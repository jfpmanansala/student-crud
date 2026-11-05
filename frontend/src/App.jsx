import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "https://student-backend-cgwd.onrender.com/students";

export default function App() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', course: '', section: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
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
    setFormData({ firstName: '', lastName: '', course: '', section: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        handleClearForm();
        fetchStudents();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      course: student.course || '',
      section: student.section || ''
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
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
            <button className="refresh-btn" onClick={fetchStudents}>Refresh</button>
          </div>
        </header>

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
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. Juan"
                      required
                  />
                </div>
                <div className="form-group">
                  <label>LAST NAME <span className="required">*</span></label>
                  <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
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
                <button type="button" onClick={handleClearForm} className="clear-btn">Clear Form</button>
                <button type="submit" className="submit-btn">{editingId ? 'Update Student' : 'Add Student'}</button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="table-header">
              <div className="card-header">
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
                      <td colSpan="5" className="empty-td">No students found.</td>
                    </tr>
                ) : (
                    filteredStudents.map((s, idx) => (
                        <tr key={s.id || idx}>
                          <td>#{s.id || idx + 1}</td>
                          <td>
                            <strong className="student-name">{s.firstName} {s.lastName}</strong>
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