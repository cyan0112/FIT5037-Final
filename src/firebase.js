// 导入 Firebase 核心功能和我们需要的服务
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: 将这里替换成您自己的 Firebase 项目配置
const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
  };
// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);
// 获取并导出认证服务实例
const auth = getAuth(app);
// 获取并导出 Firestore 数据库实例
const db = getFirestore(app);
export { auth, db };