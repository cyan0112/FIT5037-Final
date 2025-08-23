import {createRouter, createWebHistory} from 'vue-router'

import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Donation from '@/views/Donation.vue'
import Layout from '@/views/Layout.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Table from '@/views/ManageTable.vue'
import Map from '@/views/Geo.vue'


const routes = [
    { 
        path: '/', 
        component: Layout, 
        children:[
            { path: '', component: Home },
            { path: '/about', component: About },
            { path: '/donation', component: Donation },
            { path: '/table', component: Table},
            { path: '/geo', component: Map}
        ] },
    { path: '/login', component: Login },
    { path: '/register', component: Register }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router