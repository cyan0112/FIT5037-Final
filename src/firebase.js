// 导入 Firebase 核心功能和我们需要的服务
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: 将这里替换成您自己的 Firebase 项目配置
 const firebaseConfig = {
    apiKey: "AIzaSyAyHqK_aZz02z9M69ta_sQv71Ps1ew8k_4",
    authDomain: "assignment-final-c931e.firebaseapp.com",
    projectId: "assignment-final-c931e",
    storageBucket: "assignment-final-c931e.firebasestorage.app",
    messagingSenderId: "1039321637375",
    appId: "1:1039321637375:web:2948242cf4c82453acc7ca",
    measurementId: "G-KYDNCB4XQY"
  };
// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);
// 获取并导出认证服务实例
const auth = getAuth(app);
// 获取并导出 Firestore 数据库实例
const db = getFirestore(app);
export { auth, db };