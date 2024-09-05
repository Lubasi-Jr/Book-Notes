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




--Sort by date (Most recent) --
SELECT * FROM books
ORDER BY TO_DATE(date_read, 'DD/MM/YYYY') DESC;

--Sort by highest rated  --
SELECT * FROM your_table_name
ORDER BY rating DESC;

--Sort by Alphabetical order  --
SELECT * FROM books
ORDER BY title ASC;


--Sort by REVERSE Alphabetical order  --
SELECT * FROM books
ORDER BY title DESC;



