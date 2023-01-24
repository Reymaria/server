const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(cors());

const port = process.env.port || 4000;


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "cpet17",
});

app.use(bodyParser.json({ limit: "50mb" }));



app.use(express.json())

// CREATE(insert)
app.post("/insert", async(req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const repassword = req.body.repass
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const encrypt = await bcrypt.hash(password, salt)

    const query = "SELECT * from users where email=? AND username=?";
    const params = [email, username]
    connection.query(query, params, (err, rows) => {
        if (err) throw err;
        //
        var output = {}
        if (password != repassword) {
            output["message"] = "Password does not match";
        }
        else if (username == "" || email == "" || password == "") {
            output["message"] = "Please fill up the necessary informations needed";
        }
        else {
            if (rows.length != 0) {
                console.log('User already exists')
                output["message"] = "User already exists";
            } else {
                console.log('Successfully Registered')
                output["message"] = "Successfully Registered";
                connection.query(
                    "INSERT INTO users (username, email, password) VALUES (?,?,?)", [username, email, encrypt],
                );
            }
        }

        res.json(output)

    });

});

// app.post("/users/insert",(req, res) => {
//     // const username = req.body.usernameInput;
//     // const email = req.body.emailInput;
//     // const password = req.body.passwordInput;
//     const username = req.body.un;
//     const email = req.body.em;
//     const password = req.body.psswrd;
//     const bcrypt = require('bcryptjs');
//     const salt = bcrypt.genSaltSync(10);
//     const encrypt = bcrypt.hash(password, salt);

//     connection.execute(
//       "INSERT INTO `users` (`username`, `email`, `password`) VALUES (?, ?, ?)",
//       [username, email, encrypt],
//       (err, results, fields) => {
//         if (err) throw err;
//         res.json({
//           message: `registered new user`,
//           inserted_at_id: results.insertId,
//         });
//       }
//     );
//   });

app.post("/users/check", (req, res) => {
    const username = req.body.un;
    const email = req.body.em;
    // const username = req.body.usernameInput;
    // const email = req.body.emailInput;
    connection.execute(
      "SELECT * FROM `users` WHERE `username` = ? OR `email` = ?",
      [username, email],
      function (err, results, fields) {
        if (err) throw err;
        res.json(results);
      }
    );
  });


app.post("/read", (request, response) => {
    const user = request.body.username
    const pass = request.body.password
    console.log(user)
    const query = "SELECT `password` from `users` where `username`=?";
    const params = [user]
    connection.query(query, params, (err, rows) => {
        if (err) throw err;
        //
        var output = {}
        if (rows.length != 0) {
            var password_hash = rows[0]["password"];
            const bcrypt = require('bcryptjs');
            const verified = bcrypt.compareSync(pass, password_hash);
            if (verified) {
                output["status"] = 1;
                output["message"] = "Verified";
                console.log('verified')
            } else {
                console.log('invalid credentials')
                output["status"] = 0;
                output["message"] = "Invalid password";
            }

        } else {
            console.log('invalid')
            output["message"] = "Invalid username and password";
        }
        response.json(output)

    });
})

app.post("/find", (request, response) => {
    const email = request.body.email

    const query = "SELECT * from users where email=?";
    const params = [email]
    connection.query(query, params, (err, rows) => {
        if (err) throw err;
        //
        var output = {}
        if (rows.length != 0) {
            console.log('Email found')
            output["message"] = "Email found";

        } else {
            console.log('could not find email')
            output["message"] = "Could not find email";
        }
        response.json(output)

    });
})

app.post("/change", async(request, response) => {
    const email = request.body.email
    const password = request.body.password
    const repassword = request.body.repass
    const query = "SELECT password from users where email=?";
    const params = [email]
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const encrypt = await bcrypt.hash(password, salt)
    connection.query(query, params, (err, rows) => {
        if (err) throw err;
        //
        var output = {}
        if (password != repassword) {
            output["message"] = "Password does not match";
        } else if (password == "" || repassword == "") {
            output["message"] = "Please fill up the necessary information needed";
        } else {
            if (rows.length != 0) {
                connection.query(
                    "UPDATE users SET password = ? WHERE email = ?;", [encrypt, email],
                );
                console.log('Successfully Reset Password')
                output["message"] = "Successfully Reset Password";

            } else {
                console.log('An Error Occured')
                output["message"] = "An Error Occured";
            }
        }
        response.json(output)

    });
})


// for fetching blob images and convert to binaryffkff

app.get("/data", async(request, res) => {
    connection.query("SELECT * FROM detected", (err, results) => {

        try {

            if (results.length > 0) {
                let new_result = [];
                for (let i = 0; i < results.length; i++) {
                    new_result.push({
                        captured: new Buffer.from(results[i].captured).toString("utf8"),
                        date_time: results[i].date_time
                    })
                }
                res.json(new_result)
            } else {
                res.json({ message: 'No added data' });
            }
        } catch (err) {
            res.json({ message: err });
        }
    });
});

app.post("/data", (req, res) => {
    const { date_time } = req.body;
    const { captured } = req.body;
    console.log(date_time)
    connection.query(
        "INSERT INTO detected (date_time, captured) VALUES (?, ?)", [date_time, captured],
        (err, results) => {
            try {
                if (results.affectedRows > 0) {
                    res.json({ message: "Adding successful!" });

                } else {
                    res.json({ message: "Error, please check your error" });
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