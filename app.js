// jshint esversion:6

require('dotenv').config()
const express= require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const fs = require("fs");

const app = express();


app.use(express.static("public"));
app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret : "little secret",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/userDB" ,{useNewUrlParser : true ,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
  username: String,
  password : String,
  size : String,
  quantity : Number,
  name : String,
  address : String,
  landmark : String,
  phoneno : String,

});

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User" , userSchema);


passport.use(User.createStrategy());

// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// console.log(stripeSecretKey,stripePublicKey);



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

app.get("/order",function(req,res){
  res.render("order");
})


app.post("/" , function(req,res){
    User.register({username: req.body.username} ,req.body.password ,function(err,user){
      if(err){
        console.log(err);
        res.redirect("/");
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/prod");
        });
      }
    });
});


app.post("/login" ,function(req,res){
  const user = new User({
    username : req.body.username,
    password : req.body.password
  });
  req.login(user , function(err){
    if(err){
      console.log(err);
      alert("wrong password");
    }else {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/prod");
        })
      }
  })
});

// const email = req.body.email;
// const password = req.body.password;
//
// Customer.findOne({email : email} , function(err , foundUser){
//   if(err){
//     console.log(err);
//     alert("Wrong username or password");
//   }else{
//     if(foundUser){
//       if(foundUser.password === password){
//         res.redirect("/prod");
//       }
//     }
//   }
// });

app.post("/prod" ,function(req,res){
  console.log(req.body.value);
  const tsize = req.body.size;
  const tquantity = req.body.quantity;
  const tname =req.body.name;
  const taddress = req.body.address;
  const tlandmark = req.body.landmark;
  const tphoneno =req.body.phoneno;
  console.log(req.user);

  User.findById(req.user._id ,function(err ,foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        foundUser.size = tsize ;
        foundUser.quantity = tquantity;
        foundUser.name = tname;
        foundUser.address = taddress;
        foundUser.landmark = tlandmark;
        foundUser.phoneno = tphoneno;
        foundUser.save(function(){
            res.redirect("/order");
        });
      }
    }
  });
});
// const newUser = new User({
//   id : req.body.value,
//   size : req.body.size,
//   quantity : req.body.quantity,
//   name : req.body.name,
//   address : req.body.address,
//   landmark : req.body.landmark,
//   phoneno : req.body.phoneno
// })
// newUser.save(function(err){
//   if(err){
//     res.render("home");
//   }else{
//     res.render("final");
//   }
// })

app.listen(process.env.PORT || 3000 ,function(req,res){
  console.log("server started at port 3000");
});
