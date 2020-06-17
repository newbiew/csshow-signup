const express = require("express");
const moment = require("moment");
const router = express.Router();
const cryptoRandomString = require("crypto-random-string");
var mysql = require("mysql");
var nodemailer = require("nodemailer");



var LOCALHOST = "http://localhost:3000";
var LOGINNAME = "login";
var LANDINGPAGE = "keynote.html";
var APPNAME = "main";

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "userTracking",
  socket: "/Applications/MAMP/tmp/mysql/mysql.sock",
  port: "8889",
});



router.post("/auth/signup", function (req, res) {
  var ua = req.headers["user-agent"];

  var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "1169b769b99813",
      pass: "98f7da90d7f375",
    },
  });

  var email = req.body.email;

  var token = cryptoRandomString({ length: 100, type: "url-safe" });

  var sql = `INSERT INTO tbl_user_verify (email, token, browser, created_at) VALUES (?,?,?,?)`;
  var values = [email, token, ua, moment().format("YYYY-MM-DD hh:mm:ss")];

  connection.query(sql, values, function (err, result) {
    if (err) throw err;
  });

  var mailOptions = {
    from: "ilhmp1314@gmail.com",
    to: email,
    subject: "Sending Email using Node.js",
    text: "hi, this is your email verification",
    html:
      '<p><a href="' +
      LOCALHOST +
      "/email-verify/" +
      token +
      '">Click Here to verify</a></p>',
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.redirect(
        LOCALHOST + "/email-sent.html" + "?emailto=" + encodeURIComponent(email)
      );
      res.end();
    }
  });
});

router.get("/email-verify/:token", function (req, res) {
  var sql =
    'SELECT * from tbl_user_verify where verified=0 and token ="' +
    req.params.token +
    '"';
  connection.query(sql, function (err, result) {
    if (err) throw err;

    if (result.length > 0) {
      //update tbl_user_verify SET verified to 1 and verified_at to date
      var sql = `UPDATE tbl_user_verify SET verified=1, verified_at = ? where token = ?`;
      var values = [moment().format("YYYY-MM-DD hh:mm:ss"), req.params.token];
      connection.query(sql, values, function (err, result) {
        if (err) throw err;
      });

      //end update

      //start insert into tbl_users
      var email = result[0].email; //get the email
      var nickname =
        result[0].email.substr(0, result[0].email.search("@")) + result[0].id; //generate the nickname

      var sql = `INSERT tbl_users (email,nickname) VALUES (?,?)`;
      var values = [email, nickname];

      connection.query(sql, values, function (err, result) {
        if (err) throw err;

        var token = cryptoRandomString({ length: 30, type: "url-safe" }); //generate token for login to livecast.html

        var url =
          LOCALHOST +
          "/" +
          APPNAME +
          "/" +
          LANDINGPAGE +
          "?nickname=" +
          nickname +
          "&token=" +
          token +
          "&email=" +
          encodeURIComponent(email);

        res.render("redirecting", { url: url });
      });
    } else {
      //error while verify
      res.redirect(LOCALHOST + "/error-verify.html");
      res.end();
    }
  });
});

module.exports = router;
