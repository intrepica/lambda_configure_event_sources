##AWS configure Lambda events

Creates, updates and deletes lambda event sources (dynamodb, kinesis)

[![Build Status](https://semaphoreci.com/api/v1/projects/748d1a07-7e3d-4542-8442-b90702ad8749/622270/badge.svg)](https://semaphoreci.com/lp/lambda_configure_event_sources)

[![Coverage Status](https://coveralls.io/repos/intrepica/lambda_configure_event_sources/badge.svg?branch=master&service=github)](https://coveralls.io/github/intrepica/lambda_configure_event_sources?branch=master)

###Setup

```sh
npm install @literacyplanet/lambda_configure_event_sources --save
```

####./event_sources.json

```json
[
    {
      "EventSourceArn": "arn:aws:dynamodb:us-east-1:xxxxxx:table/my_dynamo_table/stream/2015-12-03T01:01:02.357",
      "StartingPosition": "TRIM_HORIZON",
      "Enabled": true,
      "FunctionName": "my_lamdba_handler",
      "BatchSize": 1
    }
]
```

####./index.js

```javascript
var configureEvents = require('@literacyplanet/lambda_configure_event_source');
var eventSources = require('./event_sources.json');

configureEvents.createOrUpdateSources({
  eventSources: eventSources,
  region: 'us-east-1',
  lambdaName: 'my_lamdba_handler'
}, function(err) {
  // Done
});
```

###Run tests

```sh
npm run test
```