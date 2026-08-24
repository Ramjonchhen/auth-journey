const envConfig = require("./config/env");
const express = require('express');
const cors = require('cors');
const app = express();
const port = envConfig.PORT || 5001;

const corsOptions = {
    origin: envConfig.FRONTEND_URL,
    methods: ['GET', 'POST'],          // Restrict allowed HTTP methods
    optionsSuccessStatus: 200          // Compatibility for older browsers
};

app.use(cors(corsOptions));

const serverRoutes = require("./routes");

app.use(express.json());

app.use(serverRoutes);

app.listen(port, () => {
    console.log(`Backend Server is listening on port ${port}`)
})
