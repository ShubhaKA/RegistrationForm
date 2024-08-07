// Load environment variables
require('dotenv').config();

var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Use environment variables for MongoDB connection string and port
mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;

db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

app.post("/register", (req, res) => {
    var name = req.body.name;
    var mobileno = req.body.mobileno;
    var email = req.body.email;
    var password = req.body.password;

    var data = {
        "name": name,
        "mobileno": mobileno,
        "email": email,
        "password": password
    };

    db.collection('users').findOne({ $or: [{ email: email }, { mobileno: mobileno }] }, (err, user) => {
        if (err) {
            console.log("Error occurred while checking for existing user");
            return res.redirect('error.html');
        }
        if (user) {
            // User already exists
            console.log("User already registered with this email or mobile number");
            return res.redirect('error.html');
        } else {
            // Insert new user
            db.collection('users').insertOne(data, (err, collection) => {
                if (err) {
                    throw err;
                }
                console.log("Record Inserted Successfully");
                return res.redirect('success.html');
            });
        }
    });
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('index.html');
});

// Use environment variable for port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
