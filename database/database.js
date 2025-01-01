const fs = require("fs");
const path = require("path");

const DATABASE_FILE = path.join(__dirname, "database.json");

function readDatabase() {
  if (!fs.existsSync(DATABASE_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATABASE_FILE, "utf-8");
  return JSON.parse(data);
}

function saveDatabase(data) {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function addUserData(number, email) {
  const db = readDatabase();

  const userExists = db.some((user) => user.number === number);
  if (!userExists) {
    const newUser = {
      number: number,
      email: email,
      verify: false,
    };
    db.push(newUser);
    saveDatabase(db);
    return true;
  }

  return false;
}

function updateVerificationStatus(number, verificationCode) {
  const db = readDatabase();

  const user = db.find((user) => user.number === number);
  if (user) {
    if (user.verificationCode === verificationCode) {
      user.verify = true;
      user.verificationCode = undefined;
      saveDatabase(db);
      return true;
    } else {
      return false;
    }
  }

  return false;
}

module.exports = {
  readDatabase,
  saveDatabase,
  addUserData,
  updateVerificationStatus,
};
