const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const httpRequest = require('https');
var querystring = require('querystring');
var mongoose = require('mongoose');
var fs = require('fs');
var util = require('util');

const transaction = require('../models/Transaction.js');
const isin = require('../models/Isin.js');

/**
 * POST /transactions
 * Create a new transaction
 */
exports.importPrices = (req, res, next) => {

    var http = new XMLHttpRequest();

    getCodeFromISIN('FR0010313486', function (err, code) {
        requestQuandlData(code, "2017-09-10", "2017-09-12");
    });

    function getCodeFromISIN(isinSource, callback) {    
        isin.findOne({ 'isin': isinSource }, 'code', function (err, stock) {
            if (err) return handleError(err);
            console.log(stock.code);
            callback(null, stock.code);
        })
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
    function requestQuandlData(symbol, startDate, endDate) {
        var quandl = "https://www.quandl.com/api/v3/datasets/EURONEXT/" + symbol + "?start_date=" + startDate +
            "&end_date=" + endDate + "&api_key=x-sv5jiML9zikPj8wjJy";
        console.log(quandl);
        http.open("GET", quandl, true);
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                var response = JSON.parse(http.responseText);
                console.log(response.dataset.data[0][4]);
            }
        }
        http.send();
    }

    //transaction.create({
    //}, function (err) {
    //    if (err) return handleError(err);
    //})

};