const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL ="mongodb+srv://sayeem:8TMuvTmTDFjpMfW1@cluster0.ytx1e3r.mongodb.net/Cluster0";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: '6599431f1ee50523aee16d3e' }))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();