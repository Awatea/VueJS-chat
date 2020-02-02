const express = require('express')
const app = express()
const cors = require('cors')
const admin = require('firebase-admin');
const port = process.env.PORT || 8888;
const bodyParser = require('body-parser');
const SSE = require('express-sse');
const sse = new SSE();
const serviceAccount = require('./vuechatbots_k.json');

// Support json encoded bodies
app.use(bodyParser.json()); 
// Support encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// Allow Firebase
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://vuechatbots.firebaseio.com"
});
const db = admin.firestore();

// Add CORS
app.use(cors())

// Check for errors
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('error', { error: err });
})

// Get user messages list
async function getUserMessagesList(userId) {
	let user = db.collection('bots').doc(userId);
	return await user.get()
		.then(field => {
			return field.data().messages_history;
		})
		.catch((err) => {
			console.log('Problems with users data getting: ', err);
		});
}

// save messages to DB
async function saveMessagesToDB(userId, messages) {
	let user = db.collection('bots').doc(userId);
	let allMessages = await getUserMessagesList(userId);
	let keys = Object.keys(allMessages).sort((a, b) => {
		if (parseInt(a) < parseInt(b)) {
			return -1;
		}
		if (parseInt(a) > parseInt(b)) {
			return 1;
		}
		return 0;
	});
	let allMessagesLength = +keys[keys.length-1] + 1 || 0;
	for (let i = 0; i < messages.length; i++) {
		let index = {};
		messages[i].id = allMessagesLength;
		messages[i].time = (new Date()).valueOf();
		index['messages_history.' + allMessagesLength] = messages[i];
		user.update(index);
		let dataObj = {};
		dataObj[allMessagesLength] = messages[i];
		let data = await prepareUserHistory(dataObj);
		sse.send(data.result[0], 'message');
		allMessagesLength++;
	}
	
	return getUserMessagesList(userId);
}

// get random number
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min); 
}

// get random bot answer from pull
async function getRandomBotAnswer(userId) {
	let user = db.collection('bots').doc(userId);
	return await user.get()
		.then(fields => {
			let answersArr = Object.values(fields.data().messages_pull);
			let rnd = getRandomInt(0, answersArr.length);
			return { author: userId, text: answersArr[rnd], time: new Date().valueOf()};
		})
		.catch((err) => {
			console.log('Problems with users data loading: ', err);
		});
}

// get user data by user's ID
async function getUserDataByID(userId) {
	if (userId && userId !== 'user1') {
		let user = db.collection('bots').doc(userId);
		return await user.get()
			.then(fields => {
				let userData = fields.data();
				return { 
					id: userData.id,
					avatar: userData.avatar,
					profileLink: userData.profileLink,
					name: userData.name,
				}
			})
			.catch((err) => {
				console.log('Problems with users data loading: ', err);
			});
	} else {
		return {
			id: "user1",
			avatar: 'https://share.moltendorf.net/Pictures/Avatar/Doge/Doge-Lovers.png',
			profileLink: "https://en.wikipedia.org/wiki/Doge_(meme)",
			name: 'You',
		}
	}
}

// prepare needed part of messages history for sending
async function prepareUserHistory(messages, limit = 20, offset = 0) {
	const msgArr = Object.keys(messages).map(async key => {
		const newObj = JSON.parse(JSON.stringify(messages[key]));
		newObj.id = key;
		newObj.author = await getUserDataByID(newObj.author.id ? newObj.author.id : newObj.author);
		return newObj;
	});
	
	return Promise.all(msgArr).then((result) => {
		result = result.sort((a, b) => {
			if (a.time > b.time) {
				return -1;
			}
			if (a.time < b.time) {
				return 1;
			}
			return 0;
		});
		return { maxLength: result.length, result: result.splice(offset, limit) }
	})
}

// send randomized bot's answer
async function sendRandomBotAnswer(userId) {
	let data = await getRandomBotAnswer(userId);
	setTimeout(() => { 
		saveMessagesToDB(userId, [data]);
	}, getRandomInt(1000, 5001));
}

// send called part of messages history
async function sendUserHistory(userId, limit = 20, offset = 0) {
	const messages = await getUserMessagesList(userId);
	const res = await prepareUserHistory(messages, limit, offset);
	await sse.send(res.result, 'messages');
	await sse.send(res.maxLength, 'maxLength');
}

// =============== SSE

// get all users data
app.get('/users', (request, response) => {
	let data = [];
	db.collection('bots').get()
		.then((docs) => {
			docs.forEach((doc) => {
				if (!doc.exists) {
					console.log('No such document!');
				} else {
					let docData = doc.data()
					let contactData = {
						name: docData.name,
						id: docData.id,
						avatar: docData.avatar,
						profileLink: docData.profileLink
					}
					data.push(contactData);
				}
			});
			response.json({
				data
			})
		})
		.catch((err) => {
			response.status(500).send('Something broke!');
			console.log('Error getting documents', err);
		});
})

// start sse-connection and get full user history
app.get('/users/:id/sse', function(request, response) {
	sse.init(request, response);
	setTimeout(() => {
		sendUserHistory(request.params.id, request.query.limit, request.query.offset);
	}, 0);
})

// get part of history
app.get('/users/:id', function(request, response) {
	response.status(200).send();
	sendUserHistory(request.params.id, request.query.limit, request.query.offset);
})

// save new messages to db
app.post('/users/:id', async (request, response) => {
	let messages = request.body.messages;
	try {
		await saveMessagesToDB(request.params.id, messages);
		response.status(200).send()
		for (let i = 0; i < messages.length; i++) {
			sendRandomBotAnswer(request.params.id)
		}
	}
	catch (err) {
		response.status(500).send('Something broke!');
		console.log('Problems with users data saving: ', err);
	}
})

app.listen(port);