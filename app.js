/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require("fs");
var crypto = require('crypto');
var url = require('url');

var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon(__dirname + '/public/images/favicon.png'));
app.use(express.logger('dev'));
app.use(express.json({
  limit: '20mb'
}));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/profilbild', routes.index);
app.get('/klar', routes.index);
app.post('/upload', function(req, res) {

  var base64Data = req.body.imgData.replace(/^data:image\/png;base64,/,'');
  var hash = crypto.createHash('md5').update(new Date().toString()).digest('hex');

  var name = req.body.id + "-" + hash + ".png";

  console.log('statusCode', res.statusCode);
  
  fs.writeFile('public/uploads/' + name, base64Data, 'base64', function(err) {
   
    if(err) {
      console.log(err);
      res.send({error: err});
    }
    res.send( {
      name : name, 
      path: '/uploads/' + name,
    } );

  });

});
app.use(function(req, res, next) {
  res.status(404).redirect('/');
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
