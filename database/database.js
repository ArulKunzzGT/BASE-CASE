// database.js
const fs = require("fs");
const nodemailer = require("nodemailer");

// Mengimpor global settings
require("../settings"); // Pastikan path ini sesuai dengan lokasi file settings.js

// Fungsi membaca database
function readDatabase() {
  const data = fs.readFileSync("./database/database.json", "utf-8");
  return JSON.parse(data);
}

// Fungsi menyimpan database
function saveDatabase(data) {
  fs.writeFileSync("./database/database.json", JSON.stringify(data, null, 2));
}

// Fungsi untuk menambah pengguna ke database
function addUser(user) {
  const db = readDatabase();
  const userExists =
    db.findIndex(
      (entry) => entry.email === user.email || entry.number === user.number
    ) !== -1;

  if (userExists) {
    console.log("User already exists!");
    return false;
  }

  db.push(user);
  saveDatabase(db);
  console.log("User added successfully!");
  return true;
}

// Fungsi membuat kode random (6 digit)
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Konfigurasi email dengan menggunakan global.email dan global.passwordmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: global.email,
    pass: global.passwordmail,
  },
});

// Fungsi mengirim email verifikasi
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: global.email,
    to: email,
    subject: "Verification Code",
    text: `Your verification code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Fungsi memulai proses verifikasi
async function verifyUser(email) {
  const db = readDatabase();

  const userIndex = db.findIndex((entry) => entry.email === email);
  if (userIndex === -1) {
    console.log("User not found!");
    return false;
  }

  const verificationCode = generateVerificationCode();
  db[userIndex].verificationCode = verificationCode;

  const emailSent = await sendVerificationEmail(email, verificationCode);
  if (!emailSent) {
    console.log("Failed to send email!");
    return false;
  }

  saveDatabase(db);
  console.log("Verification code sent successfully!");
  return true;
}

// Fungsi memvalidasi kode verifikasi
function validateVerification(email, code) {
  const db = readDatabase();

  const userIndex = db.findIndex((entry) => entry.email === email);
  if (userIndex === -1) {
    console.log("User not found!");
    return false;
  }

  if (db[userIndex].verificationCode === code) {
    db[userIndex].verified = true;
    delete db[userIndex].verificationCode;
    saveDatabase(db);
    console.log("User verified successfully!");
    return true;
  } else {
    console.log("Invalid verification code!");
    return false;
  }
}

module.exports = {
  addUser,
  verifyUser,
  validateVerification,
  getUserByNumberOrEmail,
  addUserData,
};
