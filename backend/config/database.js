const mongoose = require("mongoose");
const DB_URI = "mongodb://localhost:27017/ecommerce"
const connectDatabase = () => {
    mongoose.connect(DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(
    (data)=> {
        console.log(`mongodb connected with server: ${data.connection.host}`);
    }).catch((err) => {
        console.log(err)
    })
}


module.exports = connectDatabase;

