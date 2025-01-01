const nodemailer = require("nodemailer");
const {
  addUserData,
  readDatabase,
  saveDatabase,
  updateVerificationStatus,
} = require("../database/database");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: global.mail,
    pass: global.passwordmail,
  },
});

async function sendVerificationEmail(email, code) {
    const mailOptions = {
      from: global.email,
      to: email,
      subject: "Verification Code || ArulRamadan",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #4CAF50;">Verification Code</h2>
          <p>Dear User,</p>
          <p>Thank you for using our service. Please use the following verification code to complete your verification process:</p>
          <div style="font-size: 1.5em; color: #333; font-weight: bold; margin: 20px 0;">
            ${code}
          </div>
          <p>If you did not request this code, please ignore this email or contact support if you feel this is an error.</p>
          <p>Best regards,</p>
          <p><strong>ArulRamadan Team</strong></p>
        </div>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully!");
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
  

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function verifyUser(email, code) {
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
  sendVerificationEmail,
  generateVerificationCode,
  verifyUser,
};
