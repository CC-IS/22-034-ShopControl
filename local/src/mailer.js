const sgMail = require('@sendgrid/mail')
var remote = require('electron').remote;
var appRoot = remote.getGlobal('appRoot');
const path = require('path');
var os = require('os');

var credDir = `${appRoot}/.credentials/`;
if(os.platform() == 'linux') credDir = '/boot/.credentials/'

sgMail.setApiKey(require(path.resolve(credDir + 'sendgrid.json')).key);

exports.sendMail = msg=>{
  return sgMail.send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error.response.body)
  });
}
