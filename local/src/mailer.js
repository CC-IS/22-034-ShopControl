const sgMail = require('@sendgrid/mail')
const path = require('path');
var os = require('os');

if(os.platform() == 'linux') window.credDir = '/boot/.credentials/'

sgMail.setApiKey(require(path.resolve(window.credDir + 'sendgrid.json')).key);

exports.sendMail = msg=>{
  return sgMail.send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error.response.body)
  });
}
