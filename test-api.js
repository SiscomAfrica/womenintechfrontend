// Test API call
const token = localStorage.getItem('token');
console.log('Token:', token ? 'exists' : 'missing');

fetch('http://localhost:8000/events/schedule', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
