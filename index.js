// import express and pg
const express = require("express");
const pg = require("pg");
const app = express();

// create database in terminal: createdb the_acme_flavors_db
// then create init () function to run that connects to our database
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_flavors_db"
);

// app routes here
app.use(express.json());
app.use(require("morgan")("dev"));

//CREATE // POST --
app.post("/api/flavors ", async (req, res, next) => {
  try {
    const SQL = `
    INSERT INTO flavors(txt)
    VALUES($1)
    RETURNING *
    `;

    const response = await client.query(SQL, [req.body.txt]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//READ // GET -- returns array of flavors
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors ORDER BY created_at DESC;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//READ // GET :ID -- returns a single flavor
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors WHERE id = $1;`; // select specific id
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//UPDATE // PUT -- payload: the updated flavor, returns the updated flavor
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3 RETURNING *`;

    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
//DELETE -- returns nothing
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        DELETE from flavors
        WHERE id = $1`;

    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// create your init function
const init = async () => {
  await client.connect();
  console.log("connected to database");

  let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL, 
        is_favorite BOOLEAN,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    );
    INSERT INTO flavors(name, is_favorite) VALUES('mint chocolate', true);
    INSERT INTO flavors(name, is_favorite) VALUES('coffee', true);
    INSERT INTO flavors(name, is_favorite) VALUES('vanilla', false);
    INSERT INTO flavors(name, is_favorite) VALUES('strawberry', false);
  `;
  await client.query(SQL);
  console.log("flavors created");

  SQL = ``;
  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

// init function invocation
init();
