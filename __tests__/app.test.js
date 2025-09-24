const request = require('supertest')

const { createApp, createShutdownHandler, startServer } = require('../app')

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  jest.clearAllMocks()
})

describe('createApp', () => {
  test('GET / responds with environment details', async () => {
    process.env.APP_VERSION = '1.2.3'
    process.env.DEPLOY_ENV = 'test'
    process.env.HOSTNAME = 'local'

    const app = createApp()
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Hello world!')
    expect(response.text).toContain('1.2.3')
    expect(response.text).toContain('test')
    expect(response.text).toContain('local')
  })

  test('GET / falls back to unknown values when env vars missing', async () => {
    delete process.env.APP_VERSION
    delete process.env.DEPLOY_ENV
    delete process.env.HOSTNAME

    const app = createApp()
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toContain('unknown')
  })
})

describe('createShutdownHandler', () => {
  test('logs error when server is not running', () => {
    const exit = jest.fn()
    const logger = { log: jest.fn(), error: jest.fn() }

    const handler = createShutdownHandler(null, { exit, logger })
    handler()

    expect(logger.error).toHaveBeenCalledWith('Server is not running')
    expect(exit).not.toHaveBeenCalled()
    expect(logger.log).not.toHaveBeenCalled()
  })

  test('closes server and exits gracefully', () => {
    const exit = jest.fn()
    const logger = { log: jest.fn(), error: jest.fn() }
    const server = {
      close: jest.fn((cb) => cb())
    }

    const handler = createShutdownHandler(server, { exit, logger })
    handler()

    expect(server.close).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Killing myself...')
    expect(exit).toHaveBeenCalledWith(0)
  })
})

describe('startServer', () => {
  test('starts server and registers shutdown handlers', () => {
    const exit = jest.fn()
    const logger = { log: jest.fn(), error: jest.fn() }
    const processRef = { on: jest.fn() }
    const server = {
      close: jest.fn((cb) => cb())
    }
    const app = {
      listen: jest.fn((port, cb) => {
        cb()
        return server
      })
    }

    const result = startServer({
      port: 4000,
      app,
      signals: ['SIGTERM', 'SIGINT'],
      exit,
      logger,
      processRef
    })

    expect(app.listen).toHaveBeenCalledWith(4000, expect.any(Function))
    expect(logger.log).toHaveBeenCalledWith('Example app listening at http://localhost:4000')
    expect(processRef.on).toHaveBeenCalledTimes(2)
    expect(processRef.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function))
    expect(processRef.on).toHaveBeenCalledWith('SIGINT', expect.any(Function))
    expect(result).toMatchObject({ app, server })

    result.shutDown()

    expect(server.close).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Killing myself...')
    expect(exit).toHaveBeenCalledWith(0)
  })
})
