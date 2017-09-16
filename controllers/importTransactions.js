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
exports.importTransactions = (req, res, next) => {

    var http = new XMLHttpRequest();

    function importISIN() {
        var lineList = fs.readFileSync('../Euronext_Equities_EU.csv').toString().split('\n');
        lineList.shift();

        var schemaKeyList = ['isin', 'code'];
        
        function createDocRecurse(err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            if (lineList.length) {
                var line = lineList.shift();
                var doc = new isin();
                doc['id'] = mongoose.Types.ObjectId();
                line.split(';').forEach(function (entry, i) {
                    doc[schemaKeyList[i - 1]] = entry;
                });
                console.log(doc['code']);
                doc.save(createDocRecurse);
            }
        }

        createDocRecurse(null);
    }

    function importFromCSV() {
        var lineList = fs.readFileSync('../data.csv').toString().split('\n');
        lineList.shift(); // Shift the headings off the list of records.

        var schemaKeyList = ['isin', 'company', 'manager', 'date', 'nature', 'instrument',
            'price', 'quantity', 'total', 'capital_share', 'currency'];

        //function queryAllEntries() {
        //    transaction.aggregate(
        //        {
        //            $group: {
        //                _id: '$RepName', oppArray: {
        //                    $push: {
        //                        isin: 'isin'
        //                    }
        //                }
        //            }
        //        }, function (err, qDocList) {
        //            console.log(util.inspect(qDocList, false, 10));
        //            process.exit(0);
        //        });
        //}

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
            }
        }

        createDocRecurse(null);
    }

};