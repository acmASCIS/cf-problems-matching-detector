import dotenv from "dotenv";
import { run, polyLogin, cfLogin, cfParseStatements, polygonParseStatement, delay } from './scraper/StatementsScraper';
import check from 'string-similarity';

dotenv.config();

const getCfStatements = () => {
    run().then(async (browser) => {

        // codeforces
        const cfPage = await cfLogin(browser, 0);
        delay(100);

        const cfProblems = await cfParseStatements(cfPage, 0, ' ');
        delay(100);

        // polygon
        const polyPage = await polyLogin(browser, 0);

        // polygon problem id
        const id = '72737';
        const polygonProblem = await polygonParseStatement(polyPage, id, 0, ' ');

        console.log(polygonProblem);
        
        const similarity = statementsSimilarity(cfProblems, polygonProblem);

        similarity.forEach((s, ele)=>{

            if (s > 0.6){
                console.log(s, ele);
            }
        });

        console.log('===========\n');
        console.log(similarity[0]);

        // close
        // browser.close();
        

    }).catch((err) => {
        console.log(err);
    });
};

// cfProblems: Array, polygonProblem: dict
const statementsSimilarity = (cfProblems, polygonProblem) => {

    const similarity = [];

    const computeSimilarity = (a, b) => {

        const s = check.compareTwoStrings(a['statement'], b['statement']);

        return s;
    };

    for (let i = 0; i < cfProblems.length; i++) {

        const s = computeSimilarity(cfProblems[i], polygonProblem);

        similarity.push([s, cfProblems[i]['header']]);
    }

    return similarity;
};

getCfStatements();

export { getCfStatements, polygonParseStatement, statementsSimilarity };