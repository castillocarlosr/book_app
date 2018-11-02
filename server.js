'use strict';


//brings in modules
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const methodoverride = require('method-override');

require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();


// pg middleware setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

// Express setup
app.use(cors());

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(methodoverride((req, res)=>{
  if(typeof (req.body)==='object' && '_method' in req.body ){
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));


//middleware connections to front end
app.get('/', fetchBooksFromDB);

app.post('/search', fetchBooksAPI);



app.post('/view', viewBookDetail);
app.post('/update', updateBook)

app.post('/save', saveBook);

app.put('/deletebook', deleteBook);

// This retrieves and returns data from the Google Books API.
function fetchBooksAPI(req, res) {
  const _books_URL = `https://www.googleapis.com/books/v1/volumes?q=+in${req.body.search[1]}:${req.body.search[0]}`;
  return superagent.get(_books_URL)
    .then(results => {
      if (results.body.items.length > 0) {
        const formattedResults = results.body.items.slice(0, 10).map(result => {
          return new BookResult(result);
        });
        return res.render('pages/searches/show', { books: formattedResults});
      } else {
        throw 'no results returned';
      }
    })
    .catch(err => handleError(err, res));

}

//determines if there is an id on object
function viewBookDetail(req, res){
  let booky;
  if(req.body){
    booky = {
      title: req.body.title,
      authors: req.body.authors,
      isbn: req.body.isbn,
      img_url: req.body.img_url,
      description1: req.body.description1,
      bookshelf: req.body.bookShelf
    };
  } else {
    console.log('our form is fucked');
  }
  if (req.body.id) {
    booky.id = req.body.id;
  }

  res.render('pages/books/detail', {book: booky});

}


function fetchBooksFromDB(req, res) {
  const SQL = 'SELECT * FROM savedBooks';
  return client.query(SQL)
    .then(results => {
      if(results.rows[0]) {
        res.render('pages/index', {books: results.rows});
      }
    })
    .catch(err => handleError(err, res));
}

//this function is called from getbookshelf, and saves books to book shelf
function saveBook(req, res) {
  const values =[req.body.author, req.body.title, req.body.isbn, req.body.img_url, req.body.description, req.body.bookshelf];
  const SQL = 'INSERT INTO savedBooks (authors, title, isbn, img_url, description1, bookshelf) VALUES($1, $2, $3, $4, $5, $6);';
  client.query(SQL, values);
  res.redirect('/');
}


function updateBook(req, res){
  const updateArr=[req.body.authors, req.body.title, req.body.isbn, req.body.img_url, req.body.description, req.body.bookshelf, req.body.id];
  let updateSQL ='UPDATE savedBooks SET authors=$1, title=$2, isbn=$3, img_url=$4, description1=$5, bookshelf=$6 WHERE id=$7'
  client.query(updateSQL, updateArr);
  console.log('saved to database!');
  res.redirect('/');
}

//delete books from database
function deleteBook(req, res) {
  const values = [req.body.id];
  const SQL = 'DELETE FROM savedBooks WHERE id = $1;'
  client.query(SQL, values);
  console.log('deleted item');
  res.redirect('/');
}


function handleError(err, res) {
  console.log('Oh oh error', err);
  res.render('pages/error');
}

function BookResult(result) {
  this.title = result.volumeInfo.title || '';
  this.authors = result.volumeInfo.authors || [];
  this.isbn = result.volumeInfo.industryIdentifiers || [];
  this.img_url = result.volumeInfo.imageLinks.thumbnail || '';
  this.description1 = result.volumeInfo.description1 || '';
}

app.listen(PORT, () => console.log(`App is up on port ${PORT}`));
