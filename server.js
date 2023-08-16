const express = require("express");
const app = express();
const routes = require('./web/routes')
const cors = require('cors');
const dotenv = require("dotenv");
app.use(cors({
    origin: '*'
}));
app.use(express.json({}));
app.use(express.json({
    extented: true
}));

dotenv.config();

app.use("/", routes);


app.listen(8080, 
    console.log(`Server running on  Port :8080`));