const express = require('express');
const app = express();
const port = 3000

const serverRoutes = require("./routes");

app.use(express.json());

app.use(serverRoutes);

app.listen(port, () => {
    console.log(`Backend Server is listening on port ${port}`)
})
