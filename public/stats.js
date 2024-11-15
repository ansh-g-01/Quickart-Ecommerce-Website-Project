async function loadStats() {
    try {
      const response = await fetch('http://localhost:3000/api/stats');
      const data = await response.json();
  
      // Display top user and product
      document.getElementById('topUserName').textContent = `User: ${data.topUser[0]} - Purchases: ${data.topUser[1]}`;
      document.getElementById('topProductName').textContent = `Product: ${data.topProduct[0]} - Times Bought: ${data.topProduct[1]}`;
  
      // Chart data preparation
      const labels = data.productGraphData.map(row => row[0]); // Product names
      const values = data.productGraphData.map(row => row[1]); // Purchase counts
  
      const ctx = document.getElementById('productChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Number of Purchases',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  
  // Load stats on page load
  window.onload = loadStats;
  