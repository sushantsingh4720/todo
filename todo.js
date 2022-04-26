const bodyParser = require("body-parser");
const express = require("express");
const { get } = require("request");
const mongoose = require("mongoose");
const _ = require("lodash");
const server = http.createServer(app);

mongoose.connect(
  "mongodb+srv://admin-sushant:singhsushant123@cluster0.qfvw8.mongodb.net/Todolistdb"
);
//var items = ["Electronic", "Grecery", "Beauty"];
var workitems = [];
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const itemSchema = mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "mango",
});
const item2 = new Item({
  name: "rice",
});
const defaultitem = [item1, item2];
const customSchema = mongoose.Schema({
  name: String,
  clist: [itemSchema],
});
const List = mongoose.model("List", customSchema);

app.get("/", function (req, res) {
  /* const date = new Date();
  const options = { weekday: "long", day: "numeric", month: "long" };

  var day = date.toLocaleDateString("en-US", options);*/
  Item.find(function (err, founditems) {
    
    if (err) {
      console.log(err);
    } else {
      if (founditems.length === 0) {
        Item.insertMany(defaultitem, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("new itme added in your todolistvdatabase");
          }
        });
      }

      res.render("list", { listtitle: "Today", addlistitems: founditems });
    }
   
  });
});
app.post("/", function (req, res) {
  const item = req.body.newitem;
  const listitem = req.body.list;

  const itemname = new Item({
    name: item,
  });

  if (listitem === "Today") {
    itemname.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listitem }, function (err, foundlist) {
      foundlist.clist.push(itemname);
      foundlist.save();
      res.redirect("/" + listitem);
    });
  }
});
app.post("/delete", function (req, res) {
  const checkeditemid = req.body.selectitems;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove({ _id: checkeditemid }, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { clist: { _id: checkeditemid } } },
      function (err, foundlist) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:paramName", function (req, res) {
  const param = _.capitalize(req.params.paramName);
  List.findOne({ name: param }, function (err, findlist) {
    if (err) {
      console.log(err);
    } else if (findlist) {
      res.render("list", {
        listtitle: findlist.name,
        addlistitems: findlist.clist,
      });
    } else {
      const list = new List({
        name: param,
        clist: defaultitem,
      });
      list.save();
      res.redirect("/" + param);
    }
  });
});

app.get("/about", function (re, res) {
  res.render("about");
});

/*app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("your web port on 3000");
});*/
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
