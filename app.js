const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;

app.use(express.json());

//database
let initialize = async () => {
  try {
    let dbPath = path.join(__dirname, "covid19India.db");

    db = await open({ filename: dbPath, driver: sqlite3.Database });

    app.listen(3000, () => console.log("Server is Online"));
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initialize();

//API 1
app.get("/states/", async (request, response) => {
  let query = `SELECT * FROM state`;

  let result = await db.all(query);

  function convertor(obj) {
    return {
      stateId: obj.state_id,
      stateName: obj.state_name,
      population: obj.population,
    };
  }

  response.send(result.map((obj) => convertor(obj)));
});

//API 2
app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const query = `SELECT * FROM state WHERE state_id = ${stateId}`;

  let result = await db.all(query);

  function convertor(obj) {
    return {
      stateId: obj.state_id,
      stateName: obj.state_name,
      population: obj.population,
    };
  }

  response.send(convertor(result[0]));
});

//API 3
app.post("/districts/", async (request, response) => {
  let body = request.body;

  let { districtName, stateId, cases, cured, active, deaths } = body;

  let query = `INSERT INTO district (
        district_name, state_id, cases, cured, active, deaths)
        VALUES ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths} );`;

  await db.run(query);

  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const query = `SELECT * FROM district WHERE district_id = ${districtId}`;

  let result = await db.all(query);

  function convertor(obj) {
    return {
      districtId: obj.district_id,
      districtName: obj.district_name,
      stateId: obj.state_id,
      cases: obj.cases,
      cured: obj.cured,
      active: obj.active,
      deaths: obj.deaths,
    };
  }

  response.send(convertor(result[0]));
});

//API 5
app.delete("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const query = `DELETE FROM district WHERE district_id = ${districtId}`;

  await db.run(query);

  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;

  let body = request.body;

  let { districtName, stateId, cases, cured, active, deaths } = body;

  let query = `UPDATE district SET
        district_name = '${districtName}', 
        state_id = ${stateId}, 
        cases = ${cases}, 
        cured = ${cured}, 
        active = ${active}, 
        deaths = ${deaths} WHERE district_id = ${districtId};`;

  await db.run(query);

  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const query = `SELECT SUM(cases) AS totalCases,
    SUM(cured) AS totalCured,
    SUM(active) AS totalActive,
    SUM(deaths) AS totalDeath
    FROM district WHERE state_id = ${stateId} 
    GROUP BY state_id`;

  let result = await db.all(query);

  response.send(result);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const query = `SELECT state_name FROM district JOIN state ON district.state_id = state.state_id WHERE district_id = ${districtId}`;

  let result = await db.all(query);

  console.log(result);

  function convertor(obj) {
    return {
      stateName: obj.state_name,
    };
  }

  response.send(convertor(result[0]));
});

//module export
module.exports = app;
