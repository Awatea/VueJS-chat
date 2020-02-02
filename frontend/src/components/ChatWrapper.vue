<template>
	<main class="main" v-loading="loadingContacts">
		<div
			class="chat-wrapper"
			:class="{
				'mobile': isMobile,
			}"
		>
			<!-- Contact list -->
			<ContactsList
				:contacts='contactsList'
				:activeUserId="activeUserId"
				:fullWidth="isMobile"
				:hideMenu="hideMenu"
				@activateContact="activateContact"
				@toggleMenu="toggleMenu"
			/>
			<!-- End of Contact list -->

			<!-- Main chat block -->
			<div class="blocked-wrap" :class="{'blocked': !activeUserId}">
				<!-- Messages -->
				<a
					v-if="isMobile"
					@click.prevent="toggleMenu(false)"
					class="button-back"
				>
					<i class="el-icon-caret-left"></i>
					Back to contacts
				</a>
				<Messages
					:loadingMessages="loadingMessages"
					ref="messagesList"
					:messagesList="messagesList"
					:activeUserId="activeUserId"
					:isMobile="isMobile"
				/>
				<!-- End of Messages -->

				<!-- Main text input -->
				<div class="chat-form">
					<form action="">
						<div class="textarea-wrap">
							<textarea
								v-model="newMessage"
								class="textarea"
								placeholder="Text"
								@keydown.enter.prevent="prepareMessage($event)"
								:disabled="!activeUserId"
							></textarea>
							<div class="textarea-controls">
								<div class="sending-loader"
									v-if="loadingSending"
									v-loading="loadingSending"
								></div>
								<div class="enter-message" v-else>
									Press Enter to send
								</div>
							</div>
						</div>
					</form>
				</div>
				<!-- End of Main text input -->
			</div>
			<!-- End of Main chat block -->
		</div>
	</main>
</template>

<script>
import axios from 'axios';
import Messages from '@/components/Messages';
import ContactsList from '@/components/ContactsList';

