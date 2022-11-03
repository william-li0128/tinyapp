const { assert } = require('chai');

const { getUserByEmail, generateRandomString, checkShortenedURL } = require('../helpers.js');

/////////////////////////
// test getUserByEmail //
/////////////////////////

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert(user === testUsers[expectedUserID], 'return the right user object');
  });
});

describe('getUserByEmail', function() {
  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedUserID = undefined;
    assert(user === undefined, 'return undefined with invalid email');
  });
});

////////////////////////////
// test checkShortenedURL //
////////////////////////////

describe('checkShortenedURL', function() {
  it('should return true if the userID exists', function() {
    const result = checkShortenedURL("userRandomID", testUsers)
    const expectedUserID = true;
    assert(result === expectedUserID, 'return true if the id exists');
  });
});

describe('checkShortenedURL', function() {
  it('should return false if the userID doesn\'t exist', function() {
    const result = checkShortenedURL("user3RandomID", testUsers)
    const expectedUserID = false;
    assert(result === expectedUserID, 'return false if the id doesn\'t exist');
  });
});