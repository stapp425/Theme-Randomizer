const express = require("express");
const router = express.Router();
const colorsController = require("../../controller/colorsController");

router.route("/")
    .get(colorsController.getNormalThemes)
    .post(colorsController.addNewTheme)
    .put(colorsController.updateTheme)
    .delete(colorsController.removeTheme);

router.get("/favorites", colorsController.getFavThemes);

module.exports = router;