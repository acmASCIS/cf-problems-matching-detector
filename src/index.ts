import dotenv from "dotenv";
import { run, polyLogin, cfLogin, cfParseStatements, polygonParseStatement, delay } from './scraper/StatementsScraper';
import check from 'string-similarity';

const fs = require('fs');

dotenv.config();

const cache_info = (data) => {
    
    let jsonData = {};
    
    for(let i=0; i<data.length; i++)
    {
        jsonData[i] = data[i];
    }

    let json = JSON.stringify(jsonData);

    fs.writeFile('cf_cache.json', json, (err) => {
        if (err) {
            throw err;
        }
        console.log("cf-data is saved");
    });
};

const getCfStatements = () => {
    run().then(async (browser) => {

        // codeforces
        const cfPage = await cfLogin(browser, 0);

        const numOfParallelContests = 5;
        const cfProblems = await cfParseStatements(cfPage, numOfParallelContests, 0, ' ');
        
        delay(100);

        // polygon
        const polyPage = await polyLogin(browser, 0);

        // polygon problem id
        const page = 2;
        const id = '104501';
        const polygonProblem = await polygonParseStatement(polyPage, page, id, 0, ' ');

        console.log(polygonProblem);

        const similarity = statementsSimilarity(cfProblems, polygonProblem);


        similarity.forEach((s, ele) => {

            if (s > 0.6) {
                console.log(s, ele);
            }
        });
        
        const maxSimilarity = getMaxSimilarity(similarity);

        console.log('===========\n');
        console.log(maxSimilarity);

        cache_info(similarity); // cache output

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

        const s = computeSimilarity(cfProblems[i]['problem'], polygonProblem);

        similarity.push([s, cfProblems[i]['problem']['header'], cfProblems[i]['url']]);
    }

    return similarity;
};

const getMaxSimilarity = (similarity)=>{
    
    let mx = [-1, null, null];

    for(let i=0; i<similarity.length; i++){
      
        if(mx[0] < similarity[i][0]){
          
            mx = similarity[i];
        }
    }

    return mx;
};

getCfStatements();

export { getCfStatements, polygonParseStatement, statementsSimilarity };