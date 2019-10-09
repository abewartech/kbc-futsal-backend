const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const Schema = mongoose.Schema;
const Model = mongoose.model;
require("dotenv").config();
const { MDB_URL, MDB_PORT, MDB_NAME } = process.env;

const mongodb = `mongodb://${MDB_URL}:${MDB_PORT}/${MDB_NAME}`;

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
    username: {
      type: String,
      unique: true,
      index: {
        unique: true
      }
    },
    password: String,
    role: Number,
    line: Number,
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

module.exports = {
  User
};
