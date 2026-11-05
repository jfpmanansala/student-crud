import { useEffect, useState } from 'react';

// Update the path (/students or /api/students) based on Step 1
const API_URL = "https://student-backend-cgwd.onrender.com/students";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (response.ok) {
        setName('');
        setEmail('');
        fetchStudents();
      }
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return (
      <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
        <h2>Student Management System</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
              type="text"
              placeholder="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
              required
          />
          <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Add Student</button>
        </form>

        <h3>Student List</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {students.map((student) => (
              <li key={student.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                <span><strong>{student.name}</strong> {student.email ? `(${student.email})` : ''}</span>
                <button onClick={() => handleDelete(student.id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
              </li>
          ))}
        </ul>
      </div>
  );
}

export default App;