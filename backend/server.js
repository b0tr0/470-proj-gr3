const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const fuelRoutes = require('./routes/fuelRoutes');
const hazardRoutes = require('./routes/hazardRoutes.js')

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/hazards', hazardRoutes);


app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));