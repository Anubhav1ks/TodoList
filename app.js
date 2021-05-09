//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Anubhav:test123@cluster0.xagze.mongodb.net/todolistdb", {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("successfully connected");
});
const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model('Item', itemsSchema);
const item1=new Item({
  name:"welcome"
});
const item3=new Item({
  name:"welcome3"
});
const item2=new Item({
  name:"welcome2"
});

const defaultitems=[item1,item2,item3];


const workSchema = new mongoose.Schema({
  name: String,
  items :[itemsSchema]
});
const Work = mongoose.model('Work', workSchema);


app.get("/", function(req, res) {


  Item.find({},function(err,founditems){
    if (founditems.length ===0) {
      Item.insertMany(defaultitems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("sucessfully added");
          res.redirect("/");
        }
      });
    }else{
        res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  });


// const day = date.getDate();
//
//   res.render("list", {listTitle: day, newListItems: Item});

});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname=req.body.list;
  // console.log(listname);
  const item = new Item({
    name: itemname
  });
  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    Work.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    });
  }
});

app.post("/delete",function(req,res){
  const id=req.body.check;
  const listname=req.body.listname;
  // console.log(listname);
  if(listname==="Today"){
  Item.deleteOne({_id:id},function(err){
    if(err){
    console.log(err);
  }else{
    res.redirect("/");
  }
  });
}
else{
    Work.findOneAndUpdate({name: listname},{$pull:{items:{_id:id}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    });
}
});



app.get("/:name", function(req,res){
  const title=_.capitalize(req.params.name);
  Work.findOne({name:title},function(err,finditem){
      if(!err){
        if(!finditem){
          const work = new Work({
            name: title,
            items: defaultitems
          });
          work.save();
          res.redirect("/"+title);
        }else{
             res.render("list", {listTitle: finditem.name, newListItems: finditem.items});
        }
      }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
