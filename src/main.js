import { createApp } from 'vue'
import router from '@/router/index.js'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App.vue'
import Data from '@/assets/data/UserData.json'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ratings from '@/assets/data/RatingData.json'
import donations from '@/assets/data/DonationData.json'
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

if (!localStorage.getItem('donation')) {
    localStorage.setItem('donation', JSON.stringify(donations))
}
if (!localStorage.getItem('userData')) {
    localStorage.setItem('userData', JSON.stringify(Data))
}
if (!localStorage.getItem('rating')) {
    localStorage.setItem('rating', JSON.stringify(ratings))
}
const app = createApp(App)
app.use(PrimeVue,{
    themes: {
        preset: Aura
    }
})
app.component('EasyDataTable', Vue3EasyDataTable);
app.use(router)
app.mount('#app')
