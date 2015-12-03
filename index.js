var _ = require('lodash');
var async = require('async');
var AWS = require('aws-sdk');

exports.createOrUpdateSources = function(options, callback) {
  var eventSources = options.eventSources;
  var lambdaName = options.lambdaName;

  AWS.config.region = options.region;

  var lambda = new AWS.Lambda();

  function find(source, mapping) {
    return _.find(source, {
      EventSourceArn: mapping.EventSourceArn
    });
  }

  function setEventSourceMappings(method, events, done) {
    async.each(events, function(mapping, cb) {
      lambda[method](mapping, cb);
    }, done);
  }

  function addFunctionName(mapping) {
    return _.merge(
      {
        FunctionName: lambdaName
      },
      mapping
    );
  }

  function pickUuidFromDest(mapping) {
    return {
      UUID: mapping.UUID
    };
  }

  function pickPropertiesFromSource(mapping) {
    var source = find(eventSources, mapping);
    return _.merge(
      {
        UUID: mapping.UUID
      },
      _.pick(source, [
        'BatchSize',
        'Enabled'
      ])
    );
  }

  function predicate(source, match) {
    return function(mapping) {
      if (find(source, mapping)) {
        return match;
      } else if (!match) {
        return true;
      }
    };
  };

  function updateEventSources(err, data) {
    if (err) {
      return callback(err);
    }

    var updateEvents = data.EventSourceMappings
      .filter(predicate(eventSources, true))
      .map(pickPropertiesFromSource);

    var createEvents = eventSources
      .filter(predicate(data.EventSourceMappings, false))
      .map(addFunctionName);

    var deleteEvents = data.EventSourceMappings
      .filter(predicate(eventSources, false))
      .map(pickUuidFromDest);

    async.parallel([
      function create(cb) {
        setEventSourceMappings(
          'createEventSourceMapping',
          createEvents,
          cb
        );
      },
      function update(cb) {
        setEventSourceMappings(
          'updateEventSourceMapping',
          updateEvents,
          cb
        );
      },
      function del(cb) {
        setEventSourceMappings(
          'deleteEventSourceMapping',
          deleteEvents,
          cb
        );
      }
    ], callback);
  }

  lambda.listEventSourceMappings({
    FunctionName: lambdaName
  }, updateEventSources);
};
