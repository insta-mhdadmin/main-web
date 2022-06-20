const express = require('express')
const app = express()
const ejs = require("ejs");
const path = require("path");
const mongoose = require('mongoose')
const axios = require("axios").default
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const cookieParser = require("cookie-parser");
const admindb= require('./schmes/admin')
const md5 = require("md5");
const password = require('./schmes/password');
const urls = require('./schmes/urls');
app.use(cookieParser());
require('dotenv').config()
mongoose.connect(process.env.dburl)
app.listen(8000)
app.engine("ejs", ejs.renderFile);
app.set("view engine", "ejs");
const renderTemplate = (res, req, template, data = {}) => {
    const dataDir = path.resolve(`${process.cwd()}${path.sep}html`); 
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);
    const baseData = {
    req : req
    };
    res.render(
      path.resolve(`${templateDir}${path.sep}${template}`),
      Object.assign(baseData, data),
    );
  };
app.use(
    session({
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret:"#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
      resave: false,
      saveUninitialized: false,
    }),
  );
  //pages 
  app.get('/:id',async function (req,res) {
    if(req.params.id.includes('apilistcm')){
        api(req,res)
        return;
    }
    if(req.params.id.includes('add')){
        add(req,res)
        return;
    }
    if(req.params.id.includes('remove')){
        remove(req,res)
        return;
    }
    if(req.params.id.includes('auth')){
        auth(req,res)
        return;
    }
    if(req.params.id.includes('login')){
        login(req,res)
        return;
    }
    if(req.params.id.includes('dash')){
        dash(req,res)
        return;
    }
    if(req.params.id.includes('list')){
        list(req,res)
        return;
    }
    let u = await urls.findOne({id : req.params.id})
    if(u){
        res.redirect(u.redirect)
        return;
    }else {
        return  renderTemplate(res, req, "404.ejs");
    }
  })
  // funcations
  async  function api (req,res) {
    let ur = []
    urls.find({}, function (err, users) { 
        users.forEach( async u => {
             ur.push(u)
        })
        res.send(ur)
    })
  }
  async function auth( req,res) {
    let a = await password.findOne({pass : md5(req.query.pass)})
    if(!a) res.redirect('/login')
else {
    await admindb({sid : req.cookies["connect.sid"]}).save()
    res.redirect('/dash')
}
  }

  async function login (req,res){
    let a = await admindb.findOne({sid : req.cookies["connect.sid"]})
    if(a)res.redirect("/dash")
    else {
        return  renderTemplate(res, req, "login.ejs");
    }
  }

  async  function dash (req,res) {
    let a = await admindb.findOne({sid : req.cookies["connect.sid"]})
    if(!a)res.redirect("/login")
    else {
        return  renderTemplate(res, req, "administrator.ejs");
    }
  }
  async function list (req,res) {
   let apia = await axios.get('http://192.168.1.105:8000/apilistcm').catch()
   return  renderTemplate(res, req, "list.ejs", { db : apia});
  }
  async function add (req,res) {
    if(!req.query.url)return res.redirect('/dash')
    let ID = await makeid(12)
    let db = await urls.findOne({id : ID})
    if(db) ID = await makeid(12)
   await urls
    (
        {
            id : ID,
            redirect : req.query.url
        }
    ).save()
    res.redirect('/dash')
   }
   async function remove (req,res) {
    if(!req.query.id)return res.redirect('/dash')
    let db = await urls.findOne({id : req.query.id})
    if(!db)return res.redirect('/login') && console.log("not Found")
    else {
       await urls.deleteOne({_id : db._id})
        return res.redirect('/dash')
    }
   }
     function makeid(length) {
        var result = "";
        var characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      }