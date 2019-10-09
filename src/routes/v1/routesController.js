const router = require("express").Router();
const user = require("./controllers/userRoutes");

//user
router
  .post("/adduser", user.registerUser)
  .post("/login", user.loginUser)
  .get("/getallusers", user.verifyToken, user.getAllUsers)
  .get("/getuser/:id", user.verifyToken, user.getOneUser)
  .put("/changepassword/:id", user.verifyToken, user.changePassword)
  .delete("/deleteuser/:id", user.verifyToken, user.deleteOneUser);

module.exports = router;
