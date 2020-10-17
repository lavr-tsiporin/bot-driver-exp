//CONFIG
require('dotenv').config()
//DATABASE
const mongoose = require('mongoose')
//Schema
const Asessor = require('./models/asessor')

const handlerError = msg => {
  return `Error ${msg}`
}

async function deleteAsessor(asessor) {
  await Asessor.deleteOne({
    username: asessor
  }, (err, res) => {
    if (err) return handlerError(err)
    return handlerError(res)
  })
}

module.exports = deleteAsessor