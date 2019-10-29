const router = require("express").Router();
const user = require("./controllers/userRoutes");
const booking = require("./controllers/bookingRoutes");

//user
router
  .post("/adduser", user.registerUser)
  .post("/login", user.loginUser)
  .get("/getallusers", user.verifyToken, user.getAllUsers)
  .get("/getuser/:id", user.verifyToken, user.getOneUser)
  .put("/changepassword/:id", user.verifyToken, user.changePassword)
  .delete("/deleteuser/:id", user.verifyToken, user.deleteOneUser);

//booking
router
  .post("/addbooking", user.verifyToken, booking.addBooking)
  .get("/getallbooking", user.verifyToken, booking.getAllBookings)
  .get("/getbooking/:id", user.verifyToken, booking.getOneBooking)
  .delete("/deletebooking/:id", user.verifyToken, booking.deleteOneBooking);

module.exports = router;
