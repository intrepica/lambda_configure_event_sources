##AWS Lambda Functions

Creates, updates and deletes lambda event sources (dynamodb, kinesis)

###Setup

```sh
npm install @literacyplanet/lambda_configure_event_source --save
```

####./event_sources.json

```json
{
  "EventSources": [
    {
      "EventSourceArn": "arn:aws:dynamodb:us-east-1:xxxxxx:table/my_dynamo_table/stream/2015-12-03T01:01:02.357",
      "StartingPosition": "TRIM_HORIZON",
      "Enabled": true,
      "FunctionName": "my_lamdba_handler",
      "BatchSize": 1
    }
  ],
  "Region": "us-east-1"
}
```

####./index.js

```json
var configureEvents = require('@literacyplanet/lambda_configure_event_source');
var eventSources = require('./event_sources.json');

configureEvents.createOrUpdateSources({
  eventSources: config.EventSources,
  region: config.Region,
  lambdaName: 'my_lamdba_handler'
}, function(err) {
  // Done
});
```

###Run tests

```sh
npm run test
```