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

// function to finding a user object from its email
const getUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase , user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

///////////////////////////////
// set up the regeister page //
///////////////////////////////

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '') {
    res.status(400).send('email is invalidate');
  } else if (req.body.password === '') {
    res.status(400).send('password is invalidate');
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send('account already registered');
  } else {
    const userId = generateRandomString();
    users[userId] = {
      id:       userId,
      email:    req.body.email,
      password: req.body.password
    }
    res.cookie('user_id', userId);
    res.redirect('/urls/'); 
  }
});

//////////////////////////

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL); 
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id], user: users[req.cookies["user_id"]]};
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

//clear the cookie after receiving a logout commend
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/'); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});