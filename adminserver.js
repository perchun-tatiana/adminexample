const express = require("express");
const cors = require("cors");
require("dotenv").config();
var fs = require("fs");
var mongoose = require("mongoose");
var asyncLoop = require("node-async-loop");

var dburl = process.env.dburl;
var UserSchema = require("./scheme/userSchema");
var PostSchema = require("./scheme/postSchema");
var FileSchema = require("./scheme/fileSchema");
var PassSchema = require("./scheme/passSchema");
var TokenSchema = require("./scheme/tokenSchema");
var MessageSchema = require("./scheme/messageSchema");

const app = express();

app.use(express.json());

app.use(cors());

function makeid(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

app.use("/login", (req, res) => {
  var db = mongoose.createConnection(dburl);
  var modelThings = db.model("Pass", PassSchema);
  var modelThingstoken = db.model("Token", TokenSchema);
  var modelThingsmes = db.model("Message", MessageSchema);

  modelThings.findOne({ chatid: req.body.username }, function (err, pass) {
    if (pass && req.body.password == pass.text) {
      var token = makeid(10);
      var newtoken = new modelThingstoken({
        chatid: req.body.username,
        text: token,
      });
      newtoken.save(function (err) {
        if (err) {
          res.send({
            token: false,
          });
          db.close();
        } else {
          var newmess = new modelThingsmes({
            chatid: req.body.username,
            text: "Кто-то залогинился в админку под вашим login(если это вы, ничего делать не надо, если нет, срочно свяжитесь с @PerchunTatiana)",
            date: new Date(),
            adminanswer: 459549142,
            needsend: true,
          });
          newmess.save(function (err) {
            res.send({
              token: token,
            });
            db.close();
          });
        }
      });
      //     }
      // })
    } else {
      res.send({
        token: false,
      });
      db.close();
    }
  });
});

app.use("/logout", (req, res) => {
  var db = mongoose.createConnection(dburl);
  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.deleteMany(
    { text: req.body.token },
    function (err, tokenrec) {
      res.send({
        success: true,
      });
      db.close();
    }
  );
});

function formatDateForSheet(data) {
  var str = "";
  if (data) {
    str +=
      data.getFullYear() +
      "-" +
      (data.getMonth() + 1) +
      "-" +
      data.getDate() +
      " " +
      data.getHours() +
      ":" +
      data.getMinutes();
  }
  return str;
}

app.use("/userslist", (req, res) => {

  var db = mongoose.createConnection(dburl);
  var modelThings = db.model("User", UserSchema);
  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var cond = {};
      var usersfile = fs.readFileSync("./tbusers.json");
      var usersarray = JSON.parse(usersfile).usersarray;
      var sessionfile = fs.readFileSync("./session.json");
      var sessionarray = JSON.parse(sessionfile);
      var userslist = [];
      var step7 = 0;
      var usersf = fs.readFileSync("./groups.json");
      var usersarr = JSON.parse(usersf).users;
      function onestep7(step7) {
        modelThings.find(
          cond,
          null,
          { limit: 500, skip: step7 * 500 },
          function (err, users) {
            if (users && users.length) {
              var userslist2 = users.map(function (item) {
                var subscr = usersarr.indexOf(item.email) != -1 ? "да" : "нет";

                return {
                  chatid: item.chatid,
                  startdate: formatDateForSheet(item.startdate),
                  email: item.email,
                  status: item.status,
                  // telegramname: item.telegramname,
                  subscr: subscr,
                };
              });
              userslist = userslist.concat(userslist2);

              step7++;
              onestep7(step7);
            } else {
              for (let u = 0; u < usersarray.length; u++) {
                var newuser = userslist.filter(function (item) {
                  return item.chatid == usersarray[u];
                });
                if (!newuser || !newuser[0]) {
                  var email = "";
                  if (
                    sessionarray[usersarray[u]] &&
                    sessionarray[usersarray[u]].userdata &&
                    sessionarray[usersarray[u]].userdata.email
                  ) {
                    email = sessionarray[usersarray[u]].userdata.email;
                  } else if (
                    sessionarray[usersarray[u]] &&
                    sessionarray[usersarray[u]].userdata &&
                    sessionarray[usersarray[u]].userdata.checkemail
                  ) {
                    email = sessionarray[usersarray[u]].userdata.checkemail;
                  }
                  var telegramname =
                    sessionarray[usersarray[u]] &&
                    sessionarray[usersarray[u]].userdata &&
                    sessionarray[usersarray[u]].userdata.telegramname
                      ? sessionarray[usersarray[u]].userdata.telegramname
                      : "";
                  userslist.push({
                    chatid: usersarray[u],
                    email: email,
                    telegramname: telegramname,
                  });
                }
              }
              res.send({
                userslist: userslist,
              });
              db.close();
            }
          }
        );
      }
      onestep7(step7);
    } else {
      db.close();
      res.send({
        redirect: "login",
      });
    }
  });
});

