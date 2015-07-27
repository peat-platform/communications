/*
 * peat_data_api
 * peat-platform.org
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var nano          = require('nano')('http://dev.peat-platform.org:5984');
var peatLogger   = require('peat-logger')
var twilio        = require('twilio')
var nodemailer    = require('nodemailer')
var zmq           = require('m2nodehandler');
var peatUtils    = require('peat-cloudlet-utils')
var htmlToText    = require('html-to-text')
var logger        = null
var smsTransport  = null
var smtpTransport = null


var init = function(config){
   logger        = peatLogger(config.logger_params)
   smsTransport  = twilio(config.sms.accountSid, config.sms.authToken)
   smtpTransport = nodemailer.createTransport({
      service: config.email.service,
      auth: {
         user: config.email.user,
         pass: config.email.pass
      }
   });

   process.on('exit', function(){
      if (smtpTransport){
         smtpTransport.close()
      }
   })
}


var sendSMS = function(msg){

   smsTransport.sms.messages.create({
      body  : msg.body,
      to    : msg.to,
      from  : msg.from
   }, function(err, sms) {
      if (err){
         logger.log('error', 'Error sending SMS')
         logger.log('error', msg, err)
      }
      else{
         logger.log('info', 'SMS sent', sms)
         logger.log('info', sms)
      }
   });

   return null;
}


var sendEmail = function(msg){

   console.log(msg)

   var data = msg.data;
   var mailOptions = {
      from    : 'PEAT <foo@peat-platform.org>',
      to      : data.to,
      subject : data.subject,
      text    : htmlToText.fromString(data.body),
      html    : data.body
   }

   console.log("Sending Email")

   smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
         logger.log('error', error);
      }else{
         logger.log('info', 'Email sent: ' + response.message);
      }
   });

}


var revertSentNotifications = function(cloudlet){

   var db = nano.use(cloudlet)

   db.get('notifications', function (err, db_body) {
      if (err) {
         logger.log('error', err )
      }
      else{

         for (var i =0; i < db_body.notifications.length; i++){
            if (db_body.notifications[i].status === 'sent'){
               db_body.notifications[i].status = 'unsent'
            }
         }

         db.insert(db_body, 'notifications', function (err) {

            if (err) {
               logger.log('error', err )
            }
         })
      }
   })
}


var ackSentNotifications = function(cloudlet, notificationId, websocketSink, uuid, connId){

   var db = nano.use(cloudlet)

   db.get('notifications', function (err, db_body) {
      if (err) {
         logger.log('error', err )
      }
      else{

         for (var i =0; i < db_body.notifications.length; i++){

            if ( notificationId === db_body.notifications[i].id ){
               db_body.notifications[i].status = 'ack'
               break;
            }
         }

         db.insert(db_body, 'notifications', function (err) {

            if (err) {
               logger.log('error', err )
            }
            else{
               var response = zmq.Response(zmq.status.OK_200, zmq.header_json, {'message':'processed'})
               websocketSink.send(uuid, connId, response)
            }

         })
      }
   })
}


var sendNotifications = function(cloudlet, queue, connected){

   var conn = connected[cloudlet]

   if ( null !== conn && undefined !== conn){

      var db = nano.use(cloudlet)

      db.get('notifications', function (err, db_body) {


         if (err) {
            logger.log('error', err )
         }
         else{
            db_body.notifications.sort(function(a,b){
               return b.time - a.time
            })


            var sseNotification = []


            for (var i =0; i < db_body.notifications.length; i++){

               var n = db_body.notifications[i]

               if (db_body.notifications[i].status === 'unsent'){
                  db_body.notifications[i].status = 'sent'
                  sseNotification.push(zmq.Notification(n.body, n.id, n.event))
               }
            }

            db.insert(db_body, 'notifications', function (err) {

               if (err) {
                  logger.log('error', err )
               }
               else{
                  for (var i =0; i < sseNotification.length; i++){
                     queue.send(conn.uuid, conn.connId, sseNotification[i])
                  }
               }
            })

         }
      })
   }
}


var processNotification = function(msg, queue, connected){

   var db = nano.use(msg.cloudlet)

   db.get('notifications', function (err, db_body) {

      if (err && err.reason === 'missing') {
         db_body = {'notifications':[]}
      }

      var id   = peatUtils.randomHash()
      var time = new Date().getTime();

      db_body.notifications.push({'id':id, 'time':time, 'body': msg.body, 'event':msg.event, 'status':'unsent'})

      db.insert(db_body, 'notifications', function (err) {

         if (err) {
            logger.log('error', err )
         }
         else{
            sendNotifications(msg.cloudlet, queue, connected)
         }
      })

   })
}


var processCommunication = function (msg, queue, connected) {

   switch(msg.type.toUpperCase()){
   case 'SMS':
      sendSMS(msg)
      break;
   case 'EMAIL':
      sendEmail(msg)
      break;
   case 'NOTIFICATION':
      processNotification(msg, queue, connected)
      break;
   default:
      break;
   }
}


var processMessage = function (msg, queue, connected) {

   logger.log('debug', msg)

   processCommunication(msg)

   /*for (var i = 0; i < msg.length; i++){
      processCommunication(msg[i], queue, connected)
   }*/

}


module.exports.init                    = init
module.exports.processMessage          = processMessage
module.exports.sendNotifications       = sendNotifications
module.exports.revertSentNotifications = revertSentNotifications
module.exports.ackSentNotifications    = ackSentNotifications