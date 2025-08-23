<template>
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
    <div class="row"> 
        <div class="line">
        </div>
    </div>
    <div class="content">
        <div class="container">
            <form @submit.prevent="submitForm">
                 <div class="row mb-3"> 
                    <div class="col-md-6 col-sm-6">
                        <!-- 关键改动：将 username 改为 email -->
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" v-model="formData.email" @blur="validateEmail(true)" @input="validateEmail(true)">
                        <div v-if="error.email" class="text-danger">{{ error.email }}</div>
                    </div>
                </div> 
                <div class="row mb-3"> 
                    <div class="col-md-6 col-sm-6">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" v-model="formData.password" @blur="validatePassword(true)" @input="validatePassword(true)">
                        <div v-if="error.password" class="text-danger">{{ error.password }}</div>
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <label for="password_check" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="password_check" v-model="formData.password_check" @blur="validatePasswordCheck(true)" @input="validatePasswordCheck(true)">
                        <div v-if="error.password_check" class="text-danger">{{ error.password_check }}</div>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-12 col-sm-12">
                        <label for="gender" class="form-label">Gender</label>
                        <select class="form-select" id="gender" v-model="formData.gender" @blur="validateGender(true)">
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                        </select>
                        <div class="text-danger" v-if="error.gender">{{ error.gender }}</div>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="reason" class="form-label">Reason For Joining</label>
                    <textarea class="form-control" id="reason" rows="3" v-model="formData.reason" @blur="validateReason(true)" @input="validateReason(true)"></textarea>
                </div>
                <div v-if="error.reason" class="text-danger">{{ error.reason }}</div>
                <div class="text-center">
                    <button type="submit" class="btn btn-primary me-2">Register</button>
                    <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
                </div> 
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '@/router/index.js';
// 导入 Firebase 服务和相关函数
import { auth, db } from '@/firebase.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
const formData = ref({
    email: '',
    password: '',
    password_check: '',
    gender: '',
    reason: ''
});
const error = ref({
    email: null,
    password: null,
    password_check: null,
    gender: null,
    reason: null,
    general: null // 用于显示 Firebase 返回的错误
});
const clearForm = () => {
    formData.value = { email: '', password: '', password_check: '', gender: '', reason: '' };
    error.value = { email: null, password: null, password_check: null, gender: null, reason: null, general: null };
};
const validateForm = () => {
    validateEmail(true);
    validatePassword(true);
    validatePasswordCheck(true);
    validateGender(true);
    validateReason(true);
    // 检查所有错误字段是否都为空
    return Object.values(error.value).every(err => !err);
};
const submitForm = async () => {
    error.value.general = null; // 重置通用错误
    if (validateForm()) {
        try {
            // 1. 使用 Firebase Auth 创建用户
            const userCredential = await createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password);
            const user = userCredential.user;
            // 2. 将用户的额外信息存储到 Firestore
            // 我们使用用户的 UID 作为文档的唯一 ID，将认证信息和数据库信息关联起来
            await setDoc(doc(db, "users", user.uid), {
                email: formData.value.email,
                gender: formData.value.gender,
                reason: formData.value.reason,
                role: "User", // 默认角色为 'User'
                createdAt: new Date()
            });
            alert("Register Successfully!");
            router.push("/login");
        } catch (firebaseError) {
            // 3. 处理 Firebase 可能返回的错误
            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    error.value.general = "This email is already registered.";
                    break;
                case 'auth/weak-password':
                    error.value.general = "The password is too weak. It must be at least 6 characters long.";
                    break;
                default:
                    error.value.general = "An unexpected error occurred. Please try again.";
                    console.error("Firebase registration error:", firebaseError);
            }
        }
    }
};
// --- 表单验证函数 ---
// 我对您的验证函数做了一些微调和补充
const validateEmail = (blur) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.value.email) {
        if (blur) error.value.email = "Email is required.";
    } else if (!emailRegex.test(formData.value.email)) {
        if (blur) error.value.email = "Please enter a valid email address.";
    } else {
        error.value.email = null;
    }
};
const validatePassword = (blur) => { 
    // Firebase 默认密码要求至少6位，这里我们与它保持一致
    if (formData.value.password.length < 6) {
        if (blur) error.value.password = "Password must be at least 6 characters long.";
    } else {
        error.value.password = null;
    }
};
const validatePasswordCheck = (blur) => { 
    if (formData.value.password !== formData.value.password_check) {
        if (blur) error.value.password_check = "Passwords do not match.";
    } else {
        error.value.password_check = null;
    }
};
const validateGender = (blur) => { 
    if (formData.value.gender === '') {
        if (blur) error.value.gender = "Please select a gender.";
    } else {
        error.value.gender = null;
    }
};
const validateReason = (blur) => { 
    if (formData.value.reason.length < 10 || formData.value.reason.length > 200) {
        if (blur) error.value.reason = "Reason must be between 10 and 200 characters long.";
    } else {
        error.value.reason = null;
    }
};
</script>
<style setup>
.header {
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10rem;
    height: 10rem;
} 
.line{
    background-color: rgb(38,142,142);
    height: 4rem;
    width: 100%;
}
.content{
    width: 50%;
    margin: 2rem auto;
}
.form{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
}
.logo {
    background-image: url("@/assets/image/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    height: 100px;
    min-height: 100px;
}

.slogan {
    background-image: url("@/assets/image/slogan.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    height: 100px;
    min-height: 100px;
}
.header .row {
    width: 100%;
    margin: 0;
    display: flex;
    justify-content: space-between;
}

</style>