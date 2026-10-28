require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
console.log('Auth routes loaded');

const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const userRoutes = require('./routes/userRoutes');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);
console.log('Protected employee routes mounted');
app.use('/api/auth', authRoutes);
console.log('Employee routes loaded');
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
console.log('Leave routes mounted');
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});

app.get('/', (req, res) => {
    res.send('StaffSync Backend is running!');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');

        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
    });