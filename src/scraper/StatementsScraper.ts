import puppeteer from 'puppeteer';
import xtree from 'xpath';
import { DOMParser } from 'xmldom';
import { url } from 'inspector';

// login url
const polyLoginUrl = 'https://polygon.codeforces.com/login';
const cfLoginUrl = 'https://codeforces.com/enter';

// login form xpath
const ployLoginXpath = '//form/table/tbody/tr/td/';
const cfLoginXpath = '//form/table/tbody/tr/td/';

// config
const rememberMe = true;

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const strFormat = (str: string) => {
  return str
    .replace(/[^a-zA-Z ^0-9]/g, ' ')
    .replace(/\s\s+/g, ' ')
    .toLowerCase();
};

const run = async (headless: boolean = false) => {
  const browser = await puppeteer.launch({
    headless: headless,
    // executablePath: process.env.Chrome,
  });

  return browser;
};

const polyLogin = async (browser, timeout = 0) => {
  const polyPage = (await browser.pages())[0];

  await polyPage.goto(polyLoginUrl, { waitUntil: 'load', timeout: timeout });

  const polyLoginForm = await polyPage.$x(ployLoginXpath + 'input');

  if (polyLoginForm.length < 2) {
    console.log('polygon - login form is not found');

    return;
  }

  await polyLoginForm[0].type(process.env.POLYGON_USERNAME);
  await polyLoginForm[1].type(process.env.POLYGON_PASSWORD);

  const check = await (
    await polyLoginForm[2].getProperty('checked')
  ).jsonValue();

  if (!check && rememberMe) {
    await polyLoginForm[2].click();
  }

  await polyPage.keyboard.press('Enter');

  await delay(3000);

  const [send_anyway] = await polyPage.$x(
    '//button[contains(., "Send anyway")]'
  );

  if (send_anyway) {
    await Promise.all([
      send_anyway.click(),
      polyPage.waitForNavigation({ waitUntil: 'networkidle0', timeout }),
    ]);
  }

  return polyPage;
};

const cfLogin = async (browser, timeout = 0) => {
  const cfPage = (await browser.pages())[0];

  await cfPage.goto(cfLoginUrl, { waitUntil: 'load', timeout: timeout });

  const cfLoginForm = await cfPage.$x(cfLoginXpath + 'input');
  const formCheckbox = await cfPage.$x(cfLoginXpath + 'label/input');

  if (cfLoginForm.length < 2) {
    console.log('codeforces - login form is not found');

    return;
  }

  await cfLoginForm[0].type(process.env.CF_USERNAME);
  await cfLoginForm[1].type(process.env.CF_PASSWORD);

  const check = await (
    await formCheckbox[0].getProperty('checked')
  ).jsonValue();

  if (!check && rememberMe) {
    await formCheckbox[0].click();
  }

  await Promise.all([
    cfPage.keyboard.press('Enter'),
    await cfPage.waitForNavigation({ waitUntil: 'load', timeout: timeout }),
  ]);

  return cfPage;
};

