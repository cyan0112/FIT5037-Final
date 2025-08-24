<template>
  <div class="email-form">
    <h2>Contact Us</h2>
    <form @submit.prevent="sendEmail">
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="formData.name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="formData.email" required />
      </div>
      <div>
        <label for="message">Message:</label>
        <textarea id="message" v-model="formData.message" required></textarea>
      </div>
      <div>
        <label for="attachment">Attachment:</label>
        <!-- 允许用户上传图片、PDF 等文件 -->
        <input type="file" id="attachment" @change="handleFileChange" multiple />
        <!-- 可以显示已选择的文件名 -->
        <div v-if="selectedFiles.length > 0">
          Selected files:
          <ul>
            <li v-for="file in selectedFiles" :key="file.name">{{ file.name }}</li>
          </ul>
        </div>
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Sending...' : 'Send Email' }}
      </button>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        formData: {
          name: '',
          email: '',
          message: '',
        },
        selectedFiles: [], // 用于存储用户选择的文件对象
        encodedAttachments: [], // 用于存储Base64编码后的附件数据
        isLoading: false,
        successMessage: '',
        errorMessage: '',
      };
    },
    methods: {
      async handleFileChange(event) {
        this.selectedFiles = Array.from(event.target.files);
        this.encodedAttachments = []; // 重置附件列表
        for (const file of this.selectedFiles) {
          // readFileAsBase64 是一个辅助函数，用于将文件读取并编码
          const base64Content = await this.readFileAsBase64(file);
          if (base64Content) {
            this.encodedAttachments.push({
              filename: file.name,
              type: file.type, // 例如: image/png, application/pdf
              content: base64Content,
            });
          }
        }
      },
      readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // FileReader.readAsDataURL 会返回 'data:image/png;base64,.....'
            // SendGrid API 需要纯粹的 Base64 字符串，所以需要移除前缀
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = error => reject(error);
          if (file) {
            reader.readAsDataURL(file); // 读取文件为 Data URL
          } else {
            resolve(null);
          }
        });
      },
      async sendEmail() {
        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';
        try {
          const payload = {
            ...this.formData,
            // 如果有附件，就包含附件数据
            attachments: this.encodedAttachments,
          };
          const response = await fetch('/api/_email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          if (response.ok) {
            this.successMessage = 'Email sent successfully!';
            this.formData = { name: '', email: '', message: '' }; // 清空表单
            this.selectedFiles = []; // 清空文件选择
            this.encodedAttachments = [];
            // 可以重置文件输入字段，使其清除之前选择的文件
            const fileInput = document.getElementById('attachment');
            if (fileInput) fileInput.value = '';
          } else {
            const errorData = await response.json().catch(() => response.text());
            this.errorMessage = `Failed to send email: ${JSON.stringify(errorData)}`;
            console.error('API Error:', errorData);
          }
        } catch (error) {
          this.errorMessage = `An error occurred: ${error.message}`;
          console.error('Network or other error:', error);
        } finally {
          this.isLoading = false;
        }
      },
    },
  };
</script>
<style scoped>
/* 你的 CSS 样式 */
.email-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
div {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input[type="text"],
input[type="email"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
textarea {
  resize: vertical;
  min-height: 100px;
}
button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.success {
  color: green;
  margin-top: 10px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>