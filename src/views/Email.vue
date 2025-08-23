<template>
  <div class="contact-form-container">
    <h2>Give a message to the emigrants</h2>
    <form @submit.prevent="submitForm" class="contact-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>
      <div class="form-group">
        <label for="subject">Subject:</label>
        <input type="text" id="subject" v-model="form.subject" required />
      </div>
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea id="message" v-model="form.message" rows="5" required></textarea>
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </button>
    </form>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
  </div>
</template>
<script>
import axios from 'axios'; // 或者使用内置的fetch API
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
      isLoading: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    async submitForm() {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await axios.post('/.netlify/functions/send-email', this.form);
        // 部署到 Netlify 时，直接使用相对路径 /.netlify/functions/send-email
        // 本地开发时，如果你运行了 `netlify dev`，它也会正确代理到本地函数
        this.successMessage = response.data.message;
        this.resetForm(); // 成功后清空表单
      } catch (error) {
        console.error('Error submitting form:', error.response || error);
        this.errorMessage = error.response?.data?.message || '发送失败，请稍后重试。';
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      this.form = {
        name: '',
        email: '',
        subject: '',
        message: '',
      };
    },
  },
};
</script>
<style scoped>
.contact-form-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}
input[type="text"],
input[type="email"],
textarea {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}
textarea {
  resize: vertical; /* 允许垂直调整大小 */
}
button {
  display: block;
  width: 100%;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
button:hover:not(:disabled) {
  background-color: #0056b3;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}
.message.success {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}
.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}
</style>