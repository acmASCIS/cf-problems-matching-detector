import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import { List } from "./List";
import { InputForm } from "./InputForm";
import axios from "axios";
import {Scraper} from "../../src/scraper"

function App() {

  let problemsScraper: Scraper = undefined;

  const [existeStatements, setExisteStatements] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(true);

  const onSubmit = async (data: any) => {

    const numOfPolygonPages: number = data.numOfPolygonPages;
    const problemsId: string = data.problemsId;
    const matchingPercentageThreshold: number = data.matchingPercentageThreshold;

    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/cf-problems-matching`;


    if (!ready) {
     
      setIsLoading(true);
      
      try {

        problemsScraper = await axios.post(url, {numOfPolygonPages, matchingPercentageThreshold}, {
          timeout: 0,
        });

      }

      catch (error) {

        alert('An error occurred. \n' + error);

      }

      finally {

        setIsLoading(false);
        setReady(true);
      }
    }

    else{
      problemsScraper.matchingPercentageThreshold = matchingPercentageThreshold;
      problemsScraper.numOfPolygonPages = numOfPolygonPages;
    }

    problemsScraper.matchPolygonProblems(problemsId);
  
  };

  return (
    <div className="App">
      <header className="header">
        {/* <img src={logo} className="logo" alt="logo" /> */}
        <body>
          <InputForm isLoading={isLoading} onSubmit={onSubmit} />
        </body>
      </header>

    </div>
  );
}

export { App };
