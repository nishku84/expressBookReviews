const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
      const doesExist = users.filter((user) => user.username === username);
      
      if (doesExist.length === 0) {
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(400).json({message: "User already exists!"});
      }
  }
  return res.status(400).json({message: "Unable to register user. Please provide username and password"});
});

public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
      return res.status(200).json(books[isbn]);
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];
  
  for (let isbn in books) {
      if (books[isbn].author === author) {
          booksByAuthor.push(books[isbn]);
      }
  }
  
  if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
  } else {
      return res.status(404).json({message: "No books found by this author"});
  }
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];
  
  for (let isbn in books) {
      if (books[isbn].title === title) {
          booksByTitle.push(books[isbn]);
      }
  }
  
  if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
  } else {
      return res.status(404).json({message: "No books found with this title"});
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
      return res.status(200).json(books[isbn].reviews);
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

const getAllBooksAsync = async () => {
    try {
        const response = await axios.get("http://localhost:5500/");
        console.log("Task 10 - All Books:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error);
    }
};

const getBookByISBNPromise = (isbn) => {
    axios.get(`http://localhost:5500/isbn/${isbn}`)
        .then(response => {
            console.log("Task 11 - Book by ISBN (Promise):", response.data);
        })
        .catch(error => {
            console.error("Error fetching book by ISBN:", error);
        });
};

const getBookByAuthorAsync = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5500/author/${encodeURIComponent(author)}`);
        console.log("Task 12 - Books by Author:", response.data);
    } catch (error) {
        console.error("Error fetching books by author:", error);
    }
};

const getBookByTitleAsync = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5500/title/${encodeURIComponent(title)}`);
        console.log("Task 13 - Books by Title:", response.data);
    } catch (error) {
        console.error("Error fetching books by title:", error);
    }
};

module.exports.general = public_users;