const express = require("express");
const app = express();
const server = require("http").createServer(app);
const middleware = require("./config/middleware");
const Routes = require("./routes/index.js");
require("dotenv").config();

middleware(app);
app.use(express.static("public"));
app.use("/api", Routes);

server.listen(process.env.PORT, err => {
  if (err) throw err;
  console.info("Server running at PORT ", process.env.PORT);
});
