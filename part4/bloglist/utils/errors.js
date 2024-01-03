class AccessDeniedError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AccessDeniedError'
  }
}

class PageNotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'PageNotFoundError'
  }
}

module.exports = { AccessDeniedError, PageNotFoundError }