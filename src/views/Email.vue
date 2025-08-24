<template>
  <div class="email-form">
    <h2>Contact Us</h2>
    <form @submit.prevent="sendEmail">
      <!-- 姓名输入框 -->
      <div class="form-group">
        <label for="name">Name:</label>
        <div class="input-and-keyboard-btn">
          <input type="text" id="name" v-model="formData.name" required readonly aria-label="Name input field" />
          <button type="button" @click="showKeyboard('name')" class="keyboard-toggle-btn" aria-label="Open virtual keyboard for name">⌨</button>
        </div>
      </div>
      <!-- 邮箱输入框 -->
      <div class="form-group">
        <label for="email">Email:</label>
        <div class="input-and-keyboard-btn">
          <input type="email" id="email" v-model="formData.email" required readonly aria-label="Email input field" />
          <button type="button" @click="showKeyboard('email')" class="keyboard-toggle-btn" aria-label="Open virtual keyboard for email">⌨</button>
        </div>
      </div>
      <!-- 消息文本域 -->
      <div class="form-group">
        <label for="message">Message:</label>
        <div class="input-and-keyboard-btn">
          <textarea id="message" v-model="formData.message" required readonly aria-label="Message input field"></textarea>
          <button type="button" @click="showKeyboard('message')" class="keyboard-toggle-btn" aria-label="Open virtual keyboard for message">⌨</button>
        </div>
      </div>
      
      <!-- 附件上传 -->
      <div class="form-group">
        <label for="attachment">Attachment:</label>
        <input type="file" id="attachment" @change="handleFileChange" multiple aria-label="Attachment upload field" />
        <div v-if="selectedFiles.length > 0" class="selected-files-list">
          <p>Selected files:</p>
          <ul>
            <li v-for="file in selectedFiles" :key="file.name">{{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</li>
          </ul>
        </div>
      </div>
      <!-- 提交按钮 -->
      <button type="submit" :disabled="isLoading" aria-live="polite">
        {{ isLoading ? 'Sending...' : 'Send Email' }}
      </button>
      <p v-if="successMessage" class="success" role="status">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    </form>
    <!-- 虚拟键盘 -->
    <div v-if="showVirtualKeyboard" class="virtual-keyboard-overlay" @click="closeKeyboard">
      <div class="virtual-keyboard" @click.stop role="dialog" aria-modal="true" :aria-label="keyboardTitle">
        <div class="keyboard-header">
          <span id="keyboard-title">{{ keyboardTitle }}</span>
          <button @click="closeKeyboard" class="close-btn" aria-label="Close virtual keyboard">×</button>
        </div>
        
        <!-- 字母键盘 -->
        <div v-if="keyboardMode === 'letters'" class="keyboard-section">
          <div class="keyboard-row">
            <button v-for="key in lettersRow1" :key="key" @click="addCharacter(key)" class="key">{{ isUpperCase ? key.toUpperCase() : key }}</button>
          </div>
          <div class="keyboard-row">
            <button v-for="key in lettersRow2" :key="key" @click="addCharacter(key)" class="key">{{ isUpperCase ? key.toUpperCase() : key }}</button>
          </div>
          <div class="keyboard-row">
            <button v-for="key in lettersRow3" :key="key" @click="addCharacter(key)" class="key">{{ isUpperCase ? key.toUpperCase() : key }}</button>
          </div>
        </div>
        <!-- 数字和符号键盘 -->
        <div v-if="keyboardMode === 'numbers'" class="keyboard-section">
          <div class="keyboard-row">
            <button v-for="key in numbersRow1" :key="key" @click="addCharacter(key)" class="key">{{ key }}</button>
          </div>
          <div class="keyboard-row">
            <button v-for="key in numbersRow2" :key="key" @click="addCharacter(key)" class="key">{{ key }}</button>
          </div>
          <div class="keyboard-row">
            <button v-for="key in numbersRow3" :key="key" @click="addCharacter(key)" class="key">{{ key }}</button>
          </div>
        </div>
        <!-- 控制键 -->
        <div class="keyboard-controls">
          <button @click="toggleCase" class="control-key" :aria-label="isUpperCase ? 'Switch to lowercase' : 'Switch to uppercase'">⇧</button>
          <button @click="toggleKeyboardMode" class="control-key" :aria-label="keyboardMode === 'letters' ? 'Switch to numbers and symbols' : 'Switch to letters'">
            {{ keyboardMode === 'letters' ? '123' : 'ABC' }}
          </button>
          <button @click="backspace" class="control-key" aria-label="Backspace">⌫</button>
          <button @click="addSpace" class="control-key space-key" aria-label="Add space">Space</button>
          <button @click="clearField" class="control-key" aria-label="Clear current input field">Clear</button>
        </div>
      </div>
    </div>
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
      
      // 虚拟键盘相关数据
      showVirtualKeyboard: false,
      activeField: '', // 'name', 'email', 'message'
      keyboardMode: 'letters', // 'letters' 或 'numbers'
      isUpperCase: false, // 字母大小写
      
      // 键盘布局 (初始为小写)
      lettersRow1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      lettersRow2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      lettersRow3: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      numbersRow1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      numbersRow2: ['@', '.', '_', '-', '+', '(', ')', '[', ']', '{', '}'],
      numbersRow3: ['!', '#', '$', '%', '^', '&', '*', '?', '/', '\\', '|']
    };
  },
  computed: {
    keyboardTitle() {
      const fieldNames = {
        name: 'Name',
        email: 'Email',
        message: 'Message'
      };
      return `Enter ${fieldNames[this.activeField] || ''}`;
    }
  },
  methods: {
    async handleFileChange(event) {
      this.selectedFiles = Array.from(event.target.files);
      this.encodedAttachments = []; // 重置附件列表
      const MAX_FILE_SIZE_MB = 5; // 定义最大文件大小
      for (const file of this.selectedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            this.errorMessage = `文件 "${file.name}" 大小超过 ${MAX_FILE_SIZE_MB}MB，将不会上传。`;
            // 可以在这里移除过大的文件，或只是显示错误不上传
            this.selectedFiles = this.selectedFiles.filter(f => f.name !== file.name);
            continue; 
        }
        const base64Content = await this.readFileAsBase64(file);
        if (base64Content) {
          this.encodedAttachments.push({
            filename: file.name,
            type: file.type || 'application/octet-stream', // 提供默认MIME类型
            content: base64Content,
          });
        }
      }
    },
    readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
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
      // 可以在此处添加前端验证，确保所有必填字段已填写
      if (!this.formData.name || !this.formData.email || !this.formData.message) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }
      // 简单邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
          this.errorMessage = 'Please enter a valid email address.';
          return;
      }
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const payload = {
          ...this.formData,
          attachments: this.encodedAttachments, // 包含Base64编码后的附件
        };
        // 请将此 URL 替换为你的 Cloudflare Worker 的实际 URL
        const response = await fetch('https://email.cyan0112.workers.dev/', { 
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
          this.encodedAttachments = []; // 清空编码附件
          const fileInput = document.getElementById('attachment');
          if (fileInput) fileInput.value = ''; // 清除文件输入字段值
        } else {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          this.errorMessage = `Failed to send email: ${errorData.error || 'Unknown error'}`;
          console.error('API Error:', { status: response.status, data: errorData });
        }
      } catch (error) {
        this.errorMessage = `An error occurred: ${error.message}`;
        console.error('Network or other error:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 虚拟键盘相关方法
    showKeyboard(field) {
      this.activeField = field;
      this.showVirtualKeyboard = true;
      this.keyboardMode = 'letters'; // 每次打开默认为字母模式
      this.isUpperCase = false; // 每次打开默认为小写
    },
    closeKeyboard() {
      this.showVirtualKeyboard = false;
      this.activeField = '';
    },
    addCharacter(char) {
      if (this.activeField) {
        const actualChar = this.isUpperCase ? char.toUpperCase() : char;
        this.formData[this.activeField] += actualChar;
      }
    },
    backspace() {
      if (this.activeField) {
        this.formData[this.activeField] = this.formData[this.activeField].slice(0, -1);
      }
    },
    addSpace() {
      if (this.activeField) {
        this.formData[this.activeField] += ' ';
      }
    },
    clearField() {
      if (this.activeField) {
        this.formData[this.activeField] = '';
      }
    },
    toggleCase() {
      this.isUpperCase = !this.isUpperCase;
      // 注意：这里我们不再需要手动 map `lettersRowX`，
      // 因为 template 中的按钮文本会根据 `isUpperCase` 动态渲染。
    },
    toggleKeyboardMode() {
      this.keyboardMode = this.keyboardMode === 'letters' ? 'numbers' : 'letters';
    }
  },
};
</script>
<style scoped>
/* 基本表单样式 */
.email-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* 稍微增加阴影 */
  background-color: #fff;
}
h2 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}
.form-group {
  margin-bottom: 18px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}
