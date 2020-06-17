const express = require("express");
const path = require("path");

const logger = require("./middleware/logger");

var cookieParser = require("cookie-parser");
const csurf = require("csurf");
var csrf = require("csurf");
var https = require("https");
const http = require("http");
var fs = require("fs");
var csrfProtection = csrf({ cookie: true });
const csrfMiddleware = csurf({ cookie: true });

var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    // Create a worker
    cluster.fork();
  }
} else {
  const app = express();

  app.use(logger);
  // Handlebars Middleware

  // Set EJS as templating engine
  app.set("view engine", "ejs");

  // Body Parser Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(cookieParser());
  app.use(csrfMiddleware);

  app.get("/", csrfProtection, function (req, res) {
    // pass the csrfToken to the view
    res.render("signup", { csrfToken: req.csrfToken() });
  });

  // Set static folder
  app.use(express.static(path.join(__dirname, "public")));

  // Members API Routes
  app.use("/", require("./routes/api/members"));

  const PORT = process.env.PORT || 3000;

  //run with http
  var server = http.createServer(app);

  //run with https
  //attach the certificate
  // var server = https.createServer(
  //   {
  // key: fs.readFileSync("/etc/nginx-rc/conf.d/dell-csg-2020.d/server.key"),
  // cert: fs.readFileSync("/etc/nginx-rc/conf.d/dell-csg-2020.d/server.crt"),
  //     },
  //     app
  //   );
  //end attach certificate

  server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

cluster.on("exit", function (worker, code, signal) {
  console.log(
    "Worker %d died with code/signal %s. Restarting worker...",
    worker.process.pid,
    signal || code
  );
  cluster.fork();
});
