const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

// Task 7: Login as a registered user
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];
  
  if (book) {
      let review = req.query.review;
      let reviewer = req.session.authorization['username'];
      
      if(review) {
          // מוסיף או מעדכן את הביקורת תחת שם המשתמש
          book.reviews[reviewer] = review;
          books[isbn] = book;
      }
      res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  } else {
      res.send("Unable to find this book!");
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  
  if (books[isbn]){
      let reviewer = req.session.authorization['username'];
      let review = books[isbn].reviews;
      
      // בודק אם קיימת ביקורת של המשתמש הזה ומוחק אותה
      if (review[reviewer]){
          delete review[reviewer];
          res.send(`Review for the ISBN ${isbn} posted by the user ${reviewer} deleted.`);
      } else {
          res.send("Review not found for this user.");
      }
  } else {
      res.send("Unable to find this book!");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;