import React from 'react';

const ResultsTable = ({ results }) => (
  <table class="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Polygon Problem</th>
        <th scope="col">Codeforces Problem</th>
        <th scope="col">Codeforces Problem URL</th>
        <th scope="col">Matching Percentage</th>
      </tr>
    </thead>
    <tbody>
      {results.map((result, index) => (
        <tr>
          <th scope="row">{index + 1}</th>
          <td>{index}</td>
          <td>{result[0]}</td>
          <td>{result[1]}</td>
          <td>{result[2]}</td>
          <td><a href={result[3]}>Code</a></td>
        </tr>
      ))}
    </tbody>
  </table>
);

export {ResultsTable};