const mysql = require("mysql2");
const express = require("express");
const app = express();
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const validate = require("./validation.js");
const fs = require("fs");

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "https://lift.onrender.com",
  })
);

const connection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 30,
});

app.use(bodyParser.json());

function verifyToken(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.json({ auth: false, status: "Authorization failed" });
  } else {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err)
        res
          .status(500)
          .send({ auth: false, message: "Failed to authenticate token." });
      connection.query(
        `SELECT name, lastname, email FROM user WHERE user_id =${decoded.id}`,
        (err, data) => {
          if (err) throw err;
          if (!data.length == 1) {
            res.status(404).send("No user found");
          } else {
            connection.
            next();
          }
        }
      );
    });
  }
}

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  email.toString();
  password.toString();
  if (
    validate.emailValidation(email) &&
    validate.passwordValidation(password)
  ) {
    connection.query(
      `SELECT * FROM user WHERE email = '${email}'`,
      (err, user) => {
        if (err) throw err;
        if (user.length === 1) {
          const passwordIsValid = bcrypt.compareSync(
            password,
            user[0].password
          );
          if (!passwordIsValid) {
            res
              .status(401)
              .json({ auth: false, msg: "Invalid email or password" });
          } else {
            const token = jwt.sign(
              { id: user[0].user_id },
              process.env.SECRET,
              {
                expiresIn: 86400, // expires in 24 hours
              }
            );
            res
              .cookie("access_token", token, {
                httpOnly: true,
              })
              .send({ auth: true, id: user[0].user_id });
          }
        } else {
          res.status(404).send({ msg: "Invalid email or password" });
        }
      }
    );
  } else {
    res.status(401).send({ msg: "Invalid email or password" });
  }
});

app.post("/signup", (req, res) => {
  const { name, lastname, email, password } = req.body;
  name.toString();
  lastname.toString();
  email.toString();
  password.toString();
  if (
    validate.nameValidation(name) &&
    validate.nameValidation(lastname) &&
    validate.emailValidation(email) &&
    validate.passwordValidation(password)
  ) {
    var hashedPassword = bcrypt.hashSync(password, 8);

    connection.query(
      `SELECT * FROM user WHERE email = '${email}'`,
      (err, user) => {
        if (err) throw err;
        if (user.length === 0) {
          connection.query(
            `INSERT INTO user (name, lastname, email, password)
          VALUES ('${name}', '${lastname}', '${email}', '${hashedPassword}');`,
            (err, result) => {
              if (err) throw err;

              const token = jwt.sign(
                { id: result.insertId },
                process.env.SECRET,
                {
                  expiresIn: 86400,
                }
              );
              res
                .cookie("access_token", token, {
                  httpOnly: true,
                })
                .send({ user_id: result.insertId });
            }
          );
        } else {
          res.status(406).json({ msg: "User already exists" });
        }
      }
    );
  }
});

app.get("/workouts/:user_id", verifyToken, (req, res) => {
  const user_id = req.params.user_id;
  connection.query(
    `SELECT * FROM workout WHERE user_id=${user_id}`,
    (err, data) => {
      if (err) throw err;
      res.send(data);
    }
  );
});

app.post("/categories", verifyToken, (req, res) => {
  connection.query("SELECT * FROM category", (err, data) => {
    if (err) throw err;
    res.send(data);
  });
});

app.post("/create/workout", verifyToken, (req, res) => {
  const { title, user_id, duration, time, date, exercises } = req.body;
  connection.query(
    `INSERT INTO workout (title, user_id, duration, time, date)
    VALUES ("${title}", "${user_id}", "${duration}", "${time}", "${date}");`,
    (err, result) => {
      if (err) throw err;
      const values = [];
      exercises.map((exercise) => {
        values.push([result.insertId, exercise.exercise_id]);
      });
      connection.query(
        `INSERT INTO exercise_line (workout_id, exercise_id) VALUES ?`,
        [values],
        (err, result) => {
          if (err) throw err;
          res.send({ msg: "workout successfully created" });
        }
      );
    }
  );
});

app.get("/workout/exercises/:workout_id", verifyToken, (req, res) => {
  const workout_id = req.params.workout_id;
  connection.query(
    `SELECT exercise.name
    FROM exercise_line, exercise
    WHERE exercise_line.workout_id=${workout_id}
    AND exercise_line.exercise_id = exercise.exercise_id;`,
    (err, data) => {
      if (err) throw err;
      res.send(data);
    }
  );
});

app.get("/exercises/:type", verifyToken, (req, res) => {
  const category_id = req.params.type;
  connection.query(
    `SELECT exercise_id,name,category_id
      FROM exercise
      WHERE category_id=${category_id}`,
    (err, data) => {
      if (err) throw err;
      res.send(data);
    }
  );
});

app.get("/image/:name", verifyToken, (req, res) => {
  const exercise_name = req.params.name;
  fs.readdir(__dirname + "/exercise_images", (err, files) => {
    if (err) console.log(err);
    else {
      let available = files.includes(exercise_name + ".webp");
      if (available) {
        res.sendFile(
          __dirname + "/exercise_images/" + exercise_name + ".webp",
          (err) => {
            if (err) throw err;
          }
        );
      } else {
        console.log("file not found")
      }
    }
  });
});

app.listen(3001, () => {
  console.log(`App is listen on port 300`);
});
