/**
 * @param {string} spreadsheet Id
 * @param {string} Specefic sheet name
 * @param {string} Relative path to the JWT token
 */
class getDataFromSheet {

    constructor(spreadsheetId, sheetName, keyFile) {
        this.authorize(keyFile);
        this.spreadsheetId = spreadsheetId;
        this.sheetName = sheetName;
        this.users = [];
        this.usrs = [];
        this.usersarr = []
        this.keyFile = keyFile;
    }
    /**
     * 
     * Gets the new values in the sheet.
     */
    update() {
        var _this = this;
        this.getBatch().then((result) => {
            this.usrs = result.data.valueRanges[0].values;

            var keys = this.usrs[0];
            _this.adminPresent = this.usrs[1][1];
            this.usrs.slice(2).forEach((row, i) => {
                _this.users[i] = {}
                keys.forEach((key, j) => {
                    _this.users[i][key] = row[j];
                });
            });
        });
        this.users.forEach((user, index) => {
            this.usersarr[index] = user.userRFID;
        })
        return;
    }

    /**
     * 
     * @param {string} User name/id 
     * @returns row of the user
     */
    getUser(UID) {
        return this.usersarr[this.usersarr.indexOf(UID)];
    }
    /**
     * renews the auth with the api
     * @param {string} keyFile 
     */
    authorize(keyFile) {
        const { google } = require("googleapis");
        this.googleSheets = google.sheets({ version: "v4", auth: this.client });

        this.auth = new google.auth.GoogleAuth({
            keyFile,
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        });
        this.client = this.auth.getClient();
    }
    /**
     * 
     * @returns Gets the entire sheet and returns it as an object[id][field] = value
     */
    async getBatch() {
        return this.googleSheets.spreadsheets.values.batchGet({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            ranges: `${this.sheetName}!A1:H99999`
        }).then((res) => {

            let values = res.data.valueRanges[0].values;
            const keys = values[0].slice(1);
            const objects = {};

            values.slice(1).forEach((row) => {
                const obj = {};
                keys.forEach((key, i) => {
                    obj[key] = row[i + 1];
                });
                objects[row[0]] = obj;
            });
            return objects
        })

    }
    /**
     * 
     * @param {*} A1 
     * @param {*} value 
     */
    async changeCell(A1, value) {
        await this.googleSheets.spreadsheets.values.update({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: [`${this.sheetName}!${A1}`],
            valueInputOption: 'USER-ENTERED',
            resource: {
                values: [[value]],
            }
        })
    }
    async addAccess(UID, devName) {
        this.changeCell(`${String.fromCharCode(68 + this.getDevNum(UID))}${this.getIndex(UID) + 3}`, 1);
        console.log(`User ${UID} permitted access successfully to ${devName}`);
        this.authorize(this.keyFile);
    }
    async addNewRow(UID) {
        if (this.usersarr.includes(UID)) { return; }
        try {
            await this.googleSheets.spreadsheets.values.append({
                auth: this.auth,
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:B`,
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [[UID, 0, 0, 0, 0, 0, 0, 0]],
                },
            })
        }
        catch {
            console.log("Error adding new row")
        }
    }
    isUser(UID) {
        // var _this = this;
        return JSON.stringify(this.users).includes(UID);

    }
    getIndex(UID) {
        let index2;
        this.users.forEach((Element, index) => {
            // console.log (Element);
            if (Element['userRFID'] && Element['userRFID'] == UID) {
                index2 = index;
            }
        })
        return index2;
    }
    getDevNum(name) {
        return this.usersarr[0].indexOf(name)
    }
    async setsheet(data) {
        const rows = Object.entries(data).map(([key, values]) => [key, ...Object.values(values)]);
        // console.log(rows)
        try {
            const response = await this.googleSheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                auth: this.auth,
                range: `${this.sheetName}!A2`,
                valueInputOption: 'RAW',
                requestBody: { values: rows },
            });
            console.log(`Data updated in the sheet: ${response.data.updatedRange}`);
        } catch (error) {
            console.error('Error updating sheet data:', error);
        }
    }
}
exports.getDataFromSheet = getDataFromSheet;