async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert("Admin login successful");
      localStorage.setItem('adminToken', data.token); // Store the token
      window.location.href = 'stats.html'; // Redirect to stats page
    } else {
      alert('Login failed: ' + data.message);
    }
  }