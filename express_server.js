const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

////////////////////////////////
// setup all database objects //
///////////////////////////////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

//function to create a random 6-digit-character short URL name 
const generateRandomString = () => {
  let result             = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase , username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

///////////////////////////////
// set up the regeister page //
///////////////////////////////

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  console.log(req.body.email);
  users[userId] = {
    id:       userId,
    email:    req.body.email,
    password: req.body.password
  }
  console.log(users);
  res.cookie('user_id', userId);
  res.redirect('/urls/'); 
});

//////////////////////////

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL); 
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//redirect the shortURL to the appropriate longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//implement a DELETE operation and redirect to the urls_index page afterwards
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls/'); 
});

//implement an EDIT operation and redirect to the urls_index page afterwards
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls/'); 
});

//set a cookie named username to the value submitted in the request body via the login form
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls/'); 
});

//clear the cookie after receiving a logout commend
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/'); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});