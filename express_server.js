const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080;
const { generateRandomString, getUserByEmail, verifyPassword } = require("./helper");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const userDetails = users[req.cookies.user_id];
  const templateVars = { 
    userDetails: userDetails,
  };
  if(userDetails) {
    res.render("urls_new", templateVars);
  }
  res.render("./login", templateVars);
  
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userData = users[req.cookies.user_id];
  const templateVars = {id: req.params.id, longURL: urlDatabase[id], userDetails: userData,};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  if(!longURL.startsWith("http://") && !longURL.startsWith("https://")) {
    longURL = `http://${longURL}`;
  }
  if(!longURL.endsWith(".com")) {
    longURL = `${longURL}.com`;
  }
  const shortURLID = generateRandomString(6);
  urlDatabase[shortURLID] = longURL;
  res.redirect(`/urls/${shortURLID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const deletItem = req.params.id;
  if(urlDatabase[deletItem]) {
    delete urlDatabase[deletItem];
    res.redirect("/urls")
  }
  else{
    res.send("URL was not found")
  }
});

app.post("/urls/:id/update", (req, res) => {
  const updateItem = req.params.id;
  let editURL = req.body.longURL;
  if(!editURL.startsWith("http://") && !editURL.startsWith("https://")) {
    editURL = `http://${editURL}`;
  }
  if(!editURL.endsWith(".com")) {
    editURL = `${editURL}.com`;
  }
  if(urlDatabase[updateItem]) {
    urlDatabase[updateItem] = editURL;
    res.redirect(`/urls`);
  }
});

app.post("/urls/:id/edit", (req, res) => {
  const editItem = req.params.id;
  if(urlDatabase[editItem]) {
    res.redirect(`/urls/${editItem}`)
  }
  else{
    res.send("URL was not found")
  }
});

app.get("/urls", (req, res) => {
  const userDetails = users[req.cookies.user_id];
  const templateVars = { 
    userDetails: userDetails,
    urls: urlDatabase
  };
  if(userDetails) {
    res.render("urls_index", templateVars);
  }
  res.redirect("/login");
  
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userDetails = users[req.cookies.user_id];
  const templateVars = { 
    userDetails: userDetails,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    res.status(400).send("Please provide an email and a password");
    
  }

  let foundUser = getUserByEmail(email, users);
  
  if (foundUser) {
    return res.status(400).send("A User with this email already exists.");
  }

  const userRandomID = generateRandomString(4);
  const newUser = {
    id: userRandomID,
    email,
    password
  };

  // Add a new user to the 'users' database
  users[userRandomID] = newUser;
  console.log(newUser);
  console.log(users);
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  const userDetails = users[req.cookies.user_id];
  const templateVars = { 
    userDetails: userDetails,
  };
  res.render("login", templateVars );
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if(!userEmail || !userPassword) {
    res.status(400).send("Provide login details")
  }
  let verifyEmail = getUserByEmail(userEmail, users);
  
  if(!verifyEmail) {
    res.status(403).send("User not found");
  }
  
  let verifyPword = verifyPassword(userPassword, users);
  if(!verifyPword) {
    res.status(403).send("Either email or password is invalid");
  }

  res.cookie('user_id', verifyEmail.id, {
    expires: new Date(Date.now() + 8 * 3600000)
  });
  res.redirect("/urls")
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});