const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const errorHandler = require("errorhandler");
const passport = require("passport");
const md5 = require("md5");
const auth = require("./config/auth");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const router = express.Router();

mongoose.connect('mongodb://yassinereptor:85001997yw@ds251507.mlab.com:51507/muse_db', {useNewUrlParser: true});
mongoose.set('debug', true);

require('./models/admins');
require('./models/users');
require("./models/place");
require("./models/article");
require('./config/passport');

const Admins = mongoose.model('Admins');
const Users = mongoose.model('Users');
const Place = mongoose.model("Place");
const Article = mongoose.model("Article");
let now = new Date();

router.post('/signup', auth.optional, (req, res, next) => {
    const admin = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
    }

    if (!admin.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!admin.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }


    if (!admin.name) {
        return res.status(422).json({
            errors: {
                name: 'is required',
            },
        });
    }

    const finaladmin = new Admins(admin);
    finaladmin.setPassword(admin.password);
    return finaladmin.save()
        .then(()=>{
            return res.json({
            admin: finalUser.toAuthJSON()
        })});
});

router.post('/login', auth.optional, (req, res, next) => {
    const adminObj = {
        email: req.body.email,
        password: req.body.password,
    }

    console.log(adminObj);

    if (!adminObj.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!adminObj.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', {
        session: false
    }, (err, passportadmin, info) => {

        if (err) {
            return res.status(400).json(err);
        }

        if (passportadmin) {

            const admin = passportadmin;
            admin.token = passportadmin.generateJWT();

            return res.json({
                admin: admin.toAuthJSON()
            });
        }

        return res.status(422).json({
            errors: {
                info: 'invalide',
            },
        });
    })(req, res, next);
});

router.get('/current', auth.required, (req, res, next) => {
    const id = req.query.id;

    return Admins.findById(id)
        .then((admin) => {
            if (!admin) {
                return res.sendStatus(400);
            }
            console.log(admin);
            return res.json({
                admin: admin
            });
        });
});



router.post('/info', auth.optional, (req, res, next) => {
    const id = req.body.id;


    return Admins.findById(id)
        .then((admin) => {
            if (!admin) {
                return res.sendStatus(400);
            }
            console.log(admin);
            return res.json({
                admin: admin
            });
        });
});


router.post('/add', auth.optional, (req, res, next)=>{
    const interest = req.body.interest;
    const time = req.body.time;

    const user = new Users();
    user.time = time;
    user.interest = interest;

    user.save((err,data)=>{
        if(err)
            return res.sendStatus(400);
        return res.json({"id": data.id});
     });
    });


router.post("/add-article", auth.optional, (req, res, next) => {
  const base64Image = req.body.image.split(";base64,").pop();
  const filename = "http://142.93.238.151/public/images/" + Date.now() + "-" + "test" + ".jpg";
  const filename2 = "public/images/" + Date.now() + "-" + "test" + ".jpg";
  fs.writeFile(filename2, base64Image, { encoding: "base64" }, err => {
    if (err) res.json({ msg: "Your photo is invalid" });
  });
  const article = new Article({
    name: req.body.name,
    place: req.body.place,
    serie: req.body.serie,
    author: req.body.author,
    audio: req.body.audio,
    image: filename,
    description: req.body.description,
    created_at: now.getDate()
  });
  article.save(function (err) {
    if (err) {
        return res.status(400).json(err);
    }
    return res.json({
      res: "saved"
    });
  });
});
    

router.post("/add-place", auth.optional, (req, res, next) => {
  // convert photo from base64 and save it
  const base64Image = req.body.image.split(";base64,").pop();
  // Create images folder if not exist
  const filename = "/images/" + Date.now() + "-" + "test" + ".jpg";
  var filename2 = "public/images/" + Date.now() + "-" + "test" + ".jpg";
  fs.writeFile(filename2, base64Image, { encoding: "base64" }, err => {
    if (err) res.json({ msg: "Your photo is invalid" });
  });
  var i = 0;
  var filename360 = [];
  var filename2,filename2360;
  var base64Image360;   
  while (req.body.image360[i])
  {
  base64Image360 = req.body.image360[i].split(";base64,").pop();
  // Create images folder if not exist
  filename2 = "/images/" + Date.now() + i + "360" + ".jpg";
  filename360.push(filename2);
  filename2360 = "public/images/" + Date.now() + "-" + "360" + ".jpg";
  fs.writeFile(filename2360, base64Image360, { encoding: "base64" }, err => {
    if (err) res.json({ msg: "Your photo is invalid" });
  });
  i++;
  }
  const place = new Place({
    name: req.body.name,
    address: req.body.address,
    serie: req.body.serie,
    author: req.body.author,
    city: req.body.city,
    lat: req.body.latitude,
    lng: req.body.longitude,
    image: filename,
    image360: JSON.stringify(filename360),
    description: req.body.description,
    created_at: now.getDate()
  });

 
  place.save(function (err) {
    if (err) {
        return res.status(400).json(err);
    }
    return res.json({
      res: "saved"
    });
  });
});

router.get("/places", auth.optional, (req, res, next) => {
  Place.find({}, function (err, places) {
    if (err) {
      return res.status(400).json(err);
    } 
    return res.send(places);
  });
});


router.get("/place/:serieID", auth.optional, (req, res, next) => {
  const serie_id = req.params.serieID;
  Place.find({ serie: serie_id }, function (err, places) {
    if (err) {
      return res.status(400).json(err);
  }
    return res.send(places);
  });
});


router.get("/place-get/", auth.optional, (req, res, next) => {
  const serie_id = req.query.serieID;
  Place.find({ serie: serie_id }).exec((err, place)=>{
    if(err || place.length == 0)
      return res.sendStatus(400);
    return res.json(place);
  });
});


router.get("/articles", auth.optional, (req, res, next) => {
  Article.find({}, function (err, places) {
    if (err) {
      return res.status(400).json(err);
  }
    return res.send(places);
  });
});

router.get("/article/:serieID", auth.optional, (req, res, next) => {
  const serie_id = req.params.serieID;
  Article.find({ serie: serie_id }, function (err, places) {
    res.send(places);
  });
});

router.post("/article-list/", auth.optional, (req, res, next) => {
  const serie_id = req.body.serieID;
  Article.find({ serie: {$in: serie_id} }, function (err, places) {
    if(err)
      return res.sendStatus(400);
      console.log(places);
    return res.json(places);
  });
});

router.post("/place-list/", auth.optional, (req, res, next) => {
    const serie_id = req.body.serieID;
    Place.find({ serie: {$in: serie_id} }, function (err, places) {
      if(err)
        return res.sendStatus(400);
        console.log(places);
      return res.json(places);
    });
  });
  

module.exports = router;
