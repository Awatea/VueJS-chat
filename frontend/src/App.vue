<template>
	<div id="chatApp">
		<ChatWrapper />
	</div>
</template>

<script>
import ChatWrapper from '@/components/ChatWrapper';

export default {
	name: 'App',
	components: {
		ChatWrapper,
	},
};
</script>

<style>
@import url('./assets/elementui.css');

*,
*::before,
*::after {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
a,
a:hover,
a:active,
a:focus,
a:visited {
	color: black;
	text-decoration: none;
}

html,
body,
#chatApp {
	display: flex;
	height: 100%;
	width: 100%;
}
</style>
