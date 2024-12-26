// Sample list of products (mock data)
const products = [
    { id: 1, name: "Product 1", price: 100 },
    { id: 2, name: "Product 2", price: 200 },
    { id: 3, name: "Product 3", price: 300 }
];

// Function to load products
function loadProducts() {
    const productList = document.getElementById("product-list");
    products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productList.appendChild(productDiv);
    });
}

// Cart array to store selected products
let cart = [];

// Function to add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCartDisplay();
}

// Function to update cart display
function updateCartDisplay() {
    const cartList = document.getElementById("cart-list");
    cartList.innerHTML = ""; // Clear existing items
    cart.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");
        itemDiv.innerHTML = `
            <p>${item.name} - $${item.price}</p>
        `;
        cartList.appendChild(itemDiv);
    });
}

// Initial load
loadProducts();
