<template>
    <header class="header">
        <div class="row flex-column flex-md-row">
            <div class="logo">
            </div>
            <div class="slogan">
            </div>
<div class="authentication">
        <span v-if="isLoggedIn" class="user-email">{{ userEmail }}</span>
        <router-link to="/login" class="btn btn-success" v-if="!isLoggedIn">Login</router-link>
        <router-link to="/register" class="btn btn-success" v-if="!isLoggedIn">Register</router-link>
        <button @click="logout" class="btn btn-danger" v-else>Logout</button>
      </div>
        </div>
    </header>
  <div class="header_header">
    <router-link class="header_header_link" to="/">Home</router-link>
    <router-link class="header_header_link" to="/about">About</router-link>
    <router-link class="header_header_link" to="/donation">Donation</router-link>
    <router-link class="header_header_link" to="/table">Tables</router-link>
    <router-link class="header_header_link" to="/geo">Map</router-link>
    <router-link class="header_header_link" to="/email">Email</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const isLoggedIn = ref(false);
const userEmail = ref('');
const auth = getAuth();

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true;
      userEmail.value = user.email;
      localStorage.setItem('user', JSON.stringify({ email: user.email }));
    } else {
      isLoggedIn.value = false;
      userEmail.value = '';
    }
  });
});

const logout = () => {
  signOut(auth).then(() => {
    localStorage.removeItem('user');
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
    console.error('Logout Error:', error);
  });
};
</script>

<style scoped>
.header{
    padding: 2rem 10rem;
    background-color: rgb(255, 255, 255);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header_link{
    text-decoration: none;
    color: black;
}
.authentication{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 15%;
}
.header_header {
    display: flex;
    justify-content: space-between;
    align-items: center; 
    width: 100%;
    padding: 1rem 10rem;
    background-color: rgb(38, 142, 142);
    height: 4rem;
}
.header_header_link {
    text-decoration: none;
    color: rgb(255, 255, 255);
    font-weight: bolder;
}
.logo {
    background-image: url("@/assets/image/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 40%;
}

.slogan {
    background-image: url("@/assets/image/slogan.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 40%;
}
</style>
