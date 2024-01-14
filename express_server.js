const express = require("express");
const app = express();
const cookieSession  = require('cookie-session')
const PORT = 8080; // default port 8080;
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession ({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));


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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

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

app.get("/urls/:id", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase);
  if(!userDetails || !userPages) {
    return res.send(403).send("You must login to access your URLs!");
  }
  const id = req.params.id;
  const userData = users[req.session.user_id];
  const templateVars = {id: req.params.id, longURL: urlDatabase[id].longURL, userDetails: userData,};
  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if(!longURL) {
    return res.status(404).send("Short URL Cannot be found");
  }
  return res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userDetails = users[req.session.user_id];
  if(!userDetails) {
    return res.status(403).send("Only registered users can shorten URL");
    return res.redirect("/login")
  }
  let longURL = req.body.longURL;
  if(!longURL.startsWith("http://") && !longURL.startsWith("https://")) {
    longURL = `http://${longURL}`;
  }
  if(!longURL.endsWith(".com")) {
    longURL = `${longURL}.com`;
  }
  let shortURLID = generateRandomString(6);
  const userID = userDetails.id;
  let newdatabase = {
    longURL: longURL,
    userID: userID
  }
  urlDatabase[shortURLID] = newdatabase;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase);
  if(!userDetails || !userPages) {
    return res.status(403).send("Only registered users can delete URLs");
    return res.redirect("/login")
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

app.post("/urls/:id/update", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase);
  if(!userDetails || !userPages) {
    return res.status(403).send("Only registered users can update URL");
    return res.redirect("/login")
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

app.post("/urls/:id/edit", (req, res) => {
  const userDetails = users[req.session.user_id];
  const userPages = urlsForUser(userDetails.id, urlDatabase);
  if(!userDetails || !userPages) {
    return res.status(403).send("Only registered users can edit URL");
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


app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userDetails = users[req.session.user_id];
  const templateVars = { 
    userDetails: userDetails,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const password = hashedPassword;

  if(!email || !password) {
    return res.status(400).send("Please provide an email and a password");
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
  const userDetails = users[req.session.user_id];
  const templateVars = { 
    userDetails: userDetails,
  };
  res.render("login", templateVars );
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPword = req.body.password;
  
  if(!userEmail || !userPword) {
    return res.status(400).send("Provide login details")
  }
  
  let verifyEmail = getUserByEmail(userEmail, users);
    
  if(!verifyEmail) {
    res.status(403).send("User not found");
  }

  let verifyPword = bcrypt.compareSync(userPword, verifyEmail.password);
  
  if(!verifyPword) {
    return res.status(403).send("Either email or password is invalid");
  }

  req.session.user_id = verifyEmail.id;
  res.redirect("/urls")
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
