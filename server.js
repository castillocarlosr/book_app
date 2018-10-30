'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const pg = require('pg');
const ejs = require('ejs');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('err', err=> console.log(err));

app.use(cors());

app.set('view engine', 'ejs');

//this is rendering the entire index page
app.get('/', (reg, res) => {
  res.render('pages/index')
});

app.get('/search', (reg, res)=>{
  const sampleBooks = [{
    title: 'foundation',
    authors: ['Isac hazmat'],
    isbn: '123-abcd',
    img_url: 'https://images-na.ssl-images-amazon.com/images/I/811zq%2B9%2BhNL.jpg',
    description: 'This book sucks!'
  },
  {
    title: 'lort',
    authors: ['grlort'],
    isbn: '666-nice',
    img_url: 'https://images-na.ssl-images-amazon.com/images/I/811zq%2B9%2BhNL.jpg',
    description: 'This book is for children!'
  }];
  res.render('pages/searches/show', {books: sampleBooks});
});



app.get('/hello', function (req, res){
  res.send('hello game of thrones book')});





app.listen(PORT, ()=> console.log(`App is up on port ${PORT}`));
