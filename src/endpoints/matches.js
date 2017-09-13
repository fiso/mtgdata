const createTableStatement = `
CREATE TABLE matches (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP)`;

function mount (connection, router) {
}

module.exports = {
  createTableStatement,
  mount,
};
