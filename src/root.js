function mount () {
  return function middleware (req, res, next) {
    res.send(`
      <html>
        <head>
          <style>
            body {
              background-color: black;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: sans-serif;
            }

            h1 {
              color: white;
              font-size: 200px;
            }
          </style>
        </head>

        <body>
          <h1>JA TACK</h1>
        </body>
      </html>
      `
    );
  };
}

module.exports = {
  mount,
};
