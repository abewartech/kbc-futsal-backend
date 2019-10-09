const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const middleware = require("./config/middleware");
const Routes = require("./routes/index.js");
const { SocketIO } = require("./config/websocket");
SocketIO(io);
require("dotenv").config();

middleware(app);
app.use("/api", Routes);

server.listen(process.env.PORT, err => {
  if (err) throw err;
  console.info("Server running at PORT ", process.env.PORT);
});
