const { Order, Line } = require("../config/dbConfig");
let Users = [];
let newSocket;

const SocketIO = io => {
  newSocket = io;
  io.on("connect", function(socket) {
    socket.emit("requestId", null);
    socket.on("userConnected", function(msg) {
      if (msg.role === 5) {
        if (Users.filter(user => user.userId === msg.id).length === 0) {
          Users.push({ id: socket.id, userId: msg.id });
          console.log("ini users ", Users);
        }
      }
    });
    socket.on("userDisconnected", function(msg) {
      Users = Users.filter(user => user.id !== socket.id);
    });

    socket.on("disconnect", () => {
      Users = Users.filter(user => user.id !== socket.id);
    });
    socket.on("scanner", function(msg) {
      io.emit("scannertc", msg.payload);
    });

    socket.on("updateLine", function(msg) {
      if (msg.payload) {
        return updateLifeTime(io);
      }
      return;
    });
  });
};

const updateLifeTime = io => {
  Line.aggregate([
    {
      $project: {
        _id: 1,
        ids: 1,
        toolId: 1,
        id_jenisTool: 1,
        jenis: 1,
        lifeTime: 1,
        shots: 1,
        line: 1,
        op: 1,
        magazine: 1,
        regrinding: 1,
        andon: 1,
        difference: { $subtract: ["$lifeTime", "$shots"] }
      }
    },
    { $match: { difference: { $lt: 1000 } } }
  ])
    .project({ difference: 0 })
    .exec(function(err, result) {
      if (err) {
        return console.log(err);
      }

      if (result.length === 0) {
        return;
      }

      io.emit("update", result);
    });
};

const uninstallTools = data => {
  newSocket.emit("delete", data);
};

const insertOrder = (user_id, data) => {
  let user = Users.filter(user => user.userId === user_id);
  if (user.length === 0) {
    return;
  } else {
    newSocket.to(`${user[0].id}`).emit("insertedOrder", data);
  }
};

const updateOrder = (user_id, data) => {
  let user = Users.filter(user => user.userId === user_id);
  Order.findById(data._id)
    .populate("customer")
    .populate("jenistool")
    .exec(function(err, result) {
      if (err) {
        return;
      }

      if (user.length === 0) {
        return;
      } else {
        newSocket.to(`${user[0].id}`).emit("updatedOrder", result);
      }
    });
};

const deleteOrder = (user_id, data) => {
  let user = Users.filter(user => user.userId === user_id);
  if (user.length === 0) {
    return;
  } else {
    newSocket.to(`${user[0].id}`).emit("deletedOrder", data);
  }
};

module.exports = {
  SocketIO,
  uninstallTools,
  insertOrder,
  updateOrder,
  deleteOrder
};
