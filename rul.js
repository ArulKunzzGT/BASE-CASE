require("./settings");
const {
  addUserData,
  readDatabase,
  saveDatabase,
  updateVerificationStatus,
} = require("./database/database");
const {
  sendVerificationEmail,
  generateVerificationCode,
  verifyUser,
} = require("./mail/mail");
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
const ms = require("ms");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");
const { fetchBuffer } = require("./lib/myfunc2");
const fetch = require("node-fetch");
const { spawn, execSync } = require("child_process");
const exec = util.promisify(require("child_process").exec);
const fsx = require("fs-extra");

const { smsg, fetchJson, getBuffer } = require("./lib/simple");
const { downloadTikTokVideo } = require("./lib/tiktok");

function formatSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function ucword(str) {
  return str.replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
}

function toTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${
    seconds % 60
  } seconds`;
}

function checkVerificationStatus(number) {
  const db = readDatabase(); // Membaca database
  const user = db.find((user) => user.number === number); // Mencari pengguna berdasarkan nomor
  return user ? user.verify : false; // Mengembalikan status verifikasi pengguna
}

function getUserByNumberOrEmail(identifier) {
  const db = readDatabase();
  return db.find(
    (user) => user.number === identifier || user.email === identifier
  );
}

async function addNewUserIfNeeded(number) {
  const db = readDatabase();

  const userExists = db.some((user) => user.number === number);

  if (!userExists) {
    const newUser = {
      user: "",
      number: number,
      email: "",
      verify: false,
    };

    db.push(newUser);
    saveDatabase(db);
    console.log(`User with number ${number} added to the database.`);
  }
}

async function getGroupAdmins(participants) {
  return participants
    .filter((i) => i.admin === "admin" || i.admin === "superadmin")
    .map((i) => i.id);
}

function msToDate(mse) {
  const days = Math.floor(mse / (24 * 60 * 60 * 1000));
  const hours = Math.floor((mse % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((mse % (60 * 60 * 1000)) / (60 * 1000));
  return `${days} Days ${hours} Hours ${minutes} Minutes`;
}

const isUrl = (url) =>
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi.test(
    url
  );

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

const runTime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + " days, " : ""}${h > 0 ? h + " hours, " : ""}${
    m > 0 ? m + " minutes, " : ""
  }${s > 0 ? s + " seconds" : ""}`;
};

