var express = require('express');
var morgan = require('morgan');
var path = require('path');
var pool= require('pg').pool;
var crypto=require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');


var app = express();
app.use(morgan('combined'));

var config={
    user: 'swethak266',
    database: 'swethak266',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: db-swethak266-13509
};

var pool = new Pool(config);

function hash (input, salt) {
    // How do we create a hash?
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function(req, res) {
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
});

app.post('/create-user', function (req, res) {
   // username, password
   // {"username": "tanmai", "password": "password"}
   // JSON
   var username = req.body.username;
   var password = req.body.password;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send('User successfully created: ' + username);
      }
   });
});


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

app.get('/ui/lifeimg.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'lifeimg.jpg'));
});

app.get('/ui/funnyimg.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'funnyimg.jpg'));
});

app.get('/ui/successimg.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'successimg.jpg'));
});

app.get('/ui/friendimg.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'friendimg.jpg'));
});

app.get('/ui/mainimg.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'mainimg.jpg'));
});

app.get('/ui/pink.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'pink.jpg'));
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
