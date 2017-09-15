const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const httpRequest = require('https');
var querystring = require('querystring');
var mongoose = require('mongoose');
var fs = require('fs');
var util = require('util');

/**
 * GET /transactions
 * Liste des transactions
 */
const transaction = require('../models/Transaction.js');

exports.getTransactions = (req, res) => {
    transaction.find((err, docs) => {
      res.render('transactions', { transactions: docs });
  });
};

/**
 * POST /transactions
 * Create a new transaction
 */
exports.postTransactions = (req, res, next) => {

    var http = new XMLHttpRequest();
    //var url = "https://lestransactions.fr/api";
    //var params = "date=2017-06-30";
    ////var params = "isin=FR0004152882"
    //http.open("POST", url, true);

    //http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ////http.setRequestHeader("Content-type", "multipart/form-data");
    ////http.setRequestHeader("Content-length", params.length);
    ////http.setRequestHeader("Connection", "close");
    //http.setRequestHeader("Access-Control-Allow-Origin", "*");
    //http.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); 

    //http.onreadystatechange = function () {
    //    if (http.readyState == 4 && http.status == 200) {
    //        var response = JSON.parse(http.responseText);
    //        console.log(response);
    //    }
    //}
    //http.send(params);

    //var postData = 'date=2017-06-30'
    //var postBody = querystring.stringify(postData);

    //var options = {
    //    host: 'lestransactions.fr',
    //    port: 443,
    //    path: '/api',
    //    headers: {
    //        'Content-Type': 'application/x-www-form-urlencoded',
    //        'Content-Length': postBody.length
    //    },
    //    //body: {"date":"2017-06-30"},
    //    method: 'POST'
    //};

    //var req = httpRequest.request(options, function (res) {
    //    console.log('STATUS: ' + res.statusCode);
    //    console.log('HEADERS: ' + JSON.stringify(res.headers));
    //    res.setEncoding('utf8');
    //    res.on('data', function (chunk) {
    //        console.log('BODY: ' + chunk);
    //    });
    //});

    //req.on('error', function (e) {
    //    console.log('problem with request: ' + e.message);
    //});

    //// write data to request body
    //req.write(postBody);
    //req.end();


    //postBody = "date=2017-06-30";

    //options = {
    //    host: 'lestransactions.fr',
    //    path: '/api',
    //    port: 443,
    //    method: 'POST',
    //   //your options which have to include the two headers
    //   headers : {
    //            'Content-Type': 'application/x-www-form-urlencoded',
    //            'Content-Length': postBody.length
    //        }
    //};

    //var https = require('https')
    //var request = https.request(options, function (response) {
    //    // Handle the response
    //});
    //request.write(postBody);
    //request.end();

    importFromCSV();

    function importFromCSV() {
        var lineList = fs.readFileSync('../data.csv').toString().split('\n');
        lineList.shift(); // Shift the headings off the list of records.

        var schemaKeyList = ['isin', 'company', 'manager', 'date', 'nature', 'instrument',
            'price', 'quantity', 'total', 'capital_share', 'currency'];

        function queryAllEntries() {
            transaction.aggregate(
                {
                    $group: {
                        _id: '$RepName', oppArray: {
                            $push: {
                                isin: 'isin'
                            }
                        }
                    }
                }, function (err, qDocList) {
                    console.log(util.inspect(qDocList, false, 10));
                    process.exit(0);
                });
        }

        // Recursively go through list adding documents.
        // (This will overload the stack when lots of entries
        // are inserted.  In practice I make heavy use the NodeJS 
        // "async" module to avoid such situations.)
        function createDocRecurse(err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            if (lineList.length) {
                var line = lineList.shift();
                var doc = new transaction();
                doc['id'] = mongoose.Types.ObjectId();
                line.split(';').forEach(function (entry, i) {
                    doc[schemaKeyList[i]] = entry;
                });
                doc.save(createDocRecurse);
            } else {
                // After the last entry query to show the result.
                //queryAllEntries();
            }
        }

        createDocRecurse(null);
    }

    //AlphaVantage API Key: 974UTD95QA2DV3Y5
    function requestAlphaVantageData(symbol) {
        var quandl = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=974UTD95QA2DV3Y5";
        http.open("GET", quandl, true);
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                var response = JSON.parse(http.responseText);
                console.log(response);
            }
        }
        http.send();
    }

    // Quandl API Key: x-sv5jiML9zikPj8wjJy
    function requestQuandlData(symbol) {
        var quandl = "https://www.quandl.com/api/v3/datasets/EURONEXT/JXRBS?start_date=2017-09-12&end_date=2017-09-12&api_key=x-sv5jiML9zikPj8wjJy";
        http.open("GET", quandl, true);
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                var response = JSON.parse(http.responseText);
                console.log(response);
            }
        }
        http.send();
    }

    //transaction.create({
    //}, function (err) {
    //    if (err) return handleError(err);
    //})

};