import {
  run,
  polyLogin,
  cfLogin,
  cfParseStatements,
  polygonParseStatement,
} from './scraper/StatementsScraper';
import check from 'string-similarity';

class Scraper {
  private cfProblems: Array<any> | undefined = undefined;
  private polyPage: any | undefined = undefined;
  private browser: any | undefined = undefined;

  constructor(
    public numOfPolygonPages?: number,
    public matchingPercentageThreshold?: number,
    public polygonProblemsId?:number
  ) {}

  public start = async () => {
    try {
      this.browser = await run();

      console.log('[CF LOGIN START]');
      const cfPage = await cfLogin(this.browser, 0);
      console.log('[CF LOGIN END]');

      const numOfParallelContests = 10;
      const waitingStep = 100;
      const waitingTime = 100;

      this.cfProblems = await cfParseStatements(
        this.browser,
        cfPage,
        numOfParallelContests,
        waitingStep,
        waitingTime,
        0,
        ' '
      );

      console.log('[POLYGON LOGIN START]');
      // polygon
      this.polyPage = await polyLogin(this.browser, 0);

      console.log('[POLYGON LOGIN END]');

      return true;
    } catch (err) {
      console.log(err);
      throw new Error('Failed to start the scrapper');
    }
  };

  public matchPolygonProblems = async () => {
    const problemIdList: any = this.parseProblemsIdList(this.polygonProblemsId);

    let maxSimilarities: Array<any> = [];

    for (let i = 0; i < problemIdList.length; i++) {
      const {
        similarity,
        hasMaxSimilarity,
      } = await this.matchPolygonProblemHandler(problemIdList[i]);
      maxSimilarities.push([
        problemIdList[i],
        hasMaxSimilarity[2],
        hasMaxSimilarity[0].toFixed(2),
      ]);
    }

    return maxSimilarities;
  };

  public closeBrowser = () => {
    this.browser.close();
  };

  public newRequest = (
    numOfPolygonPages,
    polygonProblemsId,
    matchingPercentageThreshold
  ) => {
    this.polygonProblemsId = polygonProblemsId;
    this.numOfPolygonPages = numOfPolygonPages;
    this.matchingPercentageThreshold = matchingPercentageThreshold;
  };

  public numOfCfProblems = () => {
    return this.cfProblems.length;
  };

  // polygon: problem id, number of pages
  private matchPolygonProblemHandler = async (id) => {
    const polygonProblem = await polygonParseStatement(
      this.polyPage,
      this.numOfPolygonPages,
      id,
      0
    );

    const similarity = this.statementsSimilarity(
      this.cfProblems,
      polygonProblem
    );

    const hasMaxSimilarity = this.getMaxSimilarity(similarity);

    return { similarity, hasMaxSimilarity };
  };

  private parseProblemsIdList = (problemsId) => {
    return problemsId.replace(/ /g, '').split(',');
  };

  // cfProblems: Array, polygonProblem: dict
  private statementsSimilarity = (cfProblems, polygonProblem) => {
    const similarity = [];

    const computeSimilarity = (a, b) => {
      const s = check.compareTwoStrings(a['statement'], b['statement']);

      return s;
    };

    for (let i = 0; i < cfProblems.length; i++) {
      const s = computeSimilarity(cfProblems[i]['problem'], polygonProblem);

      similarity.push([
        s,
        cfProblems[i]['problem']['header'],
        cfProblems[i]['url'],
      ]);
    }

    return similarity;
  };

  private getMaxSimilarity = (similarity) => {
    let mx = [-1, null, null];

    for (let i = 0; i < similarity.length; i++) {
      if (mx[0] < similarity[i][0]) {
        mx = similarity[i];
      }
    }

    return mx;
  };
}

export { Scraper };
