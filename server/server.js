const express = require('express');
const oracledb = require('oracledb');
const path = require('path'); // Add this line to require the 'path' module
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dbConfig = require('./db.js');

const cors = require('cors');
require('dotenv').config({ path: 'C:/Users/DELL/Downloads/Shopping Website DBMS/server/.env' });


app.use(bodyParser.json());  // To parse incoming JSON data
app.use(cors());  // Enable CORS
app.use(express.static(path.join(__dirname,'..', 'public')));
console.log(__dirname);
// User Registration Route

app.get("/", (req, res) => {
    res.send("Welcome to the Shopping Website API!");
});
    
// Route to handle signup (POST)
app.post("/api/signup", async (req, res) => {
    const { username, password } = req.body; // Receive username and password
    let connection;

    try {
        // Connect to the database
        connection = await oracledb.getConnection(dbConfig);

        // Insert the new user into the database with plaintext password
        const result = await connection.execute(
            `INSERT INTO USERS (username, password) VALUES (:username, :password)`,
            [username, password],  // Insert the plain password directly
            { autoCommit: true }
        );``

        res.json({ message: "User registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error registering user" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


// User Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT user_id FROM USERS WHERE username = :username AND password = :password`,
            [username, password]
        );

        if (result.rows.length > 0) {
            const userId = result.rows[0][0];
            const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login', err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

  

// Get Products Route
app.get("/api/products", async (req, res) => {
  let connection;
  try {
      connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute("SELECT product_id, name, price, image_url FROM PRODUCTS");
      
      const products = result.rows.map(row => ({
          id: row[0],    // product_id
          name: row[1],  // name
          price: row[2] , // price
          image_url: row[3] // image_url
      }));
      
      res.json(products);
  } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).send("Error fetching products");
  } finally {
      if (connection) {
          await connection.close();
      }
  }
});


app.post('/api/cart', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const { productId } = req.body;

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      let connection = await oracledb.getConnection(dbConfig);
      await connection.execute(
          `INSERT INTO CART (user_id, product_id) VALUES (:userId, :productId)`,
          [userId, productId],
          { autoCommit: true }
      );
      res.status(200).json({ message: 'Product added to cart' });
  } catch (err) {
      console.error('Error adding to cart:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/cart', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
        `SELECT p.product_id, p.name, p.price 
        FROM PRODUCTS p 
        JOIN CART c ON p.product_id = c.product_id 
        WHERE c.user_id = :userId`,
        [userId]
    );
    
    const cartItems = result.rows.map(row => ({
        product_id: row[0],
        name: row[1],
        price: row[2]
    }));

    res.json(cartItems);  // Send the cart items back to the frontend
  } catch (err) {
      console.error('Error fetching cart:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Serve cart.html for the /cart route
app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "cart.html"));
});


// Cart API route - Retrieve cart for logged-in user
app.get("/api/cart", async (req, res) => {
    const token = req.headers["authorization"].split(" ")[1];
    let connection;

    try {
        // Decode user ID from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            "SELECT p.name, p.price, c.quantity FROM CART c JOIN PRODUCTS p ON c.product_id = p.product_id WHERE c.user_id = :userId",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching cart items:", err);
        res.status(500).send("Error fetching cart items");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});



app.get('/products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});


app.get("/api/stats", async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
  
      // Query to get user with the highest purchases
      const userResult = await connection.execute(`
        SELECT u.username, COUNT(c.product_id) AS purchase_count
        FROM USERS u
        JOIN CART c ON u.user_id = c.user_id
        GROUP BY u.username
        ORDER BY purchase_count DESC FETCH FIRST 1 ROWS ONLY
      `);
  
      // Query to get the most-bought product
      const productResult = await connection.execute(`
        SELECT p.name, COUNT(c.product_id) AS times_bought
        FROM PRODUCTS p
        JOIN CART c ON p.product_id = c.product_id
        GROUP BY p.name
        ORDER BY times_bought DESC FETCH FIRST 1 ROWS ONLY
      `);
  
      // Query to get all products and their purchase frequencies
      const productGraphData = await connection.execute(`
        SELECT p.name, COUNT(c.product_id) AS times_bought
        FROM PRODUCTS p
        JOIN CART c ON p.product_id = c.product_id
        GROUP BY p.name
        ORDER BY times_bought DESC
      `);
  
      res.json({
        topUser: userResult.rows[0],
        topProduct: productResult.rows[0],
        productGraphData: productGraphData.rows
      });
  
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).send("Error fetching stats");
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  });

  app.get('/api/usersData', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Query to fetch users and their purchased products along with quantity
        const result = await connection.execute(`
            SELECT u.username, u.password, p.name, p.price, COUNT(c.product_id) as quantity
            FROM USERS u
            JOIN CART c ON u.user_id = c.user_id
            JOIN PRODUCTS p ON c.product_id = p.product_id
            GROUP BY u.username, u.password, p.name, p.price
        `);

        // Organize data by user
        const userData = {};
        result.rows.forEach(([username, password, productName, price, quantity]) => {
            if (!userData[username]) {
                userData[username] = {
                    username,
                    password,
                    products: [],
                    totalWorth: 0
                };
            }

            userData[username].products.push({ productName, price, quantity });
            userData[username].totalWorth += price * quantity;
        });

        // Send the data as JSON
        res.json(Object.values(userData));
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Error fetching user data', details: error.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error('Error closing connection:', closeError);
            }
        }
    }
});



  
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
