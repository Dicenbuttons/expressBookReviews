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
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        // Simulate asynchronous db/API fetch using a Promise
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject(new Error("Book not found"));
                }
            });
        };

        const bookDetails = await getBookByISBN(isbn);
        res.status(200).json(bookDetails);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

  
// Get book details based on the author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        // Simulate async data fetching with a Promise
        const getBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const booksByAuthor = [];

                for (let key in books) {
                    if (books[key].author === author) {
                        booksByAuthor.push(books[key]);
                    }
                }

                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error("No books found by this author"));
                }
            });
        };

        const results = await getBooksByAuthor(author);
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


// Get book details based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const getBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const booksByTitle = [];

                for (let key in books) {
                    if (books[key].title === title) {
                        booksByTitle.push(books[key]);
                    }
                }

                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error("No books found with this title"));
                }
            });
        };

        const results = await getBooksByTitle(title);
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error.message });
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
