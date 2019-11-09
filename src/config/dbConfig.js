const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const Schema = mongoose.Schema;
const Model = mongoose.model;
require("dotenv").config();
const { MDB_URL, MDB_PORT, MDB_NAME, MDB_USER, MDB_PASSWORD } = process.env;

const mongodb = `mongodb://${MDB_USER}:${MDB_PASSWORD}@${MDB_URL}:${MDB_PORT}/${MDB_NAME}`;

mongoose
  .connect(mongodb, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//Starting Schema
const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    role: Number,
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const bookingScheme = new Schema(
  {
    userId: String,
    namaTeam: String,
    date: String,
    jam: String,
    image: String,
    endDate: String,
    tanggal: String,
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const completeBookingScheme = new Schema(
  {
    prevId: String,
    userId: String,
    namaTeam: String,
    date: String,
    jam: String,
    endDate: String,
    tanggal: String,
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

//Model method after this line
userSchema.pre("save", async function(next) {
  const user = this;
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  next();
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return callback(err, null);
    return callback(null, isMatch);
  });
};

//All Model after this line
const User = Model("User", userSchema);
const Booking = Model("Booking", bookingScheme);
const completeBooking = Model("completeBooking", completeBookingScheme);

module.exports = {
  User,
  Booking,
  completeBooking
};
