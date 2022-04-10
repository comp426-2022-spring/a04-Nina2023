// requirements 
const express = require('express')
const minimist = require("minimist")
const args = require('minimist')(process.argv.slice(2))
const coin_functions = require('./modules/coin')
const app = express()

args["port"]
const port = args.port || 5000


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




// error message
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
    res.type('text/plain')
})