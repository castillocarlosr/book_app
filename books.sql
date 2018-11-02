DROP TABLE IF EXISTS savedbooks;

CREATE TABLE savedbooks(
    id SERIAL PRIMARY KEY,
    authors VARCHAR(255),
    title VARCHAR(255),
    isbn VARCHAR(255),
    img_url VARCHAR(255),
    description1 TEXT,
    bookshelf VARCHAR(255)
);

--pulls data --
SELECT * FROM savedBooks;

SELECT * FROM savedBooks WHERE author = $1;

SELECT * FROM savedBooks WHERE title = $1;


INSERT INTO savedBooks (authors, title, isbn, img_url, description1, bookshelf) VALUES($1, $2, $3, $4, $5, $6);
