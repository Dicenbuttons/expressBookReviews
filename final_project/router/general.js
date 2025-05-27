const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Code to register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if username already exists
    const userExists = users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ error: 'Username already exists.' });
    }

    // Register new user by pushing into array
    users.push({ username, password }); // Again, consider hashing password
    return res.status(201).json({ message: 'User registered successfully.' });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        // Simulate async operation, for example reading from a DB
        const getBooks = () => {
            return new Promise((resolve) => {
                resolve(books);
            });
        };

        const data = await getBooks();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve any books', error: error.message });
    }
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Retrieve details from the books object based on the isbn
    const bookDetails = books[isbn];

    if (bookDetails) {
        // Send the book details as a response
        res.json(bookDetails);
    } else {
        // If the book is not found, send a 404 response
        res.status(404).send('Book not found');
    }
});
  
// Get book details based on the author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];

    // Retrieve details from the books array
    const bookKeys = Object.keys(books);

    bookKeys.forEach(key => {
        const book = books[key];
        if (book.author === author) {
            booksByAuthor.push(book);
        }
    });

    if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);
    } else {
        res.status(404).send('No books found by this author');
    }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksByTitle = [];

    // Retrieve details from the books array
    const bookKeys = Object.keys(books);

    bookKeys.forEach(key => {
        const book = books[key];
        if (book.title === title) {
            booksByTitle.push(book);
        }
    });

    if (booksByTitle.length > 0) {
        res.json(booksByTitle);
    } else {
        res.status(404).send('No books found with this title');
    }
});

//  Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    // Assuming 'books' is an object where keys are ISBNs and values are book objects
    const book = books[isbn];

    if (book && book.reviews) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ message: "No reviews found for this ISBN" });
    }
});

module.exports.general = public_users;
