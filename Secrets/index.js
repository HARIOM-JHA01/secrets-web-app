import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import encrypt from "mongoose-encryption";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET_KEY,
  encryptedFields: ["password"],
});

const User = new mongoose.model("user", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  try {
    await newUser.save();
    console.log(`${newUser.email} is registered`);
    res.render("secrets");
  } catch (err) {
    console.error(err);
    // Handle the error appropriately (e.g., sending an error response to the client)
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ email: username });

    if (foundUser && foundUser.password === password) {
      res.render("secrets");
    } else {
      res.render("login"); // Redirect back to login page on incorrect credentials
    }
  } catch (err) {
    console.error(err);
    // Handle the error appropriately (e.g., sending an error response to the client)
  }
});

app.listen(port, () => {
  console.log("Server is up!");
});
