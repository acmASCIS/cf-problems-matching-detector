import React, { useState } from 'react';
import './App.css';
import { List } from "./List";
import { InputForm } from "./InputForm";
import axios from "axios";
import { Scraper } from "../../src/scraper"

// 104501

function App() {

  let problemsScraper: Scraper = undefined;

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

        problemsScraper = await axios.post(url, { numOfPolygonPages, matchingPercentageThreshold }, {
          timeout: 0,
        });

        if (problemsScraper){
          setReady(true);
        }
      }

      catch (error) {

        alert('An error occurred. \n' + error);

      }
    }

    else {
      problemsScraper.matchingPercentageThreshold = matchingPercentageThreshold;
      problemsScraper.numOfPolygonPages = numOfPolygonPages;
    }

    if (ready) {

      await problemsScraper.matchPolygonProblems(problemsId);
      setIsLoading(false);
    }

  };

  return (
    <div className="App">
      <header className="header">
        <body>
          <InputForm isLoading={isLoading} onSubmit={onSubmit} />
        </body>
      </header>

    </div>
  );
}

export { App };
