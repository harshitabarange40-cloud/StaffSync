const express = require('express');
const Leave = require('../models/Leave');
const Employee = require('../models/Employees');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Employee leave request submit karega
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body || {};

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      reason
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin/HR saari leave requests dekh sakte hain
router.get('/', authMiddleware, roleMiddleware('Admin', 'HR'), async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name email department');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin/HR request approve ya reject kar sakte hain
router.patch('/:id', authMiddleware, roleMiddleware('Admin', 'HR'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid leave status' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;