require("dotenv").config({ path: "variables.env" });
const express = require("express");
const path = require("path");
const cors = require("cors");
const moment = require("moment");
const fetch = require("node-fetch");
const schedule = require("node-schedule");
const cookieParser = require("cookie-parser");
const KosherZmanim = require("kosher-zmanim");
const webPush = require("web-push");
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const dburl = process.env.DBURL;
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webPush.setVapidDetails("mailto:tmeemoot@gmail.com", publicVapidKey, privateVapidKey);

app.post("/subscribe", async function (req, res) {
  if (req.cookies.userid) {
    const userID = req.cookies.userid;
    console.log(`user change notify settings but we find userid in cookies.. ${userID}`);
    const client = await MongoClient.connect(dburl, { useUnifiedTopology: true });
    const data = await client.db("main").collection("users").deleteOne({ _id: ObjectId(userID) });
    if (data) {
      console.log(`userid deleted from DB. we will create new one for this user`);
    }
  }
  const subscription = req.body;
  const client = await MongoClient.connect(dburl, { useUnifiedTopology: true });
  var userkeys = { name: subscription.name, city: subscription.city, endpoint: subscription.subscription.endpoint, expiriationTime: subscription.subscription.expiriationTime, keys: { p256dh: subscription.subscription.keys.p256dh, auth: subscription.subscription.keys.auth }, stop: false };
  if (!subscription.name || !subscription.city) {
    res.status(401).json(`name or city not declare`);
    return;
  } else {
    const result = await client.db("main").collection("users").insertOne(userkeys); // רושמים את הוזר במסד נתונים
    var objid = result.insertedId; // מקבלים את המזהה של היוזר שנוצר במסד נתונים
    console.log(`userid is ${objid}, created succesfuly - name is ${subscription.name} and city is ${subscription.city}`);
    res.cookie("userid", objid, { expires: new Date('2022/01/20') }); // יוצרים עוגייה עם הערך של המזהה הנ"ל
    res.status(201).json(`subscription succeed`);
    console.log("userid cookie created successfully");
  }
  const payload = JSON.stringify({
    title: "נרשמת בהצלחה, להתראות לפני שקיעה",
    body: `נתריע לך רבע שעה לפני השקיעה ב${subscription.city}`,
  });
  webPush.sendNotification(subscription.subscription, payload).catch((error) => console.error(error));
});

app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.render("index");
});

// כשהאתר עולה, פונקציה בפרונטאנד מבקשת מהשרת נתונים על המשתמש, לשורה העליונה של האתר
app.post("/user", async function (req, res) {
  console.log(`new visit, searching if theres a user cookie`);
  if (req.cookies.userid) {
    const userID = req.cookies.userid; // מזהים את היוזר לפי העוגייה שמכילה את המזהה שלו במסד נתונים
    console.log(`user cookie found with this id: ${userID}`);
    const client = await MongoClient.connect(dburl, { useUnifiedTopology: true });
    const doc = await client.db("main").collection("users").findOne({ _id: ObjectId(userID) });
    if (!doc) {
      console.log(`id not found on DB`);
      res.status(404).json(`we cant find your userid in our DB... strange`);
    } else {
      console.log(`id match in DB. sending data to user`);
      res.status(200).json({ name: doc.name, city: doc.city, stop: doc.stop });
    }
  } else {
    res.status(404).json(`no user cookie found`);
  }
});

// נותנים ליוזר לעשות פוס להתראות
app.post("/stop", async function (req, res) {
  console.log(`user request to stop push. user id is ${req.cookies.userid}`);
  if (req.cookies.userid) {
    const userID = req.cookies.userid;
    const client = await MongoClient.connect(dburl, { useUnifiedTopology: true });
    const record = await client.db("main").collection("users").findOneAndUpdate({ _id: ObjectId(userID) }, { $set: { stop: true } }, );
    if (!record) {
      console.log(`id not found on DB`);
      res.status(404).json(`we cant find your userid in our DB... strange`);
    } else {
      console.log(`id match in DB. sending data to user`);
      res.status(202).json(`ok, push stopped for you`);
    }
  } else {
    res.status(404).json(`no user cookie found`);
  }
});

// ולבטל את הפוס
app.post("/start", async function (req, res) {
  console.log(`user request to stop push. user id is ${req.cookies.userid}`);
  if (req.cookies.userid) {
    const userID = req.cookies.userid;
    const client = await MongoClient.connect(dburl, { useUnifiedTopology: true });
    const record = await client.db("main").collection("users").findOneAndUpdate({ _id: ObjectId(userID) }, { $set: { stop: false } }, );
    if (!record) {
      console.log(`id not found on DB`);
      res.status(404).json(`we cant find your userid in our DB... strange`);
    } else {
      console.log(`id match in DB. sending data to user`);
      res.status(202).json(`ok, push started back for you`);
    }
  } else {
    res.status(404).json(`no user cookie found`);
  }
});

app.post("/", async function (req, res) {
  console.log(`user check city manualy. his req is ${req.body.city}`);
  let zmanim = await gettimesforcity(req.body.city);
  if (zmanim == 'nocity') {
    res.status(404).json(`no city named ${req.body.city}`)
  }
  else {
  console.log(`the answer is ${zmanim}. sending to user`);
  res.status(200).json({ city: zmanim.cityname, zmanim: zmanim });
  }
});

