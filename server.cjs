const { createServer } = require('node:http');
const next = require('next');
const port = Number(process.env.PORT || 3000);
const app = next({ dev: false, hostname: '0.0.0.0', port });
app.prepare().then(() => {
  createServer(app.getRequestHandler()).listen(port, '0.0.0.0');
}).catch(() => { console.error('Next.js could not start. Check deployment configuration.'); process.exit(1); });
