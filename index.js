const { SocketServer, HttpServer } = require("redweb");
const { DefaultRoute } = require("./DefaultRoute");

new SocketServer({
  port: process.env.WS_PORT ? Number(process.env.WS_PORT) : 3000,
  routes: [DefaultRoute],
});

new HttpServer({
  port: process.env.HTTP_PORT ? Number(process.env.HTTP_PORT) : 3001,
  publicPaths: ["./public"],
});
