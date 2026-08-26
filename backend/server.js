const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const forumRoutes = require('./routes/forumRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const hazardRoutes = require('./routes/hazardRoutes');
const trendsRoutes = require('./routes/trendsRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const app = express();


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Backend running'));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/hazards', hazardRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/chat', chatRoutes);


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/traffic_alert';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });