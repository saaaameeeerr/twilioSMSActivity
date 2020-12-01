'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var http = require('https');
var request = require('request');

const { JsonWebTokenError } = require('jsonwebtoken');



exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function(req, res) {

    console.log("5 -- For Edit");
    console.log("4");
    console.log("3");
    console.log("2");
    console.log("1");
    //console.log("Edited: "+req.body.inArguments[0]);    

    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function(req, res) {

    console.log("5 -- For Save");
    console.log("4");
    console.log("3");
    console.log("2");
    console.log("1");
    //console.log("Saved: "+req.body.inArguments[0]);

    // Data from the req and put it in an array accessible to the main app.
    console.log(req.body);
    logData(req);
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function(req, res) {

    console.log("5 -- For Execute");
    console.log("4");
    console.log("3");
    console.log("2");
    console.log("1");
    console.log("Executed: " + JSON.stringify(req.body.inArguments[0]));


    var requestBody = req.body.inArguments[0];
    var uniqueEmail = req.body.keyValue;
    console.log(uniqueEmail);
    const accountSid = requestBody.accountSid;
    const authToken = requestBody.authToken;
    const to = requestBody.to;
  //  const from = requestBody.messagingService;
    console.log("yeh request body address hai " + requestBody.address);
    const body = requestBody.body + ',' + requestBody.address;

    const client = require('twilio')(accountSid, authToken);
    client.messages
        .create({
            body: body,
            statusCallback: 'http://postb.in/1234abcd',
            from: '+12018905995',
            to: '+91' + to
        })
        .then(message => {


            /**** Start of Web Service ****/
            var authEndpoint = "mc6vgk-sxj9p08pqwxqz9hw9-4my.auth.marketingcloudapis.com" //add authentication endpoint


            const data = JSON.stringify({
                client_id: "sr7id7zht854bwdco8t9qdym", //pass Client ID
                client_secret: "vhmEsBaxDl3LVeqYbLUxsg6p", //pass Client Secret
                grant_type: "client_credentials"
            })

            const options = {
                hostname: authEndpoint,
                path: '/v2/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            }
            var accTok = '';
            var restURL = '';
            const requestForToken = http.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`)
                var jsonString = '';
                res.on('data', d => {
                    jsonString += d;
                    process.stdout.write(d)
                })
                res.on('end', function() {
                    var resData = JSON.parse(jsonString);
                    accTok += resData.access_token
                    restURL += resData.rest_instance_url
                    console.log(`Access Token \n` + accTok);
                    console.log(`Rest URL Endpoint \n` + restURL);
                    console.log(`Unique Email Address` + uniqueEmail);

                    /****Start of Update Data extension with the tracking details of sms from twilio*/
                    const data1 = {
                        "items": [{
                            "Email": uniqueEmail,
                            "Status": message.status,
                            "AccountSID": message.accountSid,
                       //     "apiVersion": message.apiVersion,
                            "Body": message.body,
                            "dateCreated": message.dateCreated,
                            "dateUpdated": message.dateUpdated,
                            "dateSent": message.dateSent,
                         //   "direction": message.direction,
                            "from": message.from,
                           // "messagingServiceSid": message.messagingServiceSid,
                           // "price": message.price,
                           // "priceUnit": message.priceUnit,
                           // "sid": message.sid,
                           // "uri": message.uri
                        }]
                    }
                    request.put({
                        headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + accTok },
                        url: restURL + '/data/v1/async/dataextensions/key:7A2B114A-71CD-4E20-AB3B-79A0B06DC1B8/rows',
                        body: data1,
                        json: true
                    }, function(error, response, body) {
                        console.log(error);
                        console.log(" Body yeh hai : " + body);
                        console.log( " yeh paresed body hai" + JSON.parse(jsonString) );
                        console.log("resultMessages" + body.resultMessages);
                    });
                    /****End of Update Data extension with the tracking details of sms from twilio*/
                })
            })
            requestForToken.on('error', error => {
                console.error(error);
            })
            requestForToken.write(data);
            requestForToken.end();

            /**** End of Web Service ****/

            console.log("message yeh hai end me" + message)
        })
        .done();
    //add a new row with url to a data extensions
    // FOR TESTING
    logData(req);
    res.send(200, 'Publish');

    // Used to decode JWT
    // JWT(req.body, process.env.jwtSecret, (err, decoded) => {

    //     // verification error -> unauthorized request
    //     if (err) {
    //         console.error(err);
    //         return res.status(401).end();
    //     }

    //     if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

    //         // decoded in arguments
    //         var decodedArgs = decoded.inArguments[0];

    //         logData(req);
    //         res.send(200, 'Execute');
    //     } else {
    //         console.error('inArguments invalid.');
    //         return res.status(400).end();
    //     }
    // });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function(req, res) {

    console.log("5 -- For Publish");
    console.log("4");
    console.log("3");
    console.log("2");
    console.log("1");
    //console.log("Published: "+req.body.inArguments[0]);        

    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function(req, res) {

    console.log("5 -- For Validate");
    console.log("4");
    console.log("3");
    console.log("2");
    console.log("1");
    //console.log("Validated: "+req.body.inArguments[0]);       

    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Validate');
};
