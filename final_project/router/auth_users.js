const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username is not empty and has at least 2 characters
    if (typeof username === 'string' && username.trim().length >= 2) {
      return true;
    }
    return false;
};

const authenticatedUser = (username, password) => {
    // Find a user in the users array with the matching username and password
    const user = users.find(u => u.username === username && u.password === password);
    
    // Return true if a matching user is found, otherwise return false
    return user !== undefined;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Authenticate the user
    if (authenticatedUser(username, password)) {
      // Generate a JWT for the session
      const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '2h' });
      return res.status(200).json({ message: "Login successful", token });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  });

// Middleware to verify JWT and extract username
regd_users.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
  
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your_secret_key');
      req.user = decoded.username;
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  });
  
// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user;
  
    if (!review) {
      return res.status(400).json({ message: "Review content is required in the query string." });
    }
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Initialize reviews object if missing
    if (!book.reviews) {
      book.reviews = {};
    }
  
    // Add or update the review
    book.reviews[username] = review;
  
    return res.status(200).json({
      message: "Review added/updated successfully.",
      reviews: book.reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
