import Vue from 'vue';
import TimeAgo from 'vue-timeago';
import ElementUI from 'element-ui';

import App from './App';

Vue.use(TimeAgo, { name: 'TimeAgo' });
Vue.use(ElementUI);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
	el: '#app',
	components: {
		App,
	},
	template: '<App/>',
});

