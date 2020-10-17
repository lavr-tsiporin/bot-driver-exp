//Schema
const Asessor = require('../models/asessor')

const handlerError = msg => {
  return `Error ${msg}`
}

async function allAsessor() {
  // return await Asessor.find({}, async (err, res) => {
  //   if (err) return handlerError(err)
  //   return handlerError(res)
  // })
  let all = await Asessor.find({})
  return all
}

module.exports = allAsessor