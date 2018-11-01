'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const ejs = require('ejs');
const bodyParser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

//connects to db
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

app.use(cors());

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// app.use(bodyParser.urlencoded({
//   extended: true
// }));


//this is rendering the entire index page

app.get('/', (req, res) => {
  res.render('pages/index',{books: fetchBooksFromDB(req, res)});
});

app.post('/search', fetchBooks);

app.post('/savebook', saveBooks);

app.post('/view', viewBook);

//from the form action should be shelf/<%=shelf.id%>
app.post('/shelf', getBookShelf);//shelf should be /shel/:id


function getSearchResults(req, res) {
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
  // fetchBooks(req, res);

  // if (bookResults) {
  //   res.render('pages/searches/show', {books: bookResults});
  // } else {
  //   res.render('pages/searches/error');
  // }
}

// This retrieves and returns data from the Google Books API. 
function fetchBooks(req, res) {
  const _books_URL = `https://www.googleapis.com/books/v1/volumes?q=+in${req.body.search[1]}:${req.body.search[0]}`;
  return superagent.get(_books_URL)
    .then(results => {
      if (results.body.items.length > 0) {
        const formattedResults = results.body.items.slice(0, 10).map(result => {
          return new BookResult(result);
        });
        return res.render('pages/searches/show', { books: formattedResults });
      } else {
        throw 'no results returned';
      }
    })
    .catch(err => handleError(err, res));

  // .catch(err => handleError({errorMsg: err}, res));

}
function viewBook(req, res){
  console.log(req.body)
  
}

function BookResult(result) {
  this.title = result.volumeInfo.title || '';
  this.authors = result.volumeInfo.authors || [];
  this.isbn = result.volumeInfo.industryIdentifiers || [];
  this.img_url = result.volumeInfo.imageLinks.thumbnail || '';
  this.description = result.volumeInfo.description || '';

}

function handleError(err, res) {
  //console.log(err);
  //res.redirect('/error');

  console.log('Oh oh error', err);
  const encodedError = JSON.stringify(err);
  res.render('pages/error')
  // res.redirect(`/err?e=${encodedError}`);
}


function getBookShelf() {

  //cach logic

  //needs to call the query function
  // saveBooks(req, res);
  // fetchBooksFromDB(req, res);

}

function fetchBooksFromDB(req, res) {

  //takes an object with search from path /shelf
  // let query = req.body.shelf[0]//index will need to change with form layout
  const SQL = 'SELECT * FROM savedBooks;'
  // const values = [query];
  //make 
  return client.query(SQL).then(results => {
    console.log(results.rows[0])})


}

//this function is called from getbookshelf, and saves books to book shelf
function saveBooks(req, res) {

console.log(req.body)
  let query = req.body.shelve
  // const query = [];
  const values =[];
  const SQL = 'INSERT INTO savedBooks (author, title, isbn, image_url, description1, bookshelf) VALUES($1, $2, $3, $4, $5, $6);'
  query.forEach(idx => {
    values.push([idx])

  });

  client.query(SQL, values);
  

}


//delete books from database
function deleteBooks() {
  // let query = req.body.shelf//index will need to change with form layout
  const values = ['6'];
  const SQL = 'DELETE FROM savedBooks WHERE id = $1;'


  client.query(SQL, values);
  console.log('deleted item')
}

app.listen(PORT, () => console.log(`App is up on port ${PORT}`));