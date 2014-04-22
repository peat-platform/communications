'use strict';

var base_path = require('./basePath.js');
var commsComp = require(base_path + '../lib/helper.js');



/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/



exports['test'] = {
   setUp: function(done) {
      commsComp.init({
         sms           : {  accountSid : 'AC952cebd3bbdfe9f08ab835c7c9ec7a04', authToken: 'a1a77757930e53545fd3ba29a3e12a67' },
         email         : { type : 'SMTP', service: 'Gmail', user: 'openi.notifications@gmail.com', pass: '3oP1l2nPbF9EVUL' },
         sink          : { spec:'tcp://127.0.0.1:49907', bind:true, type:'pull', id:'communication_id' },
         logger_params : {
            'path'     : '/opt/openi/cloudlet_platform/logs/communications',
            'log_level': 'debug',
            'as_json'  : true
         }
      })
      done();
   },
   'send SMS'   : function(test) {

      var testInput     = [
         {
            'type' : 'SMS',
            'body' : 'test message',
            'from' : 'TEST',
            'to'   : '+14108675309'
         },
         {
            'type'      : 'EMAIL',
            'subject'   : 'test email',
            'to'        : 'dconway@tssg.org',
            'text'      : 'Hi There',
            'html'      : 'Hi <b>There</b>'
         }
      ]

      var actual = commsComp.processMessage(testInput);

      //console.log(actual)

      var j = 0;
      for ( var i =0; i < 10000000; i++){
         j = Math.sqrt(j + 100 + (5/40) * 11 )
      }
      console.log("^^^^^^^^^^^^^^^^^^^^^")
      console.log(j)

      test.done();
   }
}
