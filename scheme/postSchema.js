var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var PostSchema = new mongoose.Schema({
    date: {
        type: Schema.Types.Date
    },
    text: {
        type: Schema.Types.String,
    },
    message_ids: {
        type: Schema.Types.String,
    },
    state: {
        type: Schema.Types.String,
    },
    type: {
        type: Schema.Types.String,
    },
    photo: {
        type: Schema.Types.String,
    },
    video: {
        type: Schema.Types.String,
    },
    mediagroup: {
        type: Schema.Types.String,
    },
    video_note: {
        type: Schema.Types.String,
    },
    audio: {
        type: Schema.Types.String,
    },
    voice: {
        type: Schema.Types.String,
    },
    datetosend: {
        type: Schema.Types.Date,
    },
    groupid: {
        type: Schema.Types.String,
    },
    usercount: {
        type: Schema.Types.Number,
    }


});


module.exports = PostSchema;