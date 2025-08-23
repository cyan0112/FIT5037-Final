<template>
    <div class="news">
        <div class="container">
            <div class="row"> 
                <div class="col-md-4 col-sm-12">
                    <div class="card"> 
                        <div class="card-body">
                                <h5 class="card-title">Who We Are</h5>
                                <p class="card-text">We are a dedicated team of healthcare professionals, volunteers, and advocates passionate about immigrant health and well-being.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Our Vision</h5>
                            <p class="card-text">A world where every immigrant has access to quality healthcare and the opportunity to live a healthy, fulfilling life.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Our Approach</h5>
                            <p class="card-text">We partner with local clinics, community centers, and volunteers to provide culturally sensitive and linguistically appropriate health services.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="rating" v-if="isAuthenticated">
        <div class="container">
            <div class="row">
                <h1>Rating</h1>
                <div class="col-md-8">
                    <span>How Do You Think This Website Help You?</span>
                    <Rating v-model="ratingData.value">
                        <template #onicon>
                            <img src="@/assets/image/custom-onicon.png" height="24" width="24" />
                        </template>
                        <template #officon>
                            <img src="@/assets/image/custom-officon.png" height="24" width="24" />
                        </template>
                    </Rating>
                </div>
                <div class="col-md-4">
                    <button class="btn-oval w-100" @click="submit">Submit</button>
                    <div v-if="error.value" class="alert alert-danger mt-2" role="alert">{{ error.value }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="ratingTable">
        <div class="container">
            <div class="row"> 
                <div class="col-md-12"> 
                    <h1>Rating Table</h1>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <DataTable :value="ratings" tableStyle="min-width: 50rem">
                        <Column field="name" header="Name"></Column>
                        <Column field="value" header="Reviews">
                            <template #body="slotProps">
                                <Rating :modelValue="slotProps.data.value" readonly />
                            </template>
                        </Column>
                        <template #footer> In total there are {{ ratings ? ratings.length : 0 }} reviews. </template>
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
import Rating from 'primevue/rating';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const ratings = ref(JSON.parse(localStorage.getItem('rating')));

const error = ref({
    value: null
});

const current_user = JSON.parse(localStorage.getItem('user'));
const isAuthenticated = !!current_user;

const ratingData = ref({
    name:'',
    value: 0
})
const submit = () => {
    isValidatedValue(true);
    if(!error.value.value){
        ratingData.value.name = current_user.name;
        ratings.value.push(ratingData.value);
        localStorage.setItem('rating', JSON.stringify(ratings.value));
    }
    ratingData.value={
        name:'',
        value: 0
    }
}
const isValidatedValue = (value) => {
    if(ratingData.value.value == 0){
        if(value){
            error.value.value = "Please select a value";
        }
    }else{
        error.value.value = null;
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
    .rating{
        background-color: turquoise;
        margin-top: 3rem;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        padding: 2rem 0;
    }
    .ratingTable{
        margin-top: 3rem;
    }
</style>
