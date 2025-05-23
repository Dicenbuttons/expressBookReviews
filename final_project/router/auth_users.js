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

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
