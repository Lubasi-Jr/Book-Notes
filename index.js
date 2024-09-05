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
let sortedLatest = [];

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

//Function to get the latest books in the specified sorting method
async function sorted(criteria) {
  let result; // Use let instead of const here
  switch (criteria) {
    case "ASC":
      result = await db.query("SELECT * FROM books ORDER BY title ASC");
      sortedLatest = result.rows;
      break;
    case "DESC":
      result = await db.query("SELECT * FROM books ORDER BY title DESC");
      sortedLatest = result.rows;
      break;
    case "DATE":
      result = await db.query(
        "SELECT * FROM books ORDER BY TO_DATE(date_read, 'DD/MM/YYYY') DESC"
      );
      sortedLatest = result.rows;
      break;
    case "RATING":
      result = await db.query("SELECT * FROM books ORDER BY rating DESC");
      sortedLatest = result.rows;
      break;
    default:
      // Handle unexpected criteria
      console.error("Invalid sorting criteria:", criteria);
      sortedLatest = latestBooks; // Just send the latest books (unsorted)
  }
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

//get request for getting the home page but sorted
app.get("/sort", async (req, res) => {
  const sortBy = req.query.sort;
  //Function call to perform sorting. Remember to give functions single responsibility
  await sorted(sortBy);
  //sortedLatest variable has been updated. We can now go ahead and render it

  //console.log(sortedLatest);
  //res.redirect("/");

  res.render("index.ejs", { books: sortedLatest });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
