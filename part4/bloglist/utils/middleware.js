const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/user')

class UserExtractError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UserExtractError'
  }
}

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:', request.path)
  logger.info('Body:', request.body)
  logger.info('---')
  next()
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  try {
    if (request.token) {
      const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)
      if (!decodedToken.id) {
        throw new jwt.JsonWebTokenError('Invalid token')
      }
      const user = await User.findById(decodedToken.id)
      if (!user) {
        throw new UserExtractError('Invalid user')
      }
      request.user = user
    }
    next()
  }
  catch(error) {
    next(error)
  }
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError' || error.name === 'TypeError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError' || error.name === 'UserExtractError') {
    return response.status(401).json({ error: error.message })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Token expired' })
  }
  next(error)
}

module.exports = {
  errorHandler,
  requestLogger,
  tokenExtractor,
  userExtractor,
  unknownEndpoint
}