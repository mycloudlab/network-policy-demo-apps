var request = require('request-promise');
var moment = require('moment-timezone')

// fetch remote time from header
async function getRemoteDateTime() {
    try {
        response = await request({ uri: 'http://ntp.br/', resolveWithFullResponse: true });
        data = moment(response.headers.date);
        return {
            result: 'ok',
            message: '',
            data: data.tz('America/Sao_Paulo').format("YYYY-MM-DDTHH:mm:ss")
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
}


// circuit break 
var Brakes = require('brakes');
const brake = new Brakes(getRemoteDateTime, {
    timeout: 1000,
    fallback: () => Promise.resolve({
        result: 'fallback',
        message: 'remote data is not availability',
        data: ''
    })
});



// serve with http
var express = require('express');
var app = express();
app.get('/', function (req, res) {
    brake.exec()
        .then(result => {
            res.send(result);
        });
});
app.listen(3000, function () {
    console.log('Remote fetch time server is started in port: 3000');
});
