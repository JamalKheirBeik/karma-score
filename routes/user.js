const router = require("express").Router();
const userController = require("../controllers/userController");

router.get(
  "/user/:id/:count?/karma-position",
  userController.get_user_position
);

module.exports = router;
