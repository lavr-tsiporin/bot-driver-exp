//Schema
const Asessor = require('../models/asessor')

const handlerMsg = arr => {
  // console.log('arr del', arr)

  let str = `*Список удаленных асессоров:* \n`
  arr.forEach((item, index) => {
    return str += `${index + 1} \`@${item.id}\` _${item.status}_ \n`
  })
  return str
}

async function deleteAsessor(asessors) {
  let result = []
  asessors.forEach(async i => {
    i = i.trim()
    let res = await Asessor.findOneAndDelete({
      username: i
    })
    console.log(res);
    // if (res === null) return `Не найдено`
    // return `Пользователь \`@${asessor}\` удален`
    if (res === null) return result.push({ user: i, status: `пользователь не найден` })
    return result.push({ id: i, status: `Пользователь удален` })
  })
  console.log('result', result);
  return handlerMsg(result)
}

module.exports = deleteAsessor