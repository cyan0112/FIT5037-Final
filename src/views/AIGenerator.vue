<template>
  <div class="ai-generator-container">
    <div class="header-section">
      <h1 class="page-title">AI 内容生成器</h1>
      <p class="page-subtitle">使用 Google Gemini API 智能生成内容</p>
    </div>

    <div class="generator-card">
      <div class="input-section">
        <div class="form-group">
          <label for="prompt">输入提示词</label>
          <textarea 
            id="prompt"
            v-model="prompt"
            class="prompt-input"
            placeholder="描述您想要生成的内容..."
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="contentType">内容类型</label>
          <select v-model="contentType" class="content-type-select">
            <option value="story">故事</option>
            <option value="article">文章</option>
            <option value="email">邮件</option>
            <option value="social">社交媒体内容</option>
            <option value="code">代码</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label for="tone">语气风格</label>
          <select v-model="tone" class="tone-select">
            <option value="professional">专业</option>
            <option value="casual">轻松</option>
            <option value="creative">创意</option>
            <option value="formal">正式</option>
            <option value="friendly">友好</option>
          </select>
        </div>

        <div class="form-group">
          <label for="maxTokens">生成长度</label>
          <input 
            type="range" 
            v-model.number="maxTokens" 
            min="50" 
            max="1000" 
            step="50"
            class="token-slider"
          >
          <span class="token-value">{{ maxTokens }} 字符</span>
        </div>
      </div>

      <div class="action-section">
        <button 
          @click="generateContent" 
          :disabled="isLoading || !prompt.trim()"
          class="generate-btn"
        >
          <span v-if="!isLoading">🚀 生成内容</span>
          <span v-else>⏳ 生成中...</span>
        </button>
        
        <button 
          @click="clearAll" 
          class="clear-btn"
        >
          🗑️ 清空内容
        </button>
      </div>

      <div v-if="error" class="error-message">
        ❌ {{ error }}
      </div>

      <div v-if="generatedContent" class="result-section">
        <div class="result-header">
          <h3>生成结果</h3>
          <button @click="copyToClipboard" class="copy-btn">
            📋 {{ copied ? '已复制' : '复制内容' }}
          </button>
        </div>
        <div class="generated-content">
          <pre>{{ generatedContent }}</pre>
        </div>
      </div>

      <div v-if="recentGenerations.length > 0" class="history-section">
        <h3>最近生成记录</h3>
        <div class="history-list">
          <div 
            v-for="(item, index) in recentGenerations" 
            :key="index"
            class="history-item"
            @click="loadFromHistory(item)"
          >
            <div class="history-prompt">{{ item.prompt.substring(0, 50) }}...</div>
            <div class="history-content">{{ item.content.substring(0, 100) }}...</div>
            <div class="history-time">{{ formatTime(item.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const prompt = ref('')
const contentType = ref('story')
const tone = ref('professional')
const maxTokens = ref(300)
const generatedContent = ref('')
const isLoading = ref(false)
const error = ref('')
const copied = ref(false)
const recentGenerations = ref([])

// Gemini API 配置
const GEMINI_API_KEY = 'AIzaSyB3KMAF-mESi2KHvHM3ite0b8t-0zJc9vU' // 请替换为您的实际API密钥
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

// 生成内容
const generateContent = async () => {
  if (!prompt.value.trim()) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: `请根据以下要求生成内容：
          类型：${contentType.value}
          语气：${tone.value}
          最大长度：${maxTokens.value}字符
          
          提示词：${prompt.value}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens.value,
      }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      generatedContent.value = data.candidates[0].content.parts[0].text
      saveToHistory()
    } else {
      throw new Error('无法生成内容，请重试')
    }
  } catch (err) {
    error.value = err.message || '生成失败，请检查网络连接和API密钥'
    console.error('生成错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 保存到历史记录
const saveToHistory = () => {
  const newItem = {
    prompt: prompt.value,
    content: generatedContent.value,
    contentType: contentType.value,
    tone: tone.value,
    timestamp: new Date().toISOString()
  }
  
  recentGenerations.value.unshift(newItem)
  
  // 限制历史记录数量
  if (recentGenerations.value.length > 5) {
    recentGenerations.value = recentGenerations.value.slice(0, 5)
  }
  
  // 保存到本地存储
  localStorage.setItem('aiGeneratorHistory', JSON.stringify(recentGenerations.value))
}

// 从历史记录加载
const loadFromHistory = (item) => {
  prompt.value = item.prompt
  contentType.value = item.contentType
  tone.value = item.tone
  generatedContent.value = item.content
}

// 清空所有内容
const clearAll = () => {
  prompt.value = ''
  generatedContent.value = ''
  error.value = ''
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedContent.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    error.value = '复制失败，请手动复制'
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 加载历史记录
onMounted(() => {
  const saved = localStorage.getItem('aiGeneratorHistory')
  if (saved) {
    try {
      recentGenerations.value = JSON.parse(saved)
    } catch (err) {
      console.error('加载历史记录失败:', err)
    }
  }
})
</script>

<style scoped>
.ai-generator-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 1.2rem;
}

.generator-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.prompt-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.prompt-input:focus {
  outline: none;
  border-color: #3498db;
}

.content-type-select,
.tone-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.token-slider {
  width: 100%;
  margin: 0.5rem 0;
}

.token-value {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.action-section {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.generate-btn,
.clear-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  background: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background: #c0392b;
}

.error-message {
  background: #ffe5e5;
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.result-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.copy-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.generated-content {
  background: white;
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  max-height: 400px;
  overflow-y: auto;
}

.history-section {
  margin-top: 2rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background: #e9ecef;
}

.history-prompt {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.history-content {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.history-time {
  font-size: 0.8rem;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .ai-generator-container {
    padding: 1rem;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .generate-btn,
  .clear-btn {
    width: 100%;
  }
}
</style>