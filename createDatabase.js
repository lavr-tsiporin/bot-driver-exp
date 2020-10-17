//CONFIG
require('dotenv').config()

//DATABASE
const mongoose = require('mongoose')
//Schema
const Driver = require('./models/driver')

//GoogleSpreedsheets
const { google } = require('googleapis')
//Connect to google spreadsheet
const clientGoogleSpreadsheet = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
)

async function connectGoogleSpreadsheet(cl) {
  const googleApi = google.sheets({
    version: 'v4',
    auth: cl
  })
  const options = {
    spreadsheetId: process.env.GOOGLE_SPREADSHEET,
    range: 'Стаж!A3:B'
  }

  //Проверка на наличие БД для создания или обновления
  let resultSpreadsheet = await googleApi.spreadsheets.values.get(options)

  let allDriverNumber = resultSpreadsheet.data.values.map(item => {
    typeof item[0] !== "undefined"
      ? item[0] = item[0].replace(/\n+|\r+|\s+/g, '').toUpperCase().trim()
      : item[0] = null
    return typeof item[1] === "undefined" ? [item[0]] : [item[0], item[1]]
  })

  //запуск создания БД
  console.log('Create')
  createDatabase(allDriverNumber)
}

async function connectGoogle() {
  clientGoogleSpreadsheet.authorize((err) => {
    if (err) {
      throw new Error(err)
    } else {
      connectGoogleSpreadsheet(clientGoogleSpreadsheet)
      console.log('Google Spreadsheet connected')
    }
  })
}

//Connect to MongoDB database
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    }, () => {
      console.log('Database connected')
      connectGoogle()
    })
  } catch (error) {
    throw new Error(error)
  }
}

//Create driver in MongoDB database
async function createDatabase(el) {
  if (!el) {
    throw new Error('No data in Google')
  }

  let db = await Driver.find({})

  if (db.length > 0) {

    console.log('Drop database')
    await Driver.collection.drop()
  }

  saveDatabaseElement(el)
}

function saveDatabaseElement(arr) {
  arr.forEach(async item => {
    let driver = new Driver({
      driverNumber: item[0],
      driverExpDate: item[1]
    })
    await driver.save()
  })
}

connectMongo()