app.use("/messagelist", (req, res) => {
  var db = mongoose.createConnection(dburl);
  var modelThings = db.model("User", UserSchema);
  var mesmodelThings = db.model("Messages", MessageSchema);
  var modelThingstoken = db.model("Token", TokenSchema);
  var usersf = fs.readFileSync("./groups.json");
  var usersarr = JSON.parse(usersf).users;
  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var messagelist = [];
      var countlist = {};
      var step7 = 0;
      var cond = {
        unread: true,
      };
      function onestep7(step7) {
        mesmodelThings.find(
          cond,
          null,
          { limit: 500, skip: step7 * 500 },
          function (err, messages) {
            if (messages && messages.length) {
              for (let m = 0; m < messages.length; m++) {
                var exists = messagelist.filter(function (item) {
                  return item.chatid == messages[m].chatid;
                });
                if (!exists.length) {
                  countlist[messages[m].chatid] = 1;
                  messagelist.push(messages[m]);
                } else {
                  countlist[messages[m].chatid]++;
                  if (exists[0].date < messages[m].date) {
                    const newList = messagelist.map((o) => {
                      if (o.chatid === messages[m].chatid) {
                        return messages[m];
                      }
                      return o;
                    });
                    messagelist = newList;
                  }
                }
              }
              step7++;
              onestep7(step7);
            } else {
              if (messagelist.length) {
                var newlist = [];
                var sessionfile = fs.readFileSync("./session.json");
                var sessionarray = JSON.parse(sessionfile);
                asyncLoop(
                  messagelist,
                  function (mess, next) {
                    modelThings.findOne(
                      { chatid: mess.chatid },
                      function (err, user) {
                        var text =
                          formatDateForSheet(mess.date) + "\n\n" + mess.text;

                        if (countlist[mess.chatid] > 1) {
                          text =
                            formatDateForSheet(mess.date) +
                            " (" +
                            countlist[mess.chatid] +
                            ")" +
                            "\n\n" +
                            mess.text;
                        }

                        if (user) {
                          var subscr =
                            usersarr.indexOf(user.email) != -1
                              ? "активная подписка "
                              : "не активная подписка ";
                          subscr = user.status ? user.status : subscr;
                          newlist.push({
                            email: user.email,
                            // status: user.status,
                            date: mess.date,
                            chatid: mess.chatid,
                            text: text,
                            number: countlist[mess.chatid],
                            subscr: subscr,
                          });
                        } else {
                          var email = "";
                          if (
                            sessionarray[mess.chatid] &&
                            sessionarray[mess.chatid].userdata &&
                            sessionarray[mess.chatid].userdata.email
                          ) {
                            email = sessionarray[mess.chatid].userdata.email;
                          } else if (
                            sessionarray[mess.chatid] &&
                            sessionarray[mess.chatid].userdata &&
                            sessionarray[mess.chatid].userdata.checkemail
                          ) {
                            email =
                              sessionarray[mess.chatid].userdata.checkemail;
                          }
                          newlist.push({
                            email: email,
                            // status: user.status,
                            date: mess.date,
                            chatid: mess.chatid,
                            text: text,
                            number: countlist[mess.chatid],
                            subscr: "не зарегистрирован",
                          });
                        }

                        next();
                      }
                    );
                  },
                  function (err) {
                    newlist.sort(function (a, b) {
                      return a.date - b.date;
                    });
                    res.send({
                      messagelist: newlist,
                    });
                    db.close();
                  }
                );
              } else {
                res.send({
                  messagelist: messagelist,
                });
                db.close();
              }
            }
          }
        );
      }
      onestep7(step7);
    } else {
      db.close();
      res.send({
        redirect: "login",
      });
    }
  });
});

