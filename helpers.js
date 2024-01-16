//Generates a random string of alphanumeric characters of a specified length.
const generateRandomString = (length) => {
  const alphanumericChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * alphanumericChars.length);
    randomString += alphanumericChars.charAt(index);
  }
  return randomString;
};

//Finds a user in the given users database by their email.
const getUserByEmail = (email, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }

  return null;
}

//Retrieves all URLs associated with a specific user from the URL database.
const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const urlData = urlDatabase[shortURL];
    if (urlData.userID === id) {
      userUrls[shortURL] = urlData;
    }
  }
  return userUrls;
};

// Exporting the functions for external use
module.exports = {generateRandomString, getUserByEmail, urlsForUser}

