/*
 * object_api
 * openi-ict.eu
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var zmq    = require('m2nodehandler');
var helper = require('./helper.js');

var communicationsComponent = function(config){

   var connected = {}

   helper.init(config)

   var websocketSink = zmq.sender(config.websocket.sink);

   zmq.receiver(config.sink, null, function(msg) {

      console.log("MESSAGE FROM SINK")

      console.log(JSON.stringify(msg))
      helper.processMessage(msg, websocketSink, connected);

   });


   zmq.receiver(config.websocket.source, config.websocket.sink, function(msg) {

      console.log("MESSAGE FROM WEBSOCKET")

      //handle disconnected clients. We may need to add something to rollback notifications.
      //mark them in DB as sent then mark them as unsent from this method.
      if (msg.headers.METHOD === 'JSON' && msg.json.type === 'disconnect'){
         for (var i in connected){
            if (connected.hasOwnProperty(i)) {
               var conn = connected[i]
               if (conn.uuid === msg.uuid && conn.connId === msg.connId){
                  delete connected[i]
                  helper.revertSentNotifications(i)
                  break;
               }
            }
         }
         return
      }

      var cloudlet       = msg.path.split('/')[4];
      var notificationId = msg.path.split('/')[5];

      //updates a notifications status to ack in the database
      if (null != notificationId){

         helper.ackSentNotifications(cloudlet, notificationId, websocketSink, msg.uuid, msg.connId)

      }
      else{
         connected[cloudlet] = {'uuid' : msg.uuid, 'connId' : msg.connId }

         helper.sendNotifications(cloudlet, websocketSink, connected)
      }

   });

}


//setTimeout(function(){
//   i = i++
//   var notification = zmq.Notification({'message':'Hello Socket', 'count':i})
//   websocketSink.send(msg.uuid, msg.connId, notification)
//},3000)
//setTimeout(function(){
//   i = i++
//   var notification = zmq.Notification({'message':'User Did something'}, 'user')
//   websocketSink.send(msg.uuid, msg.connId, notification)
//},5000)
//setTimeout(function(){
//   i = i++
//   var notification = zmq.Notification({'message':'Hello Socket', 'count':i})
//   websocketSink.send(msg.uuid, msg.connId, notification)
//},7000)



module.exports = communicationsComponent