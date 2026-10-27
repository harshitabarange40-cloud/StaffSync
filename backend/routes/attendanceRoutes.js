const express = require('express');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employees');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Mark attendance - Admin or HR
router.post('/mark', authMiddleware, roleMiddleware('Admin', 'HR'), async (req, res) => {
  try {
    const { employeeId, status } = req.body;

    if (!employeeId || !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        message: 'Valid employeeId and status are required'
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (attendance) {
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employeeId,
        status,
        date: new Date()
      });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// View attendance - Admin or HR
router.get('/', authMiddleware, roleMiddleware('Admin', 'HR'), async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('employee', 'name email department');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;