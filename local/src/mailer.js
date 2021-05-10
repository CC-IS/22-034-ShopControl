const sgMail = require('@sendgrid/mail')
var remote = require('electron').remote;
var appRoot = remote.getGlobal('appRoot');
const path = require('path');

sgMail.setApiKey(require(path.resolve(appRoot + '/.credentials/sendgrid.json')).key);

exports.sendMail = msg=>{
  return sgMail.send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error.response.body)
  });
}
