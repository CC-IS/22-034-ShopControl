const { getDataFromSheet } = require('./server.js');
const sheet = new getDataFromSheet("1k3eZkkqm1bWA3lk8gUgfoR6Xpb2vVaX4iaqnizi5iDc", "sh_users", "/usr/local/src/parcel/.credentials/trackerJWT_2.json");
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
            res.status(200).send(`${0}`)
        }
        else {
            res.status(200).send(`${access[id][machine] || 0}`)
        }
    })

    app.post('/add', (req, res) => {
        let _res = res
        let id = req.body.id
        let machine = req.body.machine
        if (!access["admin"].hasOwnProperty(machine)) {
            res.status(404).send("Invalid machine");
            return;
        }
        if (access.hasOwnProperty(id) && access[id][machine] == 1) {
            res.status(200).send("Already a user")
            return;
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
                _res.status(200).send("Added and given access")
                return;
            }
            catch {
                _res.status(500).send("Error adding user")
                return;
            }


        }
        else {
            access[id][machine] = 1
            sheet.setsheet(access)
            _res.status(200).send("Updated user")

            // res.send("Updated user")
            // res.sendStatus(200)

        }


        // console.log(access)

        // res.sendStatus(200)
    })



    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

}

module.exports = handler;
