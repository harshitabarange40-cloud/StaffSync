import { useEffect, useState } from 'react'
import './App.css'

function App() {
const [employees, setEmployees] = useState([]);
const [attendance, setAttendance] = useState([]);
const [leaves, setLeaves] = useState([]);
const [announcements, setAnnouncements] = useState([]);
const [leaveMessage, setLeaveMessage] = useState('');
const [token, setToken] = useState('')
const [user, setUser] = useState(null)
const [trainings, setTrainings] = useState([]);
useEffect(() => {
  const fetchTrainings = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/api/trainings',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTrainings(data);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    }
  };

  if (token) {
    fetchTrainings();
  }
}, [token]);
const [loginForm, setLoginForm] = useState({ email: '', password: '' })
const [loginError, setLoginError] = useState('')
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [message, setMessage] = useState('')
const [form, setForm] = useState({
name: '',
email: '',
department: '',
role: '',
})
const [editingId, setEditingId] = useState(null)

const loadEmployees = async (authToken) => {
try {
const response = await fetch('http://localhost:5001/api/employees', {
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
})
if (!response.ok) throw new Error('Failed to load employees')
const data = await response.json()
setEmployees(data)
setError('')
} catch {
setError('Cannot connect to backend. Please check the server.')
} finally {
setLoading(false)
}
}

const loadAttendance = async (authToken) => {
  try {
    const response = await fetch('http://localhost:5001/api/attendance', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load attendance');
    }

    setAttendance(data);
  } catch (err) {
    console.error('Attendance error:', err.message);
  }
};

const loadLeaves = async (authToken) => {
  try {
    const response = await fetch('http://localhost:5001/api/leaves', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load leaves');
    }

    setLeaves(data);
  } catch (err) {
    console.error('Leave loading error:', err.message);
  }
};

const loadAnnouncements = async (authToken) => {
  try {
    const response = await fetch(
      'http://localhost:5001/api/announcements',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load announcements');
    }

    setAnnouncements(data);
  } catch (err) {
    console.error('Announcement loading error:', err.message);
  }
};

useEffect(() => {
  setLoading(false)
}, [])

const handleChange = (event) => {
setForm({ ...form, [event.target.name]: event.target.value })
}
const handleLoginChange = (event) => {
  setLoginForm({
    ...loginForm,
    [event.target.name]: event.target.value,
  })
}

const handleLogin = async (event) => {
  event.preventDefault()
  setLoginError('')

  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginForm),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    if (!data.token) {
      throw new Error('Login response mein token nahi mila')
    }

    setToken(data.token)
    setUser(data.user)
    await loadEmployees(data.token)
    await loadAttendance(data.token)
    await loadLeaves(data.token)
    await loadAnnouncements(data.token)
    setLoginError('')
  } catch (err) {
    setLoginError(err.message || 'Login nahi ho paya')
  }
}

const handleEdit = (employee) => {
  setEditingId(employee._id)
  setForm({
    name: employee.name || '',
    email: employee.email || '',
    department: employee.department || '',
    role: employee.role || '',
  })
  setMessage('')
  setError('')
}

const handleSubmit = async (event) => {
event.preventDefault()
setMessage('')
setError('')

try {
  const url = editingId
  ? `http://localhost:5001/api/employees/${editingId}`
  : 'http://localhost:5001/api/employees'

const response = await fetch(url, {
    method: editingId ? 'PUT' : 'POST',
    headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
},
    body: JSON.stringify(form),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to save employee')
  }

  setMessage(editingId ? 'Employee edited successfully!' : 'Employee added successfully!')
  setForm({ name: '', email: '', department: '', role: '' })
  setEditingId(null)
  await loadEmployees(token)
} catch (err) {
  setError(err.message || 'Something went wrong. Please try again.')
}

}

const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
  `http://localhost:5001/api/employees/${id}`,
  {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)

      const text = await response.text()
      console.log('Delete response:', text)
      
      let data = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server is returning an HTML response.')
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Employee was not deleted')
      }

      setMessage(`${name} successfully deleted!`)
      await loadEmployees(token)
    } catch (err) {
      setError(err.message || 'An error occurred while deleting')
    }
  }