app.use("/postlist", (req, res) => {

  var db = mongoose.createConnection(dburl);
  var modelThings = db.model("Post", PostSchema);
  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var postslist = [];
      var step7 = 0;
      function onestep7(step7) {
        modelThings.find(
          {},
          null,
          { limit: 500, skip: step7 * 500 },
          function (err, posts) {
            if (posts && posts.length) {
              var postslist2 = posts.map(function (item) {
                var state = "";
                var type = "";
                switch (item.type) {
                  case "paid":
                    type = "Прошедшие регистрацию";
                    break;
                  case "havesubscr":
                    type = "С активной подпиской";

                    break;

                  case "nosubscr":
                    type = "С закончившейся подпиской";

                    break;
                  case "group":
                    type = "Пользователи в группе";

                    break;

                  default:
                    break;
                }
                switch (item.state) {
                  case "new":
                    state = "Новый";
                    break;
                  case "delete":
                    state = "Удален у пользователей";

                    break;

                  case "needsend":
                    state = "В очереди отправки";

                    break;
                  case "send":
                    state = "Разослан";

                    break;

                  case "inqueue":
                    state = "В очереди отправки";

                    break;

                  default:
                    break;
                }
                return {
                  date: formatDateForSheet(item.date),
                  datetosend: formatDateForSheet(item.datetosend),
                  text: item.text,
                  state: state,
                  type: type,
                  groupid: item.groupid,
                  objid: item._id,
                  removeforusers: item._id,
                  usercount: item.usercount,

                  // objid: item._id,
                };
              });
              postslist = postslist.concat(postslist2);

              step7++;
              onestep7(step7);
            } else {
              res.send({
                postlist: postslist,
              });
              db.close();
            }
          }
        );
      }
      onestep7(step7);
    } else {
      db.close();
      res.send({
        redirect: "login",
      });
    }
  });
});

