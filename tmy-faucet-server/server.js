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

async function inputAdress(addressFromRequest) {
  await mgClient.connect()
  const db = mgClient.db("tmyadresses")
  const collection = db.collection("adresses")
  var result = await checkAdress(addressFromRequest)

  var date = new Date()

  if (result == null) {
    var mongoAdress = { address: addressFromRequest, createtime: date }
    collection.insertOne(mongoAdress)
    await sendTmy(addressFromRequest)
    return "Coins sent"
  }
  else {
    var str = JSON.stringify(result)
    var json = JSON.parse(str)

    var dbDate = new Date(json['createtime'])

    dbDate.setHours(dbDate.getHours() + config['timeForGiveaway'])
    //Время сейчас
    console.log(date)
    //Время в бд
    console.log(dbDate)

    if (date > dbDate) {
      collection.updateOne({ address: addressFromRequest }, { $set: { createtime: date } })
      await sendTmy(addressFromRequest)
      return "Updated"
    }
    else {
      return "Time has not yet passed"
    }
  }

}

async function checkAdress(addressFromRequest) {

  const db = mgClient.db('tmyadresses')
  const collection = db.collection("adresses")
  return collection.findOne({ address: addressFromRequest })

}

async function sendTmy(addressFromRequest) {
  var web3 = new Web3(config['nodeAddress'])
  const createTransaction = await web3.eth.accounts.signTransaction(
    {
      from: config['faucetAccount'],
      gasPrice: "10000000000",
      gas: "21000",
      to: addressFromRequest,
      value: web3.utils.toWei(config['amountOfCoins'], 'ether'),
      data: ""
    }
    , config['faucetAccountPrivateKey']);

  const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
  console.log(`Transaction successful with hash: ${createReceipt.transactionHash}`);
}



const app = express()
app.get('/api/send', async function (request, response) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET');
  response.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
  let addressFromRequest = request.query.address
  var log = await inputAdress(addressFromRequest)
  response.send({msg:log})
  response.end()
})
app.get('/api/createCollection', async function (request, response) {
  await createCollection()
  response.end()
})
app.get('/api/test', async function (request, response) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET');
  response.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
  response.send({msg:'text'})
  response.end()
})

app.listen(3000)