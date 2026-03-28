const db = require('./db/database');
db.all("SELECT id, nickname, role FROM users", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(JSON.stringify(rows));
  process.exit(0);
});
