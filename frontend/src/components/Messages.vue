<template>
	<div
		class="chat"
		v-loading="loadingMessages"
		:class="{ 'mobile': isMobile }"
	>
		<!-- Single message block -->
		<div
			v-for="message in sortedMessages"
			:key="'message-' + message.id"
			:id="'message-' + message.id"
			:class="{'user-message' : message.author.id == 'user1'}"
			class="chat-message"
		>
			<!-- Message text -->
			<div class="chat-message-text">
				<div
					class="unsended-message"
				>
					<!-- Status icons -->
					<i
						v-if="!checkIfMessageSended(message)"
						class="el-icon-check"
					></i>
					<i
						v-else
						class="el-icon-loading"
					></i>
				<!-- End of Status icons -->

				</div>{{ message.text }}

				<!-- Timer -->
				<Timer :date="message.time"/>
				<!-- End of Timer -->
			</div>
			<!-- End of Message text -->

		</div>
		<!-- End of Single message block -->

		<!-- No-messages placeholder -->
		<div v-if="showPlaceholder" class="placeholder">
			┐(‘～`；)┌
		</div>
		<!-- End of No-messages placeholder -->
	</div>
</template>

<script>
import Timer from './Timer';

export default {
	name: 'Messages',
	props: {
		messagesList: {
			type: Array,
		},
		activeUserId: {
			type: String,
		},
		loadingMessages: {
			type: Boolean,
		},
		isMobile: {
			type: Boolean,
		},
	},
	components: {
		Timer,
	},
	data() {
		return {};
	},
	computed: {
		// Check if we need to show plaseholder
		showPlaceholder() {
			return !this.loadingMessages && typeof this.messagesList === 'object' && !this.messagesList.length && this.activeUserId;
		},

		// Parse and sort messages by it's time
		sortedMessages() {
			return [...this.messagesList].sort((a, b) => {
				if (a.time < b.time) {
					return 1;
				}
				if (a.time > b.time) {
					return -1;
				}
				if (a.offlineID) {
					if (a.offlineID < b.offlineID) {
						return 1;
					}
					if (a.offlineID > b.offlineID) {
						return -1;
					}
				}
				return 0;
			});
		},
	},
	methods: {
		// Check if message was sended
		checkIfMessageSended(msg) {
			return msg.sended === false && !navigator.onLine;
		},
	},
};
</script>

<style scoped lang="scss">
.chat {
	display: flex;
	flex-direction: column-reverse;
	height: 80%;
	width: 100%;
	padding: 20px;
	text-align: center;
	overflow-y: auto;

	&.mobile {
		height: calc(80% - 38px)
	}
}
.chat-message {
	display: flex;
	align-items: center;
	text-align: left;
	margin: 5px 0;
}
.user-message {
	flex-direction: row-reverse;
	text-align: right;
}
.chat-message-photo {
	display: block;
	height: 50px;
	width: 50px;
	margin: 10px;
}

.chat-message-text {
	max-width: 250px;
	background: rgb(255, 225, 242);
	padding: 10px;
	border-radius: 10px;
	word-wrap: break-word;
}
.chat-message-time {
	color: #FF6BBD;
	font-style: italic;
	font-size: 12px;
	margin-top: 5px;
}

.user-message .chat-message-text {
	position: relative;
	background: rgb(225, 243, 216);
}
.user-message .chat-message-time {
	color: #67C23A;
}
.user-message .chat-message-time {
	right: 0%;
	text-align: right;
}

.unsended-message {
	position: absolute;
	top: 5px;
	left: -20px;
	display: inline-block;
}
</style>
