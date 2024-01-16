// Required modules
const express = require("express");
const app = express();
const cookieSession  = require('cookie-session')
const PORT = 8080; // default port 8080;
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");

// Set EJS as the view engine and use middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession ({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

//tinyapp sample database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//tinyapp sample users
const users = {
  OI9M: {
    id: 'OI9M',
    email: 'anogwihvictor@gmail.com',
    password: '$2a$10$Oa5evBTgDYqRcoJ2roKRiOKTUHcRSXBSBd55XBUY2AUexF0/e6Uca'
  },
  '2Wik': {
    id: '2Wik',
    email: 'zarvichosh@gmail.com',
    password: '$2a$10$lt0hPNObPA3u1plB5zRbpeRuKpJP.s5lj72tZzMTHDRzCWsxRsBTe'
  }
};

// Root route
app.get("/", (req, res) => {
  const userDetails = users[req.session.user_id];
  if(!userDetails) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

//JSON representation of tinyapp's database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// New URL page route
app.get("/urls/new", (req, res) => {
  const userDetails = users[req.session.user_id];
  const templateVars = { 
    userDetails: userDetails,
  };
  if(userDetails) {
    return res.render("urls_new", templateVars);
  }
  return res.render("./login", templateVars);
  
});

// Individual URL details route
app.get("/urls/:id", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase); //helper function used to get specific user URLs
  if(!userDetails || !userPages) {
    return res.status(403).render("error", { error: "You must log in to access your URLs!" });
  }

  const id = req.params.id;
  const userData = users[req.session.user_id];
  let urlData = urlDatabase[id];
  if(!urlData) {
    return res.status(404).render("error", { error: "Short URL not found" });
  }

  if(urlData.userID !== userDetails.id) {
    return res.status(403).render("error", { error: "You do not have permission to access this URL!" });
  }

  const templateVars = {id: req.params.id, longURL: urlData.longURL, userDetails: userData,};
  return res.render("urls_show", templateVars);
});

// Redirect route for short URLs
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const link = urlDatabase[id];
  if(!link) {
    return res.status(404).render("error", { error: "Short URL not found" });
  }
  const longURL = link.longURL;
  return res.redirect(longURL);
});

// Create a new URL route
app.post("/urls", (req, res) => {
  const userDetails = users[req.session.user_id];
  if(!userDetails) {
    return res.status(403).render("error", { error: "Only registered users can shorten URL"});
  }
  let longURL = req.body.longURL;
  if(!longURL.startsWith("http://") && !longURL.startsWith("https://")) {
    longURL = `http://${longURL}`;
  }
  if(!longURL.endsWith(".com")) {
    longURL = `${longURL}.com`;
  }
  let shortURLID = generateRandomString(6); // generates random strings as short URLs
  const userID = userDetails.id;
  let newdatabase = {
    longURL: longURL,
    userID: userID
  }
  urlDatabase[shortURLID] = newdatabase;
  res.redirect(`/urls/${shortURLID}`);
});

// Delete URL route
app.post("/urls/:id/delete", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase);
  if(!userDetails || !userPages) {
    return res.status(403).render("error", { error: "Only registered users can delete URLs"});
    
  }else{
    const deletItem = req.params.id;
    if(urlDatabase[deletItem]) {
      delete urlDatabase[deletItem];
      return res.redirect("/urls")
    }
    else{
      return res.send("URL was not found")
    }
  }
  
});

// Update URL route
app.post("/urls/:id/update", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase);
  if(!userDetails || !userPages) {
    return res.status(403).render("error", { error: "Only registered users can update URL"});
  } else{
    const updateItem = req.params.id;
    let editURL = req.body.longURL;
    if(!editURL.startsWith("http://") && !editURL.startsWith("https://")) {
      editURL = `http://${editURL}`;
    }
    if(!editURL.endsWith(".com")) {
      editURL = `${editURL}.com`;
    }
    if(urlDatabase[updateItem]) {
      urlDatabase[updateItem].longURL = editURL;
      return res.redirect(`/urls`);
    }
  }
  
});

// Edit URL route
app.post("/urls/:id/edit", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase);
  if(!userDetails || !userPages) {
    return res.status(403).render("error", { error: "Only registered users can edit URL"});
    return res.redirect("/login")
  } else{
    const editItem = req.params.id;
    if(urlDatabase[editItem]) {
      return res.redirect(`/urls/${editItem}`)
    }
    else{
      return res.send("URL was not found")
    }
  }
  
});

// List of users URL route
app.get("/urls", (req, res) => {
  const userDetails = users[req.session.user_id];
  if (userDetails) {
    const userUrls = urlsForUser(userDetails.id, urlDatabase);
    const templateVars = {
      userDetails: userDetails,
      urls: userUrls
    };
    return res.render("urls_index", templateVars);
  } else {
    return res.redirect("/login");
  }
});

// logout URL route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Get  Registered Users route
app.get("/register", (req, res) => {
  const userDetails = users[req.session.user_id];
  if(userDetails) {
    res.redirect("/urls");
  }
  const templateVars = { 
    userDetails: userDetails,
  };
  res.render("register", templateVars);
});

// Register users route
app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const password = hashedPassword;

  if(!email || !password) {
    return res.status(400).render("error", { error: "Please provide an email and a password"});
  }

  let foundUser = getUserByEmail(email, users);
  
  if (foundUser) {
    return res.status(400).render("error", { error: "A User with this email already exists."});
  }

  const userRandomID = generateRandomString(4);
  const newUser = {
    id: userRandomID,
    email,
    password
  };

  // Add a new user to the 'users' database
  users[userRandomID] = newUser;
  req.session.user_id = userRandomID;
  res.redirect("/urls");
  
});

// Users Login route
app.get("/login", (req, res) => {
  const userDetails = users[req.session.user_id];
  if(userDetails) {
    res.redirect("/urls");
  }
  const templateVars = { 
    userDetails: userDetails,
  };
  res.render("login", templateVars );
});

// Users sign in route
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPword = req.body.password;
  
  if(!userEmail || !userPword) {
    return res.status(400).render("error", { error: "Provide login details"})
  }
  
  let verifyEmail = getUserByEmail(userEmail, users);
    
  if(!verifyEmail) {
    res.status(403).render("error", { error: "User not found"});
  }

  let verifyPword = bcrypt.compareSync(userPword, verifyEmail.password); //checking if user's password matches saved hashed password.
  
  if(!verifyPword) {
    return res.status(403).render( "error", { error: "Either email or password is invalid"});
  }
  req.session.user_id = verifyEmail.id; //setting user's ID cookies session
  res.redirect("/urls")
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
