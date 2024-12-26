async function loadUserData() {
    try {
        // Get the token from localStorage
        const token = localStorage.getItem('adminToken');

        // If the token doesn't exist, redirect to the admin login page
        if (!token) {
            alert('You need to be logged in to view this page');
            window.location.href = 'admin.html'; // Redirect to the login page
            return;
        }

        // Fetch user data, including the token in the Authorization header
        const response = await fetch('http://localhost:3000/api/usersData', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Sending the token as a Bearer token
            }
        });

        // Check if the response is not OK
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Error fetching user data');
            return;
        }

        // Parse the JSON data
        const userData = await response.json();

        // Display user data
        const userDataContainer = document.getElementById('user-data');
        userDataContainer.innerHTML = ''; // Clear existing content

        userData.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-container');
            userDiv.innerHTML = `
                <h3>${user.username}</h3>
                <p>Password: ${user.password}</p>
                <p>Total Worth: $${user.totalWorth.toFixed(2)}</p>
                <h4>Purchased Products:</h4>
                <ul class="product-list">
                    ${user.products.map(product => `
                        <li>${product.productName} (x${product.quantity}) - $${(product.price * product.quantity).toFixed(2)}</li>
                    `).join('')}
                </ul>
            `;
            userDataContainer.appendChild(userDiv);
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Load user data when the page loads
window.onload = loadUserData;
