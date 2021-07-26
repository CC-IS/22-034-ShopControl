var obtains = [
  'µ/google/authenticate.js',
  'googleapis',
  'nodemailer/lib/mail-composer',
];

var gmail = {};

const {google} = require('googleapis');
var sheets = google.gmail('v1');

class EmailSender {
  constructor(opts){
    var _this = this;

    _this.auth = opts.auth;
  }

  putData(dataRange, dataArray, cb){
    var _this = this;
    sheets.spreadsheets.values.update({
      auth: _this.auth,
      spreadsheetId: _this.ssid,
      range: dataRange,
      valueInputOption: 'USER_ENTERED',
      resource: { range: dataRange,
          majorDimension: 'ROWS',
          values: dataArray, },
    }, cb);
  }

  appendData(dataRange,dataArray,cb){
    var _this = this;
    sheets.spreadsheets.values.append({
      auth: _this.auth,
      spreadsheetId: _this.ssid,
      range: dataRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { range: dataRange,
          majorDimension: 'ROWS',
          values: dataArray, },
    }, cb);
  }

  getData(dataRange, cb){
    var _this = this;
    sheets.spreadsheets.values.get({
      auth: _this.auth,
      spreadsheetId: _this.ssid,
      range: dataRange,
    }, cb);
  }
}

exports.Gmail = SpreadSheet;
