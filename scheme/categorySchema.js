var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CategorySchema = new mongoose.Schema({
    date: {
        type: Schema.Types.Date
    },
    name: {
        type: Schema.Types.String,
    }

});

module.exports = CategorySchema;