const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

// require all helper functions from the module
const { getUserByEmail, generateRandomString, checkShortenedURL, urlsForUser } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

///////////////////////
// server middleware //
///////////////////////

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'user_id',
  secret: 'alohomora',
}));
// set the secret string as the Unlocking Charm in Harry Potter

////////////////////////////////
// setup all database objects //
///////////////////////////////

const urlDatabase = {};
const users = {};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('Please login before viewing URLs.');
  } else {
    const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase) , user: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  }
});

///////////////////////////////
// set up the regeister page //
///////////////////////////////

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === '') {
    res.status(400).send('email is invalid');
  } else if (req.body.password === '') {
    res.status(400).send('password is invalid');
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('account already registered');
  } else {
    const userId = generateRandomString();
    users[userId] = {
      id:       userId,
      email:    req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    // hash password with bcrypt when storing
    res.redirect('/login');
  }
});

///////////////////////////
// set up the login page //
///////////////////////////

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const userObject = getUserByEmail(req.body.email, users);
  if (!userObject) {
    res.status(403).send('e-mail cannot be found');
  } else {
    if (!bcrypt.compareSync(req.body.password, userObject.password)) {
      // use bcrypt to compare hashed password with the new input
      res.status(403).send('password does not match');
    } else {
      req.session.user_id = userObject.id;
      // use cookie-session to setup the user_id cookie
      res.redirect('/urls');
    }
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('Please login before using the tiny APP.');
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userId: req.session.user_id
    };
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!req.session.user_id) {
    res.status(403).send('Please login before viewing the shorten url page.');
  } else if (!checkShortenedURL(id, urlDatabase)) {
    res.status(403).send('Invalid shorten url');
  } else if (req.session.user_id !== urlDatabase[id].userId) {
    res.status(403).send('Sorry! You don\' own this url.');
  } else {
    const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: users[req.session.user_id]};
    res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//redirect the shortURL to the appropriate longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (checkShortenedURL(shortURL, users)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(403).send('Invalid shortened URL');
  }
});

//implement a DELETE operation and redirect to the urls_index page afterwards
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (!req.session.user_id) {
    res.status(403).send('Please login before deleting the shorten url page.');
  } else if (!checkShortenedURL(id, urlDatabase)) {
    res.status(403).send('Invalid shorten url');
  } else if (req.session.user_id !== urlDatabase[id].userId) {
    res.status(403).send('Sorry! You don\' own this url.');
  } else {
    delete urlDatabase[id];
    res.redirect('/urls');
  }
});

//implement an EDIT operation and redirect to the urls_index page afterwards
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  if (!req.session.user_id) {
    res.status(403).send('Please login before editing the shorten url page.');
  } else if (!checkShortenedURL(id, urlDatabase)) {
    res.status(403).send('Invalid shorten url');
  } else if (req.session.user_id !== urlDatabase[id].userId) {
    res.status(403).send('Sorry! You don\' own this url.');
  } else {
    urlDatabase[id].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

//clear the cookie after receiving a logout commend
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});