const { getDataFromSheet } = require('./server.js');
const sheet = new getDataFromSheet("1k3eZkkqm1bWA3lk8gUgfoR6Xpb2vVaX4iaqnizi5iDc", "sh_users", "../../.credentials/trackerJWT_2.json");

const express = require('express');

const app = express();
const port = 3000;
app.use(express.json()); // Parse JSON bodies

async function handler() {
    access = await sheet.getBatch()

    app.post('/check', (req, res) => {
        let id = req.body.id
        let machine = req.body.machine
        // console.log(access, id)
        if (!access.hasOwnProperty(id) || !(access[id].hasOwnProperty(machine))) {
            res.send(`${0}`)
        }
        else {
            res.send(`${access[id][machine] || 0}`)
        }
    })

    app.post('/add', (req, res) => {
        let _res = res
        let id = req.body.id
        let machine = req.body.machine
        if (!access["admin"].hasOwnProperty(machine)) {
            res.send("Invalid machine")
            res.sendStatus(404)
        }
        if (access.hasOwnProperty(id) && access[id][machine] == 1) {
            res.send("Already a user")
            res.sendStatus(200)
        }
        if (!access.hasOwnProperty(id)) {
            try {
                sheet.addNewRow(id).then(() => {
                    sheet.getBatch().then((res) => {
                        access = res
                        access[id][machine] = 1
                        sheet.setsheet(access).then(() => {
                        })
                    })
                })
                _res.send("Added and gave access")
                _res.sendStatus(200)
            }
            catch {
                _res.send("Error adding user")
                _res.sendStatus(500)
            }


        }
        else {
            access[id][machine] = 1
            sheet.setsheet(access)
            res.send("Updated user")
            res.sendStatus(200)

        }


        // console.log(access)

        res.sendStatus(200)
    })



    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

}

module.exports = handler;