export default {
	name: 'ChatWrapper',
	components: {
		Messages,
		ContactsList,
	},
	data() {
		return {
			messagesList: [],
			contactsList: [],
			activeUserId: null,
			messagesToSend: [],
			newMessage: '',
			msgServer: null,
			loadingContacts: true,
			loadingMessages: false,
			loadingSending: false,
			limit: 20,
			offset: 0,
			loading: false,
			hideMenu: false,
			openedDialogDiv: null,
		};
	},
	methods: {
		// Get contacts list
		async getUsersList() {
			await axios.get('http://127.0.0.1:8888/users')
				.then(response => {
					this.contactsList = response.data.data;
					this.loadingContacts = false;
				}).catch(err => {
					console.log(err);
					this.loadingContacts = false;
				});
		},

		// Activate contact and show it's history
		async activateContact(id) {
			this.loadingMessages = true;
			if (this.msgServer) {
				this.stopSSE();
			}
			await this.showUserMessagesHistory(id);
		},

		// Start SSE and call for messages
		async showUserMessagesHistory(id) {
			await this.startSSE(id);
			this.openedDialogDiv = this.$refs.messagesList.$el;
			this.openedDialogDiv.onscroll = async () => {
				if (this.msgServer) {
				/* eslint-disable */
					const topOfTheElement = this.openedDialogDiv.scrollTop === 0;
					const needToCallOlderMsgs = this.maxMsgHistoryLength
						&& this.messagesList.length
						? this.messagesList.length < this.maxMsgHistoryLength
						: false;
					if (topOfTheElement && needToCallOlderMsgs && !this.loading) {
						this.loading = true;
						const lastReadedElem = `message-${this.messagesList[this.messagesList.length - 1].id}`;
						await this.loadOlderMessages(id);
						this.openedDialogDiv.scrollTop = (
							document.getElementById(lastReadedElem)
						).scrollHeight - 72;
					}
				}
			};
		},

		// Prepare new message for sending
		async prepareMessage(e) {
			e.preventDefault();
			if (this.newMessage.length) {
				const messageObj = {
					author: { id: 'user1' },
					text: this.newMessage,
					offlineID: `user1_${this.activeUserId}_${(new Date()).valueOf()}`,
				};
				this.newMessage = '';

				this.messagesToSend.push(messageObj);

				this.loadingSending = true;
				// Check if we are online
				if (navigator.onLine) {
					await this.sendUnsendedMsgs();
					window.removeEventListener('online', this.sendUnsendedMsgs);
				} else {
					const newMsg = Object.assign(messageObj, { sended: false });
					this.saveNewMessage(newMsg);
					window.addEventListener(
						'online',
						this.sendUnsendedMsgs,
					);
				}
			}
		},

		// Send messages to the server
		async sendUnsendedMsgs() {
			await this.sendMessageData({
				messages: this.messagesToSend,
			});
		},

		// Load messages
		async getMessagesList(id) {
			await axios.get(`http://127.0.0.1:8888/users/${id}?limit=${this.limit}&offset=${this.offset}`)
				.then(() => {
					setTimeout(() => {
						this.loading = false;
					}, 1000);
				})
				.catch(err => {
					console.log(err);
					this.loadingContacts = false;
				});
		},

		// Update loading offset and call for old messages
		async loadOlderMessages() {
			this.offset += this.limit;
			await this.getMessagesList(this.activeUserId);
		},

		// Remove offline messages that were sended
		clearOfflineMsg(arr, msg) {
			return arr.filter(elem => !(
				elem.sended === false
				&& msg.offlineID === elem.offlineID
			));
		},

		// Send new messages to the server
		async sendMessageData(data) {
			if (data.messages) {
				await axios
					.post(`http://127.0.0.1:8888/users/${this.activeUserId}`, data)
					.then(() => {
						this.loadingSending = false;
						this.messagesToSend = [];
					})
					.catch(err => {
						console.log(err);
						this.loadingSending = false;
					});
			}
		},

		// Update messages history with new messages
		addNewMessages(messages) {
			if (messages) {
				this.messagesList = [...this.messagesList, ...messages];
			}
		},

		// Handle new message, update it's data and add to the history
		saveNewMessage(message) {
			this.loadingSending = true;
			if (!message.id) {
				message.id = (new Date()).valueOf();
			}
			if (!message.time) {
				message.time = (new Date()).valueOf();
			}
			this.messagesList = this.clearOfflineMsg(
				this.messagesList,
				message,
			);
			this.addNewMessages([message]);
			setTimeout(() => {
				this.openedDialogDiv = this.$refs.messagesList.$el;
				/* eslint-disable */
				this.openedDialogDiv.scrollTop = this.openedDialogDiv.scrollHeight;
				this.loadingSending = false;
			}, 0);
			this.loadingMessages = false;
		},

		// Handler for closing SSE and clear filled inputs
		stopSSE() {
			if (this.msgServer) {
				this.msgServer.close();
			}
			this.messagesToSend = [];
			this.newMessage = '';
			this.messagesList = [];
			this.loadingMessages = false;
			this.maxMsgHistoryLength = 0;
			this.offset = 0;
		},

		// Start new SSE-connection and add listeners
		async startSSE(id, limit = 20, offset = 0) {
			try {
				this.activeUserId = id;
				this.msgServer = new EventSource(`http://127.0.0.1:8888/users/${this.activeUserId}/sse?limit=${limit}&offset=${offset}`);
				// Listener for single message
				this.msgServer.addEventListener('message', messageEvent => {
					this.saveNewMessage(JSON.parse(messageEvent.data));
				});
				// Listener for full messages history length
				this.msgServer.addEventListener('maxLength', messageEvent => {
					this.maxMsgHistoryLength = JSON.parse(messageEvent.data);
				});
				// Listener for full history
				this.msgServer.addEventListener('messages', async messageEvent => {
					const data = JSON.parse(messageEvent.data);
					await this.addNewMessages(data);
					this.loadingMessages = false;
				});
				// Listener for closing connection
				this.msgServer.addEventListener('close', this.stopSSE);
				// Listener for errors
				this.msgServer.onerror = err => {
					console.log('EventSource failed: ', err);
				};
			} catch (err) {
				console.log(err);
			}
		},

		// hide menu in mobile version
		toggleMenu(bool) {
			this.hideMenu = bool && this.isMobile;
		},
	},
	async mounted() {
		// Get contact list
		await this.getUsersList();

		// Check if we need to allow mobile styles
		window.onresize(() => {
			this.isMobile = window.innerWidth < 1024;
		})
	},
	beforeDestroy() {
		// Clear all
		this.stopSSE();
	},
};

</script>

<style scoped lang="scss">
	.main {
		margin: auto;
		width: 100%;
		max-width: 1024px;
	}
	.chat-wrapper {
		display: flex;
		width: 100%;
		height: 100vh;
		margin: auto;
		border: 2px solid #FF6BBD;
		border-radius: 10px;
		&.mobile {
			border: none;
		}
	}
	.chat-form {
		width: 100%;
		height: 20%;
	}
	form {
		height: 100%;
	}
	.blocked-wrap {
		height: 100%;
		width: 100%;
	}
	.textarea-wrap {
		position: relative;
		height: 100%;
	}
	.textarea {
		width: 100%;
		height: 100%;
		padding: 10px;
		border: 1px solid rgb(225, 243, 216);
		border-radius: 0 0 10px 0;
		resize: none;
	}
	.textarea-controls {
		position: absolute;
		bottom: 10px;
		right: 10px;
	}
	.sending-loader {
		display: inline-block;
		vertical-align: middle;
		height: 30px;
		width: 30px;
	}
	.enter-message {
		color: rgb(225, 243, 216);
		font-style: italic;
	}
	.enter-message:hover {
		color: #67C23A;
	}
	.textarea:focus {
		outline: none !important;
		border:1px solid #67C23A;
	}
	.el-main {
		padding: 0;
	}
	.button-back {
		display: block;
		width: 100%;
		line-height: 1;
		padding: 10px;
		font-size: 16px;
		border-bottom: 1px solid #67C23A;
		background-color: #fff;
	}
</style>
