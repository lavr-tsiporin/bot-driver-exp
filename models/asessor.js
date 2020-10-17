const { Schema, model } = require('mongoose')

const Asessor = new Schema({
  idChatAsessor: {
    type: Number,
    trim: true,
    required: true
  },
  username: {
    type: String,
    trim: true,
    required: true
  }
},
  { versionKey: false }
)

module.exports = model('Asessor', Asessor)