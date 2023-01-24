var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
    date: {
        type: Schema.Types.Date
    },
    chatid: {
        type: Schema.Types.String,
    },
    messageid: {
        type: Schema.Types.String,
    },
    text: {
        type: Schema.Types.String,
    },
    adminanswer: {
        type: Schema.Types.String,
    },
    fromuser: {
        type: Schema.Types.Boolean,
    },
    unread: {
        type: Schema.Types.Boolean,
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
    audio: {
        type: Schema.Types.String,
    },
    voice: {
        type: Schema.Types.String,
    },

    needsend: {
        type: Schema.Types.Boolean,
    },
    deleted: {
        type: Schema.Types.String,
    },

});

module.exports = MessageSchema;