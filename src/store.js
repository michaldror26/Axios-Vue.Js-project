import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        idToken: null,
        userId: null,
        user: null
    },
    mutations: {
        authUser(state, userData) {
            state.idToken = userData.token;
            state.userId = userData.userId;

        },
        storeUser(state, user) {
            state.user = user;
        },
        clearAuthData(state) {
            state.idToken = null;
            state.userId = null;
        }

    },
    actions: {
        signup({commit, dispatch}, authData) {
            axios.post('/signupNewUser?key=AIzaSyBxAcAmRNCzn04XO25rf6cqm2LC6kVSJrc',
                {
                    email: authData.email,
                    password: authData.password,
                    returnSecureToken: true
                })
                .then(res => {
                    console.log(res);
                    commit('authUser', {                //update token
                        token: res.data.idToken,
                        userId: res.data.localId
                    });

                    localStorage.setItem('token', res.data.idToken);
                    localStorage.setItem('userId', res.data.localId);
                    const expirationDate = new Date().getTime() + res.data.expiresIn * 1000;
                    localStorage.setItem('expirationDate', new Date(expirationDate));

                    dispatch('storeUser', authData); //store new user in database

                })
                .catch(error => console.log(error));
        },
        login({commit}, authData) {
            axios.post('/verifyPassword?key=AIzaSyBxAcAmRNCzn04XO25rf6cqm2LC6kVSJrc',
                {
                    email: authData.email,
                    password: authData.password,
                    returnSecureToken: true
                })
                .then(res => {
                    console.log(res);
                    commit('authUser', {               //update token
                        token: res.data.idToken,
                        userId: res.data.localId
                    })

                    localStorage.setItem('token', res.data.idToken);
                    localStorage.setItem('userId', res.data.localId);
                    const expirationDate = new Date().getTime() + res.data.expiresIn * 1000;
                    localStorage.setItem('expirationDate', new Date(expirationDate));

                })
                .catch(error => console.log(error));
        },
        storeUser({commit, state}, userData) {
            if (!state.idToken) {
                return;
            }
            globalAxios.post("/users.json" + '?auth=' + state.idToken, userData)
                .then(res => console.log(res))
                .catch(error => console.log(error));
        },
        fetchUser({commit, state}) {
            if (!state.idToken) {
                return;
            }
            globalAxios.get('/users.json' + '?auth=' + state.idToken)
                .then(res => {
                    console.log(res)
                    const data = res.data
                    const users = []
                    for (let key in data) {
                        const user = data[key]
                        user.id = key
                        users.push(user)
                    }
                    console.log(users)
                    console.log(users[0])
                    // this.email = users[0].email

                    commit('storeUser', users[0]);
                })
                .catch(error => console.log(error))
        },
        logout({commit}) {
            commit('clearAuthData');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('expirationDate');

            router.replace('/signin');
        },
        tryAutoLogin({commit}) {
            const token = localStorage.getItem('token')
            if (!token) {
                return;
            }

            const expirationDate = localStorage.getItem('expirationDate');
            if (new Date() >= expirationDate) {
                return;
            }

            const userId = localStorage.getItem('userId');
            commit('authUser', {
                token: token,
                userId: userId
            })

        }
    },
    getters: {
        user(state) {
            return state.user;
        },
        isAuthenticated(state) {
            return state.idToken !== null;
        }
    }
})