const role = user?.role
const isAdminOrHR = role === 'Admin' || role === 'HR'
const isManagerUp = isAdminOrHR || role === 'Manager'
return (
<div className="app">
  {!token && (
  <section className="employee-section">
    <h2>StaffSync Login</h2>

    <form onSubmit={handleLogin} className="employee-form">
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={loginForm.email}
        onChange={handleLoginChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Enter your password"
        value={loginForm.password}
        onChange={handleLoginChange}
        required
      />

      <button type="submit" className="primary-button">
        Login
      </button>
    </form>

    {loginError && (
      <p className="error-message">{loginError}</p>
    )}
  </section>
)}
{token && (
  <>
<nav className="navbar">
<h2>StaffSync</h2>
<span>HR Management System</span>
{user && (
  <span>
    {user.name} — {user.role}
  </span>
)}
{token && (
  <button
    onClick={() => {
      setToken('')
      setMessage('')
      setError('')
      setUser(null)
    }}
  >
    Logout
  </button>
)}
</nav>

  <main className="main-content">
    <section className="employee-section">
  <h2>My Profile</h2>

  <div className="card">
    <p>
      <strong>Name:</strong> {user?.name || 'Not available'}
    </p>

    <p>
      <strong>Email:</strong> {user?.email || 'Not available'}
    </p>

    <p>
      <strong>Role:</strong> {user?.role || 'Not available'}
    </p>
  </div>
</section>
    <p className="welcome">WELCOME TO STAFFSYNC</p>
    <h1>Manage your team, <br /> all in one place.</h1>
    <p className="description">
      Simplify employee management, organize your workforce,
      and keep your team connected.
    </p>

    <div className="cards">
      <div className="card">
        <h3>Employees</h3>
        <p>Total employees: {employees.length}</p>
      </div>
      <div className="card">
        <h3>Departments</h3>
        <p>Organize your team efficiently.</p>
      </div>
      <div className="card">
        <h3>Staff Dashboard</h3>
        <p>Keep track of your workforce.</p>
      </div>
    </div>

    {user && ['Admin', 'HR'].includes(user.role) && (

    <section className="employee-section">
      <h2>Add New Employee</h2>

      <form className="employee-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter employee name"
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="employee@example.com"
            required
          />
        </label>

        <label>
          Department
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="e.g. IT, HR, Finance"
            required
          />
        </label>

        <label>
          Role
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="e.g. Developer, Manager"
            required
          />
        </label>

        <button className="primary-button" type="submit">
          
            {editingId ? 'Update Employee' : 'Add Employee'}
          </button>
        
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </section>
      )}
    <section className="employee-section">
  <h2>Attendance Management</h2>
  {user && ['Admin', 'HR'].includes(user.role) && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const employeeId = formData.get('employeeId');
      const status = formData.get('status');

      try {
        const response = await fetch('http://localhost:5001/api/attendance/mark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ employeeId, status })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Attendance mark nahi hui');
        }

        alert('Attendance successfully marked!');
        e.target.reset();
        await loadAttendance(token);
      } catch (err) {
        alert(err.message);
      }
    }}
  >
    <label>Select Employee:</label>
    <select name="employeeId" required>
      <option value="">Select Employee</option>
      {employees.map((employee) => (
        <option key={employee._id} value={employee._id}>
          {employee.name}
        </option>
      ))}
    </select>

    <label>Attendance Status:</label>
    <select name="status" required>
      <option value="Present">Present</option>
      <option value="Absent">Absent</option>
    </select>

    <button type="submit">Mark Attendance</button>
  </form>
)}

