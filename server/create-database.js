const sqlite3 = require('sqlite3').verbose();
const timestamp = new Date().toISOString();

const newdb = new sqlite3.Database('./test.db', (error) => {
  if (error) {
    console.log('Getting error ' + error);
    process.exit(1);
  }
  newdb.exec(
    `
  create table users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username text not null UNIQUE,
    pass text not null,
    email text not null,
    display_name text not null
  );
  create table event_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip text not null,
    username text not null,
    visitor_id text not null,
    timestamp DATETIME NOT NULL
  );
  create table lockouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip text not null,
    username text not null,
    visitor_id text not null,
    timestamp DATETIME NOT NULL,
    totally_blocked boolean not null
  );
  `,
    () => {
      console.log('Database created!');
    }
  );

  newdb.run(
    `
  INSERT INTO users (username, pass, email, display_name)
  VALUES('admin', 'fingerprint', 'admin@admin.com', 'Admin');`,
    (error) => {
      error ? console.log(error) : console.log(`User inserted`);
    }
  );
  newdb.run(
    `
  INSERT INTO lockouts (ip, username, visitor_id, timestamp, totally_blocked)
  VALUES
  ('111.111.111.11', 'hacker', '12345', '${timestamp}', true),
  ('222.222.222.22', 'silly', '12345', '${timestamp}', false);`,
    (error) => {
      error ? console.log(error) : console.log('Lockouts inserted');
    }
  );
});