const jsonformat = (string) => JSON.stringify(string, null, 2);

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
  myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu"];
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
        : ""; //omzee
    var budy = typeof m.text == "string" ? m.text : "";
    const isCmd = /^[_=|~!?#/$%^&.+-,\\\^]/.test(body);
    const prefix = isCmd ? budy[0] : "";
    const command = isCmd
      ? body.slice(1).trim().split(" ").shift().toLowerCase()
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
    const text = (q = args.join(" "));
    const salam = moment(Date.now())
      .tz("Asia/Jakarta")
      .locale("id")
      .format("a");
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const groupMetadata = m.isGroup
      ? await rul.groupMetadata(m.chat).catch((e) => {})
      : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const from = mek.key.remoteJid;
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
    const messagesD = body.slice(0).trim().split(/ +/).shift().toLowerCase();
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
    const time = moment(Date.now())
      .tz("Asia/Jakarta")
      .locale("id")
      .format("HH:mm:ss z");
    const reply = async (text) => {
      return await rul.sendFakeLink(m.chat, text, salam, pushname, m);
    };

    if (m.message && !m.key.fromMe) {
      console.log(
        chalk.black(chalk.bgWhite("[ MSG ]")),
        chalk.black(chalk.bgGreen(new Date())),
        chalk.black(chalk.bgBlue(budy || m.mtype)) +
          "\n" +
          chalk.magenta("=> From"),
        chalk.green(pushname),
        chalk.yellow(m.sender) + "\n" + chalk.blueBright("=> In"),
        chalk.green(m.isGroup ? pushname : "Chat Pribadi", m.chat)
      );
    }

    function parseMention(text = "") {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
        (v) => v[1] + "@s.whatsapp.net"
      );
    }

    async function getGcName(groupID) {
      try {
        let data_name = await rul.groupMetadata(groupID);
        return data_name.subject;
      } catch (err) {
        return "-";
      }
    }

    function pickRandom(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function handleVerificationCode(m, reply) {
      if (!/^\d{6}$/.test(m.body)) return false;

      const codeToVerify = m.body;
      const db = readDatabase();
      const user = db.find((u) => u.number === m.sender);

      if (!user) {
        reply("Anda belum terdaftar. Gunakan !verify <email> untuk mendaftar.");
        return true;
      }

      if (user.verificationCode !== codeToVerify) {
        reply("Kode verifikasi salah. Coba lagi dengan kode yang benar.");
        return true;
      }

      user.verify = true;
      delete user.verificationCode;
      saveDatabase(db);

      reply("Verifikasi berhasil! Anda sekarang dapat menggunakan fitur bot.");
      return true;
    }
    async function checkVerification(m, reply) {
      const isVerified = await checkVerificationStatus(m.sender); // Mengecek status verifikasi
      if (!isVerified) {
        await reply(
          "You need to verify your email first. Please verify using !verify <your_email>"
        );
        return false; // Menghentikan eksekusi jika tidak terverifikasi
      }
      return true; // Mengembalikan true jika sudah terverifikasi
    }

    if (handleVerificationCode(m, reply)) return;

    await addNewUserIfNeeded(m.sender);

    switch (command) {
      case "owner":
        const ownerVerify = await checkVerification(m, reply);
        if (ownerVerify) {
          rul.sendContact(m.chat, global.owner, m);
        }
        break;

      case "verify":
        const emailToVerify = args[0];
        if (!emailToVerify) {
          return reply("Masukan email untuk verifikasi .verify <email> !");
        }

        const user = getUserByNumberOrEmail(m.sender);
        if (user && user.verify) {
          return reply("Kamu telah terverifikasi.");
        }

        if (user && user.email) {
          return reply(
            `Email sudah dikaitkan dengan akun Anda. Harap gunakan email yang ada atau hubungi bagian dukungan.`
          );
        }
        const verificationCode = generateVerificationCode();
        const emailSent = await sendVerificationEmail(
          emailToVerify,
          verificationCode
        );

        if (!emailSent) {
          return reply(
            "Terjadi kesalahan saat mengirim kode verifikasi. Coba lagi nanti."
          );
        }

        const db = readDatabase();
        const userIndex = db.findIndex((entry) => entry.number === m.sender);

        if (userIndex !== -1) {
          db[userIndex].email = emailToVerify;
          db[userIndex].verificationCode = verificationCode;
        } else {
          db.push({
            user: "",
            number: m.sender,
            email: emailToVerify,
            verify: false,
            verificationCode: verificationCode,
          });
        }

        saveDatabase(db);

        return reply(`Kode verifikasi telah dikirim ke ${emailToVerify}`);
        break;
      case "speed":
        const speedVerify = await checkVerification(m, reply);
        if (speedVerify) {
          await reply(`Please Wait`);
          let rulSpeed;
          try {
            // Menggunakan exec dengan cara yang benar menggunakan await
            rulSpeed = await exec("python3 speed.py --share --secure");
          } catch (e) {
            rulSpeed = e;
          } finally {
            let { stdout, stderr } = rulSpeed;

            // Pastikan stdout dan stderr adalah string dan trim jika diperlukan
            stdout = stdout ? stdout.toString().trim() : "";
            stderr = stderr ? stderr.toString().trim() : "";

            if (stdout) {
              rul.sendFakeLink(m.chat, stdout, salam, pushname, m);
            }

            if (stderr) {
              m.reply(stderr);
            }
          }
        }
        break;
      case "server":
        const serverVerify = await checkVerification(m, reply);
        if (serverVerify) {
          try {
            let response = await fetch("https://ip-json.vercel.app/");
            let json = await response.json();
            delete json.status;

            let caption = `*SERVER*\n\n`;
            caption += `┌  ◦  OS : ${os.type()} (${os.arch()} / ${os.release()})\n`;
            caption += `│  ◦  Ram : ${formatSize(
              os.totalmem() - os.freemem()
            )} / ${formatSize(os.totalmem())}\n`;

            json.result.timeZones = [json.result.timeZones[0]];
            let currency = json.result.currency || {};
            let currencyCode = currency.code || "N/A";
            let currencyName = currency.name || "N/A";

            for (let key in json.result) {
              if (key === "currency") {
                caption += `│  ◦  Currency Code : ${currencyCode}\n`;
                caption += `│  ◦  Currency Name : ${currencyName}\n`;
              } else {
                caption += `│  ◦  ${ucword(key)} : ${json.result[key]}\n`;
              }
            }

            caption += `│  ◦  Uptime : ${toTime(os.uptime() * 1000)}\n`;
            caption += `└  ◦  Processor : ${os.cpus()[0].model}\n\n`;

            reply(`${caption}`);
          } catch (error) {
            console.log(error);
          } finally {
            deleteMessage();
          }
        }
        break;
      case tiktok:
        const tiktokVerify = await checkVerification(m, reply);
        if (tiktokVerify) {
          try {
            const url = args[0];
            if (!url) {
              reply("Harap berikan URL TikTok yang valid.");
              return;
            }

            await downloadTikTokVideo(url, reply);
          } catch (error) {
            console.error("Error code : tiktok", error);
            reply("❌ Terjadi kesalahan saat memproses permintaan.");
          }
        }
        break;

      default:
        if (budy.startsWith(">")) {
          if (!isCreator) return;
          try {
            let evaled = await eval(budy.slice(2));
            evaled =
              typeof evaled !== "string"
                ? require("util").inspect(evaled)
                : evaled;
            await reply(evaled);
          } catch (err) {
            await reply(util.format(err));
          }
        }
    }
  } catch (err) {
    console.error(err);
  }
};
