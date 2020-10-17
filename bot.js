//CONFIG
require('dotenv').config()

//TELEGRAM
const { Telegraf } = require('telegraf')

//DATABASE
const connect = require('./database')
const Asessor = require('./models/asessor')
const Driver = require('./models/driver')

//Connect Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
//Message /start
bot.start((ctx) => ctx.reply('Привет! Это частная собственность! 😇'))

//bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
//bot.hears('hi', (ctx) => ctx.reply('Hey there'))

//Launch Telegram Bot
bot.launch()

//Reply on all message
function regNewAsessor(obj) {
  bot.telegram.sendMessage(process.env.CHAT_ADMIN,
    `❓ __Пользователь__ ❓\n 
    *ФИО:* \`${obj.first_name} ${obj.last_name}\` \n
    *username:* \`${obj.username}\` \n
    *id:* \`${obj.id}\` \n`, {
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✅Предоставить доступ',
            callback_data: `add\t${obj.id}\t${obj.username}`
          },
          {
            text: '❌Отказать в доступе',
            callback_data: `cancel\t${obj.id}\t${obj.username}`
          }
        ]
      ]
    }
  })

  bot.on('callback_query', async (ctx) => {

    let dataCallback = ctx.callbackQuery.data.split('\t')
    switch (dataCallback[0]) {
      case 'add':
        let asessorCheck = await Asessor.find({
          idChatAsessor: dataCallback[1]
        })
        if (asessorCheck.length > 0) {
          //совпадение = дубль
          //delete message
          ctx.deleteMessage()
          //send message admin
          bot.telegram.sendMessage(process.env.CHAT_ADMIN, `
          ⭕ __Пользователь__ ⭕ \n 
          *username:* \`${dataCallback[2]}\` \n
          *id:* \`${dataCallback[1]}\` \n
          уже имеет доступ в систему`, { parse_mode: 'MarkdownV2' })
          //send message asessor
          bot.telegram.sendMessage(dataCallback[1], `✅ У Вас, \`${dataCallback[2]}\`, уже есть доступ в систему ✅`, { parse_mode: 'MarkdownV2' })

        } else {
          //добавляем
          const asessor = new Asessor({
            idChatAsessor: dataCallback[1],
            username: dataCallback[2]
          })
          await asessor.save()
          //delete message
          ctx.deleteMessage()
          //send message admin
          bot.telegram.sendMessage(process.env.CHAT_ADMIN, `
          ✅ __Пользователь__ ✅ \n 
          *username:* \`${dataCallback[2]}\` \n
          *id:* \`${dataCallback[1]}\` \n
          был успешно добавлен в систему`, { parse_mode: 'MarkdownV2' })
          //send message asessor
          bot.telegram.sendMessage(dataCallback[1], `✅ Вам, \`${dataCallback[2]}\`, был предоставлен доступ в систему ✅`, { parse_mode: 'MarkdownV2' })
        }
        break
      case 'cancel':
        //delete message
        ctx.deleteMessage()
        //send message admin
        bot.telegram.sendMessage(process.env.CHAT_ADMIN, `
          🚫 __Пользователю__ 🚫 \n 
          *username:* \`${dataCallback[2]}\` \n
          *id:* \`${dataCallback[1]}\` \n
          было отказано в доступе в систему`, { parse_mode: 'MarkdownV2' })
        //send message asessor
        bot.telegram.sendMessage(dataCallback[1], `🚫 Вам, \`${dataCallback[2]}\`, был отказано в доступе 🚫`, { parse_mode: 'MarkdownV2' })
        break
    }
  })
}

const parseToMsg = (el) => {
  let str = `*Результаты поиска*\n ✅ __${el[0].driverNumber}__ ✅ \n`

  el.forEach(item => {
    let newStr = str + `_Дата начала стажа:_ \`${item.driverExpDate}\`\n`
    str = newStr
    return str
  })

  return str
}

bot.on('message', async ctx => {
  let asessor = await Asessor.find({
    idChatAsessor: ctx.message.from.id
  })

  if (asessor.length > 0) {
    let driver = await Driver.find({
      driverNumber: ctx.message.text
    })

    if (driver.length < 1) {
      //такого не найдено
      ctx.deleteMessage()
      bot.telegram.sendMessage(ctx.message.from.id,
        `*Результаты поиска*\n ⛔️ __${ctx.message.text}__ ⛔️ \n _${process.env.TAXI_RES_NO_DRIVER}_`, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: process.env.TAXI_TEXT_HISTORY,
                url: `${process.env.TAXI_URL}${ctx.message.text}`
              }
            ]
          ]
        }
      })
    } else {
      ctx.deleteMessage()
      bot.telegram.sendMessage(ctx.message.from.id, parseToMsg(driver), {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: process.env.TAXI_TEXT_HISTORY,
                url: `${process.env.TAXI_URL}${ctx.message.text}`
              }
            ]
          ]
        }
      })
    }
  } else {
    regNewAsessor(ctx.message.from)
  }
})

//Launch connect to Mongo Database and Google Spreadsheet
connect()