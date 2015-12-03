'use strict';

var expect = require('expect.js');
var sinon = require('sinon');
var _ = require('lodash');
var nock = require('nock');
var proxyquire = require('proxyquire').noPreserveCache();

var sourceDynamodbFixture = require('./event_source_dynamodb.fixture.json');
var existingDynamodbFixture = require('./existing_dynamodb.fixture.json');
var newCommandFixture = require('./new_command.fixture.json');
var updateCommandFixture = require('./update_command.fixture.json');
var deleteCommandFixture = require('./delete_command.fixture.json');

var mock = sinon.mock;
var stub = sinon.stub;

describe('.createOrUpdateSources', function() {
  var AWS;
  var configureEvents;
  var lambda;
  var listEventSourceMappingsPayload;
  var eventSources;
  var lambdaName;

  beforeEach(function() {
    lambda = {
      new: {
        listEventSourceMappings: stub()
      }
    };

    function Lambda() {
      return lambda.new;
    }

    AWS = {
      config: {},
      Lambda: Lambda
    };

    var requireStubs = {
      'aws-sdk': AWS
    };

    eventSources = [];

    lambdaName = 'my_lamdba_handler';

    listEventSourceMappingsPayload = {
      NextMarker: null,
      EventSourceMappings: []
    };

    configureEvents = proxyquire('../', requireStubs);
  });

  function runConfigureEvents(done) {
    configureEvents
      .createOrUpdateSources({
        eventSources: eventSources,
        lambdaName: lambdaName,
        region: 'us-east-1'
      }, done);
  }

  describe('when listEventSourceMappings succeeds', function() {
    describe('when the event source doesnt exist', function() {
      var create;

      beforeEach(function() {
        eventSources.push(sourceDynamodbFixture);
        lambda.new.listEventSourceMappings
          .yields(null, listEventSourceMappingsPayload);
      });

      describe('when createEventSourceMapping succeeds', function() {
        it('creates the event source mapping', function(done) {
          create = lambda.new.createEventSourceMapping = mock();
          create.withArgs(newCommandFixture).yields(null);
          runConfigureEvents(function() {
            create.verify();
            done();
          });
        });
      });

      describe('when createEventSourceMapping fails', function() {
        it('yields an error', function(done) {
          var error = new Error('Boom!');
          create = lambda.new.createEventSourceMapping = stub();
          create.withArgs(newCommandFixture).yields(error);
          runConfigureEvents(function(err) {
            expect(err).to.eql(error);
            done();
          });
        });
      });
    });

    describe('when the event source is currently set', function() {
      beforeEach(function() {
        listEventSourceMappingsPayload
          .EventSourceMappings
          .push(existingDynamodbFixture);

        lambda.new.listEventSourceMappings
          .yields(null, listEventSourceMappingsPayload);
      });

      describe('and the event source has changed attributes', function() {
        var update;

        beforeEach(function() {
          eventSources.push(sourceDynamodbFixture);
        });

        describe('when updateEventSourceMapping succeeds', function() {
          it('creates the event source mapping', function(done) {
            update = lambda.new.updateEventSourceMapping = mock();
            update.withArgs(updateCommandFixture).yields(null);
            runConfigureEvents(function() {
              update.verify();
              done();
            });
          });
        });

        describe('when updateEventSourceMapping fails', function() {
          it('yields an error', function(done) {
            var error = new Error('Boom!');
            update = lambda.new.updateEventSourceMapping = stub();
            update.withArgs(updateCommandFixture).yields(error);
            runConfigureEvents(function(err) {
              expect(err).to.eql(error);
              done();
            });
          });
        });
      });

      describe('when the event source is not required', function() {
        var deleteCommand;

        describe('when deleteEventSourceMapping succeeds', function() {
          it('deletes the event source mapping', function(done) {
            deleteCommand = lambda.new.deleteEventSourceMapping = mock();
            deleteCommand.withArgs(deleteCommandFixture).yields(null);
            runConfigureEvents(function() {
              deleteCommand.verify();
              done();
            });
          });
        });

        describe('when deleteEventSourceMapping fails', function() {
          it('yields an error', function(done) {
            var error = new Error('Boom!');
            deleteCommand = lambda.new.deleteEventSourceMapping = stub();
            deleteCommand.withArgs(deleteCommandFixture).yields(error);
            runConfigureEvents(function(err) {
              expect(err).to.eql(error);
              done();
            });
          });
        });
      });
    });
  });

  describe('when listEventSourceMappings fails', function() {
    var error;

    beforeEach(function() {
      error = new Error('Boom!');
      lambda.new.listEventSourceMappings.yields(error);
    });

    it('yields an error', function(done) {
      runConfigureEvents(function(err) {
        expect(err).to.eql(error);
        done();
      });
    });
  });
});
