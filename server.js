const express = require("express");
const server = express();
const path = require("path");
const PORT = 3500;

server.use("/", express.static(path.join(__dirname, "public")));

server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "index.html"));
})

server.get("/colors", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "colorsList.html"))
})

server.all("*", (req, res) => {
    res.status(404).sendFile(path.join(__dirname, "view", "404error.html"));
})

server.listen(PORT);