const cfParseStatements = async (
  browser,
  cfPage,
  numOfParallelContests = 5,
  waitingStep = 500,
  watingTime = 3000,
  timeout = 0,
  sep = ' '
) => {
  const problemsettingUrl = `http://codeforces.com/contests/writer/${process.env.CF_USERNAME}`;

  await cfPage.goto(problemsettingUrl, { waitUntil: 'load', timeout: timeout });

  const enterGroup = await cfPage.$x('//a[contains(., "Enter »")]');

  const problemsUrl = await Promise.all(
    enterGroup.map(async (a) => {
      return (await (await a.getProperty('href')).jsonValue()) + '/problems';
    })
  );

  console.log('No. of contests :', problemsUrl.length);

  const contests = [];

  // dublicatePages
  const dublicatePage = Array(numOfParallelContests);
  const idlePageMask = Array(numOfParallelContests).fill(false);

  dublicatePage[0] = (await browser.pages())[0];

  for (let i = 1; i < numOfParallelContests; i++) {
    dublicatePage[i] = await browser.newPage();
    await delay(50);
  }

  // ith contest
  let i = 0;

  const parseContestBody = async (req, jth, problemsBody) => {
    await Promise.all(
      problemsBody.map(async (bodyElement) => {
        const body = await dublicatePage[jth].evaluate(
          (el) => el.innerHTML,
          bodyElement
        );
        contests.push({ url: req._url, body: body });
      })
    ).then(() => {
      idlePageMask[jth] = false;
    });
  };

  const parseBody = async (jth, req) => {
    await dublicatePage[jth]
      .$x('//div[@class="problem-statement"]')
      .then(parseContestBody.bind(null, req, jth));
  };

  const parseRequest = async (url, jth) => {
    idlePageMask[jth] = true;
    i += 1;

    await dublicatePage[jth]
      .goto(url, { waitUntil: 'load', timeout: timeout })
      .then(parseBody.bind(null, jth));
  };

  const onIdle = async (state, j) => {
    if (state === false && i < problemsUrl.length)
      await parseRequest(problemsUrl[i], j);
  };

  while (i < problemsUrl.length) {
    await Promise.all(idlePageMask.map(onIdle));

    if (i > 0 && i % waitingStep === 0) await delay(watingTime);

    console.log(i);

    // if (i === 120) break;
  }

  console.log('No. of cf-problems : ', contests.length);

  const parseProblemBody = async (body) => {
    const doc = new DOMParser({
      locator: {},
      errorHandler: {
        warning: function (warn) {},
        error: function (err) {},
        fatalError: function (err) {
          console.error(err);
        },
      },
    }).parseFromString(body, 'text/xml');

    const classes = [
      'header',
      'input-specification',
      'output-specification',
      'sample-tests',
      'note',
    ];

    const problem = {};

    for (let i = 0; i < classes.length; i++) {
      const spNodes = xtree.select(
        `//div[@class="${classes[i]}"]/child::*/text()`,
        doc
      );
      let text = '';

      for (let j = 0; j < spNodes.length; j++) {
        text += spNodes[j].toString() + sep;
      }

      problem[classes[i].replace('-', '_')] = strFormat(text);
    }

    const pNodes = xtree.select(`div[not(@class)]/child::*/text()`, doc);
    let text = '';

    for (let i = 0; i < pNodes.length; i++) {
      text += pNodes[i].toString() + sep;
    }

    problem['statement'] = strFormat(text);

    return problem;
  };

  let problems = [];

  for (let i = 0; i < contests.length; i++) {
    const problem = await parseProblemBody(contests[i]['body']);

    problems.push({ url: contests[i]['url'], problem: problem });
  }

  for (let i = 1; i < numOfParallelContests; i++) {
    await dublicatePage[i].close();
  }

  return problems;
};

const polygonParseStatement = async (polyPage, numOfPages, id, timeout = 0) => {
  const findProblem = async () => {
    let problemElement = undefined;
    let found = 0;

    for (let i = 1; i <= numOfPages; i++) {
      const url = `https://polygon.codeforces.com/problems?page=${i}`;

      try {
        await polyPage.goto(url, { waitUntil: 'load', timeout: timeout });
      } catch (err) {
        console.log(`Page = ${i} was not found`);
      }

      try {
        problemElement = await polyPage.$x(`//tr[@problemid="${id}"]/td/a`);
      } catch {
        console.log(`Page = ${i}`);
      }

      if (problemElement.length) {
        found = 1;
        break;
      }
    }

    return { found, problemElement };
  };

  const { found, problemElement } = await findProblem();

  if (!found) {
    console.log(`Problem with id = ${id}, was not found`);
    return;
  }

  const problemUrl = await (
    await problemElement[0].getProperty('href')
  ).jsonValue();

  console.log(problemUrl);

  await polyPage.goto(problemUrl, { waitUntil: 'load', timeout: timeout });

  const statementElement = await polyPage.$x(
    `//div[@class="menu"]/span/a[contains(., "Statement")]`
  );
  const statementUrl = await (
    await statementElement[0].getProperty('href')
  ).jsonValue();

  console.log(statementUrl);

  await polyPage.goto(statementUrl, { waitUntil: 'load', timeout: timeout });

  const xpath = '//div/table/tbody/tr/td/form/div/table/tbody/tr/td/textarea';

  const body = await polyPage.$x(xpath);

  const parseProblem = async (textareaNode) => {
    const classes = [
      'statement',
      'input_specification',
      'output_specification',
      'note',
      'tutorial',
    ];
    let problem = {};

    for (let i = 0; i < textareaNode.length; i++) {
      problem[classes[i]] = await polyPage.evaluate(
        (el) => el.value,
        textareaNode[i]
      );
    }

    problem['statement'] = strFormat(problem['statement']);

    return problem;
  };

  const problem = await parseProblem(body);

  return problem;
};

export {
  run,
  polyLogin,
  cfLogin,
  polygonParseStatement,
  cfParseStatements,
  delay,
};
