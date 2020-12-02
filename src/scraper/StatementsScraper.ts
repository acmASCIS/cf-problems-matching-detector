import puppeteer from 'puppeteer';
import xtree from "xpath";
import { DOMParser } from "xmldom";
import { url } from 'inspector';

// login url
const polyLoginUrl = 'https://polygon.codeforces.com/login';
const cfLoginUrl = 'https://codeforces.com/enter'

// login form xpath
const ployLoginXpath = '//form/table/tbody/tr/td/'
const cfLoginXpath = '//form/table/tbody/tr/td/'

// config
const rememberMe = true;


const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

const strFormat = (str: string) => {

    return str.replace(/\n[0-9]|/g, '').replace(/\n/g, ' ').replace(/\s\s+/g, ' ').replace('$', '');
};

const run = async (headless: boolean = false) => {

    const browser = await puppeteer.launch({ headless: headless, executablePath: process.env.Chrome });

    return browser;
};

const polyLogin = async (browser, timeout = 0) => {

    const polyPage = await browser.newPage();

    await polyPage.goto(polyLoginUrl, { waitUntil: 'load', timeout: timeout });

    const polyLoginForm = await polyPage.$x(ployLoginXpath + 'input');

    if (polyLoginForm.length < 2) {

        console.log('polygon - login form is not found');

        return;
    }

    await polyLoginForm[0].type(process.env.POLYGONE_USERNAME);
    await polyLoginForm[1].type(process.env.POLYGONE_PASSWORD);

    const check = await (await polyLoginForm[2].getProperty('checked')).jsonValue();

    if (!check && rememberMe) {

        await polyLoginForm[2].click();
    }

    await polyPage.keyboard.press('Enter');

    await delay(3000);

    const [send_anyway] = await polyPage.$x('//button[contains(., "Send anyway")]');

    if (send_anyway) {

        await send_anyway.click();
    }

    await polyPage.waitForNavigation({ waitUntil: 'networkidle0' });

    return polyPage;
}


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

    const check = await (await formCheckbox[0].getProperty('checked')).jsonValue();

    if (!check && rememberMe) {

        await formCheckbox[0].click();
    }

    await cfPage.keyboard.press('Enter');
    await cfPage.waitForNavigation({ waitUntil: 'networkidle0' });

    return cfPage;
}

const cfParseStatements = async (cfPage, numOfParallelContests, timeout = 0, sep = ' ') => {

    const problemsettingUrl = `http://codeforces.com/contests/writer/${process.env.CF_USERNAME}`

    await cfPage.goto(problemsettingUrl, { waitUntil: 'load', timeout: timeout });

    const enterGroup = await cfPage.$x('//a[contains(., "Enter »")]');

    const problemsUrl = await Promise.all(enterGroup.map(async (a) => {
        return await (await a.getProperty('href')).jsonValue() + '/problems';
    }));

    console.log('No. of contests :', problemsUrl.length);

    const contests = [];

    const inParallel = Math.floor(problemsUrl.length / numOfParallelContests);

    console.log(inParallel);

    for (let i = 0; i < inParallel; i++) {

        const startIdx = i * numOfParallelContests;
        let endIdx = (i + 1) * numOfParallelContests;

        endIdx = Math.min(endIdx, problemsUrl.length);


        let subRequest = problemsUrl.slice(startIdx, endIdx);

        const parseContestBody = async (req, problemsBody) => {

            await Promise.all(problemsBody.map(async (bodyElement) => {

                const body = await cfPage.evaluate(el => el.innerHTML, bodyElement);
                contests.push({ 'url': req._url, 'body': body });

            }));
        };
       
        const parseBody = async (req) => {

            await cfPage.$x('//div[@class="problem-statement"]').then(parseContestBody.bind(null, req));

        };

        const parseSupRequest = async (url) => {

            await cfPage.goto(url, { waitUntil: 'load', timeout: timeout }).then(parseBody.bind(null));

        };

        await Promise.all(subRequest.map(parseSupRequest));

        console.log(i);
    }

    console.log('No. of cf-problems : ', contests.length);
    console.log(contests[0]);

    const parseProblemBody = async (body) => {

        const doc = new DOMParser({
            locator: {},
            errorHandler: {
                warning: function (warn) { },
                error: function (err) { },
                fatalError: function (err) { console.error(err); }
            }
        }).parseFromString(body, 'text/xml');

        const classes = ['header', 'input-specification', 'output-specification', 'sample-tests', 'note'];

        const problem = {};


        for (let i = 0; i < classes.length; i++) {

            const spNodes = xtree.select(`//div[@class="${classes[i]}"]/child::*/text()`, doc);
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

        problems.push({ 'url': contests[i]['url'], 'problem': problem });
    }

    return problems;
}

const polygonParseStatement = async (polyPage, page, id, timeout = 0, sep = ' ') => {

    const mainUrl = `https://polygon.codeforces.com/problems?page=${page}`;

    await polyPage.goto(mainUrl, { waitUntil: 'load', timeout: timeout });

    const problemElement = await polyPage.$x(`//tr[@problemid="${id}"]/td/a`);
    const problemUrl = await (await problemElement[0].getProperty('href')).jsonValue();

    console.log(problemUrl);

    await polyPage.goto(problemUrl, { waitUntil: 'load', timeout: timeout });

    const statementElement = await polyPage.$x(`//div[@class="menu"]/span/a[contains(., "Statement")]`);
    const statementUrl = await (await statementElement[0].getProperty('href')).jsonValue();

    console.log(statementUrl);

    await polyPage.goto(statementUrl, { waitUntil: 'load', timeout: timeout });

    const xpath = '//div/table/tbody/tr/td/form/div/table/tbody/tr/td/textarea';

    const body = await polyPage.$x(xpath);

    const parseProblem = async (textareaNode) => {

        const classes = ['statement', 'input_specification', 'output_specification', 'note', 'tutorial'];
        let problem = {};

        for (let i = 0; i < textareaNode.length; i++) {

            problem[classes[i]] = await polyPage.evaluate(el => el.value, textareaNode[i]);
        }

        problem['statement'] = strFormat(problem['statement']);

        return problem;
    }

    const problem = await parseProblem(body);

    return problem;
}

export { run, polyLogin, cfLogin, polygonParseStatement, cfParseStatements, delay };