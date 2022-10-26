const { Router } = require('express');
const express = require('express')
const mongo = require('mongodb')

const Web3 = require('web3')
const fs = require('fs');
var config;


async function loadConfig() {
  let rawdata = fs.readFileSync('config.json');
  let json = JSON.parse(rawdata);
  config = json

}

loadConfig()
const url = config['mongodbAddress'];
const mgClient = new mongo.MongoClient(url);

async function createCollection() {
  await mgClient.connect()
  const db = mgClient.db(config['mongodbName'])
  if (db.databaseName != null) {
    return
  }
  else {
    const users = db.createCollection(config['mongodbCollectionName'])
  }
}

async function inputAdress(addressFromRequest, response) {
  await mgClient.connect()
  const db = mgClient.db("tmyadresses")
  const collection = db.collection("adresses")
  var result = await checkAdress(addressFromRequest)

  var date = new Date()

  if (result == null) {
    var mongoAdress = { address: addressFromRequest, createtime: date }
    collection.insertOne(mongoAdress)
    await sendTmy(addressFromRequest, response)
  }
  else {
    var str = JSON.stringify(result)
    var json = JSON.parse(str)

    var dbDate = new Date(json['createtime'])

    dbDate.setHours(dbDate.getHours() + config['timeForGiveaway'])
    //Время сейчас
    //console.log(date)
    //Время в бд
    //console.log(dbDate)
    //Время через которое можно будет получить монеты
    var timeLeft = new Date(dbDate - date)
    //console.log(timeLeft)

    if (date > dbDate) {
      collection.updateOne({ address: addressFromRequest }, { $set: { createtime: date } })
      await sendTmy(addressFromRequest, response)
    }
    else {
      response.send({
        msg: "Time has not yet passed",
        timeForGiveaway: timeLeft.getUTCHours() + ":" + timeLeft.getMinutes() + ":" + timeLeft.getSeconds()
      })
      response.end()
    }

  }

}

async function sendTmy(addressFromRequest, response) {
  var web3 = new Web3(config['nodeAddress'])
  const createTransaction = await web3.eth.accounts.signTransaction(
    {
      from: config['faucetAccount'],
      gasPrice: "1000000000",
      gas: "21000",
      to: addressFromRequest,
      value: web3.utils.toWei(config['amountOfCoins'], 'ether'),
      data: ""
    }
    , config['faucetAccountPrivateKey']);
  response.send({
    msg: "Coins sent",
    tx: "https://tmyscan.com/tx/" + createTransaction.transactionHash
  })
  response.end()
  const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);

}

async function checkAdress(addressFromRequest) {

  const db = mgClient.db('tmyadresses')
  const collection = db.collection("adresses")
  return collection.findOne({ address: addressFromRequest })

}





const app = express()
app.get('/api/send', async function (request, response) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET');
  response.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
  let addressFromRequest = request.query.address
  var log = await inputAdress(addressFromRequest, response)
})

app.get('/api/createCollection', async function (request, response) {
  await createCollection()
  response.end()
})


app.listen(3000)