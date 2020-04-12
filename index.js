import express from 'express';
import o2x from 'object-to-xml';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';
import url from 'url';
import estimator from './src/estimator';
import api_estimator from "./src/estimator2";
import log from './src/log';


const app = express();

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// logging middleware
app.use(morgan((tokens, req, res) => [
  `${tokens.date(req, res)}\t\t`,
  `${url.parse(req.url).pathname}\t\t`,
  `done in ${tokens['response-time'](req, res)}`, 'ms'
].join(' '), { stream: accessLogStream }));

app.use(express.json());

// response format middleware
app.use((req, res, next) => {
  res.sendData = function (object) {
    if (req.params.format === 'json' || !req.params.format) {
      res.header('Content-Type', 'application/json');
      res.send(object);
    } else if (req.params.format === 'xml') {
      res.header('Content-Type', 'application/xml');
      const xml = o2x({ '?xml version="1.0" encoding="UTF-8" ?': null, object });
      res.send(xml);
    } else {
      res.status(404).send({ message: 'Endpoint not found.' });
    }
  };

  next();
});

app.get('/api/v1/on-covid-19/logs', log);
app.post('/api/v1/on-covid-19', estimator);
app.get('/api/v1/on-covid-19/:format', estimator);


// Not found middleware
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  res.status(404).send({ message: 'Endpoint not found.' });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
