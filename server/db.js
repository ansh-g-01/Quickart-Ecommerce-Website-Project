require('dotenv').config({ path: 'C:/Users/DELL/Downloads/Shopping Website DBMS/server/.env' });


const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

// Log the configuration details to check if they are loaded (avoid logging sensitive data in production)
console.log("Database Config:", {
    user: dbConfig.user,
    connectString: dbConfig.connectString
    // Avoid logging the password here for security reasons
});

module.exports = dbConfig;
