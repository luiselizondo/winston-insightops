var winston = require('winston')
var util = require('util')

const DEFAULT_REGION = 'us'
var Logger = require('r7insight_node')

function transformLevel (level) {
  var codes = {
    error: 'err',
    warn: 'warning',
    info: 'info',
    verbose: 'debug',
    debug: 'debug',
    silly: 'debug'
  }

  return codes[level]
}

var InsightOpsTransport = module.exports = function (options) {
  options = options || {}

  winston.Transport.call(this, options)

  if (!options.token) {
    throw new Error('A token must be set for Insight Transport')
  }

  this.silent = options.silent || false
  
  this.logger = new Logger({ 
    token: options.token, 
    region: options.region || DEFAULT_REGION
  })
}

util.inherits(InsightOpsTransport, winston.Transport)

winston.transports.InsightOpsTransport = InsightOpsTransport

function objectIsEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

InsightOpsTransport.prototype.log = function (level, message, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  var _level = transformLevel(level)
  this.logger.log(_level, message)
  
  if (!objectIsEmpty(meta)) {
    this.logger.log(_level, meta)
  }

  callback(null, true);
}