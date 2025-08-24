<template>
  <div class="ai-generator-container">
    <div class="header-section">
      <h1 class="page-title">AI Content Generator</h1>
      <p class="page-subtitle">Intelligent content creation using Google Gemini API</p>
    </div>

    <div class="generator-card">
      <div class="input-section">
        <div class="form-group">
          <label for="prompt">Input Prompt</label>
          <textarea 
            id="prompt"
            v-model="prompt"
            class="prompt-input"
            placeholder="Describe what you want to generate..."
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="contentType">Content Type</label>
          <select v-model="contentType" class="content-type-select">
            <option value="story">Story</option>
            <option value="article">Article</option>
            <option value="email">Email</option>
            <option value="social">Social Media Content</option>
            <option value="code">Code</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="tone">Tone Style</label>
          <select v-model="tone" class="tone-select">
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="creative">Creative</option>
            <option value="formal">Formal</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>

        <div class="form-group">
          <label for="maxTokens">Generation Length</label>
          <input 
            type="range" 
            v-model.number="maxTokens" 
            min="50" 
            max="1000" 
            step="50"
            class="token-slider"
          >
          <span class="token-value">{{ maxTokens }} characters</span>
        </div>
      </div>

      <div class="action-section">
        <button 
          @click="generateContent" 
          :disabled="isLoading || !prompt.trim()"
          class="generate-btn"
        >
          <span v-if="!isLoading">🚀 Generate Content</span>
          <span v-else>⏳ Generating...</span>
        </button>
        
        <button 
          @click="clearAll" 
          class="clear-btn"
        >
          🗑️ Clear All
        </button>
      </div>

      <div v-if="error" class="error-message">
        ❌ {{ error }}
      </div>

      <div v-if="generatedContent" class="result-section">
        <div class="result-header">
          <h3>Generated Result</h3>
          <button @click="copyToClipboard" class="copy-btn">
            📋 {{ copied ? 'Copied' : 'Copy Content' }}
          </button>
        </div>
        <div class="generated-content">
          <pre>{{ generatedContent }}</pre>
        </div>
      </div>

      <div v-if="recentGenerations.length > 0" class="history-section">
        <h3>Recent Generation History</h3>
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

// Reactive data
const prompt = ref('')
const contentType = ref('story')
const tone = ref('professional')
const maxTokens = ref(300)
const generatedContent = ref('')
const isLoading = ref(false)
const error = ref('')
const copied = ref(false)
const recentGenerations = ref([])

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyB3KMAF-mESi2KHvHM3ite0b8t-0zJc9vU' // Replace with your actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent' // 使用更稳定的1.5-flash版本

