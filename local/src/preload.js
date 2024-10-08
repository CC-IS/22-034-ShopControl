
const electron = require('electron');
console.log(electron);
//
const path = require('path');

// console.log(contextBridge);
const SerialPort = require('serialport');
const { DelimiterParser} = require('@serialport/parser-delimiter');

global.config = require(path.resolve(`${__dirname}/../../config/app.js`));
window.config = global.config;
window.credDir = path.resolve(`${__dirname}/../../../.credentials/`)+"/";

SerialPort.SerialPort.list().then((ports)=>{
  console.log(ports);
});

// electron.contextBridge.exposeInMainWorld('electron', {
//   quit: ()=>{}
// });

window.serialport = SerialPort;
window.DelimiterParser = DelimiterParser;
