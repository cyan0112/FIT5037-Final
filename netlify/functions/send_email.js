// netlify/functions/send-email.js
const sgMail = require('@sendgrid/mail');
exports.handler = async function(event, context) {
  // 1. 设置 SendGrid API Key
  // 这个环境变量将在 Netlify UI 中配置，而不是代码中硬编码
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // 仅处理 POST 请求，因为这是表单提交
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  try {
    const data = JSON.parse(event.body); // 解析前端 POST 过来的 JSON 数据
    // 从环境变量获取发件人邮箱和收件人邮箱 (你的邮箱)
    // 记得在 Netlify UI 中配置这些环境变量
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
    const TO_EMAIL = process.env.CONTACT_FORM_RECIPIENT_EMAIL; // 你的收件邮箱
    if (!FROM_EMAIL || !TO_EMAIL || !process.env.SENDGRID_API_KEY) {
      console.error("Missing SendGrid environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Server configuration error: Missing SendGrid credentials." }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    // 基本数据验证
    if (!data.name || !data.email || !data.subject || !data.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Please fill in all required fields." }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    // 构建邮件内容
    const msg = {
      to: TO_EMAIL, // 你的收件邮箱
      from: FROM_EMAIL, // 经过 SendGrid 验证的发件人邮箱
      replyTo: data.email, // 方便你直接回复用户
      subject: `联系表单: ${data.subject}`,
      text: `
        姓名: ${data.name}
        邮箱: ${data.email}
        主题: ${data.subject}
        --------------------
        消息:
        ${data.message}
      `,
      html: `
        <p><strong>姓名:</strong> ${data.name}</p>
        <p><strong>邮箱:</strong> ${data.email}</p>
        <p><strong>主题:</strong> ${data.subject}</p>
        <hr>
        <p><strong>消息:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    };
    // 发送邮件
    await sgMail.send(msg);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send email.", error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};