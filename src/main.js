import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://my-project-1525170773541.firebaseio.com';

const ax = axios.interceptors.request.use(config => {//קדם שליחת בקשה
    // config.headers['RRR']='rrr';
    console.log(config);
    return config;
});
axios.interceptors.response.use(res => { //קדם קבלת תגובה
    console.log(res);
    return res;
});
axios.interceptors.request.eject(ax);//מבטל את הפונקציה ()use

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
