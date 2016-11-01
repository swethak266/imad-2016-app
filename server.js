var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/inspirational', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui','inspirational.html'));
});

app.get('/funny', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui','Funny.html'));
});

app.get('/life', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui','Life.html'));
});

app.get('/friendship', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui','Friendship.html'));
});

app.get('/success', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui','Success.html'));
});

app.get('/ui/main.js',function(req,res){
    res.sendFile(path.join(__dirname,'ui','main.js'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/blue.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'blue.jpg'));
});

app.get('/ui/ImgInsp.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'ImgInsp.jpg'));
});

app.get('/ui/imgInspBck.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'imgInspBck.jpg'));
});


app.get('/ui/bckgrnd.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'bckgrnd.jpg'));
});


app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
