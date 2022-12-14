// function to finding a user object from its email
const getUserByEmail = function(email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};

//function to create a random 6-digit-character short URL name
const generateRandomString = () => {
  let result             = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// function to check whether a shortened url exists
const checkShortenedURL = (shortenedURL, database) => {
  for (const key in database) {
    if (shortenedURL === key) {
      return true;
    }
  }
  return false;
};

/* returns the URLs where the userID is equal
to the id of the currently logged-in user. */
const urlsForUser = (id, database) => {
  const userUrlDatabase = {};
  for (const key in database) {
    if (id === database[key].userId) {
      userUrlDatabase[key] = database[key];
    }
  }
  return userUrlDatabase;
};

module.exports = { getUserByEmail, generateRandomString, checkShortenedURL, urlsForUser};