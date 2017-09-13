const mysql = require('mysql');
const apiuser = require('../src/apiuser');
const decklists = require('../src/endpoints/decklists');
const duels = require('../src/endpoints/duels');
const matches = require('../src/endpoints/matches');

const DB_NAME = 'mtgdata_test_db';

before(function (done) {
  process.stdout.write('\x1Bc'); // Clear terminal

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });

  // First, drop the database if it already exists.
  // We allow it to persist after a testrun to allow us to
  // inspect it after tests have been run
  const query = `DROP DATABASE ${DB_NAME}`;

  connection.query(query,
    function (error, results, fields) {
      if (error) {
        console.log('this is fine');
      }
    }
  );

  // Then create the database and begin anew
  connection.query(`CREATE DATABASE ${DB_NAME}`,
    function (error, results, fields) {
      if (error) {
        throw error;
      }

      connection.changeUser({database: DB_NAME},
        function (err) {
          if (err) {
            throw err;
          }

          const queries = [
            apiuser.createTableStatement,
            decklists.createTableStatement,
            duels.createTableStatement,
            matches.createTableStatement,
          ];

          Promise.all(queries.map((query) => {
            return new Promise((resolve, reject) => {
              connection.query(query,
                function (error, results, fields) {
                  if (error) {
                    throw error;
                  }

                  resolve();
                }
              );
            });
          })).then(() => done());
        }
      );
    }
  );
});

after(function () {

});
