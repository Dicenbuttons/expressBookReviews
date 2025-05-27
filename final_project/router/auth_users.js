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

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, 'access', { expiresIn: '2h' });

        // ✅ Store token in session
        req.session.authorization = {
            accessToken: token
        };

        return res.status(200).json({ message: "Login successful" });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Middleware to verify JWT and extract username
regd_users.use((req, res, next) => {
    // Use session for the jwt
    const token = req.session?.authorization?.accessToken;
    if (!token) {
      return res.status(401).json({ message: 'Token missing from session' });
    }

    try {
      const decoded = jwt.verify(token, 'access'); // use same secret as index.js
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

  // Delete your own book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    // Delete the user's review
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
