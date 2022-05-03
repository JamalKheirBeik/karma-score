const router = require("express").Router();
const apiController = require("../controllers/apiController");

router.get("/user/:id/:count?/karma-position", apiController.get_user_position);

module.exports = router;
