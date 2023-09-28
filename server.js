const express = require("express");
const app = express();
const v = require('body-parser');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

app.use(express.static("public"));
app.use(v.urlencoded({ extended: true }));

const serviceAccount = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/public/" + "signup.html");
});

app.get("/order", function (req, res) {
  res.sendFile(__dirname + "/public/" + "dashboard.html");
});

app.post('/order', (req, res) => {
  db.collection('pawan kalyan').add({
    item: req.body.selected,
    quantity: req.body.quantity,
  }).then(() => {
    console.log('success');
  });
});

app.post("/signupSubmit", function (req, res) {
  const { username, email, password } = req.body;

  db.collection('pawan kalyan')
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.send("Email already exists. Please choose a different email.");
      } else {
        bcrypt.hash(password, 10, function (err, hashedPassword) {
          if (err) {
            console.error("Error hashing password", err);
            res.send("An error occurred during signup");
          } else {
            db.collection('pawan kalyan').add({
              username: username,
              email: email,
              password: hashedPassword,
            })
              .then(() => {
                res.send("Signup successful, please <a href='/login'>login</a>");
              })
              .catch((error) => {
                console.error("Error storing user data", error);
                res.send("An error occurred during signup");
              });
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error checking email duplication", error);
      res.send("An error occurred during signup");
    });
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/public/" + "login.html");
});
app.post("/loginsubmit", function (req, res) {
  const { email, password } = req.body;

  db.collection('pawan kalyan')
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        const user = docs.docs[0].data();
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            console.error("Error comparing passwords", err);
            res.send("An error occurred during login");
          } else {
            if (result) {
              res.redirect("/dashboard.html");
            } else {
              res.send("Login unsuccessful. Please check your credentials.");
            }
          }
        });
      } else {
        res.send("Login unsuccessful. Please check your credentials.");
      }
    })
    .catch((error) => {
      console.error("Error checking login credentials", error);
      res.send("An error occurred during login");
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
