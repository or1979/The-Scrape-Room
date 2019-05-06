const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"));
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view-engine", "handlebars");

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
  });
} else {
  mongoose.connect("mongodb://localhost/scraperoom_db", {
    useNewUrlParser: true
  });
}

app.get("/", (req, res) => {
  db.Article.find().then(d => {
    console.log(d);
    res.render("index.handlebars", {
      articles: d
    })
  }).catch(e => console.log(e));
});


app.get("/saved", (req, res) => {
  db.Article.find({
    saved: true
  }).then(d => {
    res.render("saved.handlebars", {
      articles: d
    })
  }).catch(e => console.log(e));
})


app.get("/api/scrape", function (req, res) {
  axios.get("https://www.cnn.com/health").then(function (response) {
    const $ = cheerio.load(response.data);
    $("li article").each(function (i, element) {
      const out = {}
      const section = $(this).find("h3.cd__headline a");
      out.link = "https://www.cnn.com" + section.attr("href");
      out.title = section.children("span.cd__headline-text").text();
      console.log(out);
      db.Article.create(out).then(d => {
        console.log(d);
      }).catch(e => {
        return console.log(e);
      });
    });
    res.redirect("/");
  }).catch(err => {
    return console.log(err)
  });
});


app.get("/api/delete", (req, res) => {
  db.Article.deleteMany({
    saved: false
  }).then(d => {
    console.log(d);
    res.json(d);
  }).catch(e => {
    return console.log(e);
  })
});


app.put("/api/save/:id", (req, res) => {
  db.Article.updateOne({
    _id: req.params.id
  }, {
    saved: true
  }).then(d => {
    console.log(d);
    res.json(d);
  }).catch(e => {
    console.log(e);
  })
});

app.put("/api/unsave/:id", (req, res) => {
  db.Article.updateOne({
    _id: req.params.id
  }, {
    saved: false
  }).then(d => {
    console.log(d);
    res.json(d);
  }).catch(e => {
    console.log(e);
  })
})


app.post("/api/comment/:articleID", (req, res) => {
  db.Comment.create(req.body).then(function (dbComment) {
    return db.Article.findOneAndUpdate({
      _id: req.params.articleID
    }, {
      $push: {
        comment: dbComment._id
      }
    }, {
      new: true
    });
  }).then(function (dbArticle) {
    console.log(dbArticle);
    res.json(dbArticle);
  }).catch(function (err) {
    res.json(err);
  });
});


app.get("/api/comment/:articleID", (req, res) => {
  db.Article.findOne({
    _id: req.params.articleID
  }).populate("comment").then(function (dbArticle) {
    res.json(dbArticle);
  }).catch(function (err) {
    res.json(err);
  });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});