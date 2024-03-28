const mongoose = require("mongoose");
const express = require("express");
const server = express();
const path = require("path");

require("dotenv").config();
require("./config/connectDB")();

server.use(express.json());
server.use("/", express.static(path.join(__dirname, "public")));

server.use("/", require("./routes/main"));
server.use("/all", require("./routes/colors"));
server.use("/api/colors", require("./routes/api/savedColors"));

server.all("*", (req, res) => {
    res.status(404).sendFile(path.join(__dirname, "view", "404error.html"));
})

mongoose.connection.once("open", () => {
    console.log("Database successfully connected.");
    server.listen(process.env.PORT, () => console.log(`Server running on PORT ${process.env.PORT}`));
});
