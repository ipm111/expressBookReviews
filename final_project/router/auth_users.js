const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

const isValid = (username)=>{ //returns boolean
  return users.hasOwnProperty(username);
}

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 100 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
   // Obtener el ISBN y la reseña del cuerpo de la solicitud
   const isbn = req.params.isbn.trim();
   const numericIsbn = Number(isbn);
   const username = req.session.username;
   const review = req.body.review;

   console.log(username)
 
   // Validar el ISBN
   if (isNaN(numericIsbn)) {
     return res.status(400).json({ message: "Invalid ISBN. Please provide a numeric value." });
   }
 
   // Validar que se haya proporcionado una reseña
   if (!review || typeof review !== "string") {
     return res.status(400).json({ message: "Review is required and must be a string." });
   }
 
   // Buscar el libro
   const book = books[numericIsbn];
   if (!book) {
     return res.status(404).json({ message: `Book with ISBN ${numericIsbn} not found.` });
   }
 
   // Publicar o actualizar la reseña
   if (book.reviews[username]) {
     // Si el usuario ya tiene una reseña, actualizarla
     book.reviews[username] = review;
     books[numericIsbn] = book;
     return res.status(200).json({ message: `Review updated for ISBN ${numericIsbn}.` });
   } else {
     // Si el usuario no tiene una reseña, agregarla
     book.reviews[username] = review;
     books[numericIsbn] = book;
     return res.status(201).json({ message: `Review added for ISBN ${numericIsbn}.` });
   }
  

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.username;
 
  const isbn = req.params.isbn.trim();
  const numericIsbn = Number(isbn);

  if (isNaN(numericIsbn)) {
    return res.status(400).json({ message: "Invalid ISBN. Please provide a numeric value." });
  }

  const book = books[numericIsbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${numericIsbn} not found.` });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: `Review deleted for ISBN ${numericIsbn}.` });
  } else {
    return res.status(404).json({ message: `No review found for ISBN ${numericIsbn} by user ${username}.` });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
