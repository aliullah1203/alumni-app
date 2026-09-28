const BACKEND = "https://alumni-app-qaxy.onrender.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy /api/* and /uploads/* to the Render backend
    if (url.pathname.startsWith("/api") || url.pathname.startsWith("/uploads")) {
      const backendUrl = BACKEND + url.pathname + url.search;
      const proxied = new Request(backendUrl, {
        method:  request.method,
        headers: request.headers,
        body:    request.body,
        redirect: "follow",
      });
      return fetch(proxied);
    }

    // Everything else → serve from static assets (SPA fallback handles unknown routes)
    return env.ASSETS.fetch(request);
  },
};
