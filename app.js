// jshint esversion:6

require('dotenv').config()
const express= require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();


app.use(express.static("public"));
app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/customerDB" ,{useNewUrlParser : true ,useUnifiedTopology: true});

const customerSchema = new mongoose.Schema({
  email : String,
  username : String,
  password : String,
  size : String,
  quantity : Number,
  name : String,
  address : String,
  landmark : String,
  phoneno : String

});

const Customer = mongoose.model("Customer" , customerSchema);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

console.log(stripeSecretKey,stripePublicKey);



app.get("/" ,function(req,res){
  res.render("home");
})

app.get("/login" , function(req,res){
  res.render("login");
})

app.get("/prod" ,function(req,res){
  fs.readFile('items.json',function(error,data){
    if(error){
      res.status(500).end()
    }else{
      res.render("prod.ejs",{items : JSON.parse(data) });
    }
  })
});


app.get("/order" , function(req,res){
  res.render("order");
})

app.post("/" , function(req,res){
  const newCustomer = new Customer({
    email: req.body.email,
    username : req.body.username,
    password : req.body.password
  });
  newCustomer.save(function(err){
    if(err){
      res.render("home");
    }else{
      res.render("prod");
    }
  })
})

app.post("/login" ,function(req,res){
  const email = req.body.email;
  const password = req.body.password;

  Customer.findOne({email : email} , function(err , foundUser){
    if(err){
      console.log(err);
      alert("Wrong username or password");
    }else{
      if(foundUser){
        if(foundUser.password === password){
          res.redirect("/prod");
        }
      }
    }
  });
});

app.post("/prod" ,function(req,res){
  console.log("product");
})

app.post("/order" ,function(req,res){
  const newCustomer = new Customer({
    size : req.body.size,
    quantity : req.body.quantity,
    name : req.body.name,
    address : req.body.address,
    landmark : req.body.landmark,
    phoneno : req.body.phoneno
  })
  newCustomer.save(function(err){
    if(err){
      res.render("home");
    }else{
      res.render("final");
    }
  })
});

app.listen(process.env.PORT || 3000 ,function(req,res){
  console.log("server started at port 3000");
});