// Generate content
const generateContent = async () => {
  if (!prompt.value.trim()) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: `Please generate content based on the following requirements:
          Type: ${contentType.value}
          Tone: ${tone.value}
          Maximum length: ${maxTokens.value} characters
          
          Prompt: ${prompt.value}`
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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    console.log('完整API响应:', data)
    console.log('响应结构:', JSON.stringify(data, null, 2))
    
    // 更详细的调试信息
    if (data.candidates) {
      console.log('候选人数量:', data.candidates.length)
      console.log('第一个候选人:', data.candidates[0])
    }
    
    let generatedText = ''
    
    // 策略1: 标准Gemini响应结构
    if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      console.log('处理候选人:', candidate)
      
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn('完成原因:', candidate.finishReason)
      }
      
      if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
        console.log('内容部分:', candidate.content.parts)
        
        // 检查所有部分
        candidate.content.parts.forEach((part, index) => {
          console.log(`部分 ${index}:`, part)
          if (part.text) {
            console.log(`部分 ${index} 文本:`, part.text)
            generatedText += part.text
          } else {
            console.log(`部分 ${index} 不是文本类型`, part)
          }
        })
      } else {
        console.log('内容结构异常:', {
          hasContent: !!candidate.content,
          hasParts: !!(candidate.content && candidate.content.parts),
          partsType: candidate.content && candidate.content.parts ? typeof candidate.content.parts : 'N/A'
        })
      }
    }
    
    // 策略2: 处理空候选人的情况
    else if (data.candidates && data.candidates.length === 0) {
      console.log('候选人数组为空')
    }
    
    // 策略3: 检查是否有错误信息
    if (data.error) {
      console.error('API错误:', data.error)
      throw new Error(`API错误: ${data.error.message || JSON.stringify(data.error)}`)
    }
    
    // 策略4: 检查内容阻止
    if (data.promptFeedback) {
      console.log('提示反馈:', data.promptFeedback)
      if (data.promptFeedback.blockReason) {
        throw new Error(`内容被阻止: ${data.promptFeedback.blockReason}`)
      }
      if (data.promptFeedback.safetyRatings) {
        console.log('安全评级:', data.promptFeedback.safetyRatings)
      }
    }
    
    // 策略5: 检查其他可能的响应结构
    const possibleTextPaths = [
      'candidates[0].content.parts[0].text',
      'candidates[0].text',
      'text',
      'result',
      'output'
    ]
    
    possibleTextPaths.forEach(path => {
      const value = path.split('.').reduce((obj, key) => {
        if (key.includes('[')) {
          const [k, i] = key.replace(']', '').split('[')
          return obj && obj[k] ? obj[k][parseInt(i)] : undefined
        }
        return obj ? obj[key] : undefined
      }, data)
      
      if (value && typeof value === 'string') {
        console.log(`在路径 ${path} 找到文本:`, value)
        generatedText = value
      }
    })
    
    console.log('最终生成的文本:', generatedText)
    
    if (generatedText && generatedText.trim()) {
      generatedContent.value = generatedText.trim()
      saveToHistory()
    } else {
      // 提供更详细的错误信息
      const debugInfo = {
        hasCandidates: !!(data.candidates && data.candidates.length > 0),
        candidatesLength: data.candidates ? data.candidates.length : 0,
        hasError: !!data.error,
        hasPromptFeedback: !!data.promptFeedback,
        keys: Object.keys(data)
      }
      console.error('无法获取有效内容，调试信息:', debugInfo)
      throw new Error(`无法从API获取有效内容。响应结构: ${JSON.stringify(debugInfo)}`)
    }
    
  } catch (err) {
    console.error('Generation error:', err)
    
    // Enhanced error handling
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      error.value = 'Network error. Please check your internet connection.'
    } else if (err.message.includes('API key') || err.message.includes('403')) {
      error.value = 'Invalid API key or insufficient permissions. Please check your Gemini API key.'
    } else if (err.message.includes('400')) {
      error.value = 'Invalid request format. Please check your prompt and parameters.'
    } else if (err.message.includes('429')) {
      error.value = 'Rate limit exceeded. Please try again later.'
    } else if (err.message.includes('500') || err.message.includes('503')) {
      error.value = 'Server error. Please try again later.'
    } else {
      error.value = err.message || 'Generation failed. Please try again with a different prompt.'
    }
  } finally {
    isLoading.value = false
  }
}

// Save to history
const saveToHistory = () => {
  const newItem = {
    prompt: prompt.value,
    content: generatedContent.value,
    contentType: contentType.value,
    tone: tone.value,
    timestamp: new Date().toISOString()
  }
  
  recentGenerations.value.unshift(newItem)
  
  // Limit history records
  if (recentGenerations.value.length > 5) {
    recentGenerations.value = recentGenerations.value.slice(0, 5)
  }
  
  // Save to local storage
  localStorage.setItem('aiGeneratorHistory', JSON.stringify(recentGenerations.value))
}

// Load from history
const loadFromHistory = (item) => {
  prompt.value = item.prompt
  contentType.value = item.contentType
  tone.value = item.tone
  generatedContent.value = item.content
}

// Clear all content
const clearAll = () => {
  prompt.value = ''
  generatedContent.value = ''
  error.value = ''
}

// Copy to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedContent.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    error.value = 'Copy failed, please copy manually'
  }
}

// Format time
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US')
}

// Load history records
onMounted(() => {
  const saved = localStorage.getItem('aiGeneratorHistory')
  if (saved) {
    try {
      recentGenerations.value = JSON.parse(saved)
    } catch (err) {
      console.error('Failed to load history:', err)
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