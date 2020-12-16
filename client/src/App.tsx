import React, { useState } from 'react';
import './App.css';
import { ResultsTable } from "./ResultsTable";
import { InputForm } from "./InputForm";
import axios from "axios";
import { Scraper } from "../../src/scraper"

// 104501

function App() {

  let problemsScraper: Scraper = undefined;

  const [results, setResults] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const onSubmit = async (data: any) => {

    setIsLoading(true);

    const numOfPolygonPages: number = data.numOfPolygonPages;
    const problemsId: string = data.problemsId;
    const matchingPercentageThreshold: number = data.matchingPercentageThreshold;

    const url = `http://localhost:${process.env.REACT_APP_PORT}/api/cf-problems-matching`;

    if (!ready) {


      try {

        await axios.post(url, { numOfPolygonPages, matchingPercentageThreshold }, {
          timeout: 0,
        }).then((_problemsScraper: any) => {
          console.log(_problemsScraper);
          problemsScraper = _problemsScraper;
        });

        console.log(problemsScraper);

        if (problemsScraper) {
          setReady(true);
        }
      }

      catch (error) {

        alert('An error occurred. \n' + error);
        setReady(false);
        setIsLoading(false);
      }
    }

    else {
      problemsScraper.matchingPercentageThreshold = matchingPercentageThreshold;
      problemsScraper.numOfPolygonPages = numOfPolygonPages;
    }

    if (ready) {

      const maxSimilarities = await problemsScraper.matchPolygonProblems(problemsId);
      setIsLoading(false);
      setResults(maxSimilarities);
    }

  };

  return (
    <div className="App">
      <header className="header">
        <body>

        {results === undefined ? (
          <InputForm isLoading={isLoading} onSubmit={onSubmit} />
          ) : (
        <ResultsTable results={results} />
      )}
        </body>
      </header>

    </div>
  );
}

export { App };
