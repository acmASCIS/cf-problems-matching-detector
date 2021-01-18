import React, { useState } from 'react';
import './App.css';
import { ResultsTable } from './ResultsTable';
import { InputForm } from './InputForm';
import axios from 'axios';

function App() {

  const [results, setResults] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);


  const forceScrap = async () => {
    setIsLoading(true);
    const url = `${process.env.REACT_APP_API_URL}/api/force-scrap`;
    try {
      const res = await axios.post(url);

      const { ready } = res.data;
      setReady(ready);

      setIsLoading(false);
      alert('All is Ready Now');

    } catch (error) {
      alert('An error occurred. \n' + error);
      setIsLoading(false);
    }

  }

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    const numOfPolygonPages: number = data.numOfPolygonPages;
    const polygonProblemsId: string = data.problemsId;
    const matchingPercentageThreshold: number =
      data.matchingPercentageThreshold;

    const url = `${process.env.REACT_APP_API_URL}/api/cf-problems-matching`;

    try {
      const res = await axios.post(
        url,
        { numOfPolygonPages, polygonProblemsId, matchingPercentageThreshold },
        { timeout: 0 }
      );

      console.log(res);

      const { ready, maxSimilarities } = res.data;

      console.log(ready);
      console.log(maxSimilarities);

      setResults(maxSimilarities);
      setReady(ready);

      setIsLoading(false || !ready);
    } catch (error) {
      alert('An error occurred. \n' + error);
      setIsLoading(false);
    }
  };


  return (
    <div className="App">
      <header className="header">
        <body>
          {
              (results === undefined ?
                <InputForm isLoading={isLoading} onSubmit={onSubmit} forceScrap={forceScrap} />
                : <ResultsTable results={results} />)
          }
        </body>
      </header>
    </div>
  );
}

export { App };
