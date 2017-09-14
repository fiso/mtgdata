function mount () {
  return function middleware (req, res, next) {
    /* eslint-disable */
    res.send(`
      <html>
        <head>
          <title>Vill du ligga?</title>
          <link rel="icon" type="image/png"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

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
    /* eslint-enable */
  };
}

module.exports = {
  mount,
};
