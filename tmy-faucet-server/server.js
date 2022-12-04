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

async function inputAdress(addressFromRequest, response) {

  try {
    
    await mgClient.connect()
    const db = mgClient.db(config['mongodbName'])
    const collection = db.collection(config['mongodbCollectionName'])
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


  } catch (error) {
    response.send({
      msg: error.message
    })
    response.end()
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
    //const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
  
    await web3.eth.sendSignedTransaction(createTransaction.rawTransaction)
      .on("receipt",(receipt) => {
        response.send({
          msg: "Coins sent",
          tx: "https://tmyscan.com/tx/" + receipt.transactionHash
        })
        response.end()
      })
      .on("error", (err) => {
        response.send({
          msg: err,
          error: err.message
        })
        response.end()
      })
  
  
}

async function checkAdress(addressFromRequest) {

  const db = mgClient.db(config['mongodbName'])
  const collection = db.collection(config['mongodbCollectionName'])
  return collection.findOne({ address: addressFromRequest })
}

const app = express()
app.get('/api/send', async function (request, response) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET');
  response.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
  let addressFromRequest = request.query.address
  await inputAdress(addressFromRequest, response)
})

console.log("Сервер запущен")
app.listen(3120)