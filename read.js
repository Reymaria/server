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

//
app.use(bodyParser.json());

// READ (select)
app.get("/blob", (req, res) => {
  connection.query("SELECT * FROM detection", (err, results) => {
    try {
      if (results.length > 0) {
        let convert = [];
        for (let i = 0; i < results.length; i++){
          convert.push({
            image: new Buffer.from(results[i].image).toString('utf-8'),
            date_time: results[i].date_time
          })
        }
       
        res.json(convert)
      }
    } catch (err) {
      res.json({ message: err });
    }
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});