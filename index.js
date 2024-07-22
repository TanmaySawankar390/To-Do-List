import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database:  process.env.database,
  password: process.env.password,
  port: process.env.databasePort
  });
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async (req, res) => {
  const result = await db.query("SELECT * from items");
  const data = result.rows;
  let items = [];
  data.forEach((item) => {
    items.push(item);
  });
  console.log(data);
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  let currentDate = `${day}-${month}-${year}`;
  res.render("index.ejs", {
    listTitle: "Date: " + currentDate,
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items (title) VALUES ($1)",[item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const updatedValue = req.body.updatedItemTitle;
  const updatedId = req.body.updatedItemId;
  await db.query("UPDATE items SET title = $1 WHERE id = $2",[updatedValue,updatedId]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const deleteId = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1", [deleteId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
