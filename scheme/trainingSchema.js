var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TrainingSchema = new mongoose.Schema({
    date: {
        type: Schema.Types.Date
    },
    name: {
        type: Schema.Types.String,
    },
    trindex: {
        type: Schema.Types.Number,
    },
    video: {
        type: [Schema.Types.String],
    },
    caption: {
        type: Schema.Types.String,
    },
    category: {
        type: Schema.Types.String,
    },
    test: {
        type: Schema.Types.Boolean,
    },
});

module.exports = TrainingSchema;