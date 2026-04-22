export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing OAuth code", { status: 400 });
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return new Response("Token exchange failed", { status: 502 });
  }

  const data = (await tokenRes.json()) as { access_token?: string; error?: string };

  if (!data.access_token) {
    return new Response(`OAuth error: ${data.error ?? "unknown"}`, { status: 400 });
  }

  const redirect = new URL("/editor", url.origin);
  redirect.hash = `token=${data.access_token}`;

  return Response.redirect(redirect.toString(), 302);
}
