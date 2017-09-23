const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const httpRequest = require('https');
var querystring = require('querystring');
var mongoose = require('mongoose');
var fs = require('fs');
var util = require('util');

const transaction = require('../models/Transaction.js');
const stock = require('../models/Stock.js');

/**
 * POST /transactions
 * Create a new transaction
 */
exports.simpleTest = (req, res, next) => {

    var http = new XMLHttpRequest();

    getCodeFromISIN('FR0004040608', function (err, code) {
        var startDate = "2017-01-01";
        var endDate = "2017-09-22";
        requestQuandlData(code, startDate, endDate);
    });

    function getCodeFromISIN(isinSource, callback) {    
        stock.findOne({ 'isin': isinSource }, 'code', function (err, stockFound) {
            if (err) return handleError(err);
            console.log(stockFound.code);
            callback(null, stockFound.code);
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
                var dates = response.dataset.data.map(function(value,index) { return value[0]; })
                dates.reverse();
                var closes = response.dataset.data.map(function(value,index) { return value[4]; })
                closes.reverse();
                updateStockClose(symbol, dates, closes);
            }
        }
        http.send();
    }

    function updateStockClose(codeSource, dates, closes) {
        stock.findOne({ 'code': codeSource }, function (err, stockFound) {
            if (err) return handleError(err);
            if (stockFound != null) {
                console.log("Ajout close : " + stockFound.code + " - " + stockFound.close.length + " / " + dates.length);
                // if (stockFound.close.length == 0) stockFound.close = [[]];
                stockFound.close = [[]];
                for (i=0; i<dates.length; i++) stockFound.close.push([dates[i], closes[i]]);
                stockFound.save();
            }
        })
    }

};