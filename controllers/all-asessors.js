//Schema
const Asessor = require('../models/asessor')

const handlerMsg = arr => {

  let str = `*Список всех асессоров:* \n`
  arr.forEach((item, index) => {
    return str += `${index + 1} \`@${item} \` \n`
  })

  return str
}

async function allAsessor() {
  let allAsessor = []
    ; (await Asessor.find({})).forEach(i => allAsessor.push(i.username))

  return handlerMsg(allAsessor)
}

module.exports = allAsessor