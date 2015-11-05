// Luke Mitchell
// 2015

var AWS = require("aws-sdk");

// Set location to Ireland
AWS.config.region = "eu-west-1";

var sqs =  new AWS.SQS();
var defaultQueueUrl = "https://sqs.eu-west-1.amazonaws.com/776851050546/fontdetective";

// Puts a message into the queue
function putSQS(queueUrl, value, callback) {
  var attributes = {
    uploaded: {
      DataType: "String",
      StringValue: Date.now().toString()
      }
  };
  putWithAttributesSQS(queueUrl, value, attributes, callback);
}

function putWithAttributesSQS(queueUrl, value, attributes, callback) {
  var params = {
    MessageBody: value,
    QueueUrl: queueUrl,
    MessageAttributes: attributes
  };
  sqs.sendMessage(params, callback);
}

function removeSQS(message, queueUrl, callback) {
    sqs.deleteMessage({
      QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle
    }, callback);
};

function receiveSQS(queueUrl, callback) {
  sqs.receiveMessage({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 60,
    WaitTimeSeconds: 3 
  }, function(err, data) {
    if (data.Messages) {
      // Only one message to get...
      var message = data.Messages[0];

      // Do something useful ...
      if (callback) {
        callback(err, message);
      }
    } else {
      // Queue is empty
      callback(err, null);
    }
  });
};

function test() {
  var contents = "test";
  putSQS(defaultQueueUrl, contents, function(err, data){
    if (err) {
      console.error(err);
      return;
    }
    receiveSQS(defaultQueueUrl, function(err, message) {
      if (err) {
        console.error(err);
        return;
      }
      if (message) {
        if (message.Body === contents) {
          removeSQS(defaultQueueUrl, message, function(err, data) {
            console.log("Deleted message");
          });
          return;
        }
      }
      console.error("Test failed, message contents do not match!");
    });
  });
}

/* Main application code */

test();