const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const tasksRoute = require('./routes/tasks');
app.use('/api/tasks', tasksRoute);

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
};

let server;

const startServer = () => {
    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Stop the other process or choose a different PORT in .env.`);
        } else {
            console.error(err);
        }
        process.exit(1);
    });
};

if (require.main === module) {
    connectDB()
        .then(() => {
            console.log('MongoDB connected');
            startServer();
        })
        .catch(err => console.error(err));
}

module.exports = { app, server, connectDB, startServer };