{attendance.length === 0 ? (
  <p>No attendance records yet.</p>
) : (
  attendance.map((record) => (
    <div key={record._id}>
      <p>Employee: {record.employee?.name || 'Unknown'}</p>
      <p>Status: {record.status}</p>
      <p>Date: {new Date(record.date).toLocaleDateString()}</p>
    </div>
  ))
)}
</section>
<section className="employee-section">
  <h2>Leave Management</h2>

  <form
    className="employee-form"
    onSubmit={async (e) => {
      e.preventDefault();
      setLeaveMessage('');

      const formData = new FormData(e.target);

      const leaveData = {
        employeeId: formData.get('employeeId'),
        leaveType: formData.get('leaveType'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        reason: formData.get('reason'),
      };

      try {
        const response = await fetch(
          'http://localhost:5001/api/leaves',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(leaveData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Leave request failed');
        }

        setLeaveMessage('Leave request submitted successfully!');
        e.target.reset();
        await loadLeaves(token);
      } catch (err) {
        setLeaveMessage(err.message);
      }
    }}
  >
    {user && ['Admin', 'HR', 'Manager'].includes(user.role) && (
    <>
    <label>Employee</label>
    <select name="employeeId" required>
      <option value="">Select Employee</option>
      {employees.map((employee) => (
        <option key={employee._id} value={employee._id}>
          {employee.name}
        </option>
      ))}
    </select>
    </>
    )}
    <label>Leave Type</label>
    <select name="leaveType" required>
      <option value="Casual">Casual</option>
      <option value="Sick">Sick</option>
      <option value="Earned">Earned</option>
    </select>

    <label>Start Date</label>
    <input type="date" name="startDate" required />

    <label>End Date</label>
    <input type="date" name="endDate" required />

    <label>Reason</label>
    <input
      name="reason"
      placeholder="Enter leave reason"
      required
    />

    <button type="submit" className="primary-button">
      Apply for Leave
    </button>
  </form>

  {leaveMessage && <p>{leaveMessage}</p>}

  <h3>Leave Requests</h3>

  {leaves.length === 0 ? (
    <p>No leave requests found.</p>
  ) : (
    leaves.map((leave) => (
      <div className="card" key={leave._id}>
        <p>
          Employee: {leave.employee?.name || 'Employee'}
        </p>
        <p>Type: {leave.leaveType}</p>
        <p>
          Dates: {new Date(leave.startDate).toLocaleDateString()}
          {' - '}
          {new Date(leave.endDate).toLocaleDateString()}
        </p>
        <p>Reason: {leave.reason}</p>
        <p>Status: {leave.status}</p>

        {user && ['Admin', 'HR'].includes(user.role) &&
          leave.status === 'Pending' && (
            <>
              <button
                onClick={async () => {
                  const response = await fetch(
                    `http://localhost:5001/api/leaves/${leave._id}`,
                    {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ status: 'Approved' }),
                    }
                  );

                  if (response.ok) {
                    await loadLeaves(token);
                    setLeaveMessage('Leave approved!');
                  } else {
                    setLeaveMessage('Could not approve leave.');
                  }
                }}
              >
                Approve
              </button>

              <button
                onClick={async () => {
                  const response = await fetch(
                    `http://localhost:5001/api/leaves/${leave._id}`,
                    {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ status: 'Rejected' }),
                    }
                  );

                  if (response.ok) {
                    await loadLeaves(token);
                    setLeaveMessage('Leave rejected.');
                  } else {
                    setLeaveMessage('Could not reject leave.');
                  }
                }}
              >
                Reject
              </button>
            </>
          )}
      </div>
    ))
  )}
</section>
<section className="employee-section">
  <h2>Announcements</h2>

  {user && ['Admin', 'HR'].includes(user.role) && (
    <form
      className="employee-form"
      onSubmit={async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        try {
          const response = await fetch(
            'http://localhost:5001/api/announcements',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                title: formData.get('title'),
                message: formData.get('message'),
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Announcement failed');
          }

          alert('Announcement posted successfully!');
          await loadAnnouncements(token);
          e.target.reset();
        } catch (err) {
          alert(err.message);
        }
      }}
    >
      <input
        name="title"
        placeholder="Announcement title"
        required
      />

      <textarea
        name="message"
        placeholder="Write announcement"
        required
      />

      <button type="submit" className="primary-button">
        Post Announcement
      </button>
    </form>
  )}

  <h3>Latest Announcements</h3>

