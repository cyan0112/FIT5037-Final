<template>
    <div class="login_container">
        <div class="header">
            <div class="row">
                <div class="col-md-6 col-sm-6">
                    <div class="logo">
                    </div>
                </div>
                <div class="col-md-6 col-sm-6" >
                    <div class="slogan">
                    </div>
                </div>
            </div>
        </div>
        <div class="login_board">
            <div class="login_card">
                <div class="login_content">
                    <div class="row">
                        <h1>Login With Email</h1>
                    </div>
                   <div class="row">
                        <!-- 关键改动：将 username 改为 email -->
                        <input type="email" class="form-control" v-model="credentials.email" placeholder="Email" @blur="validateEmail(true)"></input>
                        <div v-if="errorData.email != ''">
                            <span class="error">{{errorData.email}}</span>
                        </div>
                    </div>
                    <div class="row">
                        <input type="password" class="form-control" v-model="credentials.password" placeholder="Password" @blur="validatePassword(true)"></input>
                        <div v-if="errorData.password != ''">
                            <span class="error">{{errorData.password}}</span>
                        </div>
                    </div>
                    <!-- 用于显示 Firebase 返回的错误 -->
                    <div v-if="errorData.general" class="row">
                        <span class="error">{{errorData.general}}</span>
                    </div>
                    <button class="btn btn-primary" type="button" @click="submitLogin">Login</button>
                    <div class="row">
                        <div class="help">
                            <span>Not Have Account?</span>
                            <router-link to="/register" class="register_link">Register</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import router from '@/router/index.js'

import { auth } from '@/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

const userDataBase = JSON.parse(localStorage.getItem('userData'));
const userData = ref({
    username: '',
    password: ''
})

const credentials = ref({
    email: '',
    password: ''
});
const errorData = ref({
    email: '',
    password: '',
    general: '' // 用于显示 Firebase 返回的错误信息
});

const validateForm = () => {
    validateEmail(true);
    validatePassword(true);
    return errorData.value.email === '' && errorData.value.password === '';
};
const submitLogin = async () => {
    errorData.value.general = ''; // 重置通用错误
    if (validateForm()) {
        try {
            // 使用 Firebase 进行登录
            await signInWithEmailAndPassword(auth, credentials.value.email, credentials.value.password);
            
            // 登录成功后，Firebase 会自动处理用户的会话状态。
            // 我们不需要再手动操作 localStorage 来存储用户信息。
            // 只需要跳转到主页或仪表盘页面即可。
            console.log("Successfully logged in!");
            router.push('/'); 
        } catch (firebaseError) {
            // 处理 Firebase 可能返回的错误
            switch(firebaseError.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorData.value.general = 'Incorrect email or password.';
                    break;
                default:
                    errorData.value.general = 'An unexpected error occurred. Please try again.';
                    console.error("Firebase login error:", firebaseError);
            }
        }
    }
};
// --- 表单验证函数 ---
const validateEmail = (blur) => {
    if (!credentials.value.email) {
        if (blur) errorData.value.email = 'Email is required.';
    } else {
        errorData.value.email = '';
    }
};
const validatePassword = (blur) => { 
    if (!credentials.value.password) {
        if (blur) errorData.value.password = 'Password is required.';
    } else {
        errorData.value.password = '';
    }
};
</script>

<style scoped>
.login_container {
    padding: 1rem;
}
.header {
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10rem;
    height: 10rem;
} 
.login_board {
    background-image:url('@/assets/image/loginAdvertisement.jpg');
    width: 100%;
    height: 40.886vw;
    background-size: 100% 40.886vw;
    display: flex;
    color: rgb(38,142,142);
}
.login_card {
    margin: 6rem 13.8vw 6rem auto;
    width: 28.125vw;
    min-width: 348px;
    background-color: #fff;
    border-radius: 10px;
}
.login_content{
    height: 100%;
    padding: 8rem 2rem 4rem 2rem;
    border-radius: 5px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

}
.btn-primary {
    background-color: rgb(38,142,142);
    border-color: rgb(38,142,142);
}
.help{
    margin: 0 1rem 0 auto;
    color: rgb(79, 84, 84);
}
.register_link {
    text-decoration: none;
    color: rgb(38,142,142);
    padding: 0 0.5rem;
}
.error {
    color: red;
}
.logo {
    background-image: url("@/assets/image/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
}

.slogan {
    background-image: url("@/assets/image/slogan.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
}
.header .row {
    width: 100%;
    margin: 0;
    display: flex;
    justify-content: space-between;
}

</style>