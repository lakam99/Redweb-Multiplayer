const { SocketServer, HttpServer } = require("redweb");
const { DefaultRoute } = require("./DefaultRoute");

new SocketServer({
    port: 3000,
    routes: [DefaultRoute]
});

new HttpServer({
    port: 80
})