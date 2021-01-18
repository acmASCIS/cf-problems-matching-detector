import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import { Scraper } from './scraper';
import basicAuth from 'express-basic-auth';

const fs = require('fs');
const app = express();



let problemsScraper = undefined;
let ready = false;

dotenv.config();

fs.exists('logs.log', function (exists) {
  if (exists) {
    fs.unlinkSync('logs.log');
  }
});

const logFile = fs.createWriteStream(path.join(__dirname, 'logs.log'), {
  flags: 'a',
});

app.use(express.json());
app.use(cors());
app.use(morgan('dev', { stream: logFile }));
app.use(
  basicAuth({
    users: { [process.env.BASIC_AUTH_USERNAME as string]: process.env.BASIC_AUTH_PASSWORD as string },
    challenge: true,
  }),
);

app.use(express.static(path.join(__dirname, '../client/build')));


const startScraper = async () => {
  if (!ready) {
    problemsScraper = new Scraper();

    ready = true;

    await problemsScraper.start();
  }
};

app.post('/api/cf-problems-matching', async (req, res) => {
  req.setTimeout(1000 * 60 * 10); // 10 Minutes

  const {
    numOfPolygonPages,
    polygonProblemsId,
    matchingPercentageThreshold,
  } = req.body;

  await startScraper()

  problemsScraper.newRequest(
    numOfPolygonPages,
    polygonProblemsId,
    matchingPercentageThreshold
  );

  const maxSimilarities = await problemsScraper.matchPolygonProblems();

  res.send({ ready, maxSimilarities });
  res.end();
});


app.post('/api/force-scrap', async (req, res) => {
  req.setTimeout(1000 * 60 * 10); // 10 Minutes
  ready = false;
  await startScraper();

  res.send({ ready });
  res.end();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
