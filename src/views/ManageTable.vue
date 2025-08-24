<template>
  <div class="users-container">
    <h1 class="page-title">User Management</h1>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div> <!-- 添加一个简单的加载动画 -->
      Loading...
    </div>
    
    <div v-if="error" class="error-state">{{ error }}</div>
    <div v-if="!loading && users.length > 0">
      <!-- 搜索和导出区域 -->
      <div class="controls-wrapper">
        <div class="search-wrapper">
          <label for="global-search" class="visually-hidden">Search</label>
          <input 
            id="global-search"
            type="text" 
            v-model="searchValue" 
            placeholder="Acording to email, role, gender or reason..."
            class="search-input"
          >
          <i class="search-icon">🔍</i> <!-- 增加一个搜索图标 -->
        </div>
        <button @click="exportToCSV" class="export-btn" :disabled="users.length === 0">
          📊 Export CSV
        </button>
      </div>
      
      <!-- 数据表格组件 -->
      <EasyDataTable
        :headers="headers"
        :items="users"
        :rows-per-page="10"
        :search-value="searchValue"
        show-index
        buttons-pagination
        sort-by="createdAt"
        sort-type="desc"
        theme-color="#1ABC9C" 
        table-class-name="styled-data-table" 
      >
        <!-- #item-role slot for role badge styling -->
        <template #item-role="{ role }">
          <span :class="['role-badge', `role-${role.toLowerCase()}`]">{{ role }}</span>
        </template>
         <!-- #item-reason slot for truncated text with tooltip -->
        <template #item-reason="{ reason }">
          <span :title="reason" class="reason-cell">{{ truncateText(reason, 50) }}</span>
        </template>
         <!-- #item-createdAt slot for formatted date and time -->
         <template #item-createdAt="{ createdAt }">
            {{ formatDateTime(createdAt) }}
         </template>
        
        <!-- #empty-message slot for custom empty state feedback -->
        <template #empty-message>
          <div class="empty-data-message">
            <p>There is no user data in the database.</p>
            <button v-if="searchValue" @click="searchValue=''" class="clear-search-btn">Clear Search</button>
          </div>
        </template>
      </EasyDataTable>
    </div>
    
    <div v-if="!loading && users.length === 0" class="empty-state">
      <p>There is no user data in the database.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase.js'; 

// 1. 定义表头 (Headers) - 调整宽度以优化空间
const headers = ref([
  { text: "邮箱", value: "email", sortable: true, width: 180 }, // 邮箱可能较长，给足宽度
  { text: "角色", value: "role", sortable: true, width: 100 }, // 角色较短，适当宽度
  { text: "性别", value: "gender", sortable: true, width: 80 },  // 性别很短
  { text: "加入原因", value: "reason", sortable: true, width: 250 }, // 原因可能很长
  { text: "注册时间", value: "createdAt", sortable: true, width: 180 }, // 时间戳也相对长
]);

// 2. 初始化响应式状态
const users = ref([]);        
const loading = ref(true);    
const error = ref(null);      
const searchValue = ref('');  

// 3. 辅助函数：截断长文本
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

// 辅助函数：格式化日期时间
const formatDateTime = (timestamp) => {
  // 兼容 Firestore Timestamp 对象和普通字符串
  let date;
  if (timestamp && typeof timestamp.seconds === 'number') {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp); // 尝试解析字符串日期
  } else {
    return '';
  }
  // 确保日期有效
  if (isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

// CSV导出函数
const exportToCSV = () => {
  if (users.value.length === 0) {
    alert('No data to export');
    return;
  }

  // 定义CSV标题行
  const csvHeaders = ['ID', 'Email', 'Role', 'Gender', 'Reason', 'Registration Time'];
  
  // 转换数据为CSV格式
  const csvData = users.value.map((user, index) => {
    const row = [
      index + 1,
      user.email || '',
      user.role || '',
      user.gender || '',
      user.reason || '',
      formatDateTime(user.createdAt) || ''
    ];
    
    // 处理包含逗号、引号或换行符的字段
    return row.map(field => {
      const stringField = String(field || '');
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    });
  });

  // 组合CSV内容
  const csvContent = [csvHeaders, ...csvData]
    .map(row => row.join(','))
    .join('\n');

  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `user_data_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理
  URL.revokeObjectURL(url);
};

// 4. 定义从 Firestore 加载数据的函数
const loadUsers = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const allUsers = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allUsers.push({
        id: doc.id, 
        ...data,
        createdAt: data.createdAt, // 直接传递Firestore Timestamp，让模板中的formatDateTime处理
      });
    });
    
    users.value = allUsers;
  } catch (err) {
    console.error("加载用户数据时出错: ", err);
    error.value = "无法加载用户数据，请检查网络连接或联系管理员。";
  } finally {
    loading.value = false;
  }
};

// 5. 在组件挂载时调用加载函数
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
/* 整体容器样式 */
.users-container {
  padding: 30px;
  max-width: 1300px;
  margin: 30px auto; 
  background-color: #ffffff; 
  border-radius: 12px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); 
}

.page-title {
  font-size: 2.2em;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 600;
}

/* 控制区域样式 */
.controls-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
  flex-wrap: wrap;
}

/* 搜索框样式 */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 15px; 
  border-radius: 25px; 
  border: 1px solid #ddd;
  font-size: 1.05rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1ABC9C;
  box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.2);
}

.search-icon {
  position: absolute;
  right: 15px;
  color: #888;
  font-size: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
}

/* 导出按钮样式 */
.export-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-btn:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.export-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* EasyDataTable 组件的全局样式覆盖 */
.styled-data-table {
  /* 表格整体边框 */
  --easy-table-border: 1px solid #e0e0e0;
  /* 表头背景色 */
  --easy-table-header-background-color: #1ABC9C;
  --easy-table-header-font-color: #ffffff;
  --easy-table-header-font-size: 15px;
  --easy-table-header-height: 50px;
  --easy-table-header-item-padding: 15px 10px;
  /* 行样式 */
  --easy-table-body-row-height: 48px;
  --easy-table-body-row-font-color: #444;
  --easy-table-body-row-font-size: 14px;
  --easy-table-body-row-hover-background-color: #f5fcfb;
  --easy-table-body-row-border-color: #eee;
  /* 单元格内边距 */
  --easy-table-row-item-padding: 12px 10px;
}

/* 角色徽章样式 */
.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 15px;
  border-radius: 20px; 
  font-size: 0.85em;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  min-width: 70px;
}

/* 不同角色的背景色 */
.role-user { background-color: #3498db; }
.role-admin { background-color: #e74c3c; }
.role-editor { background-color: #f39c12; color: #333; }
.role-guest { background-color: #95a5a6; }

/* "加入原因"列的内容样式 */
.reason-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
  line-height: 1.4;
  height: 2.8em;
  max-width: 100%;
}

/* 加载、错误和空状态样式 */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px;
  font-size: 1.25rem;
  color: #666;
  background-color: #f8f8f8;
  border-radius: 8px;
  margin-top: 30px;
}

.error-state {
  color: #c0392b;
  background-color: #fdeaea;
  border: 1px solid #e0b4b4;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #1ABC9C;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-data-message {
  padding: 20px;
  font-size: 1.1em;
  color: #777;
}

.clear-search-btn {
  background-color: #1ABC9C;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.clear-search-btn:hover {
  background-color: #16a085;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-wrapper {
    max-width: 100%;
  }
  
  .export-btn {
    align-self: flex-end;
  }
}
</style>