var express = require('express');
const { token } = require('morgan');
var router = express.Router();
const fs = require('node:fs');

var ver = "0.1.0"

var debug = true

if (debug) {
  console.log("DEBUG MODE")
}

// STORAGE INIT

const JSONdb = require('simple-json-db');
const userdb = new JSONdb(__dirname + '/db/users.json');
const chatdb = new JSONdb(__dirname + '/db/chats.json');
const umapdb = new JSONdb(__dirname + '/db/usermapdb.json');


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
    res.send(userdb.get(req.body.name).token)
  } else  {
    console.warn("Failed login attempt for " + req.body.name)
    res.sendStatus(401)
  }} // 200 if correct, 401 if wrong
});

router.post('/api/account/register/', function(req, res, next) {
  let tokenmem = gentoken()
  if (typeof userdb.get(tokenmem) === "undefined") {
    userdb.set(tokenmem,
      {
        displayname: req.body.name,
      password: req.body.password,
      avatar: false,
      bio: "",
      pfptype: "none",
      admin: false,
      username: req.body.name
      }

    )
    umapdb.set(req.body.name, token)
    res.sendStatus(201)
  } else {
    res.send("ultra rare error, try again")
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
   /// УСТАРЕЛО /// Его логин и пароль и айди чата
   
   теперь я жду его токен и айди чата

    это функция проверки состоит ли юзер в чате
  */

        // TODO: сделать функцию которую может вызвать любой мембер чата для проверки какие юзеры есть в чате

    if(typeof userdb.get(req.body.token)/*accounts[req.body.name]*/ === "undefined") {
      res.sendStatus(401)
    } else {
//  if (userdb.get(req.body.token) === req.body.token) {
    if (typeof chatdb.get(req.body.chatid) != "undefined") {
      if (chatdb.get(req.body.chatid).members.includes(/*req.body.name*/userdb.get(req.body.token).username)) {
        res.sendStatus(200)
      } else {
        res.sendStatus(204) // 204
      }
    } else {
      res.sendStatus(204)
    }
//  } else {
    res.sendStatus(401)
  }
}/*}*/);

router.post('/api/chats/send/', function(req, res, next) {
  /* Я ожидаю от юзера следующие данные:
    Его ~~логин и пароль~~ ТОКЕН и айди чата, сообщение

    это функция для отправки сообщения
  */
    if(typeof userdb.get(req.body.token)/*accounts[req.body.name]*/ === "undefined") {
      res.sendStatus(401)
    } else {
  if (userdb.has(req.body.token)) {
    if (typeof chatdb.get(req.body.chatid) != "undefined") {
      if (chatdb.get(req.body.chatid).members.includes(userdb.get(req.body.token).username)) {
        
        let dblivecopy = chatdb.JSON(); 

        dblivecopy[req.body.chatid].messages.push(
        {  "content": req.body.message,
          "id": dblivecopy[req.body.chatid].messages.length + 1,
          "author": userdb.get(req.body.token).username,
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
    Его ~~логин, пароль~~ токен и айди чата

    это функция для получения ВСЕХ сообщений в чате
  */
    if(/*typeof */userdb.has(req.body.token)/*accounts[req.body.name] === "undefined"*/) {
      res.sendStatus(401)
    } else {
  // if (userdb.get(req.body.name).password === req.body.password) {
    if (typeof chatdb.get(req.body.chatid) != "undefined") {
      if (chatdb.get(req.body.chatid).members.includes(userdb.get(req.body.token).name)) {
        
       

        res.send(chatdb.get(req.body.chatid))        


      } else {
        res.sendStatus(204)
      }
    } else {
      res.sendStatus(204)
    }
  /*} else {
    res.sendStatus(401)
  }*/
}});


// FUNCTIONS

router.get('/test/tokengen/', function(req, res, next) {
  if (debug) {
  res.send(gentoken());
  } else {
    res.sendStatus(404)
  }
});

function gentoken() {
  let result = '';
  let length = 64
  const characters = 'qQwWeErRtTyYuUiIoOpPaAsSdDfFgGhHjJkKlLzZxXcCvVbBnNmM1234567890!#$%^}{[];'
  

  for (let i = 0; i < length; i++) {
      const randomInd = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomInd);
  }

return result
}

function finduname(username) {
  if(umapdb.has(username)) {
    return umapdb.get(username)
  } else {
    return null
  }
}

module.exports = router;
