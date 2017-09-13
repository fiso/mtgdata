const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const apiuser = require('./apiuser.js');
const params = require('./params.js');
const duels = require('./endpoints/duels.js');
const matches = require('./endpoints/matches.js');
const decklists = require('./endpoints/decklists.js');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mtgdata',
});

const app = express();

app.use(function (req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(apiuser.middleware({connection}));

const router = express.Router();  // eslint-disable-line

duels.mount(connection, router);
matches.mount(connection, router);
decklists.mount(connection, router);

app.use('/api', router);

const http = require('http');
const https = require('https');
const fs = require('fs');

const port = process.env.PORT || 8080;

const httpServer = http.createServer(app);
httpServer.listen(port);
/*
const credentials = {
  key: fs.readFileSync('ssl/key.pem', 'utf8'),
  cert: fs.readFileSync('ssl/cert.pem', 'utf8'),
};

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);
*/

console.log('Listening on port ' + port);
