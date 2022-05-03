const hbs = require("express-handlebars");
const express = require("express");
const app = express();
const DB = require("./models/DB");
// init dotenv
require("dotenv").config();

app.engine("hbs", hbs.engine({ defaultLayout: "main", extname: "hbs" }));
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use("/", require("./routes/user"));
app.use("/api/v1", require("./routes/api"));

app.listen(process.env.PORT, async () => {
  // init the database
  let db = new DB();
  await db.init();
  await db.generateDummyData(100000, 25000);
  await db.disconnect();
});
