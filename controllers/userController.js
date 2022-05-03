const DB = require("../models/DB");

const get_user_position = async (req, res) => {
  let id = parseInt(req.params.id);
  let count = parseInt(req.params.count) || 5;
  if (isNaN(id) || isNaN(count))
    return res.render("position.hbs", {
      error: "please enter positive numbers only that are bigger than 0",
    });
  count = Math.ceil(count / 2) - 1;
  let db = new DB();
  await db.connect();
  let data = await db.getUserPosition(req.params.id, count);
  db.disconnect();
  if (data.length > 0) {
    return res.render("position.hbs", { data: data });
  }
  return res.render("position.hbs");
};

module.exports = { get_user_position };
