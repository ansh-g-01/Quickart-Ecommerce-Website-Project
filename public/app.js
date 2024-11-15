// Signup Form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting and refreshing the page

        // Get the values from the form
        console.log('Signup Form found');
        const username = document.getElementById('usesign').value;
        const password = document.getElementById('passsign').value;
        // Log the values to check if they're being correctly captured
        console.log('Username:', username);
        console.log('Password:', password);

        // If values are correctly captured, proceed to send them to the backend
        fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('User registered successfully:', data);
            alert('user registered successfully')
            // Optionally, redirect to the login page or show a success message
        })
        .catch(error => console.error('Error:', error));
    });
}

// Login Form
    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        
        const username = document.getElementById('uselog').value;
        const password = document.getElementById('passlog').value;

        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('token', data.token);
            alert('Login Successful'); // Concatenate the string and token

            window.location.href = 'http://localhost:3000/products.html';
        } else {
            alert('Login failed');
        }
    });

// Function to load products when the page loads
// Function to load products when the page loads

// Call the loadProducts function when the page loads


// Function to handle adding a product to the cart


