export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { name, email, message } = data;

    if (!name || !email || !message) {
      return new Response("Missing fields", { status: 400 });
    }

    const payload = {
      personalizations: [
        {
          to: [{ email: env.TO_EMAIL }],
          subject: `New message from ${name}`
        }
      ],
      from: { email: env.FROM_EMAIL },
      content: [
        {
          type: "text/plain",
          value: `From: ${name} <${email}>\n\n${message}`
        }
      ]
    };

    const send = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!send.ok) {
      return new Response("Email failed", { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};