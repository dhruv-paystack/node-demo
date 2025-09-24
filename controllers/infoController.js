function parseLevels(queryValue) {
  const fallback = 4
  if (queryValue === undefined) {
    return fallback
  }

  const parsed = Number.parseInt(queryValue, 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, 1), 8)
}

function generatePascalPyramid(levels) {
  if (levels <= 0) {
    return []
  }

  const pyramid = [[[1]]]

  for (let level = 1; level < levels; level += 1) {
    const previousLayer = pyramid[level - 1]
    const layer = []

    for (let i = 0; i <= level; i += 1) {
      const row = []
      for (let j = 0; j <= level - i; j += 1) {
        const value =
          getLayerValue(previousLayer, i - 1, j) +
          getLayerValue(previousLayer, i, j - 1) +
          getLayerValue(previousLayer, i, j)
        row.push(value)
      }
      layer.push(row)
    }

    pyramid.push(layer)
  }

  return pyramid
}

function getLayerValue(layer, i, j) {
  if (!layer || i < 0 || j < 0 || i >= layer.length) {
    return 0
  }

  const row = layer[i]
  if (!row || j >= row.length) {
    return 0
  }

  return row[j]
}

function formatPyramid(pyramid) {
  return pyramid.map((layer, layerIndex) => {
    const rows = layer
      .map((row, rowIndex) => {
        const padding = ' '.repeat(layer.length - rowIndex - 1)
        return `${padding}${row.join(' ')}`
      })
      .join('\n')

    return `Level ${layerIndex}\n${rows}`
  })
}

function getInfo(req, res) {
  const levels = parseLevels(req.query.levels)
  const pyramid = generatePascalPyramid(levels)

  res.json({
    name: process.env.APP_NAME || 'node-demo',
    description: process.env.APP_DESCRIPTION || 'Demo Node application',
    version: process.env.APP_VERSION || 'unknown',
    pascalPyramid: {
      levels,
      layers: pyramid,
      formatted: formatPyramid(pyramid)
    }
  })
}

module.exports = {
  getInfo,
  generatePascalPyramid,
  parseLevels,
  formatPyramid
}
