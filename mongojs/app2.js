var express = require('express'),
app = express(),
engines = require('consolidate'),
bodyParser = require('body-parser'),
MongoClient = require('mongodb').MongoClient,
assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true })); 

// Handler for internal server errors
function errorHandler(err, req, res, next) {
console.error(err.message);
console.error(err.stack);
res.status(500).render('error_template', { error: err });
}

//For use on glitch.com to prevent database hacking.
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
//var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;

//for use locally, delete this line -don't comment it out when switching to glitch.
var uri = 'mongodb://'+"";


MongoClient.connect(uri, function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB/%s.", uri);

    app.get('/', function(req, res, next) {
        res.render('add_movie', {});
    });

    app.post('/add_movie', function(req, res, next) {
        var title = req.body.title;
        var year = req.body.year;
        var imdb = req.body.imdb;
        
        if ((title == '') || (year == '') || (imdb == '')) {
            next('Please provide an entry for all fields.');
        } else {
            db.collection('movies').insertOne(
                { 'title': title, 'year': year, 'imdb': imdb },
                function (err) {
                    assert.equal(null, err);
                    db.collection('movies').find({'title':title}).toArray(function(err,docs){
                    res.render('movies', { 'movies' : docs, 'updatedTitle': title});
                    });
                }
            );
        }
    });

    app.use(errorHandler);

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});