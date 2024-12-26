var express = require('express');
var router = express.Router();
const fs = require('node:fs');

var ver = "0.1.0"

// STORAGE INIT

const JSONdb = require('simple-json-db');
const userdb = new JSONdb(__dirname + '/db/users.json');
const chatdb = new JSONdb(__dirname + '/db/chats.json');

//


// var accounts = {
//   John: {
//     displayname: "BJ",
//     password: "changeme",
//     avatar: "true",
//     bio: "balls",
//     pfptype: "jpg",
//     admin: false
//   }
// }

/*
            MAIN API
 */
router.get('/api/', function(req, res, next) {
  res.send("internaserver");  // чтобы клиент узнал что это тот сервер
});

router.get('/api/ver/', function(req, res, next) {
  res.send(ver); // чтобы клиент сравнил версии
});


/*
          ACCOUNTING
*/

router.post('/api/login/', function(req, res, next) {
  // console.log(req.body)
  //console.log(accounts[req.body.name])

  if(typeof userdb.get(req.body.name)/*accounts[req.body.name]*/ === "undefined") {
    res.sendStatus(401)
  } else {

  if (userdb.get(req.body.name).password === req.body.password) {
    console.info("Successful login for " + req.body.name)
    res.sendStatus(200)
  } else  {
    console.warn("Failed login attempt for " + req.body.name)
    res.sendStatus(401)
  }} // 200 if correct, 401 if wrong
});

router.post('/api/account/register/', function(req, res, next) {
  if (typeof userdb.get(req.body.name) === "undefined") {
    userdb.set(req.body.name,
      {
        displayname: req.body.name,
      password: req.body.password,
      avatar: false,
      bio: "",
      pfptype: "none",
      admin: false
    }
    )
    res.sendStatus(201)
  } else {
    res.send("exists")
  }
});



// PROFILE PICTURES

// NEEDS TESTING AND JSONSTORAGE SYSTEM!!!!!
// router.post('/api/account/pfp/upload/', function(req, res, next) {
//   if (accounts[req.body.name].password === req.body.password) { 
//     fs.writeFile(__dirname + '/pfp/'+req.body.name+'.'+req.body.type, req.body.file, err => {
//       if (err) {
//         console.error(err);
//         res.sendStatus(500)
//       } else {
//         // file written successfully
//         res.sendStatus(200)
//       }
//     });
//   }
  
// });

// ТОЛЬКО ДЛЯ ДЖОНА, ОН ИЗБРАННЫЙ
router.get('/api/account/pfp/get/', function(req, res, next) {
  res.sendFile(__dirname + '/pfp/'+userdb.get(req.body.name)+'.'+userdb.get(req.body.name).pfptype)
});


/*
          CHATS
*/

router.get('/api/chats/check/', function(req, res, next) {
  /* Я ожидаю от юзера следующие данные:
    Его логин и пароль и айди чата

    это функция проверки состоит ли юзер в чате
  */
    if(typeof userdb.get(req.body.name)/*accounts[req.body.name]*/ === "undefined") {
      res.sendStatus(401)
    } else {
  if (userdb.get(req.body.name).password === req.body.password) {
    if (typeof chatdb.get(req.body.chatid) != "undefined") {
      if (chatdb.get(req.body.chatid).members.includes(req.body.name)) {
        res.sendStatus(200)
      } else {
        res.sendStatus(204) // 204
      }
    } else {
      res.sendStatus(204)
    }
  } else {
    res.sendStatus(401)
  }
}});

router.post('/api/chats/send/', function(req, res, next) {
  /* Я ожидаю от юзера следующие данные:
    Его логин и пароль и айди чата, сообщение

    это функция для отправки сообщения
  */
    if(typeof userdb.get(req.body.name)/*accounts[req.body.name]*/ === "undefined") {
      res.sendStatus(401)
    } else {
  if (userdb.get(req.body.name).password === req.body.password) {
    if (typeof chatdb.get(req.body.chatid) != "undefined") {
      if (chatdb.get(req.body.chatid).members.includes(req.body.name)) {
        
        let dblivecopy = chatdb.JSON(); 

        dblivecopy[req.body.chatid].messages.push(
        {  "content": req.body.message,
          "id": dblivecopy[req.body.chatid].messages.length + 1,
          "author": req.body.name,
          "timestamp": Date.now()}
        )

        chatdb.JSON(dblivecopy)
        chatdb.sync()

        // НАДО ПОМЕНЯТЬ НА ЧТО-ТО ЧТО МЕНЬШЕ ЖРЕТ СКОРОСТЬ (и ресурс) ДИСКА

        res.sendStatus(201)

      } else {
        res.sendStatus(204) // 204
      }
    } else {
      res.sendStatus(204)
    }
  } else {
    res.sendStatus(401)
  }
}});

router.get('/api/chats/getall/', function(req, res, next) {
  /* Я ожидаю от юзера следующие данные:
    Его логин и пароль и айди чата

    это функция для получения ВСЕХ сообщений в чате
  */
    if(typeof userdb.get(req.body.name)/*accounts[req.body.name]*/ === "undefined") {
      res.sendStatus(401)
    } else {
  if (userdb.get(req.body.name).password === req.body.password) {
    if (typeof chatdb.get(req.body.chatid) != "undefined") {
      if (chatdb.get(req.body.chatid).members.includes(req.body.name)) {
        
       

        res.send(chatdb.get(req.body.chatid))        


      } else {
        res.sendStatus(204)
      }
    } else {
      res.sendStatus(204)
    }
  } else {
    res.sendStatus(401)
  }
}});

module.exports = router;
