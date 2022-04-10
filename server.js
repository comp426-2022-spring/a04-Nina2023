// requirements 
const express = require('express')
const minimist = require("minimist")
const args = require('minimist')(process.argv.slice(2))
const coin_functions = require('./modules/coin')

// new requirements 
const db = require('./database.js')
const morgan = require('morgan')
const fs = require('fs')

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

args["port"]
const port = args.port || 5000


if(args.log == 'false') {
    console.log("Not creating a new access.log")
}
else {
    // Use morgan
    const WRITESTREAM = fs.createWriteStream('access.log', { flags: 'a' })
    app.use(morgan('combined', { stream: WRITESTREAM }))
}

//middleware

app.use( (req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    console.log(logdata)
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
    next();
    })

    if(args.debug === true) {
        app.get('/app/log/access/', (req, res) => {
            const stmt = db.prepare("SELECT * FROM accesslog").all()
            res.status(200).json(stmt)
        });
        app.get('/app/error', (req, res) => {
            throw new Error('Error test successful.')
        });
    } 


//start server

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

// define endpoints
app.get('/app/', (req, res) => {
    res.statusCode = 200
    res.statusMessage = 'OK'
    res.writeHead(res.statusCode, {'Content-Type' : 'text/plain'})
    res.end(res.statusCode + ' ' + res.statusMessage)
})

app.get('/app/flips/:number', (req, res) => {
    const flips = coin_functions.coinFlips(req.params.number)
    res.status(200).json({raw: flips, summary: coin_functions.countFlips(flips)})
})

app.get('/app/flip/call/tails', (req, res) => {
    const r = coin_functions.flipACoin("tails")
    res.status(200).json({call: r.call, flip: r.flip, result: r.result})
})

app.get('/app/flip/call/heads', (req, res) => {
    const result = coin_functions.flipACoin("heads")
    res.status(200).json({call: result.call, flip: result.flip, result: result.result})
})

app.get('/app/flip/', (req, res) => {
    res.status(200).json({flip: coin_functions.coinFlip()})
})

// help functions

const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}




// error message
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
    res.type('text/plain')
})