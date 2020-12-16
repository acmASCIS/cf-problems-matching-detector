import dotenv from "dotenv";
import express from 'express';
import path from 'path';
import morgan from "morgan";
import DelayedResponse from "http-delayed-response";
import cors from "cors";

import { Scraper } from "./scraper";

const headless = true;

const fs = require('fs');
const app = express();

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
app.use(express.static(path.join(__dirname, '../client/build')));

app.post('/api/cf-problems-matching',  (req, res) => {
    
    const { numOfPolygonPages, matchingPercentageThreshold } = req.body;

    const problemsScraper = new Scraper(headless, numOfPolygonPages, matchingPercentageThreshold);

    const delayed = new DelayedResponse(req, res);
    
    delayed.wait();

    delayed.end((async () => {

        const RETRIES = 10;

        for (let i = 0; i < RETRIES; i += 1) {

            try {

                await problemsScraper.start();

                return problemsScraper;
            }

            catch (error) {

                console.log(`ATTEMPT [${i + 1}] FAILED.`);
                console.log(error);
            }
        }

        return undefined;
    })(),
    );
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});