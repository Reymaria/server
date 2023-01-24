const express = require("express");
const mysql = require("mysql2");
const app = express();
const bodyParser = require("body-parser");
const port = 2022;


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "data",
  });

app.use(bodyParser.json());

// CREATE(insert)
app.post("/blob", (req, res) => {
    const { date_time,image } = req.body;
  
    connection.query(
      "INSERT INTO detection (date_time,image) VALUES (?,?)",
      [date_time,image],
      (err, results) => {
        try {
          if (results.affectedRows > 0) {
            res.json({ message: "Data has been added!" });
          } else {
            res.json({ message: "Something went wrong." });
          }
        } catch (err) {
          res.json({ message: err });
        }
      }
    );
  });


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

