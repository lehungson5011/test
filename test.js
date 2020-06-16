const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views", "./views");
app.use(bodyParser.urlencoded({ extended: true }));

process.env.TZ = "Asia/Bangkok";
const server = require("http").Server(app);
const io = require('socket.io')(server);
server.listen(process.env.PORT || 30000);


const qrcode = require('qrcode')
const {authenticator, totp, hotp} = require('otplib')


var secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';
// var secret = authenticator.generateSecret()
// console.log(secret);

app.get('/', async(reque, respo) => {
  var token = authenticator.generate(secret);
  console.log(token);

  const otp = authenticator.keyuri('user1', "Our TFA App", secret);
  console.log(otp);

  qrcode.toDataURL(otp, (err, imageUrl) => {
    if (err) {
      console.log('Could not generate QR code', err);
      respo.send("err")
      return;
    }
    respo.render("test",{url:reque.headers.host,imgLink:imageUrl});
  });
})


io.on('connection', (socket) => {
  socket.on("test",async (optToken) => {
    console.log(optToken);

    var isValid = authenticator.check( optToken, secret );
    console.log(isValid);
    socket.emit("resCheckToken", isValid);
  })
});
