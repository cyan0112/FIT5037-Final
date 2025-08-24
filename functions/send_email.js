// functions/send-email.js (临时用于测试)
export async function onRequestPost({ request }) {
  console.log("简化的测试函数收到 POST 请求");
  try {
    const bodyPreview = await request.json().then(b => JSON.stringify(b)).catch(() => "Could not parse JSON body.");
    return new Response(JSON.stringify({
      status: 'success',
      message: 'Received your POST request to /api/send-email test endpoint!',
      receivedBody: bodyPreview
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify({
      status: 'error',
      message: `Worker error in test function: ${e.message}`
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}