A Winston Transport for Rapid7 InsightOps

# Install

```
npm install winston-insightops
```

# Usage

```
var winston = require('winston')
require('winston-insightops')

var InsightOps = winston.transports. InsightOpsTransport
var options = { 
  token: 'someToken', 
  region: 'us'
}

winston.add(InsightOps, options)
```