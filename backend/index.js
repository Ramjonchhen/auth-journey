const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

app.get('/public', (req, res) => {
    res.json({ message: "This is public data", data: "anyone can see this" });
})

app.get("/api/balance", (req, res) => {
    res.json({ balance: 5000, currency: "USD" });
})

app.listen(port, () => {
    console.log(`Backend Server is listening on port ${port}`)
})
