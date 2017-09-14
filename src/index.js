const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const apiuser = require('./apiuser.js');
const params = require('./params.js');
const duels = require('./endpoints/duels.js');
const matches = require('./endpoints/matches.js');
const decklists = require('./endpoints/decklists.js');
const matchups = require('./endpoints/matchups.js');
const cors = require('cors');
const root = require('./root.js');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mtgdata',
});

const app = express();

app.use(function (req, res, next) {
  console.log(`${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

app.get('/', root.mount());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(apiuser.middleware({connection}));

const router = express.Router();  // eslint-disable-line

duels.mount(connection, router);
matches.mount(connection, router);
decklists.mount(connection, router);
matchups.mount(connection, router);

app.use('/api', router);

const http = require('http');
const fs = require('fs');

let port = 8080;

let server = null;

if (process.argv.length > 2 && process.argv[2] === 'ssl') {
  const https = require('https');
  const options = {
    key: fs.readFileSync('ssl/privkey.pem'),
    cert: fs.readFileSync('ssl/fullchain.pem'),
  };
  port = 443;
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

server.listen(port, function () {
  console.log('Listening on port ' + port);
});
