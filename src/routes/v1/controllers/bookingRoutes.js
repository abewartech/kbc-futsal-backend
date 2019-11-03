const jwt = require("jsonwebtoken");
const { Booking, completeBooking } = require("../../../config/dbConfig");
const fs = require("fs");

const booking = {
  addBooking: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function(err, authData) {
      req.checkBody("date", "date field cannot be empty").notEmpty();
      const errors = req.validationErrors();

      if (errors) {
        res.status(400).json({
          success: false,
          message: errors[0].msg
        });
      } else {
        let newBooking = new Booking({
          userId: req.body.userId,
          namaTeam: req.body.namaTeam,
          date: req.body.date,
          jam: req.body.jam
        });

        newBooking.save(function(err, savedBooking) {
          if (err) {
            if (err.name === "MongoError" && err.code === 11000) {
              return res.status(400).json({
                success: false,
                message: "Booking already registered"
              });
            }
            res.status(400).json({ success: false, message: err });
          } else {
            res.status(200).json({
              success: true,
              message: savedBooking
            });
          }
        });
      }
    });
  },

  getAllBookings: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function(err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        Booking.find({}, function(err, Bookings) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          res.status(200).json({ success: true, message: Bookings });
        });
      }
    });
  },

  getOneBooking: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function(err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        const id = req.params.id;
        Booking.findById(id, function(err, Booking) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          if (Booking === null) {
            return res
              .status(200)
              .json({ success: false, message: "Booking not found" });
          }

          res.status(200).json({ success: true, message: Booking });
        });
      }
    });
  },

  editOneBooking: (req, res) => {
    const fileName = req.body.fileName;
    const id = req.body.id;
    let editBooking = {
      image: fileName
    };

    Booking.findByIdAndUpdate(id, editBooking, { new: true }, function(
      err,
      booking
    ) {
      if (err) {
        return res.status(400).json({ success: false, message: err });
      }

      if (booking === null) {
        return res
          .status(200)
          .json({ success: false, message: "Booking not found" });
      }

      res.status(200).json({ success: true, message: booking });
    });
  },

  deleteOneBooking: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function(err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        const id = req.params.id;
        Booking.findByIdAndDelete(id, function(err, deletedBooking) {
          if (err) {
            res.status(400).json({ success: false, message: err });
          }

          if (deletedBooking === null) {
            return res
              .status(200)
              .json({ success: false, message: "Booking not found" });
          }

          res.status(200).json({ success: true, message: deletedBooking });
        });
      }
    });
  },

  completeBooking: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function(err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        const id = req.params.id;

        Booking.findById(id, function(err, Booking) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          if (Booking === null) {
            return res
              .status(200)
              .json({ success: false, message: "Booking not found" });
          }

          Booking.remove(function(err, result) {
            if (err) {
              return res.status(400).json({ success: false, message: err });
            }

            fs.unlink(`public/images/uploads/${result.image}`, err => {
              if (err) throw err;
            });

            let newComplete = new completeBooking({
              prevId: result._id,
              userId: result.userId,
              namaTeam: result.namaTeam,
              date: result.date,
              jam: result.jam
            });

            newComplete.save(function(err, savedComplateBooking) {
              if (err) {
                if (err.name === "MongoError" && err.code === 11000) {
                  return res.status(400).json({
                    success: false,
                    message: "Complate Booking already registered"
                  });
                }
                res.status(400).json({ success: false, message: err });
              } else {
                res.status(200).json({
                  success: true,
                  message: savedComplateBooking
                });
              }
            });
          });
        });
      }
    });
  },

  getAllCompleteBookings: (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, function(err, authData) {
      if (err) {
        res.status(401).json({ success: false, message: err });
      } else {
        completeBooking.find({}, function(err, Bookings) {
          if (err) {
            return res.status(400).json({ success: false, message: err });
          }

          res.status(200).json({ success: true, message: Bookings });
        });
      }
    });
  }
};

module.exports = booking;
