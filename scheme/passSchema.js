var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var PassSchema = new mongoose.Schema({
    text: {
        type: Schema.Types.String
    },
    chatid: {
        type: Schema.Types.String,
    },
});

module.exports = PassSchema;