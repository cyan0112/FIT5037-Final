// functions/send-email.js (Cloudflare Pages Function)
export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response('Unsupported Media Type', { status: 415 });
    }
    // 从请求体中解析数据，现在可能包含 `attachments` 数组
    const { name, email, message, attachments = [] } = await request.json();
    // 基本验证
    if (!name || !email || !message) {
      return new Response('Missing required fields (name, email, message)', { status: 400 });
    }
    const sendGridApiKey = env.SENDGRID_API_KEY;
    const senderEmail = env.YOUR_EMAIL_SENDER;
    const receiverEmail = email;
    if (!sendGridApiKey || !senderEmail || !receiverEmail) {
      console.error('Missing environment variables for SendGrid');
      return new Response('Server configuration error: Email API keys or sender/receiver emails are missing.', { status: 500 });
    }
    const sendGridUrl = 'https://api.sendgrid.com/v3/mail/send';
    // 准备 SendGrid 的附件数组
    const sendGridAttachments = attachments.map(att => ({
      content: att.content,      // Base64 编码的文件内容
      filename: att.filename,    // 原始文件名
      type: att.type,            // MIME 类型 (例如 'image/png', 'application/pdf')
      disposition: 'attachment', // 通常设置为 'attachment'，表示作为附件下载
      // content_id: 'unique_id' // 如果需要在 HTML 邮件中嵌入图片，可以使用 'inline' 和 content_id
    }));
    const emailContent = {
      personalizations: [
        {
          to: [{ email: receiverEmail }],
          subject: `New Contact Form Message from ${name}`,
        },
      ],
      from: { email: senderEmail },
      content: [
        {
          type: 'text/html',
          value: `
            <p>You received a new message from your website contact form.</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            ${attachments.length > 0 ? `<p><strong>Attachments:</strong> ${attachments.map(a => a.filename).join(', ')}</p>` : ''}
          `,
        },
      ],
      // 将处理好的附件数组添加到这里
      attachments: sendGridAttachments,
    };
    const sendResponse = await fetch(sendGridUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sendGridApiKey}`,
      },
      body: JSON.stringify(emailContent),
    });
    if (sendResponse.ok) {
      return new Response('Email sent successfully!', { status: 200 });
    } else {
      const errorBody = await sendResponse.json().catch(() => sendResponse.text());
      console.error('SendGrid API Error:', sendResponse.status, errorBody);
      return new Response(`Failed to send email: ${JSON.stringify(errorBody)}`, { status: sendResponse.status });
    }
  } catch (error) {
    console.error('Worker Error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}