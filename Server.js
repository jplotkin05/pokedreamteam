//get env data for mongo auth
const path = require("path");
require('dotenv').config({
    path:path.resolve(__dirname,".env")
});

//command input
process.stdin.on("readable", function (){
    const userInput = process.stdin.read();
    if(userInput!== null){
      //must trim to properly clean data for reading
        userInput = userInput.trim()
      if(userInput === "stop"){
        process.stdout.write("Shutting down the server.\n")
        process.exit(0);
      }else{
        //invalid command response
        process.stdout.write(`Invalid command: ${userInput}\n`);
      }
    }
    process.stdout.write("Type stop to shutdown the server: ");
    process.stdin.resume();
});

//server setup
const express = require("express"); 
const app = express(); 
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
const bodyParser = require("body-parser");
const { cursorTo } = require('readline');
app.use(bodyParser.urlencoded({extended:false}));
//listen to port
let port_number = 6969
app.listen(port_number, (err) => {
    if (err) {
      console.log("Starting server failed.");
      process.stdout.write("Type itemList or stop to shutdown the server: ");
    } else {
      console.log(`To access server: http://localhost:${port_number}`);
      process.stdout.write("Type stop to shutdown the server: ");
    }
  });

//home page
app.get('/',(req,res)=>{

    res.render('index')
})
//view teams
app.get('/view-teams',(req,res)=>{
    
    res.render('seeTeams')
})

//will add rest later :)