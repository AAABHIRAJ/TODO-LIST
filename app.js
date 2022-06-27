const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const items = ["Wake up", "Take Bath", "Meditate"];
const _ = require("lodash");


const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine", 'ejs');


mongoose.connect("mongodb+srv://admin-abhiraj:Test123@cluster0.wojuy.mongodb.net/todolistDB");

const itemSchema = {
    name : String
};

const Item = mongoose.model("Item", itemSchema);

const listSchema ={
    name : String,
    items : []
};

const List = mongoose.model("List",listSchema);

app.get("/", (req,res) => {
    Item.find((err, foundItems) => {
        if(!err){
            res.render("home", {todoItem : foundItems, listHeading : "Today"})
        }
    });
});


app.post("/delete", (req,res) => {
    const checkedItemId = req.body.checkedItemId;
    const checkedListName = req.body.listName;

    if(checkedListName === "Today"){
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if(!err){
                res.redirect("/");
            }
        });
    }else{
        List.findOne({name : checkedListName}, (err, foundList) => {
            if(!err){
                foundList.items.forEach((item, index) => {
                    if(item._id == checkedItemId){
                        foundList.items.splice(index,1);
                        foundList.save();
                        res.redirect("/" + checkedListName);
                    }
                });
            }
        });
    }
    
    });

// });
app.post("/", (req,res) => {
    const itemName = req.body.item;
    const listName = req.body.submitButton;
    const item = new Item({
        name : itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name : listName}, (err, foundList) => {
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }
        
});

app.get("/:heading", (req,res) => {
    let title = req.params.heading;
    title = _.capitalize(title);

    List.findOne({name : title}, (err, foundList) => {
        if(!err){
            if(!foundList){
                const list = new List({
                    name : title,
                    items :[]
                });
                list.save();
                res.render("home", {todoItem : list.items, listHeading : title});
            }else{
                res.render("home", {todoItem : foundList.items, listHeading : title});
            }
            
        }
    });
    
});

app.listen(3000, () => {
    console.log("Listening to port 3000...");
});
