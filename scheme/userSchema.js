var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var UserSchema = new mongoose.Schema({
  chatid: {
    type: Schema.Types.String,
  },
  startdate: {
    type: Schema.Types.Date,
  },
  blockdate: {
    type: Schema.Types.Date,
  },
  email: {
    type: Schema.Types.String,
  },
  status: {
    type: Schema.Types.String,
  },
  favorites: {
    type: [Schema.Types.ObjectId],
  },
  needsubsrcsend: {
    type: Schema.Types.Boolean,
  },
  nopaid: {
    type: Schema.Types.Boolean,
  },
  testtrainings: {
    type: [Schema.Types.ObjectId],
  },
});

module.exports = UserSchema;
