var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var FileSchema = new mongoose.Schema({
    telegramid: {
        type: Schema.Types.String,
    },
    fileindex: {
        type: Schema.Types.String,
    },
    type: {
        type: Schema.Types.String
    },
    text: {
        type: Schema.Types.String,
    },
    adminanswer: {
        type: Schema.Types.String,
    },
    photo: {
        type: Schema.Types.String,
    },
    video: {
        type: Schema.Types.String,
    },
    video_note: {
        type: Schema.Types.String,
    },
    header: {
        type: Schema.Types.String,
    },
    audio: {
        type: Schema.Types.String,
    },
    voice: {
        type: Schema.Types.String,
    },

    document: {
        type: Schema.Types.String,
    },

});

module.exports = FileSchema;