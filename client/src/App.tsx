import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { List } from "./List";
import { InputForm } from "./InputForm";

function App() {

  const [existeStatements, setExisteStatements] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: any) => {

    const problemsId: string = data.problemsId;
    const matchingPercentageThreshold: number = data.matchingPercentageThreshold ;

    const problemIdList = problemsId.replace(/ /g, '').split(',');

    // .....
    console.log(problemIdList);
    console.log(matchingPercentageThreshold);
  
  };
  return (
    <div className="App">
      <header className="header">
        <img src={logo} className="cf-logo" alt="cf-logo" />
        <body>
        <InputForm isLoading={isLoading} onSubmit={onSubmit}/>
        </body>
      </header>

    </div>
  );
}

export { App };
