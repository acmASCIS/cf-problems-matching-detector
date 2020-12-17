import React from 'react';

const ResultsTable = ({ results }) => (
  <table classname="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Polygon Problem ID</th>
        <th scope="col">Codeforces Problem URL</th>
        <th scope="col">Matching Percentage</th>
      </tr>
    </thead>
    <tbody>
      {results.map((result, index) => (
        <tr>
          <td>{index + 1}</td>
          <td>{result[0]}</td>
          <td>
            <a href={result[1]}>here</a>
          </td>
          <td>{result[2]}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export { ResultsTable };
