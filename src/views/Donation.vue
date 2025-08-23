<template>
    <div class="news">
        <div class="container">
            <div class="row"> 
                <div class="col-md-4 col-sm-12">
                    <div class="card"> 
                        <div class="card-body">
                                <h5 class="card-title">Card title</h5>
                                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Card title</h5>
                            <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Card title</h5>
                            <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="donation">
        <div class="container">
            <form @submit.prevent="confirm">
                <div class="row mb-3">
                    <div class="col-md-6 col-sm-6">
                        <h1>Donation</h1>
                    </div> 
                </div>  
                <div class="row mb-3"> 
                    <div class="col-md-6 col-sm-6">
                        <label for="name" class="form-label">UserName</label>
                        <input type="text" class="form-control" id="name" v-model="userData.name" @blur="isValidUsername(true)" @input="isValidUsername(true)">
                        <div v-if="error.name" class="text-danger">{{ error.name }}</div>
                    </div>
                </div> 
                <div class="row mb-3"> 
                    <div class="col-md-6 col-sm-6">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" v-model="userData.password" @blur="isValidPassword(true)" @input="isValidPassword(true)">
                        <div v-if="error.password" class="text-danger">{{ error.password }}</div>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6 col-sm-6">
                        <label abel for="itemName" class="form-label">ItemName</label>
                        <input type="text" class="form-control" id="itemName" v-model="userData.itemName" @blur="isValidItemName(true)" @input="isValidItemName(true)">    
                        <div v-if="error.itemName" class="text-danger">{{ error.itemName }}</div>
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <label abel for="amount" class="form-label">Amount</label>
                        <input type="text" class="form-control" id="amount" v-model="userData.amount" @blur="isValidAmount(true)" @input="isValidAmount(true)"></input>    
                        <div v-if="error.amount" class="text-danger">{{ error.amount }}</div>
                    </div>
                </div>
                <div class="text-center">
                    <button type="submit" class="btn btn-primary me-2">Confirm</button>
                    <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
                </div> 
            </form>
        </div>
    </div>
    <div class="donationTable">
        <div class="container">
            <div class="row"> 
                <div class="col-md-12"> 
                    <h1>Donation Table</h1>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <DataTable :value="donations" tableStyle="min-width: 50rem">
                        <Column field="name" header="Name"></Column>
                        <Column field="itemName" header="ItemName"></Column>
                        <Column field="amount" header="Amount"></Column>
                        <template #footer> In total there are {{ donations ? donations.length : 0 }} donations. </template>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
    <footer>
       <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h5>About Us</h5>
                    <p>We are committed to providing high-quality charitable donation services, connecting caring individuals with those in need.</p>
                </div>
                <div class="col-md-4">
                    <h5>Contact Information</h5>
                    <ul class="contact-info">
                        <li><i class="fas fa-envelope"></i> Email: contact@charity.org</li>
                        <li><i class="fas fa-phone"></i> Tel: +86 123 4567 8900</li>
                        <li><i class="fas fa-map-marker-alt"></i> Address: Suzhou China</li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5>Developer</h5>
                    <p>Name: Chen Yang</p>
                    <p>ID: 35524464</p>
                    <p>Email: cyan0112@student.monash.edu</p>
                </div>
            </div>
            <div class="row">
                <div class="col-12 text-center copyright">
                <p>&copy; 2025 Migrant Charity Web. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>
</template>
<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const userDataBase = JSON.parse(localStorage.getItem('userData'));

const donations = ref(JSON.parse(localStorage.getItem('donation')));

const userData = ref({
    name: '',
    password: '',
    itemName: '',
    amount: ''
})

const error = ref({
    name: '',
    password: '',
    itemName: '',
    amount: ''
})

const confirm = () => {
    isValidUsername(true)
    isValidPassword(true)
    isValidItemName(true)
    isValidAmount(true)
    if (error.value.name === '' && error.value.password === '' && error.value.itemName === '' && error.value.amount === '') {
        if ( checkLegalUser(userData.value.name,userData.value.password )) {
            const currentUser_data = {
                "name":userData.value.name,
                "itemName":userData.value.itemName,
                "amount":userData.value.amount
            }
            donations.value.push(currentUser_data)
            localStorage.setItem('donation', JSON.stringify(donations.value))
            alert('Donation Success')
            clearForm()
        }
        else{
            alert('Username or Password is incorrect')
        }
    }
}

const checkLegalUser = (username,password) => {
    return userDataBase.some((user) => user.name === username && user.password === password)
}

const isValidUsername = (blur) => {
    if (userData.value.name.length === 0 || userData.value.name.length > 20) {
        if (blur) {
             error.value.name = 'Username is required and must be less than 20 characters'
        }
    } else {
        error.value.name = ''
    }
}
const clearForm = () => { 
    userData.value = {
        name: '',
        password: '',
        itemName: '',
        amount: ''
    }
    error.value = {
        name: '',
        password: '',
        itemName: '',
        amount: ''
    }
}

const isValidPassword = (blur) => { 
    if (userData.value.password.length === 0 || userData.value.password.length > 20) {
        if (blur) {
             error.value.password = 'Password is required and must be less than 20 characters'
        }
    } else {
        error.value.password = ''
    }
}
const isValidItemName = (blur) => {
    if (userData.value.itemName.length === 0 || userData.value.itemName.length > 20) {
        if (blur) {
            error.value.itemName = 'ItemName is required and must be less than 20 characters'
        }
    } else {
        error.value.itemName = ''
    }
}
const isValidAmount = (blur) => {
    if (userData.value.amount.length === 0 || userData.value.amount.length > 7) {
        if (blur) {
            error.value.amount = 'Amount is required and must be less than 7 characters'
        }
    } else {
        error.value.amount = ''
    }
}
</script>
<style scoped>
    .carousel-item {
        height: 500px;
    }
    .carousel-item img {
        height: 100%;
        width: 100%;
    }
    .btn-oval {
        width: 240px;
        height: 50px;
        border-radius: 25px;
        background-color: rgb(38, 142, 142);
        color: white;
        border: none;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .button-group1{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 3rem;
    }
    .news .container .row{
        height: 300px;
        margin-top: 2rem;
    }
    .card {
        height: 100%;
    }
    footer{
        background-color: rgb(38, 142, 142);
        color: white;
        padding: 3rem;
        text-align: center;
        margin-top: 3rem;
    }
    .donation{
        background-color: turquoise;
        margin-top: 3rem;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        padding: 2rem 0;
    }
    .donationTable{
        margin-top: 3rem;
    }
</style>