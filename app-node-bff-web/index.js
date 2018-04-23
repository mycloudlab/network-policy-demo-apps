var request = require('request-promise');
var moment = require('moment-timezone')


// circuit break 
var Brakes = require('brakes');

function buildCircuitBreakerCall(uri, fallbackMessage) {
    return new Brakes(
        async function (params) {
            if (!params) { params = "" }
            try {
                return JSON.parse(await request({ uri: uri + params }));
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        {
            timeout: 3000,
            fallback: () => Promise.resolve({
                result: 'fallback',
                message: fallbackMessage,
                data: ''
            })
        });
}

// recover date from service url
const getDateTimeFromService = buildCircuitBreakerCall(process.env.DATETIME_SERVICE_URL, 'date time service is not availability');

// recover random php service
const getRandomDataFromService = buildCircuitBreakerCall(process.env.RANDOM_SERVICE_URL, 'remote random value is not availability');

// recover tweets node service
const getTweetsFromService = buildCircuitBreakerCall(process.env.TWEETS_SERVICE_URL, 'remote tweets value is not availability');


// serve with http
var express = require('express');
var app = express();

// endpoint for datetime service
// endpoint for random service
app.get('/data', function (req, res) {
    let datetime = getDateTimeFromService.exec();
    let random = getRandomDataFromService.exec();

    Promise.all([datetime, random])
        .then((resolvedValues) => {
            res.send({
                datetime: resolvedValues[0],
                random: resolvedValues[1]
            });
        }).catch((err) => {
            console.log(err);

        });
});

// endpoint for tweets service
app.get('/tweets', function (req, res) {
    getTweetsFromService.exec('/?q=' + req.query.q)
        .then(result => {
            res.send(result);
        });
});


app.listen(3000, function () {
    console.log('bff is started in port: 3000');
});