// function to finding a user object from its email
const getUserByEmail = function(email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    } 
  }
  return null;
};





module.exports = { getUserByEmail };