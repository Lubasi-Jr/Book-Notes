import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_notes",
  password: process.env.postgresPassword,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let latestBooks = [];

async function currentDate() {
  const today = new Date();
  const ukDate = today.toLocaleDateString("en-GB"); // en-GB is the locale for the United Kingdom
  // Example: 04/09/2024 (DD/MM/YYYY)
  return ukDate;
}

//Function to get the latest books from the database.
async function latest() {
  const result = await db.query("SELECT * FROM books");
  //Updates the latest books array, which is parsed in the EJS file
  latestBooks = result.rows;
}

app.get("/", async (req, res) => {
  await latest();
  res.render("index.ejs", { books: latestBooks });
});

app.post("/create", (req, res) => {
  res.render("create_post.ejs");
});

app.post("/submit", async (req, res) => {
  const isbn = req.body.isbn;
  const title = req.body.title;
  const rating = req.body.rating;
  const details = req.body.details;
  //make function calls to get the current date
  const day = await currentDate();
  //For the image, make API call to Open Library
  const image = `https://covers.openlibrary.org/b/ISBN/${isbn}-L.jpg`;

  //console.log("ISBN entered: " + isbn);
  //console.log("Details: " + details);

  //Perform the insert query in a try-catch block

  try {
    await db.query(
      "INSERT INTO books (isbn,title,rating,details,date_read,image_url) VALUES ($1, $2, $3, $4, $5, $6)",
      [isbn, title, rating, details, day, image]
    );
    res.redirect("/");
  } catch (err) {
    //Possible errors would be duplicate entry or invalid field type. Therefore just log error and redirect
    console.log(err);
    res.redirect("/");
  }
});

//Method for deleting
app.post("/delete", async (req, res) => {
  const isbn = req.body.isbn;

  try {
    await db.query("DELETE FROM books WHERE isbn = $1", [isbn]);
    console.log(`Successfully deleted: ${isbn}`);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

//Method for editing
app.post("/edit", async (req, res) => {
  const isbn = req.body.isbn;
  console.log(`ISBN to be edited: ${isbn}`);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
