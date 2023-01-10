const sql1 = `CREATE TABLE user(
    user_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL UNIQUE, 
    name VARCHAR(255), 
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL
    )`
const sql2 = `CREATE TABLE workout(
    workout_id INT AUTO_INCREMENT KEY NOT NULL UNIQUE,
    title VARCHAR(255),
    category_id INT,
    user_id INT,
    FOREIGN KEY (category_id) REFERENCES category(category_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
    )`
const sql3 = `CREATE TABLE category(
    category_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL UNIQUE,
    name VARCHAR(255)
    )`
const sql4 = `CREATE TABLE exercise(
    exercise_id INT AUTO_INCREMENT KEY NOT NULL UNIQUE,
    name VARCHAR(255),
    description VARCHAR(255),
    category_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
    )`