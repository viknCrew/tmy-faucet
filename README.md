# tmy-faucet

Перед запуском сервера нужно создать config.json рядом с файлом server.js
```
{
    "mongodbAddress" : "mongodb://localhost:27017/",
    "mongodbName": "<Имя бд в mongodb>",
    "mongodbCollectionName": "<Имя коллекции в бд>",
    "timeForGiveaway": Время в часах через которое можно повторно забрать монеты,
    "faucetAccount" : "Адрес кошелька с которого будут перечислятбся монеты",
    "nodeAddress": "Адресс ноды",
    "amountOfCoins":"0.000005",
    "faucetAccountPrivateKey" : "Приватный ключ аккаунта с которого будут перечисляться монеты"
}
```
