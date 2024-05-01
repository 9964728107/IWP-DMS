const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");
//authentification
const passport = require('passport');
const LocalStratergy = require('passport-local');
const User = require('./models/user.js');
if(process.env.NODE_ENV != "production"){
require('dotenv').config()
}

const ExpressError = require("./utils/ExpressError.js");

const session = require('express-session');
var flash = require('connect-flash');

const listingRouter= require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require('./routes/user.js')

app.use((req,res,next)=>{
    req.time= new Date(Date.now()).toString();
 console.log(req.path,req.time,req.method);
 next();
});



main().then(()=>{console.log("connected to DB")}).catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));//no extra space ever
app.engine("ejs", ejsMate);


async function main() {
    await mongoose.connect(process.env.MONGO_URL);

}
// app.get("/testListing",async (req,res)=>{
//     let samplelisting = new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     });

//    await samplelisting.save();
//    console.log("sample was saved");
//    res.send("saving process was succesful");
// });


const checkToken = (req, res, next) => {
    let { token } = req.query;
    if (token == "giveaccess") {
        next();
    }
    throw new ExpressError(401,"ACSESS DENIED!");

   };

app.get("/api", checkToken, (req, res) => {
    res.send("data");

});

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,

    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,    
        httpOnly:true,
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));   
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error  = req.flash("error");
    res.locals.curUser = req.user;
    next();
});

// app.get("/demouser", async(req,res)=>{
//      let fakeUser = new User({
//         email:"delta-student@gmail.com",
//         username: "delta user",
//      });

//     await User.register(fakeUser,"helloworld");
// })
//Listing

app.use("/", userRouter);
app.use("/listing",listingRouter);
app.use("/listing/:id/reviews",reviewRouter);





// app.get("/",(req,res)=>{
//     res.send("hi i am groot");
// });

    app.all("*", (req, res, next) => {
        next(new ExpressError(404, "page not found"));
    });

    //usecase practice
    app.use((err, req, res, next) => {
        let { status=500, message="something went wrong" } = err;
        // res.status(status).send(message);
        res.status(status).render("listings/error.ejs",{message});
    });

    app.listen(8081,()=>{
        console.log("listening at 8081");
    });




