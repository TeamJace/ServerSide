// require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');


const PORT = 3000;
const conString = `postgres://@localhost:5432/books`;
const client = new pg.Client(conString);
client.connect();


app.get('/api/v1/books', (req,res) => {
    client.query('SELECT id, title, author, "image_url" FROM books;')
        .then(data => res.send(data.rows));
});

// Create a new endpoint at GET /api/v1/books which will retrieve an array of book objects from the database, limited to only the book_id, title, author, and image_url.
// STRETCH GOAL: Create a new endpoint that will retrieve a single book based on its id.

app.get('/api/v1/:recipient', (req,res) => {
    // client.query('SELECT * FROM cards WHERE recipient = $1', [:reipient])
    //     .then((data) => res.send(data.rows));
});

app.get('*', (req,res) => {
    res.send('ERROR path does not exist');
});

loadDB();

app.listen(PORT, () => (console.log(`listening for api requests to ${PORT}`)));

//////// ** DATABASE LOADERS ** ////////
////////////////////////////////////////
function loadBooks() {
    fs.readFile('books.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO books(title, author, isbn, "image_url", description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
            )
                .catch(console.error);
        });
    });
}
function loadDB() {
    client.query(`
    CREATE TABLE IF NOT EXISTS books (id SERIAL PRIMARY KEY, title VARCHAR(50), author VARCHAR(50), isbn VARCHAR(100) UNIQUE, image_url VARCHAR(255), description VARCHAR(2500));`
    )
        .then(loadBooks)
        .catch(console.error);
}