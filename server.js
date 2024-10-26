const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/bloodbank", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// Mongoose schemas
const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bloodType: { type: String, required: true },
    contact: { type: String, required: true },
    location: { type: String, required: true }
});

const recipientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bloodType: { type: String, required: true },
    contact: { type: String, required: true },
    location: { type: String, required: true }
});

const donationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

// Mongoose models
const Donor = mongoose.model("Donor", donorSchema);
const Recipient = mongoose.model("Recipient", recipientSchema);
const Donation = mongoose.model("Donation", donationSchema);

// API Routes
// Donor registration
app.post("/api/donors", async (req, res) => {
    const donor = new Donor(req.body);
    try {
        await donor.save();
        // Update inventory after adding donor
        const updatedInventory = await Donor.aggregate([
            { $group: { _id: "$bloodType", count: { $sum: 1 } } }
        ]);
        res.status(201).json({ message: "Donor Registered Successfully", inventory: updatedInventory });
    } catch (error) {
        res.status(400).send("Error registering donor: " + error.message);
    }
});

// Recipient registration
app.post("/api/recipients", async (req, res) => {
    const recipient = new Recipient(req.body);
    try {
        await recipient.save();
        res.status(201).send("Recipient Registered Successfully");
    } catch (error) {
        res.status(400).send("Error registering recipient: " + error.message);
    }
});

// Record a donation
app.post("/api/donations", async (req, res) => {
    const { donorId, quantity } = req.body;
    
    try {
        const donation = new Donation({ donorId, quantity });
        await donation.save();
        res.status(201).send("Donation recorded successfully.");
    } catch (error) {
        res.status(400).send("Error recording donation: " + error.message);
    }
});

// Fetch all donation records
app.get("/api/donations", async (req, res) => {
    try {
        const donations = await Donation.find().populate('donorId', 'name bloodType');
        res.json(donations);
    } catch (error) {
        res.status(500).send("Error fetching donation records: " + error.message);
    }
});

// Fetch blood inventory (counts of blood types)
app.get("/api/inventory", async (req, res) => {
    try {
        const donors = await Donor.aggregate([
            { $group: { _id: "$bloodType", count: { $sum: 1 } } }
        ]);
        res.json(donors);
    } catch (error) {
        res.status(500).send("Error fetching inventory: " + error.message);
    }
});

// Fetch all donor records
app.get("/api/donors", async (req, res) => {
    try {
        const donors = await Donor.find();
        res.json(donors);
    } catch (error) {
        res.status(500).send("Error fetching donors: " + error.message);
    }
});

// Fetch all recipient records
app.get("/api/recipients", async (req, res) => {
    try {
        const recipients = await Recipient.find();
        res.json(recipients);
    } catch (error) {
        res.status(500).send("Error fetching recipients: " + error.message);
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
