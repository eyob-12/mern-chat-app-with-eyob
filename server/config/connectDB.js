const mongoose = require("mongoose");

function connectDatabase() {
    const uri = "mongodb+srv://mydatabase:mydatabase@eyobdb.ea7lwku.mongodb.net/?retryWrites=true&w=majority"
    async function connect() {
        try {
            await mongoose.connect(uri);
            console.log('Connected......');
         } catch (error){
            console.log(error);
        }
    }
    connect();
}

module.exports = connectDatabase;
