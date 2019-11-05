const jwt = require("jsonwebtoken");
const { Booking, completeBooking } = require("../../../config/dbConfig");
const fs = require("fs");
const Moment = require("moment");
const { extendMoment } = require("moment-range");

const moment = extendMoment(Moment);

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
        completeBooking.find(
          { tanggal: req.body.tanggal },
          { date: 1, endDate: 1 },
          function(err, Bookings) {
            if (err) {
              return res.status(400).json({ success: false, message: err });
            }
            if (Bookings.length > 0) {
              const { date, endDate } = req.body;
              const dates = [moment(date), moment(endDate)];
              const range = moment.range(dates);

              for (let i = 0; i < Bookings.length; i++) {
                let dates2 = [
                  moment(Bookings[i].date),
                  moment(Bookings[i].endDate)
                ];
                let range2 = moment.range(dates2);
                if (range.overlaps(range2, { adjacent: false })) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "Lapangan sudah dibooking, silahkan cek jadwal dahulu"
                  });
                }
              }

              let newBooking = new Booking({
                userId: req.body.userId,
                namaTeam: req.body.namaTeam,
                date: req.body.date,
                jam: req.body.jam,
                endDate: req.body.endDate,
                tanggal: req.body.tanggal
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
            } else {
              let newBooking = new Booking({
                userId: req.body.userId,
                namaTeam: req.body.namaTeam,
                date: req.body.date,
                jam: req.body.jam,
                endDate: req.body.endDate,
                tanggal: req.body.tanggal
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
          }
        );
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

            if (result.image) {
              fs.unlink(`public/images/uploads/${result.image}`, err => {
                if (err) throw err;
              });
            }

            completeBooking.find(
              { tanggal: result.tanggal },
              { date: 1, endDate: 1 },
              function(err, Bookings) {
                if (err) {
                  return res.status(400).json({ success: false, message: err });
                }
                if (Bookings.length > 0) {
                  const { date, endDate } = result;
                  const dates = [moment(date), moment(endDate)];
                  const range = moment.range(dates);

                  for (let i = 0; i < Bookings.length; i++) {
                    let dates2 = [
                      moment(Bookings[i].date),
                      moment(Bookings[i].endDate)
                    ];
                    let range2 = moment.range(dates2);
                    if (range.overlaps(range2, { adjacent: false })) {
                      return res.status(400).json({
                        success: false,
                        message:
                          "Booking gagal di Accept, Karena lapangan sudah di booking."
                      });
                    }
                  }

                  let newComplete = new completeBooking({
                    prevId: result._id,
                    userId: result.userId,
                    namaTeam: result.namaTeam,
                    date: result.date,
                    jam: result.jam,
                    endDate: result.endDate,
                    tanggal: result.tanggal
                  });

                  newComplete.save(function(err, savedComplateBooking) {
                    if (err) {
                      if (err.name === "MongoError" && err.code === 11000) {
                        return res.status(400).json({
                          success: false,
                          message: "Complete Booking already registered"
                        });
                      }
                      res.status(400).json({ success: false, message: err });
                    } else {
                      res.status(200).json({
                        success: true,
                        message: result
                      });
                    }
                  });
                } else {
                  let newComplete = new completeBooking({
                    prevId: result._id,
                    userId: result.userId,
                    namaTeam: result.namaTeam,
                    date: result.date,
                    jam: result.jam,
                    endDate: result.endDate,
                    tanggal: result.tanggal
                  });

                  newComplete.save(function(err, savedComplateBooking) {
                    if (err) {
                      if (err.name === "MongoError" && err.code === 11000) {
                        return res.status(400).json({
                          success: false,
                          message: "Complete Booking already registered"
                        });
                      }
                      res.status(400).json({ success: false, message: err });
                    } else {
                      res.status(200).json({
                        success: true,
                        message: result
                      });
                    }
                  });
                }
              }
            );
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
