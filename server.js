require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const body = require('body-parser');
const cors = require('cors');
const superagent = require('superagent');

const googleUrl = 'https://www.googleapis.com/books/v1/volumes?q=';
const gAPIKey = process.env.g_key;
console.log(gAPIKey);

const PORT = process.env.PORT;
console.log(PORT);
const conString = process.env.DATABASE_URL;
const client = new pg.Client(conString);
client.connect();

app.use(cors());
app.use(body.json());
app.use(body.urlencoded({extended: true}));

app.get('/api/v1/books', (req, res) => {
    client.query('SELECT * FROM books')
        .then(data => res.send(data.rows)).catch(console.error);
});

app.get('/api/v1/books/search', (req, res) => {
    const query = req.query.search;
    superagent
        .get(`${googleUrl}${query}&key=${gAPIKey}`)
        .end((err, resp) => {
            const bookReturn = resp.body.items.slice(0,10).map( book => {
                return {
                    title: book.volumeInfo.title || 'n/a',
                    isbn: (book.volumeInfo.industryIdentifiers) ? book.volumeInfo.industryIdentifiers[0].identifier : 'n/a',
                    author: (book.volumeInfo.authors) ? book.volumeInfo.authors[0] : 'n/a',
                    image_url: (book.volumeInfo.imageLinks) ? book.volumeInfo.imageLinks.thumbnail : 'n/a',
                    description: book.volumeInfo.description || 'n/a'
                };
            });
            res.send(bookReturn);
        });
        // .catch(console.error);
});

app.get('/api/v1/books/:id', (req, res) => {
    client.query('SELECT * FROM books WHERE id = $1', [req.params.id])
        .then(data => res.send(data.rows)).catch(console.error);
});

app.post('/api/v1/new', (req, res) => {
    console.log(req.body);
    client.query('INSERT INTO books (title, author, isbn, "image_url", description) VALUES ($1, $2, $3, $4, $5)', [req.body.title, req.body.author, req.body.isbn, req.body.image_url, req.body.description])
        .then(data => res.send(data))
        .catch(console.error);
});


app.put('/api/v1/books/:id', (req, res) => {
    client.query('UPDATE books SET author=$1, isbn=$2, description=$3, title=$4, image_url=$5 WHERE id=$6;', [req.body.author, req.body.isbn, req.body.description, req.body.title, req.body.image_url, req.params.id])
        .then(() => res.status(200).send('Book updated'))
        .catch(console.error);
});

app.delete('/api/v1/books/:id', (req, res) => {
    client.query(`DELETE FROM books WHERE id=$1`, [req.params.id])
        .then(() => res.status(204).send('Book deleted'))
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