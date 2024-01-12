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

<<<<<<< HEAD
module.exports = {generateRandomString, getUserByEmail, verifyPassword}
=======
module.exports = {generateRandomString, getUserByEmail, verifyPassword}
>>>>>>> 6a66520ded13f3e6f0615996044f1a9a1500f690
