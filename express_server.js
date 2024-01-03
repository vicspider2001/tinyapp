const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = (length) => {
  const alphanumericChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * alphanumericChars.length);
    randomString += alphanumericChars.charAt(index);
  }
  return randomString;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>Victors's World! Where are the people!</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {id: req.params.id, longURL: urlDatabase[id]};
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});