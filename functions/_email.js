// functions/send-email.js
export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response('Unsupported Media Type', { status: 415 });
    }
    const { name, email, message, attachments = [] } = await request.json();
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
    const sendGridAttachments = attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: 'attachment',
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
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            ${attachments.length > 0 ? `<p><strong>Attachments:</strong> ${attachments.map(a => a.filename).join(', ')}</p>` : ''}
          `,
        },
      ],
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
      // 成功响应通常没有 body 内容，或者是一个简单的成功消息
      // 不需要读取 body，直接返回成功响应
      return new Response('Email sent successfully!', { status: 200 });
    } else {
      // --- 关键修改开始 ---
      // 先尝试将响应体读取为文本，无论成功与否，这个流都只被读取一次
      const errorText = await sendResponse.text();
      let errorData;
      try {
        // 尝试解析为 JSON
        // 如果响应内容是合法的 JSON 字符串，则解析成功
        errorData = JSON.parse(errorText);
      } catch (jsonError) {
        // 如果不是合法的 JSON，那么就使用原始的文本内容
        errorData = errorText;
      }
      console.error('SendGrid API Error:', sendResponse.status, errorData);
      return new Response(`Failed to send email: ${JSON.stringify(errorData)}`, { status: sendResponse.status });
      // --- 关键修改结束 ---
    }
  } catch (error) {
    console.error('Worker Error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}