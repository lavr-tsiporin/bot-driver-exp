//Schema
const Asessor = require('../models/asessor')

const handlerMsg = arr => {

  if (arr.length < 1) {
    return `Таких пользователей не существует`
  }

  let str = `*Список удаленных асессоров:* \n`
  arr.forEach((item, index) => {
    return str += `${index + 1} Пользователь \`@${item.username}\` _удален_ \n`
  })

  return str
}

async function deleteAsessor(asessors) {

  let result = []
  const findAsessors = (await Asessor.find({ username: { $in: asessors } })).forEach(i => result.push(i))
  const deletedAsessot = await Asessor.deleteMany({ username: { $in: asessors } })

  return handlerMsg(result)
}

module.exports = deleteAsessor