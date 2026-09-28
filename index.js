const { defineApp, METHODS } = require('redweb');
const { DefaultRoute } = require('./DefaultRoute');

function createApp(options = {}) {
  const app = defineApp({
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    publicPaths: ['./public'],
    sockets: [DefaultRoute],
    httpServices: [{
      serviceName: '/health',
      method: METHODS.GET,
      function: (_request, response) => {
        const ready = app.sockets?.isReady() === true;
        response.status(ready ? 200 : 503).json({ ready });
      },
    }],
    ...options,
  });
  return app;
}

if (require.main === module) {
  createApp().run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { createApp };
