import React, { useState, useEffect } from 'react';
import './App.css';

const getApiUrl = () => {
  let base = import.meta.env.VITE_API_BASE_URL;
  if (!base || base.includes("student-backend.onrender.com")) {
    base = "https://student-backend-cgwd.onrender.com";
  }
  const cleanBase = base.replace(/\/$/, '');
  if (cleanBase.endsWith('/manansala/students')) {
    return cleanBase;
  }
  if (cleanBase.endsWith('/manansala')) {
    return `${cleanBase}/students`;
  }
  return `${cleanBase}/manansala/students`;
};

const API_URL = getApiUrl();

export default function App() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ firstname: '', lastname: '', course: '', section: '' });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        showNotification('error', `Failed to load students (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      showNotification('error', "Cannot connect to server. Please check backend status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({ firstname: '', lastname: '', course: '', section: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const endpoint = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const payload = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        course: formData.course.trim(),
        section: formData.section.trim()
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('success', editingId ? "Student updated successfully!" : "Student registered successfully!");
        handleClearForm();
        fetchStudents();
      } else {
        const errorText = await response.text();
        showNotification('error', `Server error (${response.status}): ${errorText || 'Failed to save'}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showNotification('error', "Network error: Unable to save student data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      firstname: student.firstname || student.firstName || '',
      lastname: student.lastname || student.lastName || '',
      course: student.course || '',
      section: student.section || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('success', "Student deleted successfully!");
        fetchStudents();
      } else {
        showNotification('error', `Failed to delete student (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      showNotification('error', "Network error: Unable to delete student.");
    }
  };

  const filteredStudents = students.filter(s => {
    const fn = s.firstname || s.firstName || '';
    const ln = s.lastname || s.lastName || '';
    const fullName = `${fn} ${ln}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      (s.course && s.course.toLowerCase().includes(query)) ||
      (s.section && s.section.toLowerCase().includes(query))
    );
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="branding">
          <div className="logo-icon">🎓</div>
          <div>
            <h1 className="app-title">Student Portal</h1>
            <p className="app-subtitle">Manansala CRUD Management System</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="total-badge">Total: {students.length}</span>
          <button className="refresh-btn" onClick={fetchStudents} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {statusMessage && (
        <div style={{
          maxWidth: '1280px',
          margin: '16px auto 0',
          padding: '12px 24px',
        }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="main-grid">
        <section className="card">
          <div className="card-header">
            <div className="card-icon">👤</div>
            <div>
              <h2 className="card-title">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
              <p className="card-subtitle">
                {editingId ? 'Modify student registration details' : 'Fill in details to register a new student'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-row">
              <div className="form-group">
                <label>FIRST NAME <span className="required">*</span></label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  placeholder="e.g. Juan"
                  required
                />
              </div>
              <div className="form-group">
                <label>LAST NAME <span className="required">*</span></label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="e.g. Dela Cruz"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>COURSE <span className="required">*</span></label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g. BSIT"
                  required
                />
              </div>
              <div className="form-group">
                <label>SECTION <span className="required">*</span></label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  placeholder="e.g. 3A"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleClearForm} className="clear-btn" disabled={isSubmitting}>
                {editingId ? 'Cancel Edit' : 'Clear Form'}
              </button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting
                  ? (editingId ? 'Updating...' : 'Adding...')
                  : (editingId ? 'Update Student' : 'Add Student')}
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="table-header">
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div className="card-icon">👥</div>
              <div>
                <h2 className="card-title">Student Directory</h2>
                <p className="card-subtitle">Showing {filteredStudents.length} of {students.length} students</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search name, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>STUDENT NAME</th>
                  <th>COURSE</th>
                  <th>SECTION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-td">
                      {isLoading ? 'Loading students...' : 'No students found.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={s.id || idx}>
                      <td>#{s.id || idx + 1}</td>
                      <td>
                        <strong className="student-name">
                          {(s.firstname || s.firstName || '')} {(s.lastname || s.lastName || '')}
                        </strong>
                      </td>
                      <td><span className="course-badge">{s.course || 'N/A'}</span></td>
                      <td><span className="section-badge">{s.section || 'N/A'}</span></td>
                      <td>
                        <div className="action-group">
                          <button onClick={() => handleEdit(s)} className="edit-btn">Edit</button>
                          <button onClick={() => handleDelete(s.id)} className="delete-btn">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
