const winston = require('winston')
const util = require('util')
const _ = require('lodash')

const DEFAULT_REGION = 'us'
const Logger = require('r7insight_node')

function transformLevel(level) {
  const codes = {
    error: 'err',
    warn: 'warning',
    info: 'info',
    verbose: 'debug',
    debug: 'debug',
    silly: 'debug'
  }

  return codes[level]
}

let InsightOpsTransport = module.exports = function (options) {
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

InsightOpsTransport.prototype.log = function (level, message, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  const _level = transformLevel(level)

  if (!_.isEmpty(message)) {
    this.logger.log(_level, message, meta)
  }

  callback(null, true);
}

InsightOpsTransport.prototype.logException = function (msg, meta, callback, err) {
  let self = this;

  function onLogged() {
    self.removeListener('error', onError);
    callback();
  }

  function onError() {
    self.removeListener('logged', onLogged);
    callback();
  }

  this.once('logged', onLogged);
  this.once('error', onError);

  this.logger.log('err', err)
};
