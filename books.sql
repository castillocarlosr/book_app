-- DROP TABLE IF EXISTS savedBooks;

CREATE TABLE savedBooks(
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn VARCHAR(255),
    image_url VARCHAR(255),
    description1 TEXT,
    bookshelf VARCHAR(255)
)


--pulls data --
SELECT * FROM savedBooks;

SELECT * FROM savedBooks WHERE author = $1;

SELECT * FROM savedBooks WHERE title = $1;


INSERT INTO savedBooks (id, author, title, isbn, image_url, description1, bookshelf) VALUES($1, $2, $3, $4, $5, $6,$7);
