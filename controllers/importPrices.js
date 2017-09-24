const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const httpRequest = require('https');
var querystring = require('querystring');
var mongoose = require('mongoose');
var fs = require('fs');
var util = require('util');
var async = require('async');

const transaction = require('../models/Transaction.js');
const stock = require('../models/Stock.js');

/**
 * POST /prices
 * Import prices
 */
exports.importPrices = (req, res, next) => {

    transaction.find({ 'nature': 'Acquisition' }, function (err, transactions) {
        if (err) return handleError(err);
        if (transactions != null) {
            // getData(transactions[0].isin);
            async.each(transactions, function(transactionFound, callback) {
                getData(transactionFound.isin);
            })
            // transactions.forEach(function(transactionFound) {
            //     async.parallel(getData(transactionFound.isin));
            // }, this);
        }
    });

    function getData(isin) {
        getCodeFromISIN(isin, function (err, stock) {
            var startDate = "2017-01-01";
            var endDate = "2017-09-22";
            requestQuandlData(stock, startDate, endDate);
        });
    }

    function getCodeFromISIN(isinSource, callback) {
        stock.findOne({ 'isin': isinSource }, function (err, stockFound) {
            if (err) return handleError(err);
            if (stockFound != null) {
                console.log(stockFound.code);
                callback(null, stockFound);
            }
        })
    }

    //AlphaVantage API Key: 974UTD95QA2DV3Y5
    function requestAlphaVantageData(symbol) {
        var alpha = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=974UTD95QA2DV3Y5";
        var http = new XMLHttpRequest();
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
    function requestQuandlData(stock, startDate, endDate) {
        var quandl = "https://www.quandl.com/api/v3/datasets/EURONEXT/" + stock.code + "?start_date=" + startDate +
            "&end_date=" + endDate + "&api_key=x-sv5jiML9zikPj8wjJy";
        // console.log(quandl);
        if (stock != null) {
            if (!stock.already_imported) {
                var http = new XMLHttpRequest();
                http.open("GET", quandl, true);
                http.onreadystatechange = function () {
                    if (http.readyState == 4 && http.status == 200) {
                        var response = JSON.parse(http.responseText);
                        var dates = response.dataset.data.map(function (value, index) { return value[0]; })
                        dates.reverse();
                        var closes = response.dataset.data.map(function (value, index) { return value[4]; })
                        closes.reverse();
                        updateStockClose(stock, dates, closes);
                    }
                }
                http.send();
            }
        }
    }

    function updateStockClose(stock, dates, closes) {
        if (stock != null) {
            console.log("Ajout close : " + stock.code + " - " + stock.close.length + " / " + dates.length);
            // if (stock.close.length == 0) stock.close = [[]];
            stock.close = [[]];
            for (i = 0; i < dates.length; i++) stock.close.push([dates[i], closes[i]]);
            stock.already_imported = true;
            stock.save();
        }
    }

};