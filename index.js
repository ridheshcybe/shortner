const path = require("path");
const express = require("express");
const { randomBytes } = require("crypto");
const simplejson = require("simple-json-db");

const views = {
    home: path.resolve(__dirname, './views/index.html'),
    404: path.resolve(__dirname, './views/404.html')
}
const app = express();
const db = new simplejson('./.db/index.json')

const port = process.env.PORT || 8080

app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(views.home)
})

app.post('/', (req, res) => {
    const uri = req.query.url
    if (!uri) return res.status(400).send({
        message: "No url found",
        ok: false
    })
    if (typeof uri !== "string") res.status(400).send({
        message: "typeof url !== string",
        ok: false
    })

    const bytes = randomBytes(5).toString('base64url')

    if (db.has(uri)) return res.send({
        message: db.get(uri),
        ok: true
    })
    db.set(uri, bytes)
    res.send({
        message: bytes,
        ok: true
    })
    db.sync()
})

app.get('/:uri', (req, res) => {
    const o = db.JSON();
    let redirected = false;
    const uri = req.params.uri;

    for (const id in o) {
        if (Object.hasOwnProperty.call(o, id)) {
            const el = o[id];
            if (el !== uri) return;
            redirected = true;
            res.redirect(id)
        }
    }

    if (!redirected) res.sendFile(views[404]);
})

app.use((req, res, next) => {
    res.status(404).sendFile(views[404]);
})

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`)
})