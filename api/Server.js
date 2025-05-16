//get env data for mongo auth
const path = require("path");
require('dotenv').config({
    path:path.resolve(__dirname,".env")
});
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.gbptl4g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
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
const req = require("express/lib/request");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));
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
  roster_one.forEach(driver => {
    radio_one+=`
      <label>
        <input type="radio" name="driverOne" value='${JSON.stringify(driver)}'>${driver['givenName']} ${driver['familyName']}
      </label><br>
    `;
  });
  let radio_two = "";
    roster_two.forEach(driver => {
    radio_two+=`
      <label>
        <input type="radio" name="driverTwo" value='${JSON.stringify(driver)}'>${driver['givenName']} ${driver['familyName']}
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

app.post('/display_players',(req,res)=>{
  let driver_one =  JSON.parse(req.body['driverOne']);
  let driver_two = JSON.parse(req.body['driverTwo']);
  let team_name = req.body['team'];
  // res.render('display_players')
  let team = {
    teamName:team_name,
    drivers:[
      {
        driver_name: `${driver_one['givenName']} ${driver_one['familyName']}`,
        bio: driver_one['url'],
        nationality:driver_one['nationality'],
        birthday:driver_one['dateOfBirth']
      },
      {
        driver_name:`${driver_two['givenName']} ${driver_two['familyName']}`,
        bio: driver_two['url'],
        nationality:driver_two['nationality'],
        birthday:driver_two['dateOfBirth']
      },
    ]
  }
  let display_result = `
  <table border='1'>
  <tr>
    <th>Information</th>
    <th>${team.drivers[0].driver_name}</th>
    <th>${team.drivers[1].driver_name}</th>
  </tr>
  <tr>
  <td>Nationality</td>
  <td>${team.drivers[0].nationality}</td>
  <td>${team.drivers[1].nationality}</td>
  </tr>
   <tr>
  <td>Birthday</td>
  <td>${team.drivers[0].birthday}</td>
  <td>${team.drivers[1].birthday}</td>
  </tr>
   <td>Bio</td>
  <td> <a href="${team.drivers[0].bio}">Driver Bio</a></td>
  <td> <a href="${team.drivers[1].bio}">Driver Bio</a></td>
  </tr>
  </table>
  `;
  let return_data = {
    display:display_result,
    teamName:team_name
  }
  insert_team(team)
  res.render('display_players',return_data)
})
const get_roster = async (year) =>{
  let request  = await fetch(`https://ergast.com/api/f1/${year}/drivers.json`)
  let data = await request.json();
  // console.log(data['MRData']['DriverTable']['Drivers'])
  return data['MRData']['DriverTable']['Drivers']
}
//will add rest later :)

app.get('/seeTeams', async (req, res) => {
  let teams = await get_teams();
  let text = "";
  teams.forEach(team => {
    text += `<h1>Team: ${team.teamName}</h1><br><br>
    <table border='1' class="table_pos">
  <tr>
    <th>Information</th>
    <th>${team.drivers[0].driver_name}</th>
    <th>${team.drivers[1].driver_name}</th>
  </tr>
  <tr>
  <td>Nationality</td>
  <td>${team.drivers[0].nationality}</td>
  <td>${team.drivers[1].nationality}</td>
  </tr>
   <tr>
  <td>Birthday</td>
  <td>${team.drivers[0].birthday}</td>
  <td>${team.drivers[1].birthday}</td>
  </tr>
   <td>Bio</td>
  <td> <a href="${team.drivers[0].bio}">Driver Bio</a></td>
  <td> <a href="${team.drivers[1].bio}">Driver Bio</a></td>
  </tr>
  </table><br><br><hr><br><br>`;
  });
  let variable = {teams : text};
  res.render('seeTeams', variable);
});

app.get('/delete', (req, res) => {
  res.render('deleteTeam');
});

app.post('/delete', async (req, res) => {
  await clear();
  res.render('deleteFeedback');
});


async function insert_team(team){
    try{
        await client.connect();
        database = client.db(process.env.MONGO_DB_NAME)
        let collection = database.collection(process.env.MONGO_COLLECTION);
        await collection.insertOne(team)
    }
    catch(e)
    {
      console.error(e);
    }
    finally{
        await client.close();
    }
}

async function get_teams() {
  try {
        await client.connect();
        const database = client.db(process.env.MONGO_DB_NAME);
        const collection = database.collection(process.env.MONGO_COLLECTION);

        let filter = {};
        let result = await collection.find(filter).toArray();
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function clear() {
    try {
        await client.connect();
        const database = client.db(process.env.MONGO_DB_NAME);
        const collection = database.collection(process.env.MONGO_COLLECTION);
        let filter = {};
        const result = await collection.deleteMany(filter);
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}