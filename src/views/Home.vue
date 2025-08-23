<template>
    <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div class="carousel-inner">
            <div class="carousel-item active">
                <img src="@/assets/image/image1.png" class="d-block w-100" alt="Slide 1">
            </div>
            <div class="carousel-item">
                <img src="@/assets/image/image2.png" class="d-block w-100" alt="Slide 2">
            </div>
            <div class="carousel-item">
                <img src="@/assets/image/image3.png" class="d-block w-100" alt="Slide 3">
            </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>
    <div class="button-group1">
        <div class="container">
            <div class="row flex-column flex-md-row">
                <div class="col-md-6 col-sm-12 ">
                    <button class="btn-oval w-100" @click="openDonationSearch">Donation Search</button>
                </div>
                <div class="col-md-6 col-sm-12 ">
                    <button class="btn-oval w-100" @click="openDonation">Donation</button>
                </div>
            </div>
        </div>
    </div>
    <div class="news">
        <div class="container">
            <div class="row"> 
                <div class="col-md-4 col-sm-12">
<div class="card"> 
                        <img src="@/assets/image/image1.png" class="card-img-top" alt="...">
                        <div class="card-body">
                                <h5 class="card-title">Health for All</h5>
                                <p class="card-text">Your donation provides essential medical care to immigrant families.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-12">
<div class="card">
                        <img src="@/assets/image/image2.png" class="card-img-top" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">A New Beginning</h5>
                            <p class="card-text">Help us provide mental health support for those starting a new life.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-12">
<div class="card">
                        <img src="@/assets/image/image3.png" class="card-img-top" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">Building a Community</h5>
                            <p class="card-text">Support our efforts to build a healthy and strong immigrant community.</p>
                        </div>
                    </div>
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
import { useRouter } from 'vue-router';

const router=useRouter();
const openDonationSearch = () => {
    router.push('/donation');
}
const openDonation = () => {
    router.push('/donation');
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
        margin-bottom: 3rem;
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
</style>
