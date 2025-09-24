function getHealth(_req, res) {
  res.json({
    healthy: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}

module.exports = {
  getHealth
}
