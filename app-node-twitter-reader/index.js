// init twitter connection
var Twitter = require('twitter');

let options = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

var client = new Twitter(options);

// fetch remote tweets
async function getTweets(q) {
    return new Promise((resolve, reject) => {

        client.get('search/tweets', { q }, function (error, tweets, response) {
            if (error) {
                reject(error);
                return;
            }
            resolve({
                result: 'ok',
                message: '',
                data: tweets
            });
        });
    });
}

// circuit break 
var Brakes = require('brakes');
const brake = new Brakes(getTweets, {
    timeout: 3000,
    fallback: () => Promise.resolve({
        result: 'fallback',
        message: 'remote tweets is not availability',
        data: ''
    })
});

// serve with http
var express = require('express');
var app = express();
app.get('/', function (req, res) {
    brake.exec(req.query.q)
        .then(result => {
            res.send(result);
        }).catch(err => {
            console.log(err);
        });
});

app.listen(3000, function () {
    console.log('Remote fetch time server is started in port: 3000');
});

