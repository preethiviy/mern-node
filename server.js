const express = require("express");
require('dotenv').config();
const path = require("path");
const {logger,logEvents} = require("./middlewares/logger");
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const corsOptions = require("./config/corsOptions");
const PORT = process.env.PORT || 3500;

const app = express();

app.use(logger);
connectDB();

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

// mongoose.connect(
//     DB_URL,{
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }
// );
// mongoose.Promise = Promise;
// const db = mongoose.connection;

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/users", require("./routes/userRoutes"));
app.use("/notes", require("./routes/noteRoutes"));

// db.on('error', function() {
//     console.log('Cannot connect to Mongo');
// })

// db.once('open',() => {
//     // app.use("/api/v1", MainRouter);
// });

app.all("*", (req, res) => {
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }else if(req.accepts('json')){
        res.json({message: '404 not found'});
    }else{
        res.type('txt').send('404 not found');
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
});

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
});