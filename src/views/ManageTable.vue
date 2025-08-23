<template>
  <div class="users-container">
    <h1 class="page-title">User Management</h1>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div> <!-- 添加一个简单的加载动画 -->
      Loading...
    </div>
    
    <div v-if="error" class="error-state">{{ error }}</div>
    <div v-if="!loading && users.length > 0">
      <!-- 搜索框 -->
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
/* 搜索框样式 */
.search-wrapper {
  position: relative;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  max-width: 500px; 
  margin-left: auto; 
  margin-right: auto;
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
/* EasyDataTable 组件的全局样式覆盖，特别是针对表头文本方向 */
.styled-data-table {
  /* 表格整体边框 */
  --easy-table-border: 1px solid #e0e0e0;
  /* 表头背景色，使用与导航栏类似的颜色 */
  --easy-table-header-background-color: #1ABC9C; /* 翠绿色 */
  --easy-table-header-font-color: #ffffff; /* 白色字体 */
  --easy-table-header-font-size: 15px;
  --easy-table-header-height: 50px; /* 增加表头高度 */
  --easy-table-header-item-padding: 15px 10px; /* 增加表头内边距 */
  /* 行样式 */
  --easy-table-body-row-height: 48px;
  --easy-table-body-row-font-color: #444;
  --easy-table-body-row-font-size: 14px;
  --easy-table-body-row-hover-background-color: #f5fcfb; /* 悬停颜色 */
  --easy-table-body-row-border-color: #eee; /* 行底部边框 */
  /* 单元格内边距 */
  --easy-table-row-item-padding: 12px 10px; 
  /* 分页按钮颜色 */
  --easy-table-footer-background-color: #fcfcfc;
  --easy-table-footer-font-color: #555;
  --easy-table-footer-font-size: 13px;
  --easy-table-footer-height: 50px;
  --easy-table-footer-padding: 0 10px;
  --easy-table-rows-per-page-selector-width: 70px;
  --easy-table-rows-per-page-selector-option-hover-background-color: #e3f2fd;
  --easy-table-scrollbar-track-color: #f1f1f1;
  --easy-table-scrollbar-thumb-color: #c1c1c1;
  --easy-table-scrollbar-thumb-hover-color: #a8a8a8;
  /* ***** 关键修改：强制表头文字横向排布并优化空间 ***** */
  /* 针对表头单元格的样式 */
  /* EasyDataTable 的表头项类名通常是 .easy-table__header-item */
  /* 请注意：EasyDataTable的内部结构可能略有不同，以下是根据常见约定和经验推测的，
     如果仍然无效，可能需要检查浏览器开发者工具来确认实际的CSS类名。 */
  & :deep(.easy-table__header-item) {
    display: flex; /* 使用 flex 布局确保内容居中且不换行 */
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    white-space: nowrap; /* 强制内容不换行 */
    /* 显式重置 writing-mode，确保是横向文本 */
    /* 这可能是解决垂直排布最直接的方法 */
    writing-mode: horizontal-tb !important; 
    text-orientation: mixed !important; /* 确保字符方向正常 */
    padding: 0 8px; /* 调整内边距，使其更紧凑 */
  }
  /* 针对表头文字容器，如果需要 */
  & :deep(.easy-table__header-text) {
    white-space: nowrap;
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
  }
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
</style>