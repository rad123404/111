let classSharedData = {};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API для обработки общего ДЗ, опросов и дежурств
    if (url.pathname === '/api/data') {
      if (request.method === 'POST') {
        try {
          classSharedData = await request.json();
          return new Response(JSON.stringify({ success: true }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*' 
            }
          });
        } catch(e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }
      } else {
        return new Response(JSON.stringify(classSharedData), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          }
        });
      }
    }

    // Раздача файлов сайта (index.html)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};