app.use("/messages", (req, res) => {

  var db = mongoose.createConnection(dburl);
  var modelThings = db.model("Message", MessageSchema);
  var modelThingstoken = db.model("Token", TokenSchema);
  var modelThingsuser = db.model("User", UserSchema);
  var fileModel = db.model("File", FileSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      modelThings.find({ chatid: req.body.chatid }, function (err, message) {
        modelThingsuser.findOne(
          { chatid: req.body.chatid },
          function (err, user) {
            var mes = [];

            for (let i = 0; i < message.length; i++) {
              var text = message[i].needsend
                ? message[i].text + "\nОтправляется"
                : message[i].text;
              if (message[i].adminanswer && message[i].adminanswer != "yes")
                text += "\nAdmin: " + message[i].adminanswer;
              if (message[i].deleted)
                text += "\nУДАЛЕНО У ПОЛЬЗОВАТЕЛЯ " + message[i].deleted;
              var file = "",
                type = "",
                fileend = "",
                image = "";
              if (message[i].photo) {
                file = message[i].photo;
                type = "photo";
                fileend = ".png";
                image = file + fileend;
              } else if (message[i].video) {
                file = message[i].video;
                type = "video";
                fileend = ".mp4";
              } else if (message[i].video_note) {
                file = message[i].video_note;
                type = "video";
                fileend = ".mp4";
              } else if (message[i].audio) {
                file = message[i].audio;
                type = "audio";
                fileend = ".m4a";
              } else if (message[i].voice) {
                file = message[i].voice;
                type = "audio";
                fileend = ".m4a";
              } else {
                type = "text";
              }
              mes.push({
                direction: message[i].adminanswer ? "outgoing" : "incoming",
                text: text,
                date: formatDateForSheet(message[i].date),
                sortdate: message[i].date,
                people: message[i].adminanswer || message[i].fromuser,
                file: file,
                filename: file + fileend,
                type: type,
              });
            }

            if (user) {
              if (user.answers) {
                for (let i = 0; i < user.answers.length; i++) {
                  var fileend = ".mp4";
                  if (i == 0) {
                    fileend = ".m4a";
                  }
                  var type = "text";
                  if (user.answers[i] != "Пропущено") {
                    if (i == 0) {
                      type = "audio";
                    } else {
                      type = "video";
                    }
                  }
                  mes.push({
                    direction: "incoming",
                    text: user.answers[i],
                    date: formatDateForSheet(user.answersdate[i]),
                    sortdate: user.answersdate[i],
                    file: user.answers[i] == "Пропущено" ? "" : user.answers[i],
                    filename:
                      user.answers[i] == "Пропущено"
                        ? ""
                        : user.answers[i] + fileend,
                    type: type,
                  });
                }
              }
              if (user.controls) {
                for (let i = 0; i < user.controls.length; i++) {
                  var fileend = ".mp4";
                  var type = "text";

                  if (user.controls[i] != "Пропущено") {
                    type = "video";
                  }

                  mes.push({
                    direction: "incoming",
                    text: text,
                    date: formatDateForSheet(user.controlsdate[i]),
                    sortdate: user.controlsdate[i],
                    file:
                      user.controls[i] == "Пропущено" ? "" : user.controls[i],
                    filename:
                      user.controls[i] == "Пропущено"
                        ? ""
                        : user.controls[i] + fileend,
                    type: type,
                  });
                }
              }

              if (user.extratasks) {
                for (let i = 0; i < user.extratasks.length; i++) {
                  if (user.extratasks[i]) {
                    mes.push({
                      direction: "incoming",
                      text: user.extratasks[i],
                      date: formatDateForSheet(user.extratasksdate[i]),
                      sortdate: user.extratasksdate[i],
                      file: "",
                      filename: "",
                      type: "text",
                    });
                  }
                }
              }
              if (user.npsdate) {
                for (let i = 0; i < user.npsdate.length; i++) {
                  if (user.npsdate[i]) {
                    mes.push({
                      direction: "incoming",
                      text: user.nps[i],
                      date: formatDateForSheet(user.npsdate[i]),
                      sortdate: user.npsdate[i],
                      file: "",
                      filename: "",
                      type: "text",
                    });
                  }
                }
              }
            }
            mes.sort(function (a, b) {
              return a.sortdate - b.sortdate;
            });
            var userobj = {
              chatid: req.body.chatid,
            };
            if (user) userobj = user;

            var files = mes.filter(function (item) {
              return item.file && item.file !== "";
            });
            function bigfileFn(filename, fileModel, next) {
              fileModel.findOne(
                { filename: filename },
                function (err, savedfile) {
                  if (savedfile) {
                    var mind = mes.findIndex(function (item) {
                      return item.file == filename;
                    });

                    mes[mind].text =
                      "https://t.me/" +
                      process.env.botname +
                      "?start=bigfile" +
                      savedfile.fileindex; //+ '\n' + mes[mind].type

                    mes[mind].file = "";
                    mes[mind].filename = "";
                    mes[mind].type = "text";
                    next();
                  } else {
                    var fileinc = fs.readFileSync("./fileinc.json");
                    var fileincrement = JSON.parse(fileinc).fileinc;

                    fileincrement++;
                    fs.writeFileSync(
                      "./fileinc.json",
                      JSON.stringify({ fileinc: fileincrement })
                    );

                    var newfile = new fileModel({
                      filename: filename,
                      fileindex: fileincrement,
                    });
                    newfile.save(function (err, saveddata) {
                      var mind = mes.findIndex(function (item) {
                        return item.file == filename;
                      });

                      mes[mind].text =
                        "https://t.me/" +
                        process.env.botname +
                        "?start=bigfile" +
                        saveddata.fileindex; //+ '\n' + mes[mind].type

                      mes[mind].file = "";
                      mes[mind].filename = "";
                      mes[mind].type = "text";
                      next();
                    });
                  }
                }
              );
            }
            var dirfiles = fs.readdirSync("./admin/videos");

            if (files && files.length) {
              asyncLoop(
                files,
                function (file, next) {

                  if (dirfiles.indexOf(file.filename) == -1) {
                    let url = `https://api.telegram.org/bot${process.env.token}/getFile?file_id=${file.file}`;
                    bigfileFn(file.file, fileModel, next);
                    // https.get(url, (resp) => {
                    //     let data = '';

                    //     // A chunk of data has been recieved.
                    //     resp.on('data', (chunk) => {
                    //         data += chunk;
                    //     });

                    //     // The whole response has been received. Print out the result.
                    //     resp.on('end', () => {
                    //         var newData = JSON.parse(data);
                    //         if (newData.ok) {
                    //             var options = {
                    //                 directory: "./admin/videos",
                    //                 filename: file.filename
                    //             }

                    //             download('https://api.telegram.org/file/bot' + process.env.token + '/' + newData.result.file_path, options, function (err) {
                    //                 if (err) {
                    //                     bigfileFn(file.file, fileModel, next)

                    //                 } else {
                    //                     next()

                    //                 }

                    //             })
                    //         } else {
                    //             bigfileFn(file.file, fileModel, next)
                    //         }

                    //     });

                    // }).on("error", (err) => {
                    //     bigfileFn(file.file, fileModel, next)

                    // });
                  } else {
                    next();
                  }
                },
                function (err) {
                  res.send({
                    user: userobj,
                    messages: mes,
                  });
                  db.close();
                }
              );
            } else {
              res.send({
                user: userobj,
                messages: mes,
              });
              db.close();
            }
          }
        );
      });
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/sendmessage", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var modelThings = db.model("Message", MessageSchema);

      var newmess = new modelThings({
        chatid: req.body.chatid,
        text: req.body.message,
        date: new Date(),
        adminanswer: admin.chatid,
        needsend: true,
      });
      newmess.save(function (err) {
        if (err) {
          console.log(err);
          res.send({
            result: "error",
          });
        } else {
          res.send({
            result: "success",
          });
        }
        db.close();
      });
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/markasread", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var modelThings = db.model("Message", MessageSchema);

      modelThings.find(
        {
          chatid: req.body.chatid,
          unread: true,
        },
        function (err, messages) {
          if (messages.length) {
            asyncLoop(
              messages,
              function (mess, nextmes) {
                mess.set("unread", false);
                mess.save(function (err, saved) {
                  nextmes();
                });
              },
              function (err) {
                if (err) {
                  console.log(err);
                  res.send({
                    result: "error",
                  });
                } else {
                  res.send({
                    result: "success",
                  });
                }
                db.close();
              }
            );
          } else {
            if (err) {
              console.log(err);
              res.send({
                result: "error",
              });
            } else {
              res.send({
                result: "success",
              });
            }
            db.close();
          }
        }
      );
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/changeemail", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var modelThings = db.model("Message", MessageSchema);
      var usermodelThings = db.model("User", UserSchema);
      usermodelThings.findOne(
        {
          email: req.body.email.toLowerCase(),
        },
        function (err, user) {
          if (!user) {
            var newuser = new usermodelThings({
              chatid: req.body.chatid,
              email: req.body.email.toLowerCase(),
              startdate: new Date(),
            });
            newuser.save(function (err, savedata) {
              console.log("err", err);
              var sessionfile = fs.readFileSync("session.json");
              session = JSON.parse(sessionfile);

              session[req.body.chatid].userdata = {};
              fs.writeFileSync("./session.json", JSON.stringify(session));
              var newmess = new modelThings({
                chatid: req.body.chatid,
                text: "Теперь вам доступны тренировки по команду /menu",
                date: new Date(),
                adminanswer: admin.chatid,
                needsend: true,
              });
              newmess.save(function (err) {
                if (err) {
                  console.log(err);
                  res.send({
                    result: "error",
                  });
                } else {
                  res.send({
                    result: "success",
                  });
                }
                db.close();
              });
            });
          } else {
            res.send({
              result: "error",
            });
            db.close();
          }
        }
      );
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/removefromdatabase", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var postmodelThings = db.model("Post", PostSchema);
      postmodelThings.findOneAndDelete(
        {
          _id: mongoose.Types.ObjectId(req.body.objid),
        },
        function (err, post) {
          if (err) {
            console.log(err);
            res.send({
              result: "error",
            });
          } else {
            res.send({
              result: "success",
            });
          }
          db.close();
        }
      );
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/removeforusers", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var postmodelThings = db.model("Post", PostSchema);
      postmodelThings.findOne(
        {
          _id: mongoose.Types.ObjectId(req.body.objid),
        },
        function (err, post) {
          if (err) {
            console.log(err);
            res.send({
              result: "error",
            });
            db.close();
          } else {
            if (post) {
              post.set("state", "needdelete");
              post.save(function (err) {
                if (err) {
                  console.log(err);
                  res.send({
                    result: "error",
                  });
                  db.close();
                } else {
                  res.send({
                    result: "success",
                  });
                  db.close();
                }
              });
            } else {
              res.send({
                result: "error",
              });
              db.close();
            }
          }
        }
      );
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/sendnow", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var postmodelThings = db.model("Post", PostSchema);
      postmodelThings.findOne(
        {
          _id: mongoose.Types.ObjectId(req.body.objid),
        },
        function (err, post) {
          if (err) {
            console.log(err);
            res.send({
              result: "error",
            });
            db.close();
          } else {
            if (post) {
              post.set("state", "needsend");
              post.set("datetosend", new Date());
              post.save(function (err) {
                if (err) {
                  console.log(err);
                  res.send({
                    result: "error",
                  });
                  db.close();
                } else {
                  res.send({
                    result: "success",
                  });
                  db.close();
                }
              });
            } else {
              res.send({
                result: "error",
              });
              db.close();
            }
          }
        }
      );
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/sendindate", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var postmodelThings = db.model("Post", PostSchema);
      postmodelThings.findOne(
        {
          _id: mongoose.Types.ObjectId(req.body.objid),
        },
        function (err, post) {
          if (err) {
            console.log(err);
            res.send({
              result: "error",
            });
            db.close();
          } else {
            if (post) {
              post.set("state", "needsend");
              var datetemp = req.body.datetosend;
              var date1 = datetemp.split(" ")[0].split("-");
              var time1 = datetemp.split(" ")[1].split(":");
              post.set(
                "datetosend",
                new Date(date1[2], date1[1] - 1, date1[0], time1[0], time1[1])
              );
              post.save(function (err) {
                if (err) {
                  console.log(err);
                  res.send({
                    result: "error",
                  });
                  db.close();
                } else {
                  res.send({
                    result: "success",
                  });
                  db.close();
                }
              });
            } else {
              res.send({
                result: "error",
              });
              db.close();
            }
          }
        }
      );
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.use("/savepost", (req, res) => {
  var db = mongoose.createConnection(dburl);

  var modelThingstoken = db.model("Token", TokenSchema);

  modelThingstoken.findOne({ text: req.body.token }, function (err, admin) {
    if (admin) {
      var postThings = db.model("Post", PostSchema);
      var type = "";
      switch (req.body.type) {
        case "Прошедшие регистрацию":
          type = "paid";
          break;
        case "С активной подпиской":
          type = "havesubscr";

          break;

        case "С закончившейся подпиской":
          type = "nosubscr";

          break;
        case "Пользователи в группе":
          type = "group";

          break;

        default:
          break;
      }
      var newpost = new postThings({
        text: req.body.text,
        type: type,
        date: new Date(),
        state: "new",
        groupid: req.body.groupid,
      });
      newpost.save(function (err, result) {
        res.send({
          result: "success",
        });

        db.close();
      });
    } else {
      res.send({
        redirect: "login",
      });
      db.close();
    }
  });
});

app.listen(process.env.adminport, () =>
  console.log(
    "API is running on http://localhost:" + process.env.adminport + "/login"
  )
);
