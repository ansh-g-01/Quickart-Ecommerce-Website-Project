async function loadCartItems() {
    const response = await fetch("/api/cart", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    const cartItems = await response.json();
    const cartContainer = document.getElementById("cart-items");

    cartItems.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Price: $${item.price}</p>
            <p>Quantity: ${item.quantity}</p>
        `;
        cartContainer.appendChild(itemDiv);
    });
}

async function checkout() {
    alert("Checkout functionality is under construction!");
}

// Load cart items when the page loads
window.onload = loadCartItems;
