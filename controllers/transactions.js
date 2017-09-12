const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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
    var url = "https://lestransactions.fr/api";
    var params = "date=2017-06-30";
    //var params = "isin=FR0004152882"
    http.open("POST", url, true);

    //http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //http.setRequestHeader("Content-type", "multipart/form-data");
    //http.setRequestHeader("Content-length", params.length);
    //http.setRequestHeader("Connection", "close");

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var response = JSON.parse(http.responseText);
            console.log(response);
        }
    }
    http.send(params);

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