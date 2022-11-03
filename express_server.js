const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");

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
}))
// set the secret string as the Unlocking Charm in Harry Potter

////////////////////////////////
// setup all database objects //
///////////////////////////////

const urlDatabase = {};

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

// function to check whether a shortened url exists
const checkShortenedURL = (shortenedURL) => {
  for (const key in urlDatabase) {
    if (shortenedURL === key) {
      return true;
    } 
  }
  return false;
};

/* returns the URLs where the userID is equal 
to the id of the currently logged-in user. */
const urlsForUser = (id) => {
  const userUrlDatabase = {};
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userId) {
      userUrlDatabase[key] = urlDatabase[key];
    } 
  }
  return userUrlDatabase;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('Please login before viewing URLs.');
  } else {
    const templateVars = { urls: urlsForUser(req.session.user_id) , user: users[req.session.user_id] };
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
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send('account already registered');
  } else {
    const userId = generateRandomString();
    users[userId] = {
      id:       userId,
      email:    req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
    // hash password with bcrypt when storing
    console.log(users);
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
  const userObject = getUserByEmail(req.body.email);
  if (!userObject) {
    res.status(403).send('e-mail cannot be found');
  } else {
    if (!bcrypt.compareSync(req.body.password, userObject.password)){
      // use bcrypt to compare hashed password with the new input
      res.status(403).send('password does not match');
    } else {
      req.session.user_id = userObject.id
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
    res.redirect(`/urls/${shortURL}`); 
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!req.session.user_id) {
    res.status(403).send('Please login before viewing the shorten url page.');
  } else if (!checkShortenedURL(id)) {
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
  const shortURL = req.params.id
  if (checkShortenedURL(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }else {
    res.status(403).send('Invalid shortened URL');
  }
});

//implement a DELETE operation and redirect to the urls_index page afterwards
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (!req.session.user_id) {
    res.status(403).send('Please login before deleting the shorten url page.');
  } else if (!checkShortenedURL(id)) {
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
  } else if (!checkShortenedURL(id)) {
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