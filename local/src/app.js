'use strict';

// var electron = require('electron');
// const {ipcRenderer} = require('electron');
// console.log(electron);
//var appRoot = remote.getGlobal('appRoot');
//var config = remote.getGlobal('config');
var os = require('os');
const handler = require('./server_handler');
handler();

var obtains = [
  'µ/google/jwt.js',
  'µ/google/sheets_2.js',
  'µ/components/growl.js',
  './src/sheetInfo.js',
  './src/keypad.js',
  './src/items.js',
  'uuid',
  'greg',
  'qrcode',
  'child_process',
  './src/mailer.js'
]

obtain(obtains, ({ Client }, { SpreadSheet }, growl, { SheetInfo }, { Keypad }, { Item }, { v4: uuidv4 }, greg, qr, { execSync }, { sendMail }) => {
  exports.app = {};

  console.log(config);

  var scopes = [
    'https://www.googleapis.com/auth/spreadsheets'
  ];

  //var credDir = `${appRoot}/.credentials/`;
  if (os.platform() == 'linux') window.credDir = '/boot/.credentials/'

  var auth = Client(scopes, window.credDir + 'trackerJWT_2.json');

  var materials = new SpreadSheet({
    auth: auth,
    ssid: '13-zoYnlLD6gpz5fb8yHF1NNAMhxse7jFm5_eMpyLGaw'
  });

  var users = new SpreadSheet({
    auth: auth,
    ssid: '1k3eZkkqm1bWA3lk8gUgfoR6Xpb2vVaX4iaqnizi5iDc'
  });

  var inventory = new SheetInfo(materials, 'Inventory');
  var transactions = new SheetInfo(materials, 'Transactions');
  var tools = new SheetInfo(materials, 'Tools');
  var toolCheckouts = new SheetInfo(materials, 'ToolCheckouts');

  var profile = new SheetInfo(users, 'Users');
  var activity = new SheetInfo(users, 'Activity');
  var balances = new SheetInfo(users, 'Balances');

  var imgCanv = µ('+canvas');
  const headerImg = new Image();
  headerImg.onload = function () {
    imgCanv.width = headerImg.width;
    imgCanv.height = headerImg.height;
    var ctx = imgCanv.getContext('2d');
    ctx.drawImage(headerImg, 0, 0, headerImg.width, headerImg.height);
  }
  headerImg.src = 'img/LogoHeaderSmall.png';

  ////////////////////////////////////////////////////////

  var newUserDialog = (userID) => {
    userInfoOL.data = { userID: userID };
    overlays.mode = 'acct';
    µ('input', userInfoOL).forEach(inp => {
      inp.classList.remove('warn');
      if (inp.id != 'mailList') inp.value = '';
    });
  }

  var accountDialog = acct => {
    userInfoOL.data = acct;
    overlays.mode = 'acct';
    mainGrowl.dismiss();
    for (var key in acct) {
      if (acct.hasOwnProperty(key) && key != 'userID') {
        if (key != 'mailList') µ(`#${key}`, userInfoOL).value = acct[key];
      }
    }
  }

  var getTools = toolCodes => {
    return toolCheckouts.objectArrayFromKeyValues('code', toolCodes);
  }

  var getToolCheckouts = profile => {
    toolCheckouts.objectFromKeyValue('user', profile.email).then((data) => {
      console.log('got checkouts')
      console.log(data);
      var tools = JSON.parse(data.tools);
      console.log(tools);
      var toolInd = 0;

      if (tools.length) getTools(tools.map(tool => tool.code)).then(tools => {
        console.log(tools);
      })

    }).catch(err => {
      if (err == 'VAL_NOT_FOUND') console.log('no tools checked out');
    });
  }

  var startOrder = () => {

  }

  var getFiscalYear = ()=>{
    var d = new Date();
    var month = d.getMonth();
    var year = d.getFullYear();
    year = Number(year.toString().substr(-2));
    if(month >= 7) year+=1;
    return year;
  }

  var recordTransaction = (profile, bal) => {
    console.log(profile);
    var cart = µ('ms-item');
    var list = cart.map(item => item.listify())
    console.log(list);
    var newTA = {
      uuid: uuidv4(),
      userID: profile.userID,
      userEmail: profile.email,
      jsonCart: JSON.stringify(list),
      cartTotal: cart.reduce((acc, item) => acc + item.getSubtotal(), 0),
      projectDescription: projectDescription.value
    }

    var credits = cart.reduce((acc, item) => acc + item.getSubtotal()<0?-item.getSubtotal():0, 0);

    console.log(newTA);
    console.log(credits);

    overlays.mode = 'rcpt';
    qr.toCanvas(qrcodeCV, newTA.uuid);

    var codeURL = qrcodeCV.toDataURL().split('base64,')[1];
    var logoURL = imgCanv.toDataURL().split('base64,')[1];

    const msg = {
      to: profile.email, // Change to your recipient
      from: 'no-reply@admin.make-it.cc', // Change to your verified sender
      subject: 'Makerspace Transaction Receipt',
      html: `<div style='text-align: center; font-family: sans-serif;'>
        <img class='header' style='width: 50%; height: auto;' src="cid:header"></img>
        <h1 style='color: 2B388F;'>Thank you for using the Class of '69 Makerpace! </h1>
        <p>Share your project :</p>
        <img style="display: inline-block" src="cid:qrcode"></img>
        <br />
        <strong>${newTA.uuid}</strong>
      </div>`,
      attachments: [
        {
          content: logoURL,
          filename: "header.png",
          content_id: 'header',
          type: "image/png",
          disposition: "inline"
        },
        {
          content: codeURL,
          filename: "receiptCode.png",
          content_id: 'qrcode',
          type: "image/png",
          disposition: "inline"
        }
      ]
    }

    while (itemList.firstChild) itemList.removeChild(itemList.firstChild);
    calculateTotal();

    sendMail(msg);
    //uuidSpan.textContent = newTA.uuid;
    // balances.objectFromKeyValue("email", profile.email).then(bal=>{
    //   console.log(bal);
    //   bal[getFiscalYear()+"_Actual"] -= newTA.cartTotal;
    //   console.log(bal);
    //   balances.amendOrAddFromObject(bal,"email");
    // });
    bal[getFiscalYear()+"_Actual"] -= newTA.cartTotal;
    bal[getFiscalYear()+"_Accrued"] = Number(bal[getFiscalYear()+"_Accrued"]) + credits;
    balances.amendOrAddFromObject(bal,"email");
    return transactions.amendOrAddFromObject(newTA, 'uuid');
  }

  var openQuantOL = data => {
    overlays.mode = 'quant';
    if (!data.unit) data.unit = 'ea';
    quantOL.data = data;
    var conv = {
      'ea': 'each',
      'in': 'inches',
      'oz': 'ounces',
      'g': 'grams',
      'yd': 'yards'
    };
    quantUnit.textContent = conv[data.unit];
    if (data.quantity) quantKey.input.value = data.quantity;
    else quantKey.input.value = '';
  }

  ////////////////////////////////////////////////////////

  var items = {};

  var calculateTotal = () => {
    var tot = µ('ms-item').reduce((acc, el) => acc + el.getSubtotal(), 0);
    totalCost.textContent = '₡' + Math.abs(tot).toFixed(0);
    totalCost.classList.toggle('credit',tot<0);
  }

  var handleItem = (data) => {
    var it = µ('ms-item').find(it => it.code == data.code);
    console.log('handling');
    if (!it) {
      if(data.passcode){
        openQuantOL(data);
      } else {
        console.log('adding');
        data.quantity = 0;
        it = new Item(data);
        itemList.appendChild(it);
        it.onUpdatePress = openQuantOL;
      }

    }
    console.log(data.unit);
    if (data.unit == 'ea') {
      console.log('here')
      it.setQuantity(it.quantity + 1);
      calculateTotal();
    } else {
      console.log('quant');
      openQuantOL(it);
    }
  }

  var findItem = (sku) => {
    if (!items[sku]) {
      inventory.objectFromKeyValue('code', sku).then((data) => {
        items[sku] = data;
        handleItem(items[sku]);
      }).catch(err => {
        if (err == 'VAL_NOT_FOUND') console.log('adding new item');
      })
    } else handleItem(items[sku]);

  }

  var findUser = (userID) => {
    mainGrowl.message('Finding User...', 'note', true);
    profile.objectFromKeyValue('userID', userID).then(profile => {
      console.log(profile);
      if (overlays.mode == 'acctScan') accountDialog(profile);
      else if (overlays.mode == 'welcomeScan' || overlays.mode == 'signInScan') signIn(profile);
      else if (overlays.mode == 'coScan'){
        mainGrowl.dismiss();
        balances.objectFromKeyValue('email',profile.email).then(bal=>{
          if(bal[getFiscalYear()+"_Actual"] > µ('ms-item').reduce((acc, el) => acc + el.getSubtotal(), 0)){
            recordTransaction(profile,bal);
          } else {
            mainGrowl.message('Insufficient Balance; see a manager', 'error');
          }
        });

      } else if (overlays.mode == 'toolUserScan') getToolCheckouts(profile);
      else mainGrowl.dismiss();
    }).catch(err => {
      if (err == 'VAL_NOT_FOUND') {
        mainGrowl.dismiss();
        newUserDialog(userID);
      }
    });
  }

  var signIn = data => {
    data.location = config.location;
    data.checkIn = (new Date()).toLocaleString();
    return activity.addRowFromObject(data).then(() => {
      signInName.textContent = data.firstName;
      balances.objectFromKeyValue("email", data.email).then(bal=>{
        mainGrowl.dismiss();
        acctBalance.textContent = bal[getFiscalYear()+"_Actual"];
        overlays.mode = 'signedIn';
        setTimeout(() => {
          overlays.mode = 'welcomeScan';
        }, 5000);
      });
    });
  }

  var addUser = data => {
    profile.amendOrAddFromObject(data, 'userID');
    return balances.objectFromKeyValue("email",data.email).catch(err=>{
      var newBal = {email: data.email};
      newBal[getFiscalYear()+"_Actual"]= 1000;
      newBal[getFiscalYear()+"_Accrued"]= 0;
      return balances.amendOrAddFromObject(newBal,'email');
    });
  }

  var onScan = (scanResult) => {
    if (scanResult.startsWith('CM')) {
      overlays.mode = 'shopScan';
      findItem(scanResult);
    } else if (scanResult.length == 14) {
      findUser(scanResult);
    } else if (scanResult.length == 16) {
      findUser(scanResult.substring(1, 15));
    } else if (scanResult == '0028') {
      execSync('sudo systemctl stop electron');
    }
  }

  exports.app.start = () => {

    /////////////////////////////////////////////////////////////////
    // element event handlers

    var screensaverTO = null;

    var resetSS = () => {
      screensaver.classList.remove('active');
      if (screensaverTO) clearTimeout(screensaverTO);
      screensaverTO = setTimeout(() => {
        screensaver.classList.add('active');
        overlays.mode = 'welcomeScan';
      }, 60000);
    }

    µ('body')[0].onclick = e => {
      resetSS();
    }

    Object.defineProperty(overlays, 'mode', {
      get: () => overlays.getAttribute('mode'),
      set: md => overlays.setAttribute('mode', md)
    });

    µ('input[required]', userInfoOL).forEach(el => {
      el.onchange = e => el.classList.toggle('warn', !el.value.length);
    })

    µ('#manage').onclick = (e) => {
      e.preventDefault();
      overlays.mode = 'acctScan';
    }

    startScan.onclick = e => {
      e.preventDefault();
      overlays.mode = 'shopScan';
    }

    signInButton.onclick = e => {
      e.preventDefault();
      overlays.mode = 'signInScan';
    }

    borrow.onclick = e => {
      e.preventDefault();
      overlays.mode = 'toolUserScan';
    }

    µ('.cancelTool').forEach(el => el.onclick = (e) => {
      overlays.mode = 'welcomeScan';
      e.preventDefault();
    });


    cancelScan.onclick = (e) => {
      overlays.mode = 'welcomeScan';
      e.preventDefault();
    }

    checkout.onclick = e => {
      overlays.mode = 'coScan';
      projectDescription.value = '';
    }

    cancelCO.onclick = e => {
      overlays.mode = 'shopScan';
    }

    coCancel.onclick = e => {
      e.preventDefault();
      overlays.mode = 'welcomeScan';
      while (itemList.firstChild) itemList.removeChild(itemList.firstChild);
      calculateTotal();
    }

    saveSignUp.onclick = (e) => {
      var data = µ('input', userInfoOL).reduce((acc, val) => {
        acc[val.id] = val.value;
        return acc;
      }, userInfoOL.data);
      if (data.firstName.length && data.email.length) {
        addUser(data).then(() => signIn(data));
        overlays.mode = 'signedIn';
      } else {
        µ('input[required]', userInfoOL).forEach(el => el.classList.add('warn'));
      }
    }

    cancelSignUp.onclick = e => {
      overlays.mode = 'welcomeScan';
    }

    cancelRcpt.onclick = e => {
      e.preventDefault();
      overlays.mode = 'welcomeScan';
    }

    keyPad.input.value = 'CM';

    keyPad.onSubmit = (text) => {
      onScan(text);
      keyPad.input.value = 'CM';
    }

    quantAccept.onclick = (e) => {
      if (e) e.preventDefault();
      var newQuant = parseFloat(quantKey.input.value);
      if (!newQuant) {
        quantOL.data.parentElement.removeChild(quantOL.data);
      } else {
        quantOL.data.setQuantity(newQuant);
        calculateTotal();
      }
      overlays.mode = 'shopScan';
    }

    quantCancel.onclick = (e) => {
      e.preventDefault();
      overlays.mode = 'shopScan';
    }

    quantKey.onchange = (text) => {
    }

    ///////////////////////////////////////////////////
    //// General startup

    var example = new Item({
      code: 'CM10007',
      description: "Elmer's Glue",
      price: '0.05',
      quantity: 5,
      unit: 'oz'
    });

    example.onUpdatePress = openQuantOL;
    itemList.appendChild(example);

    var scanString = '';
    var scanTO = null;

    document.onkeypress = (e) => {
      if (overlays.mode.includes('Scan')) {
        clearTimeout(scanTO);
        if (e.keyCode > 32 && e.keyCode < 127) {
          scanString += e.key;
        } else if (e.key == 'Enter') {
          resetSS();
          onScan(scanString);
          scanString = '';
        }

        scanTO = setTimeout(() => scanString = '', 50);
      } else if (overlays.mode == 'quant') {
        quantKey.input.focus();
        if (e.key == 'Enter') {
          if(quantOL.data?.passcode && quantKey.input.value == quantOL.data?.passcode){
            console.log(quantOL.data.passcode);
            var it = new Item(quantOL.data);
            it.quantity = 1;
            itemList.appendChild(it);
            it.onUpdatePress = openQuantOL;
            overlays.mode = 'shopScan';
            quantOL.data = null;
            calculateTotal();
            return;
          } else quantAccept.onclick();
        }
      }
    };

    document.onkeydown = (e)=>{
      //console.log(e.keyCode);
      if(e.keyCode == 27){
        //console.log('quitting');
        //window.electron.quit();
        //app.quit();
        //console.log("here");
        //onScan("20118000606604");
        //onScan("20118000497475");
      }
    }
  };

  provide(exports);
});