{announcements.length === 0 ? (
  <p>No announcements yet.</p>
) : (
  announcements.map((announcement) => (
    <div className="card" key={announcement._id}>
      <h3>{announcement.title}</h3>
      <p>{announcement.message}</p>
      <p>Posted by: {announcement.postedBy}</p>
      <p>
        Date: {new Date(announcement.createdAt).toLocaleDateString()}
      </p>
    </div>
  ))
)}
</section>
<section className="employee-section">
  <h2>Notifications</h2>

  <div className="card">
    <p>No notifications yet.</p>
  </div>
</section>
{user && ['Admin', 'HR', 'Manager'].includes(user.role) && ( 
<section className="employee-section">
  <h2>Reports & Analytics</h2>

  <div className="cards">
    <div className="card">
      <h3>Total Employees</h3>
      <p>{employees.length}</p>
    </div>

    <div className="card">
      <h3>Total Attendance Records</h3>
      <p>{attendance.length}</p>
    </div>

    <div className="card">
      <h3>Total Leave Requests</h3>
      <p>{leaves.length}</p>
    </div>

    <div className="card">
      <h3>Approved Leaves</h3>
      <p>
        {leaves.filter((leave) => leave.status === 'Approved').length}
      </p>
    </div>

    <div className="card">
      <h3>Pending Leaves</h3>
      <p>
        {leaves.filter((leave) => leave.status === 'Pending').length}
      </p>
    </div>
  </div>
</section>
)}

<section className="employee-section">
  <h2>Training & Development</h2>

  <p>View available training programs and development activities.</p>

  {user && ['Admin', 'Manager'].includes(user.role) && (
    <form
      className="employee-form"
      onSubmit={async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        try {
          const response = await fetch(
            'http://localhost:5001/api/trainings',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                title: formData.get('title'),
                description: formData.get('description'),
                trainer: formData.get('trainer'),
                department: formData.get('department'),
                date: formData.get('date'),
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to add training');
          }

          alert('Training added successfully!');
          e.target.reset();
        } catch (err) {
          alert(err.message);
        }
      }}
    >
      <input name="title" placeholder="Training title" required />

      <textarea
        name="description"
        placeholder="Training description"
        required
      />

      <input name="trainer" placeholder="Trainer name" required />

      <input name="department" placeholder="Department (e.g. IT)" />

      <label>Training date</label>
      <input name="date" type="date" required />

      <button type="submit" className="primary-button">
        Add Training
      </button>
    </form>
  )}

  <div className="employee-list">
  {trainings.length === 0 ? (
    <p>No training programs available yet.</p>
  ) : (
    trainings.map((training) => (
      <div key={training._id} className="employee-card">
        <h3>{training.title}</h3>
        <p>{training.description}</p>
        <p>Trainer: {training.trainer}</p>
        <p>Department: {training.department}</p>
        <p>
          Date: {new Date(training.date).toLocaleDateString()}
        </p>
      </div>
    ))
  )}
</div>
</section>
{user && ['Admin', 'HR', 'Manager'].includes(user.role) && (
    <section className="employee-section">
      <h2>Employee Directory</h2>

      {loading && <p>Loading employees...</p>}
      {!loading && employees.length === 0 && !error && (
        <p>No employees found.</p>
      )}

      {employees.map((employee) => (
        <div className="card employee-card" key={employee._id}>
          <h3>{employee.name}</h3>
          <p>Email: {employee.email}</p>
          <p>Department: {employee.department}</p>
          <p>Role: {employee.role}</p>

          {user && ['Admin', 'HR'].includes(user.role) && (
            <>
              <button
                className="delete-button"
                onClick={() => handleDelete(employee._id, employee.name)}
              >
                Delete Employee
              </button>

              <button onClick={() => handleEdit(employee)}>
                Edit
              </button>
            </>
          )}
        </div>
      ))}
    </section>
)}
  </main>
  </>
)}
</div>

)
}

export default App