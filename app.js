const express = require('express')
const { getStatus } = require('./controllers/statusController')
const { getHealth } = require('./controllers/healthController')
const { getInfo } = require('./controllers/infoController')

function createApp() {
  const app = express()

  app.get('/', (req, res) => {
    const text = `<pre>
    Hello world!
    Application version: ${process.env.APP_VERSION || 'unknown'}
    Environment: ${process.env.DEPLOY_ENV || 'unknown'}
    Hostname: ${process.env.HOSTNAME || 'unknown'}
  </pre>`;
    res.send(text);
  })

  app.get('/status', getStatus)
  app.get('/health', getHealth)
  app.get('/info', getInfo)

  return app
}

function createShutdownHandler(server, { exit = process.exit, logger = console } = {}) {
  return () => {
    if (!server || typeof server.close !== 'function') {
      logger.error('Server is not running')
      return
    }

    server.close(() => {
      logger.log('Killing myself...')
      exit(0)
    })
  }
}

function startServer({ port = process.env.PORT || 3000, app = createApp(), signals = ['SIGTERM', 'SIGINT'], exit = process.exit, logger = console, processRef = process } = {}) {
  const server = app.listen(port, () => {
    logger.log(`Example app listening at http://localhost:${port}`)
  })

  const shutDown = createShutdownHandler(server, { exit, logger })

  if (signals && Array.isArray(signals)) {
    signals.forEach((signal) => processRef.on(signal, shutDown))
  }

  return { app, server, shutDown }
}

if (require.main === module) {
  startServer()
}

module.exports = { createApp, startServer, createShutdownHandler }
