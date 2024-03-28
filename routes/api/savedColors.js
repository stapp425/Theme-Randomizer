const express = require("express");
const router = express.Router();
const colorsController = require("../../controller/colorsController");

router.route("/")
    .get(colorsController.getAllThemes)
    .post(colorsController.addNewTheme)
    .put(colorsController.updateTheme)
    .delete(colorsController.removeTheme);

router.get("/favorites", colorsController.getFavThemes);
router.get("/normal", colorsController.getNormalThemes);
router.get("/limited", colorsController.getLimitedThemes);

module.exports = router;