var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config={
    user: 'swethak266',
    database: 'swethak266',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
    <html>
      <head>
          <title>
              ${title}
          </title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="/ui/style.css" rel="stylesheet" />
      </head> 
      <body>
          <div class="container">
              <div>
                  <a href="/">Home</a>
              </div>
              <hr/>
              <h3>
                  ${heading}
              </h3>
              <div>
                  ${date.toDateString()}
              </div>
              <div>
                ${content}
              </div>
              <hr/>
              <h4>Comments</h4>
              <div id="comment_form">
              </div>
              <div id="comments">
                <center>Loading comments...</center>
              </div>
          </div>
          <script type="text/javascript">
        var currentArticleTitle = window.location.pathname.split('/')[2];

        function loadCommentForm () {
            var commentFormHtml = '<h5>Submit a comment</h5>';
            commentFormHtml += '<textarea id="comment_text" rows="5" cols="100" placeholder="Enter your comment here..."></textarea>';
            commentFormHtml += '<br/>';
            commentFormHtml += '<input type="submit" id="submit" value="Submit" />';
            commentFormHtml += '<br/>';
              
            document.getElementById('comment_form').innerHTML = commentFormHtml;

            // Submit username/password to login
            var submit = document.getElementById('submit');
            submit.onclick = function () {
                // Create a request object
                var request = new XMLHttpRequest();

                // Capture the response and store it in a variable
                request.onreadystatechange = function () {
                  if (request.readyState === XMLHttpRequest.DONE) {
                        // Take some action
                        if (request.status === 200) {
                            // clear the form & reload all the comments
                            document.getElementById('comment_text').value = '';
                            loadComments();    
                        } else {
                            alert('Error! Could not submit comment');
                        }
                        submit.value = 'Submit';
                  }
                };

                // Make the request
                var comment = document.getElementById('comment_text').value;
                request.open('POST', '/submit-comment/' + currentArticleTitle, true);
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify({comment: comment}));  
                submit.value = 'Submitting...';

            };
        }

        function loadLogin () {
            // Check if the user is already logged in
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE) {
                    if (request.status === 200) {
                        loadCommentForm(this.responseText);
                    }
                }
            };

            request.open('GET', '/check-login', true);
            request.send(null);
        }

        function escapeHTML (text)
        {
            var $text = document.createTextNode(text);
            var $div = document.createElement('div');
            $div.appendChild($text);
            return $div.innerHTML;
        }

        function loadComments () {
                // Check if the user is already logged in
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE) {
                    var comments = document.getElementById('comments');
                    if (request.status === 200) {
                        var content = '';
                        var commentsData = JSON.parse(this.responseText);
                        for (var i=0; i< commentsData.length; i++) {
                            var time = new Date(commentsData[i].timestamp);
                            content += '<div class="comment">';
                            content += '    <p>'+escapeHTML(commentsData[i].comment)+'</p>';
                            content += '    <div class="commenter">';
                            content += '        '+commentsData[i].username+' - '+time.toLocaleTimeString()+' on '+time.toLocaleDateString();
                            content += '    </div>';
                            content += '</div>';
                        }
                        comments.innerHTML = content;
                    } else {
                        comments.innerHTML('Oops! Could not load comments!');
                    }
                }
            };

            request.open('GET', '/get-comments/' + currentArticleTitle, true);
            request.send(null);
        }


        // The first thing to do is to check if the user is logged in!
        loadLogin();
        loadComments();

        </script>
      </body>
    </html>
    `;
    return htmlTemplate;
}

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

app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});
 
app.post('/login', function (req, res) {
   var username = req.body.username;
   var password = req.body.password;
   
   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (result.rows.length === 0) {
              res.status(403).send('username/password is invalid');
          } else {
              // Match the password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
              var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
              if (hashedPassword === dbString) {
                
                // Set the session
                req.session.auth = {userId: result.rows[0].id};
                // set cookie with a session id
                // internally, on the server side, it maps the session id to an object
                // { auth: {userId }}
                
                res.send('credentials correct!');
                
              } else {
                res.status(403).send('username/password is invalid');
              }
          }
      }
   });
});

app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
});

var pool = new Pool(config);

app.get('/get-articles', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.get('/get-comments/:articleName', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query(
                        'INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)',
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

app.get('/articles/:articleName', function (req, res) {
  // SELECT * FROM article WHERE title = '\'; DELETE WHERE a = \'asdf'
  pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName], function (err, result) {
    if (err) {
        res.status(500).send(err.toString());
    } else {
        if (result.rows.length === 0) {
            res.status(404).send('Article not found');
        } else {
            var articleData = result.rows[0];
            res.send(createTemplate(articleData));
        }
    }
  });
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});

//------------------------


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

app.get('/ui/article.js',function(req,res){
    res.sendFile(path.join(__dirname,'ui','article.js'));
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