app.listen(port, () => {
  console.log(`app started and listening at http://localhost:${port}`);
});

async function push(id) {
  const client = await MongoClient.connect(dburl, { useUnifiedTopology: true });
  const doc = await client.db("main").collection("users").findOne({ _id: ObjectId(id) });
  let sunset = await getsunforcity(doc.city);
  sunset = sunset.toString();
  sunset = sunset.slice(16, 21);
  const payload = JSON.stringify({
    title: "תזכורת - שקיעת החמה",
    body: `שים לב! השקיעה ב${doc.city} עוד כרבע שעה\nבשעה ${sunset}\nהתפללת כבר מנחה? ותפילין 😉`,
  });
  const pushkeys = { endpoint: doc.endpoint, keys: { p256dh: doc.keys.p256dh, auth: doc.keys.auth } };
  webPush.sendNotification(pushkeys, payload).catch((error) => console.error(error));
}

async function getsunforcity(citly) {
  var morefix = encodeURIComponent(citly);
  const response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?language=iw&address=" + morefix + ",%D7%99%D7%A9%D7%A8%D7%90%D7%9C&key=" + process.env.GOOGLE);
  const data = await response.json();
  if (data.status == "ZERO_RESULTS") {
    console.log(`not an city`);
    return "nocity";
  } else {
    var latitude = data.results[0].geometry.location.lat;
    var longitude = data.results[0].geometry.location.lng;
    var cityname = data.results[0].address_components[0].long_name;
    const options = {
      date: Date.now(),
      timeZoneId: "Asia/Jerusalem",
      locationName: cityname,
      latitude: latitude,
      longitude: longitude,
      elevation: 0,
      complexZmanim: (boolean = false),
    };
    var sunset = KosherZmanim.getZmanimJson(options).BasicZmanim.Sunset;
    sunset = new Date(sunset);
    sunset = moment(sunset).utcOffset("+02:00");
    return sunset;
  }
}

async function gettimesforcity(citly) {
  var morefix = encodeURIComponent(citly);
  const response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?language=iw&address=" + morefix + ",%D7%99%D7%A9%D7%A8%D7%90%D7%9C&key=" + process.env.GOOGLE);
  const data = await response.json();
  if (data.status == "ZERO_RESULTS") {
    console.log(`not an city`);
    return "nocity";
  } else {
    var latitude = data.results[0].geometry.location.lat;
    var longitude = data.results[0].geometry.location.lng;
    var cityname = data.results[0].address_components[0].long_name;
    const options = {
      date: Date.now(),
      timeZoneId: "Asia/Jerusalem",
      locationName: cityname,
      latitude: latitude,
      longitude: longitude,
      elevation: 0,
      complexZmanim: (boolean = false),
    };
    var netz = KosherZmanim.getZmanimJson(options).BasicZmanim.Sunrise;
    var gra = KosherZmanim.getZmanimJson(options).BasicZmanim.SofZmanShmaGRA;
    var chatzos = KosherZmanim.getZmanimJson(options).BasicZmanim.Chatzos;
    var shkia = KosherZmanim.getZmanimJson(options).BasicZmanim.Sunset;
    netz = new Date(netz);
    gra = new Date(gra);
    chatzos = new Date(chatzos);
    shkia = new Date(shkia);
    netz = moment(netz).utcOffset("+02:00");
    gra = moment(gra).utcOffset("+02:00");
    chatzos = moment(chatzos).utcOffset("+02:00");
    shkia = moment(shkia).utcOffset("+02:00");
    netz = moment(netz).format('kk:mm:ss');
    gra = moment(gra).format('kk:mm:ss');
    chatzos = moment(chatzos).format('kk:mm:ss');
    shkia = moment(shkia).format('kk:mm:ss');
    var zmanim = { cityname: cityname, netz: netz, gra: gra, chatzos: chatzos, shkia: shkia }
    return zmanim;
  }
}

async function checksun() { // חישוב הפושים לכל אחד מהיוזרים במסד נתונים, ויצירת טיימאאוטים לכל אחד
  console.log(`started scheduled job - calculating pushes for everyone`);
  const client = await MongoClient.connect(dburl, { useUnifiedTopology: true });
  const result = await client.db("main").collection("users").find({}).toArray();
  console.log(`there is ${result.length} users in push DB:`);
  for (let user of result) {
    if (user.stop !== true) {
    const city = user.city;
    const id = user._id;
    let timeforcity = await getsunforcity(city);
    var thistime = new Date(Date.now());
    thistime = moment(thistime).utcOffset("+02:00");
    var destime = moment.duration(timeforcity - thistime).asMilliseconds();
    destime = destime - 900000; // הורדה של רבע שעה
    if (destime < 0) {
      destime = destime + 86400000;
    }
    console.log(`shkia for ${user.name} is in ${moment(timeforcity).format('kk:mm:ss')}, and now is ${moment(thistime).format('kk:mm:ss')}. remaining time in ms - ${destime}`);
    setTimeout(push, destime, id);
  }
  else {
    console.log(`userid ${user._id} requested to stop push...`);
  }
} }

schedule.scheduleJob('0 14 * * *', function() { checksun() }); // הרצה של חישוב הפושים לכולם, בשעה ארבע בצהריים של השרת