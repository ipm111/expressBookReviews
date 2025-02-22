const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

/*
// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));    
});
*/

public_users.get('/', async function (req, res) {
  try {
      const data = await new Promise((resolve) => {
          resolve(books);
      });
      res.send(JSON.stringify(data, null, 4));
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

/*
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn.trim(); // Elimina espacios al inicio y al final
  const numericIsbn = Number(isbn);   // Convierte a número

  if (isNaN(numericIsbn)) {
    return res.status(400).json({ message: "Invalid ISBN. Please provide a numeric value." });
  }

  const book = books[numericIsbn];
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});
  */

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve) => {
      resolve(books[isbn]);
  })
  .then((data) => {
      res.send(JSON.stringify(data, null, 4));
  })
  .catch((error) => {
      res.status(500).json({ message: error.message });
  });
});



/*
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.trim();

  //convertir el objeto books en un array de valores
  const matchingBooks = Object.values(books).filter(book =>
    //Filtrar por author
    book.author.toLowerCase() === author.toLowerCase()
  );

  //Si hay libros
  if (matchingBooks.length > 0) {
    res.status(200).json({ message: `Books by ${author}`, books: matchingBooks });
  } else {
    res.status(404).json({ message: `No books found for author: ${author}` });
  }
});
*/

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  new Promise((resolve) => {
      let booksByAuthor = [];
      let bookKeys = Object.keys(books);
      for (let i = 0; i < bookKeys.length; i++) {
          let book = books[bookKeys[i]];
          if (book.author === author) {
              booksByAuthor.push(book);
          }
      }
      resolve(booksByAuthor);
  })
  .then((data) => {
      res.send(JSON.stringify(data, null, 4));
  })
  .catch((error) => {
      res.status(500).json({ message: error.message });
  });
});


/*
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  // Obtener y limpiar el título de los parámetros de la URL
  const titleQuery = req.params.title.trim().toLowerCase();

  // Filtrar los libros cuyo título incluya la subcadena proporcionada
  const matchingBooks = Object.values(books).filter(book =>
    book.title.toLowerCase().includes(titleQuery)
  );

  // Verificar si se encontraron libros
  if (matchingBooks.length > 0) {
    res.status(200).json({
      message: `Books matching title: "${titleQuery}"`,
      books: matchingBooks
    });
  } else {
    res.status(404).json({ message: `No books found with title containing: "${titleQuery}"` });
  }
});
*/
public_users.get('/title/:title', async function (req, res) {
  try {
      const title = req.params.title;
      const data = await new Promise((resolve) => {
          let booksByTitle = [];
          let bookKeys = Object.keys(books);
          for (let i = 0; i < bookKeys.length; i++) {
              let book = books[bookKeys[i]];
              if (book.title === title) {
                  booksByTitle.push(book);
              }
          }
          resolve(booksByTitle);
      });
      res.send(JSON.stringify(data, null, 4));
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});



//  Get book review
public_users.get('/reviews/:isbn', function (req, res) {
  // Obtener el ISBN desde los parámetros de la URL
  const isbn = req.params.isbn.trim();
  const numericIsbn = Number(isbn); // Convertir el ISBN a número

  // Validar que el ISBN sea un número válido
  if (isNaN(numericIsbn)) {
    return res.status(400).json({ message: "Invalid ISBN. Please provide a numeric value." });
  }

  // Buscar el libro en el objeto `books`
  const book = books[numericIsbn];

  // Verificar si el libro existe
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${numericIsbn} not found.` });
  }

  // Devolver las reseñas del libro
  res.status(200).json({
    message: `Reviews for book with ISBN ${numericIsbn}`,
    reviews: book.reviews
  });
});
module.exports.general = public_users;
