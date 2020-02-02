<template>
	<div
		class="contacts-wrap"
		:class="{
			'wide' : fullWidth,
			'hidden' : hideMenu
		}"
	>
		<div class="contact">
			<!-- Single contact block -->
			<div
				v-for="contact in contacts"
				:key="contact.id"
				class="contact-user"
				:class="{
					'active' : contact.id === activeUserId
				}"
				@click.prevent="activateUser(contact.id)"
			>
				<!-- Avatar -->
				<div class="contact-user-photo">
					<a :href="contact.profile_link ? contact.profile_link : ''">
						<el-avatar :size="50" :src="contact.avatar"></el-avatar>
					</a>
				</div>
				<!-- End of Avatar -->
				<!-- Name -->
				<div class="contact-user-info">
					<div class="contact-user-top">
						<a
							class="contact-user-name"
							target="_blank"
						>
							{{contact.name}}
						</a>
					</div>

				</div>
				<!-- End of Name -->
			</div>
			<!-- End of Single contact block -->
		</div>
	</div>
</template>

<script>
export default {
	name: 'ContactsList',
	props: {
		contacts: {
			type: Array,
		},
		activeUserId: {
			type: String,
		},
		fullWidth: {
			type: Boolean,
		},
		hideMenu: {
			type: Boolean,
		},
	},
	data() {
		return {
		};
	},
	methods: {
		// Activate user on click
		activateUser(id) {
			this.$emit('activateContact', id);
			this.toggleMenu();
		},
		toggleMenu() {
			this.$emit('toggleMenu', true);
		},
	},
};
</script>

<style scoped lang="scss">
.contacts-wrap {
	border-right: 1px solid rgb(225, 243, 216);

	&.wide {
		display: block;
		position: fixed;
		width: 100%;
		height: 100%;
		border-right: none;
		background-color: #fff;
		z-index: 100;
		overflow-y: auto;

		.contact {
			height: 100%;

			&-user {
				width: 100%;
				margin: 5px 0;
				background-color: #f8f8f8;

				&:first-child {
					margin-top: 0;
				}
			}
		}
	}

	&.hidden {
		display: none;
	}
}
.contact-user {
	display: flex;
	align-items: center;
	margin: 5px;
	border-radius: 5px;
	cursor: pointer;
	border: 2px dashed transparent;
	width: 200px;

	&:hover {
		border-color:  #B7AEB2;
	}

	&.active {
		border-color: #FF6BBD;
	}

	&-photo {
		margin: 5px;
	}
}
</style>
