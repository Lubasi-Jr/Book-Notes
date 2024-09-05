CREATE TABLE books(
    isbn VARCHAR(100) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    rating VARCHAR(20),
    details TEXT,
    date_read TEXT
)

CREATE TABLE notes(
    isbn VARCHAR(100) REFERENCES books(isbn) UNIQUE,
    report TEXT
)

ALTER TABLE books
    ADD image_url TEXT

UPDATE books
SET image_url = 'https://covers.openlibrary.org/b/ISBN/9780008375010-L.jpg'
WHERE title='Who They Was'

SELECT * FROM books

INSERT INTO books (isbn,title,rating,details,date_read,image_url)
VALUES ($1,$2,$3,$4,$5,$6)