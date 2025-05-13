//get env data for mongo auth
const path = require("path");
require('dotenv').config({
    path:path.resolve(__dirname,".env")
});
process.stdin.setEncoding('utf8');
//command input
process.stdin.on("readable", function (){
    let userInput = process.stdin.read();
    if(userInput!== null){
      //must trim to properly clean data for reading
        const data = userInput.trim()
      if(data === "stop"){
        process.stdout.write("Shutting down the server.\n")
        process.exit(0);
      }else{
        //invalid command response
        process.stdout.write(`Invalid command: ${data}\n`);
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
app.get('/create_team',(req,res)=>{
    res.render('createTeam')
})

app.post('/year_selected',async (req,res)=>{

  let roster_one = await get_roster(req.body['first_year'])
  let roster_two = await get_roster(req.body['second_year'])
  let radio_one = "";
  console.log(roster_one)
  roster_one.forEach(driver => {
    radio_one+=`
      <label>
        <input type="radio" name="driverOne" value="${JSON.stringify(roster_one)}">${driver['givenName']} ${driver['familyName']}
      </label><br>
    `;
  });
  let radio_two = "";
    roster_two.forEach(driver => {
    radio_two+=`
      <label>
        <input type="radio" name="driverTwo" value="${JSON.stringify(roster_one)}">${driver['givenName']} ${driver['familyName']}
      </label><br>
    `;
  });
  let return_data = {
    year:`${req.body['first_year']} & ${req.body['second_year']}`,
    first_driver: radio_one,
    second_driver: radio_two
  }

  res.render('yearSelected',return_data)
})
const get_roster = async (year) =>{
  let request  = await fetch(`https://ergast.com/api/f1/${year}/drivers.json`)
  let data = await request.json();
  // console.log(data['MRData']['DriverTable']['Drivers'])
  return data['MRData']['DriverTable']['Drivers']
}
//will add rest later :)