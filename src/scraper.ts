import { run, polyLogin, cfLogin, cfParseStatements, polygonParseStatement, delay } from './scraper/StatementsScraper';
import check from 'string-similarity';

class Scraper {

    private cfProblems: Array<any> | undefined = undefined;
    private polyPage: any | undefined = undefined;
    private browser: any | undefined = undefined;
    
    constructor(private headless = false, public numOfPolygonPages, public matchingPercentageThreshold = undefined) { }

    public start = async () => {

        run(this.headless).then(async (browser) => {

            this.browser = browser;

            // codeforces
            const cfPage = await cfLogin(this.browser, 0);

            const numOfParallelContests = 10;
            const waitingStep = 100;
            const waitingTime = 100;

            this.cfProblems = await cfParseStatements(this.browser, cfPage, numOfParallelContests, waitingStep, waitingTime, 0, ' ');

            delay(100);

            // polygon
            this.polyPage = await polyLogin(this.browser, 0);
        }).catch((err) => {
            console.log(err);
        });
    };

    public matchPolygonProblems = async (problemsId) =>{

        const problemIdList: any = this.parseProblemsIdList(problemsId);
        
        const maxSimilarities: Array<any> = [];

        for(let i=0; i<problemIdList.length; i++){

            const {similarity, hasMaxSimilarity} = await this.matchPolygonProblemHandler(problemIdList[i]);
            maxSimilarities.push([problemIdList[i], hasMaxSimilarity]);
        }

        return maxSimilarities;
    }

    public closeBrowser = () => {
        this.browser.close();
    }
    
    // polygon: problem id, number of pages
    private matchPolygonProblemHandler = async (id) => {

        console.log('start ....');

        const polygonProblem = await polygonParseStatement(this.polyPage, this.numOfPolygonPages, id, 0);

        const similarity = this.statementsSimilarity(this.cfProblems, polygonProblem);

        const hasMaxSimilarity = this.getMaxSimilarity(similarity);

        return {similarity, hasMaxSimilarity};
    }

    private parseProblemsIdList = (problemsId)=>{
        
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

            similarity.push([s, cfProblems[i]['problem']['header'], cfProblems[i]['url']]);
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