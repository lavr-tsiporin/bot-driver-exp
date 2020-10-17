const { Schema, model } = require('mongoose')

const Driver = new Schema({
  driverNumber: {
    type: String,
    trim: true,
    uppercase: true,
  },
  driverExpDate: {
    type: String,
    trim: true,
    lowercase: true,
    default: '01.01.2017'
  }
},
  { versionKey: false }
)

module.exports = model('Driver', Driver)