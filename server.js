const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");



const db = require("./models");

const PORT = process.env.PORT || 3000;
const app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars as default engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Serve public files
app.use(express.static("public"));

// Connect to MongoDB
var databaseUri = "mongodb://localhost/mongoHeadlines";
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
} else {
    mongoose.connect(databaseUri, { useNewUrlParser: true });
}

// Routes
// Home page
app.get("/", function(req, res) {
    db.Article.find({saved: false}).then(function(dbArticles) {
        res.render("home", {articles: dbArticles}); 
    }).catch(function(error) {
        console.log(error);
    });
});

// Get saved articles
app.get("/saved", function (req, res) {
    db.Article.find({saved: true}).then(function(savedArticles) {
        res.render("saved", {articles: savedArticles});
    }).catch(function(error) {
        console.log(error);
    });
});

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/style").then(function (response) {
        var $ = cheerio.load(response.data);
        $("article").each(function (i, element) {

            var title = $(element).find("h2").text();
            var link = $(element).attr("data-contenturl");
            

            db.Article.create({
                title: title,
                link: link,
                
            }).then(function(inserted) {
                res.redirect("/");
            }).catch(function(error) {
                console.log(error);
            });
        });
    });
});


app.get("/clear", function(req, res) {
    db.Article.deleteMany({}).then(function(deleted) {
    }).then(function(dbArticle) {
        return db.Note.deleteMany({});
    }).then(function(dbNote) {
        res.redirect("/");
    }).catch(function(error) {
        console.log(error);
    });
});


app.put("/save/:id", function(req, res) {
    db.Article.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { saved: true } }
    )
      .then(function(saved) {
        res.json(saved);
      })
      .catch(function(error) {
        console.log(error);
      });
});


app.delete("/delete/:id", function(req, res) {
    db.Article.deleteOne({_id: req.params.id}).then(function(deleted) {
        res.json(deleted);
    }).catch(function(error) {
        console.log(error);
    });
});


app.post("/savenote/:id", function(req, res) {
    db.Note.create({ note: req.body.note }).then(function(
      dbNote
    ) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { notes: dbNote._id } },
        { new: true }
      )
        .then(function(dbArticle) {
          res.json(dbArticle);
        })
        .catch(function(error) {
          console.log(error);
        });
    });
});


app.delete("/deletenote/:id", function(req, res) {
    db.Note.deleteOne({_id: req.params.id}).then(function(deleted) {
        res.json(deleted);
    }).catch(function(error) {
        console.log(error);
    });
});


app.get("/notes/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id}).populate("notes").then(function(dbArticle) {
        res.json(dbArticle);
    }).catch(function(error) {
        console.log(error);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});