const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Noteschema = new Schema({
  note: {
    type: String,
    
  },
    
});
const Note = mongoose.model("Note", Noteschema);
module.exports = Note;