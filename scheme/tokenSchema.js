var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TokenSchema = new mongoose.Schema({
    text: {
        type: Schema.Types.String
    },
    chatid: {
        type: Schema.Types.String,
    },
});

module.exports = TokenSchema;