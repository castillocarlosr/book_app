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

app.use(methodoverride((req, res)=>{
  if(typeof (req.body)==='object' && '_method' in req.body ){
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

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


//connections to fron end
app.get('/', fetchBooksFromDB);

app.post('/search', fetchBooksAPI);

// app.post('/savebook', saveBooks);

app.post('/view', viewBookDetail);

//override method
app.put('/savebook', saveBooks);

app.put('/deletebook', deleteBooks);

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

  // .catch(err => handleError({errorMsg: err}, res));

}

//determines if there is an id on object
function viewBookDetail(req, res){
  //gets object from front end

  console.log(reg.body);
  if(req.body.id){
    console.log(req.body.id);
  }
  
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
  // const encodedError = JSON.stringify(err);
  res.render('pages/error')
  // res.redirect(`/err?e=${encodedError}`);
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
function saveBooks(req, res) {
//takes in obj, we will parse for sql values

// console.log(req.body)

  //TODO: const values ==> array of form results

  const SQL = 'INSERT INTO savedBooks (author, title, isbn, image_url, description1, bookshelf) VALUES($1, $2, $3, $4, $5, $6);';
  client.query(SQL, values);
}


//delete books from database
function deleteBooks() {
  // let query = req.body.shelf//index will need to change with form layout
  const values = ['7'];
  const SQL = 'DELETE FROM savedBooks WHERE id = $1;'


  client.query(SQL, values);
  console.log('deleted item')
}

app.listen(PORT, () => console.log(`App is up on port ${PORT}`));