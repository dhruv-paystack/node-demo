const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  const text = `<pre>
    Hello world!
    Application version: ${process.env.APP_VERSION}
    Environment: ${process.env.DEPLOY_ENV}
    Hostname: ${process.env.HOSTNAME}
  </pre>`;
  res.send(text);
})

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  server.close(() => {
    console.log('Killing myself...');
    process.exit(0);
  });
}
