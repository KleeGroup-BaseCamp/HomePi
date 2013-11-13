/*
 * Basic HTTP Client to send data to the Cloud Server
 *
 */

var http = require('http');

var requestQueue = [];
var isInitiated = false;
var port = 4000;
var host = 'localhost';

exports.init = function (params){
    post = params.port;
    host = params.host;

    isInitiated = true;
};

function send (json){
    if(!isInitiated){
        throw new Error("HttpClient is not initiated...");
    }
    var options = {
        hostname: host,
        port: port,
        path: '/collector/collect/',
        method: 'POST',
    };
 
    var req = http.request(options, function(res) {
      console.log('\nSTATUS: ' + res.statusCode);
      //console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        //console.log('BODY: ' + chunk);
      });
    });

    req.on('error', function(e) {
      console.log('error with request: ' + e.message);
      requestQueue.push(json);
      console.log('request queued, will retry later.');
    });
    // set request header
    req.setHeader('content-type', 'application/json');
    // write data to request body
    
    console.log("Sending" + JSON.stringify(json));
    req.write(JSON.stringify(json));

    req.end();
 }

exports.send = send;
// Boucle de renvoi des données en cas d'erreur
setInterval(
    function(){
        var fixedQueue = requestQueue;
        requestQueue = [];
        var requestData;
        while(requestData = fixedQueue.shift()){
            send(requestData);
        }
            
    },
    15000
 );
