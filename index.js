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

InsightOpsTransport.prototype.log = function (level, message, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  var _level = transformLevel(level)

  if (message) {
    this.logger.log(_level, message)
  }

  if (meta) {
    this.logger.log(_level, Object.assign({}, meta))
  }

  callback(null, true);
}

InsightOpsTransport.prototype.logException = function (msg, meta, callback, err) {
	var self = this;

	function onLogged () {
		self.removeListener('error', onError);
		callback();
	}

	function onError () {
		self.removeListener('logged', onLogged);
		callback();
	}

	this.once('logged', onLogged);
	this.once('error', onError);

	this.logger.log('err', err)
};
