/**
 * Created by dmccarthy on 14/11/2013.
 */


'use strict';

var communicationComponent = require('./main.js')

var config = {
   sms           : { accountSid:'AC952cebd3bbdfe9f08ab835c7c9ec7a04', authToken:'a1a77757930e53545fd3ba29a3e12a67' },
   email         : { type : 'SMTP', service: 'Gmail', user: 'openi.notifications@gmail.com', pass: '3oP1l2nPbF9EVUL' },
   sink          : { spec:'tcp://127.0.0.1:49998', bind:true, type:'pull', id:'communication_id' },
   websocket : {
      source : { spec:'tcp://127.0.0.1:49907', id:'socket_source', bind:false, type:'pull', isMongrel2:true },
      sink   : { spec:'tcp://127.0.0.1:49908', id:'socket_sink',   bind:false, type:'pub',  isMongrel2:true }
   },
   logger_params : {
      'path'     : '/opt/openi/cloudlet_platform/logs/communications',
      'log_level': 'debug',
      'as_json'  : true
   }
}


communicationComponent(config)