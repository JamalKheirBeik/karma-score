const mysql = require("mysql2/promise");

module.exports = class DB {
  constructor() {
    this.host = process.env.DB_HOST;
    this.user = process.env.DB_USER;
    this.password = process.env.DB_PASSWORD;
    this.database = process.env.DB_NAME;
    this.port = process.env.DB_PORT;
    this.connection = undefined;
  }

  is_connected() {
    if (
      typeof this.connection !== "undefined" &&
      this.connection.connection._closing != true
    ) {
      return true;
    }
    return false;
  }

  async connect() {
    if (this.is_connected()) return;
    try {
      this.connection = await mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database,
        port: this.port,
      });
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    if (this.is_connected()) await this.connection.destroy();
  }

  async init() {
    await this.create_database();
    await this.connect();
    // create images table
    const imagesQuery =
      "CREATE TABLE IF NOT EXISTS images (id INT(10) AUTO_INCREMENT PRIMARY KEY, url VARCHAR(255) NOT NULL)";
    await this.create_table(imagesQuery);
    // create users table
    const usersQuery =
      "CREATE TABLE IF NOT EXISTS users (id INT(10) AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, karma_score INT(10) DEFAULT 0, image_id INT(10), INDEX (karma_score), CONSTRAINT img_id FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE ON UPDATE CASCADE)";
    await this.create_table(usersQuery);
  }

  async getUserPosition(id, count) {
    if (!this.is_connected()) await this.connect();

    const q1 = `CREATE TEMPORARY TABLE tmp1 as SELECT a.* ,b.url FROM ( SELECT * FROM users WHERE id = ${id} UNION ALL ( SELECT * FROM users WHERE karma_score < (SELECT karma_score FROM users WHERE id = ${id}) ORDER BY karma_score DESC LIMIT ${count} ) UNION ALL ( SELECT * FROM users WHERE karma_score > (SELECT karma_score FROM users WHERE id = ${id}) ORDER BY karma_score ASC LIMIT ${count} ) ORDER BY karma_score DESC ) AS a INNER JOIN images AS b ON a.image_id = b.id;`;
    await this.connection.query(q1);
    await this.connection.query("SET @rank=0;");
    await this.connection.query(
      "CREATE TEMPORARY TABLE tmp2 as SELECT users.id, @rank:=@rank+1 as rank FROM users ORDER BY karma_score DESC;"
    );
    let [rows, fields] = await this.connection.query(
      "SELECT * FROM tmp1 INNER JOIN tmp2 ON tmp1.id = tmp2.id;"
    );
    await this.disconnect();
    return rows;
  }

  async generateDummyData(number_of_rows, chunk) {
    if (!this.is_connected()) await this.connect();

    let [rows, fields] = await this.connection.query(
      "SELECT id FROM users LIMIT 1"
    );
    if (rows.length > 0) return;

    console.time("insert");
    let users = [];
    let images = [];
    for (let i = 1; i <= number_of_rows; i++) {
      if (i % chunk == 0) {
        images.push(["ImageURL" + i]);
        await this.connection.query("INSERT INTO images(url) VALUES ?", [
          images,
        ]);
        images = [];
        users.push(["user" + i, Math.floor(Math.random() * 50001), i]);
        await this.connection.query(
          "INSERT INTO users(username, karma_score, image_id) VALUES ?",
          [users]
        );
        users = [];
      } else {
        images.push(["ImageURL" + i]);
        users.push(["user" + i, Math.floor(Math.random() * 50001), i]);
      }
    }
    if (users.length > 0) {
      await this.connection.query("INSERT INTO images(url) VALUES ?", [images]);
      await this.connection.query(
        "INSERT INTO users(username, karma_score, image_id) VALUES ?",
        [users]
      );
    }

    console.timeEnd("insert");
  }

  async create_database() {
    this.connection = await mysql.createConnection({
      host: this.host,
      user: this.user,
      password: this.password,
      port: this.port,
    });
    await this.connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    await this.disconnect();
  }

  async create_table(query) {
    if (!this.is_connected()) return;
    await this.connection.query(query);
  }

  async insert_user(username, karma_score, image_url) {
    // insert to images
    const insertImage = `INSERT INTO images (url) VALUES ("${image_url}")`;
    let [result, fields] = await this.connection.query(insertImage);
    let image_id = result.insertId;
    // insert to users
    const insertuser = `INSERT INTO users (username, karma_score, image_id) VALUES ("${username}",${karma_score},${image_id})`;
    await this.connection.query(insertuser);
  }
};
