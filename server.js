'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//const pg = require('pg');

const ejs = require('ejs');
const bodyParser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('err', err=> console.log(err));

app.use(cors());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());



//this is rendering the entire index page
app.get('/', (reg, res) => {
  res.render('pages/index');
});



app.post('/search', getSearchResults);

function getSearchResults (req, res) {
  // const sampleBooks = [{
  //   title: 'foundation',
  //   authors: ['Isac hazmat'],
  //   isbn: '123-abcd',
  //   img_url: 'https://images-na.ssl-images-amazon.com/images/I/811zq%2B9%2BhNL.jpg',
  //   description: 'This book sucks!'
  // },
  // {
  //   title: 'lort',
  //   authors: ['grlort'],
  //   isbn: '666-nice',
  //   img_url: 'https://images-na.ssl-images-amazon.com/images/I/811zq%2B9%2BhNL.jpg',
  //   description: 'This book is for children!'
  // }];
  console.log('entered getSearchResults');
  fetchBooks(req, res);

  // if (bookResults) {
  //   res.render('pages/searches/show', {books: bookResults});
  // } else {
  //   res.render('pages/searches/error');
  // }
}

// This retrieves and returns data from the Google Books API. 
function fetchBooks (req, res) {
  console.log(req.body);
  const _books_URL = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search[0]}`;
  return superagent.get(_books_URL)
    .then(results => {
      //console.log(results);
      console.log('got results from API');
      if (results.items.length > 0) {
        const formattedResults = results.items.map(result => {
          //console.log(result.volumeInfo.title);
          return new BookResult(result);
        });
        console.table(formattedResults);
        return res.render('pages/searches/show', {books: formattedResults});
      } else {
        throw 'no results returned';
      }
    })
    .catch(err => handleError(err));
}

function BookResult (result) {
  this.title = result.volumeInfo.title;
  this.authors = result.volumeInfo.authors;
  this.isbn = result.industryIdentifiers.identifier;
  this.img_url = result.imageLinks.thumbnail;
  this.description = result.volumeInfo.description;
}

function handleError(err) {
  console.log(err);
}

app.listen(PORT, ()=> console.log(`App is up on port ${PORT}`));
