const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const httpRequest = require('https');
var querystring = require('querystring');
var mongoose = require('mongoose');
var fs = require('fs');
var util = require('util');
var async = require('async');

const transactionMongoose = require('../models/Transaction.js');
const stockMongoose = require('../models/Stock.js');

/**
 * POST /transactions
 * Create a new transaction
 */
exports.simpleTest = (req, res, next) => {

    // var codeSource = "ABCA";
    // var isinSource = "FR0004040608";

    var codeSource = "BLC";
    var isinSource = "FR0000035370";

    var deltas = [[]];
    var startStart = 2;
    var startEnd = 7;
    var endStart = 4;
    var endEnd = 50;
    for (s = startStart; s < startEnd; s++) {
        var temp = [];
        for (e = endStart; e < endEnd; e++) {
            temp.push(0);
        }
        deltas.push(temp);
    }

    var nTransactions = 0;
    var nFailures = 0;

    transactionMongoose.find({ 'nature': 'Acquisition' }, function (err, transactions) {
        var trs = transactions.slice(300, transactions.length);
        nTransactions = trs.length;
        async.each(trs, function (transaction, callback) {
            stockMongoose.findOne({ 'isin': transaction.isin }, function (err, stock) {
                testTransaction(transaction, stock);
                callback(null);
            });
        }, logDeltas);
    });

    // stockMongoose.findOne({ 'code': codeSource }, function (err, stock) {
    //     transactionMongoose.find({ 'isin': isinSource, 'nature': 'Acquisition' }, function (err, transactions) {
    //         async.each(transactions, function (transaction, callback) {
    //             testTransaction(transaction, stock);
    //             callback(null);
    //         }, logDeltas);
    //     });
    // });

    function testTransaction(transaction, stock) {
        if (stock == null) return;
        console.log(stock.code + " - " + transaction.date);
        var dateToFind = transaction.date;
        var dates = stock.close.map(function (value, index) { return value[0]; });
        var closes = stock.close.map(function (value, index) { return value[1]; });
        var len = dates.length;
        if (len == 0) {
            console.log("Pas de donnees pour : " + stock.code);
            nFailures++;
        }
        for (s = startStart; s < startEnd; s++) {
            for (e = endStart; e < endEnd; e++) {
                if (e > s) {
                    for (i = 0; i < len; i++) {
                        if (s+e+i < len) {
                            var d = new Date(dates[i]);
                            var delta = 0;
                            if (dateToFind.getTime() == d.getTime()) {
                                var firstClose = Number(closes[i + s]);
                                var lastClose = Number(closes[i + e + s]);
                                delta = (lastClose - firstClose) / firstClose;
                                deltas[s - startStart][e - endStart] = deltas[s - startStart][e - endStart] + delta;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    function logDeltas() {
        var min = 999999999999;
        var max = -999999999999;
        var sMin = 0;
        var eMin = 0;
        var sMax = 0;
        var eMax = 0;
        for (s = startStart; s < startEnd; s++) {
            for (e = endStart; e < endEnd; e++) {
                var val = deltas[s - startStart][e - endStart];
                if (val > max) {
                    max = val;
                    sMax = s;
                    eMax = e;
                } else if (val < min) {
                    min = val;
                    sMin = s;
                    eMin = e;
                }
            }
        }
        var nTFinal = nTransactions-nFailures;
        min = min / nTFinal;
        max = max / nTFinal;
        console.log("Transactions: " + nTFinal);
        console.log("min: " + min.toPrecision(2) + " ( " + sMin + " - " + eMin + " )");
        console.log("max: " + max.toPrecision(2) + " ( " + sMax + " - " + eMax + " )");
    }

};