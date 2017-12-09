require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const cors = require('cors');

const PORT = process.env.PORT;
console.log(PORT);
const conString = process.env.DATABASE_URL;
const client = new pg.Client(conString);
client.connect();

app.use(cors());

app.get('/api/v1/books', (req, res) => {
    client.query('SELECT * FROM books')
        .then(data => res.send(data.rows)).catch(console.error);
});

app.get('/api/v1/books/:id', (req, res) => {
    client.query('SELECT * FROM books WHERE id = $1', [req.params.id])
        .then(data => res.send(data.rows)).catch(console.error);
});

app.post('/api/v1/new', (req, res) => {
    client.query('INSERT INTO books (title, author, isbn, "image_url", description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING', [req.params.title, req.params.author, req.params.isbn, req.params.image_url, req.params.descrption])
        .then(console.log)
        .catch(console.error);
});

app.get('*', (req, res) => {
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
    client.query(`CREATE TABLE IF NOT EXISTS books (id SERIAL PRIMARY KEY, title VARCHAR(50), author VARCHAR(50), isbn VARCHAR(100) UNIQUE, image_url VARCHAR(255), description VARCHAR(2500))`
    )
        .then(loadBooks)
        .catch(console.error);
}