/* 键盘图标与输入框同行的样式 */
.input-and-keyboard-btn {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 输入框和按钮之间的间距 */
}
.input-and-keyboard-btn input,
.input-and-keyboard-btn textarea {
  flex-grow: 1; /* 让输入框/文本域占据剩余空间 */
  width: auto; /* 覆盖默认的 100% 宽度 */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}
.input-and-keyboard-btn textarea {
  resize: vertical;
  min-height: 80px; /* 稍微调小默认高度 */
}
/* 键盘切换按钮样式 */
.keyboard-toggle-btn {
  background-color: #4a90e2; /* 蓝色 */
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem; /* 稍微增大图标 */
  line-height: 1; /* 确保图标居中 */
  flex-shrink: 0; /* 防止按钮收缩 */
  transition: background-color 0.2s ease;
}
.keyboard-toggle-btn:hover {
  background-color: #357bd8;
}
/* 附件列表样式 */
.selected-files-list {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px dashed #ddd;
  border-radius: 4px;
}
.selected-files-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.selected-files-list li {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}
/* 提交按钮 */
button[type="submit"] {
  width: 100%;
  background-color: #28a745; /* 绿色 */
  color: white;
  padding: 12px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.2s ease;
  margin-top: 20px;
}
button[type="submit"]:hover:not(:disabled) {
  background-color: #218838;
}
button[type="submit"]:disabled {
  background-color: #90ee90; /* 禁用状态颜色 */
  cursor: not-allowed;
}
/* 消息提示 */
.success {
  color: #28a745; /* 绿色 */
  background-color: #e6ffed;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
  border: 1px solid #c3e6cb;
}
.error {
  color: #dc3545; /* 红色 */
  background-color: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
  border: 1px solid #f5c6cb;
}
/* 虚拟键盘样式改进 */
.virtual-keyboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* 更深的半透明背景 */
  display: flex;
  justify-content: center;
  align-items: flex-end; /* **改变此处：让键盘固定在底部** */
  z-index: 1000;
  padding-bottom: 20px; /* 底部间距 */
}
.virtual-keyboard {
  background-color: #333; /* **改变此处：更深的背景色** */
  border-radius: 12px 12px 0 0; /* 顶部圆角，底部直角，像手机键盘 */
  padding: 20px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.4); /* 顶部阴影 */
  max-width: 700px; /* 稍微扩大键盘宽度 */
  width: 95%; /* 响应式宽度 */
  color: white; /* 默认文本颜色变亮 */
}
.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.2rem;
  color: #eee;
}
.close-btn {
  background: none;
  border: none;
  font-size: 28px; /* 增大关闭按钮 */
  cursor: pointer;
  color: #ccc;
  line-height: 1;
  padding: 5px; /* 增加点击区域 */
  margin: -5px; /* 抵消 padding */
}
.close-btn:hover {
  color: white;
}
.keyboard-section {
  margin-bottom: 15px;
}
.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 8px; /* 增加按键间距 */
  margin-bottom: 8px;
}
.key {
  flex-grow: 1; /* 按键等宽填充 */
  padding: 15px 10px; /* **改变此处：增大按键大小** */
  border: 1px solid #555; /* **改变此处：更深的边框色** */
  background-color: #555; /* **改变此处：更深的背景色** */
  color: white; /* **改变此处：白色文字** */
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.2s, color 0.2s;
  min-width: 35px; /* 确保最小宽度 */
}
.key:hover {
  background-color: #777; /* **改变此处：hover 状态颜色** */
  border-color: #777;
}
.key:active {
  background-color: #bbb; /* **改变此处：active 状态颜色** */
  color: #333; /* **改变此处：按下时文字颜色** */
}
.keyboard-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 15px;
}
.control-key {
  background-color: #4a90e2; /* 蓝色控制键 */
  color: white;
  padding: 12px 18px; /* **改变此处：增大控制键大小** */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.2s ease;
}
.control-key:hover {
  background-color: #357bd8;
}
.space-key {
  flex-grow: 2; /* 让空格键更宽一点 */
  min-width: 100px;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .email-form {
    padding: 15px;
  }
  .input-and-keyboard-btn {
    flex-direction: column; /* 小屏上输入框和按钮可能需要堆叠 */
    align-items: flex-start;
    gap: 8px;
  }
  .input-and-keyboard-btn input,
  .input-and-keyboard-btn textarea {
    width: 100%; /* 确保在堆叠时宽度为100% */
  }
  .keyboard-toggle-btn {
    width: auto;
    align-self: flex-end; /* 让按钮靠右 */
  }
  .virtual-keyboard {
    width: 98%;
    padding: 15px;
  }
  
  .key {
    padding: 12px 8px; /* 小屏上减小按键 padding */
    font-size: 1rem;
    min-width: 30px;
  }
  .keyboard-row {
    gap: 5px;
    margin-bottom: 5px;
  }
  .keyboard-controls {
    gap: 5px;
  }
  .control-key {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
  .space-key {
    min-width: 80px;
  }
}
@media (max-width: 480px) {
    .keyboard-toggle-btn {
        font-size: 1rem;
        padding: 6px 10px;
    }
    .key {
        font-size: 0.9rem;
        padding: 10px 5px;
        min-width: unset;
    }
    .control-key {
        font-size: 0.8rem;
        padding: 8px 12px;
    }
}
</style>