const generateRandomString = (length) => {
  const alphanumericChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * alphanumericChars.length);
    randomString += alphanumericChars.charAt(index);
  }
  return randomString;
};

const getUserByEmail = (email, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }

  return null;
}

const verifyPassword = (password, users) => {
  for (const userPwd in users) {
    const verified = users[userPwd];
    if (verified.password === password) {
      return verified;
    }
  }
  return null;
}

module.exports = {generateRandomString, getUserByEmail, verifyPassword}

