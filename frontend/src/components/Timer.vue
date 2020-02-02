<template>
	<!-- Time -->
	<div class="chat-message-time">
		<time-ago
			v-if="timeAgo"
			:datetime="timeAgo"
			tooltip
			refresh
			long
		></time-ago>
		<div v-else>
			{{timeDate}}
		</div>
	</div>
	<!-- End of Time -->
</template>

<script>
export default {
	name: 'Timer',
	props: ['date'],
	data() {
		return {};
	},
	computed: {
		timeDate() {
			if (this.date) {
				const now = new Date();
				const messageDate = new Date(this.date);
				if (
					now.valueOf() - messageDate.valueOf() >= 1000 * 60 * 60 * 5
				) {
					let minutes = messageDate.getMinutes();
					minutes = `${minutes < 10 ? '0' : ''}${minutes}`;
					let hours = messageDate.getHours();
					hours = `${hours < 10 ? '0' : ''}${hours}`;
					let day = messageDate.getDate();
					day = `${day < 10 ? '0' : ''}${day}`;
					let month = messageDate.getMonth() + 1;
					month = `${month < 10 ? '0' : ''}${month}`;
					const year = (`${messageDate.getFullYear()}`).substr(2, 2);
					return `${day}.${month}.${year} ${hours}:${minutes}`;
				}
				return null;
			}
			return null;
		},
		timeAgo() {
			return this.timeDate ? null : new Date(this.date);
		},
	},
};

</script>

<style scoped>
	.main {
		margin: auto;
		width: 100%;
	}
</style>
