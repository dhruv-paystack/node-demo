function getStatus(req, res) {
  res.json({
    status: 'ok',
    version: process.env.APP_VERSION || 'unknown',
    environment: process.env.DEPLOY_ENV || 'unknown',
    hostname: process.env.HOSTNAME || 'unknown',
    uptime: process.uptime()
  })
}

module.exports = {
  getStatus
}
