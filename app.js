// Mzansi Market - Vanilla JS Application
// This file contains all client-side logic for the Mzansi Market application,
// built using only HTML, CSS, and plain JavaScript.

// --- STATE MANAGEMENT ---
let currentUser = null;
let cartItems = [];
const USERS_STORAGE_KEY = 'mzansi_market_users';
const CURRENT_USER_STORAGE_KEY = 'mzansi_market_current_user';
const CART_STORAGE_KEY = 'mzansi_market_cart';
const PRODUCTS_STORAGE_KEY = 'mzansi_market_products'; // For user-listed items

// --- Product Categories (Enum equivalent) ---
const ProductCategory = {
  ELECTRONICS: "Electronics",
  FASHION: "Fashion",
  HOME_GARDEN: "Home & Garden",
  COLLECTIBLES: "Collectibles",
  SPORTS: "Sports & Outdoors",
  BOOKS: "Books & Media",
  OTHER: "Other",
};

// --- SAMPLE PRODUCTS ---
let products = [
    { 
      id: "1", 
      name: "Wireless Headphones", 
      category: ProductCategory.ELECTRONICS, 
      price: 750.00, 
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=300&q=60",
      description: "High-quality wireless headphones with noise cancellation and superb bass.",
      sellerName: "AudioPhile Inc.",
      datePosted: new Date().toISOString()
    },
    { 
      id: "2", 
      name: "Stylish T-Shirt", 
      category: ProductCategory.FASHION, 
      price: 299.99, 
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHNoaXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=300&q=60",
      description: "Comfortable and stylish cotton t-shirt, available in various colors.",
      sellerName: "FashionForward",
      datePosted: new Date().toISOString()
    },
    { 
      id: "3", 
      name: "Indoor Plant Pot", 
      category: ProductCategory.HOME_GARDEN, 
      price: 120.50, 
      imageUrl: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGxhbnQlMjBwb3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60",
      description: "Modern ceramic pot for your favorite indoor plants. Adds a touch of green.",
      sellerName: "GreenThumbs",
      datePosted: new Date().toISOString()
    },
     { 
      id: "4", 
      name: "Vintage Comic Book", 
      category: ProductCategory.COLLECTIBLES, 
      price: 450.00, 
      imageUrl: "https://images.unsplash.com/photo-1579373903781-3de886045100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29taWMlMjBib29rfGVufDB8fDB8fHww&auto=format&fit=crop&w=300&q=60",
      description: "Rare first edition comic book in good condition. A true collector's item.",
      sellerName: "CollectorCave",
      datePosted: new Date().toISOString()
    },
];

// --- LOCALSTORAGE HELPERS ---
const getUsersFromStorage = () => JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
const saveUsersToStorage = (users) => localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
const getCartFromStorage = () => JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
const saveCartToStorage = (cart) => localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
const getListedProductsFromStorage = () => JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];
const saveListedProductsToStorage = (listedProds) => localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(listedProds));


// --- AUTHENTICATION ---
function seedInitialUsers() {
  let users = getUsersFromStorage();
  if (users.length === 0) {
    users = [
      { id: 'admin001', name: 'Admin User', email: 'admin@mzansi.com', password: 'admin123', role: 'admin' },
      { id: 'user001', name: 'Regular User', email: 'user@mzansi.com', password: 'user123', role: 'user' },
    ];
    saveUsersToStorage(users);
  }
}

function login(email, password_provided) {
  const users = getUsersFromStorage();
  const user = users.find(u => u.email === email && u.password === password_provided);
  if (user) {
    const { password, ...userToStore } = user;
    currentUser = userToStore;
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    return true;
  }
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  return false;
}

function register(name, email, password_provided) {
  const users = getUsersFromStorage();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'User with this email already exists.' };
  }
  const newUser = {
    id: `user${Date.now()}`,
    name,
    email,
    password: password_provided, // Plaintext, NOT FOR PRODUCTION
    role: 'user',
  };
  users.push(newUser);
  saveUsersToStorage(users);
  
  const { password, ...userToStore } = newUser;
  currentUser = userToStore;
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
  return { success: true };
}

function logout() {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  renderHeader();
  navigateTo('#'); // Go to home page
}

function isAuthenticated() {
  return !!currentUser;
}

function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

// --- CART ---
function addToCart(productId) {
    const allProducts = [...products, ...getListedProductsFromStorage()];
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }
    saveCartToStorage(cartItems);
    renderHeader(); // Update cart count
    showCartUpdateMessage(product.name);
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCartToStorage(cartItems);
    renderHeader();
    renderCartPage(); // Re-render cart page
}

function updateItemQuantity(productId, quantity) {
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
    }
    saveCartToStorage(cartItems);
    renderHeader();
    renderCartPage();
}

function clearCart() {
    cartItems = [];
    saveCartToStorage(cartItems);
    renderHeader();
    renderCartPage();
}

function getCartTotal() {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getItemCount() {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
}

function showCartUpdateMessage(productName) {
    let messageDiv = document.getElementById('cart-update-message');
    if (messageDiv) messageDiv.remove();

    messageDiv = document.createElement('div');
    messageDiv.id = 'cart-update-message';
    messageDiv.className = "fixed top-20 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-center";
    messageDiv.setAttribute('role', 'alert');
    messageDiv.innerHTML = `<p><span class="font-semibold">${productName}</span> added to cart!</p><p class="text-sm">Your cart has been updated.</p>`;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv) messageDiv.remove();
    }, 3000);
}


// --- DOM ELEMENTS ---
const appHeader = document.getElementById('app-header');
const appMain = document.getElementById('app-main');
const appFooter = document.getElementById('app-footer');

// --- RENDERING ---
function renderHeader() {
  const itemCount = getItemCount();
  let authLinks = '';
  let welcomeMessage = '';
  let sellItemLink = '';
  let adminLink = '';

  if (isAuthenticated()) {
    welcomeMessage = `<span class="ml-4 text-sm text-orange-300">Welcome, ${currentUser.name}!</span>`;
    authLinks = `<button id="logout-button" class="text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Logout</button>`;
    sellItemLink = `<a href="#sell" class="nav-link text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sell Item</a>`;
    if (isAdmin()) {
      adminLink = `<a href="#admin" class="nav-link text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Admin</a>`;
    }
  } else {
    authLinks = `
      <a href="#auth=login" class="nav-link text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</a>
      <a href="#auth=register" class="nav-link text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Register</a>
    `;
  }

  appHeader.innerHTML = `
    <div class="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
      <div class="flex items-center mb-2 sm:mb-0">
        <a href="#" class="text-2xl font-bold text-orange-500">Mzansi Market</a>
        ${welcomeMessage}
      </div>
      <nav class="space-x-1 sm:space-x-2 flex items-center flex-wrap">
        <a href="#" class="nav-link text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
        <a href="#browse" class="nav-link text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Browse</a>
        ${sellItemLink}
        ${adminLink}
        <a href="#cart" class="nav-link text-gray-300 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Cart ${itemCount > 0 ? `<span class="ml-1 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">${itemCount}</span>` : ''}
        </a>
        ${authLinks}
      </nav>
    </div>
  `;

  if (isAuthenticated()) {
    document.getElementById('logout-button')?.addEventListener('click', logout);
  }
  updateActiveNavLink();
}

function renderFooter() {
  appFooter.innerHTML = `
    <p class="text-sm">&copy; <span class="text-orange-500 font-semibold">Mzansi Market</span>. All rights reserved.</p>
    <p class="text-xs text-gray-500">Built using JavaScript, CSS, and HTML</p>
  `;
}

function renderHomePage() {
  const bgImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjcwJSIgZng9IjUwJSIgZnk9IjUwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmYTUwMDtzdG9wLW9wYWNpdHk6MC44IiAvPjxtaWRkbGUgc3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6I2RlNWMwMDtzdG9wLW9wYWNpdHk6MC42IiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izg5NDUwMDtzdG9wLW9wYWNpdHk6MC44IiAvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPg==";
  // Apply a wrapper for the background styling
  appMain.innerHTML = `
    <div id="home-page-background-container" class="flex flex-col items-center justify-center text-center -mx-4 -my-8">
        <div id="home-page-background" style="background-image: url(${bgImageDataUrl});"></div>
        <div class="px-4 py-8 z-10">
            <h1 class="text-4xl font-bold text-orange-500 mb-4">Welcome to Mzansi Market!</h1>
            <p class="text-lg text-gray-300 mb-2">Your one-stop C-2-C e-commerce platform.</p>
            <p class="text-md text-gray-400 mb-8 max-w-2xl mx-auto">
            Mzansi Market connects buyers and sellers, offering a vibrant space to discover unique items, list your own goods for sale, and manage your purchases with ease. Explore a diverse range of products from our community!
            </p>
            <img 
            src="https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFya2V0fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60" 
            alt="Marketplace" 
            class="mx-auto rounded-lg shadow-lg" 
            style="max-width: 600px; height: auto;" 
            />
        </div>
    </div>
  `;
}


function renderBrowsePage(searchTerm = '') {
    const allProducts = [...products, ...getListedProductsFromStorage()];
    const filteredProducts = searchTerm ? allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) : allProducts;

    let productsHTML = '';
    if (filteredProducts.length > 0) {
        productsHTML = filteredProducts.map(product => `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-4" />
              <h3 class="text-xl font-semibold mb-2 text-orange-400">${product.name}</h3>
              <p class="text-gray-400 mb-1 text-sm">Category: ${product.category}</p>
              <p class="text-gray-400 mb-3 text-xs flex-grow">${product.description.substring(0,100)}...</p>
              <p class="text-2xl font-bold text-orange-500 mb-4">R${product.price.toFixed(2)}</p>
              <button data-product-id="${product.id}" class="add-to-cart-btn w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors mt-auto">
                Add to Cart
              </button>
            </div>
        `).join('');
    } else {
        productsHTML = `
            <div class="text-center py-10 col-span-full">
                <p class="text-xl text-gray-400">
                    ${searchTerm ? `No products found matching "${searchTerm}".` : "No products available at the moment."}
                </p>
                ${searchTerm ? `<button id="clear-search-btn" class="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors">Clear Search</button>` : ''}
            </div>
        `;
    }
    
    const welcomeBanner = isAuthenticated() && currentUser ? 
        `<p class="font-bold text-orange-500">Welcome, ${currentUser.name}!</p>` :
        `<p class="font-bold text-orange-500">Welcome, Shopper!</p>`;

    appMain.innerHTML = `
        <div class="bg-gray-800 border-l-4 border-orange-500 text-orange-400 p-4 mb-6 rounded-md" role="alert">
            ${welcomeBanner}
            <p>Happy browsing. Find the best deals on Mzansi Market.</p>
        </div>
        <h2 class="text-3xl font-semibold text-gray-200 mb-6">Browse Products</h2>
        <div class="mb-8">
            <input
            type="text"
            id="search-input"
            placeholder="Search products by name or description..."
            value="${searchTerm}"
            class="w-full p-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${productsHTML}
        </div>
    `;

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => addToCart(e.target.dataset.productId));
    });
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        renderBrowsePage(e.target.value);
        // Preserve cursor position (simplified)
        const input = e.target;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.focus();
        input.setSelectionRange(start,end);
    });
    document.getElementById('clear-search-btn')?.addEventListener('click', () => renderBrowsePage());
}

function renderSellItemPage() {
    if (!isAuthenticated()) {
        navigateTo('#auth=login');
        return;
    }
    appMain.innerHTML = `
        <div class="bg-gray-800 border-l-4 border-orange-500 text-orange-400 p-4 mb-6 rounded-md" role="status">
            <p>You are listing as: <strong class="text-orange-500">${currentUser.name}</strong></p>
        </div>
        <h2 class="text-3xl font-semibold text-gray-200 mb-6">Sell Your Item</h2>
        <form id="sell-item-form" class="bg-gray-800 p-8 rounded-lg shadow-md max-w-lg mx-auto">
            <div id="sell-item-message-area" class="mb-4"></div>
            <div class="mb-4">
            <label for="itemName" class="block text-gray-300 text-sm font-bold mb-2">Item Name</label>
            <input type="text" id="itemName" name="itemName" required class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
            <div class="mb-4">
            <label for="itemDescription" class="block text-gray-300 text-sm font-bold mb-2">Description</label>
            <textarea id="itemDescription" name="itemDescription" rows="4" class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
            </div>
            <div class="mb-4">
            <label for="itemPrice" class="block text-gray-300 text-sm font-bold mb-2">Price (R)</label>
            <input type="text" id="itemPrice" name="itemPrice" placeholder="e.g., 50.00" required class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
            <div class="mb-4">
            <label for="itemCategory" class="block text-gray-300 text-sm font-bold mb-2">Category</label>
            <select id="itemCategory" name="itemCategory" class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                ${Object.values(ProductCategory).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
            </div>
            <div class="mb-6">
            <label for="itemImage" class="block text-gray-300 text-sm font-bold mb-2">Image URL (Optional)</label>
            <input type="url" id="itemImage" name="itemImage" placeholder="https://example.com/image.jpg" class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
            <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">List Item</button>
        </form>
    `;
    document.getElementById('sell-item-form').addEventListener('submit', handleSellItemSubmit);
}

function handleSellItemSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const itemName = form.itemName.value.trim();
    const itemPrice = form.itemPrice.value.trim();
    const messageArea = document.getElementById('sell-item-message-area');
    messageArea.innerHTML = ''; // Clear previous messages

    if (!itemName) {
        messageArea.innerHTML = `<div class="p-4 bg-red-800 border-l-4 border-red-500 text-red-300 rounded-md"><p>Item Name is required.</p></div>`;
        return;
    }
    if (!itemPrice) {
        messageArea.innerHTML = `<div class="p-4 bg-red-800 border-l-4 border-red-500 text-red-300 rounded-md"><p>Price is required.</p></div>`;
        return;
    }
    const priceNumber = parseFloat(itemPrice);
    if (isNaN(priceNumber) || priceNumber < 0) {
        messageArea.innerHTML = `<div class="p-4 bg-red-800 border-l-4 border-red-500 text-red-300 rounded-md"><p>Please enter a valid, non-negative price.</p></div>`;
        return;
    }

    const newProduct = {
        id: `prod${Date.now()}`,
        name: itemName,
        description: form.itemDescription.value,
        price: priceNumber,
        category: form.itemCategory.value,
        imageUrl: form.itemImage.value || 'https://via.placeholder.com/300x200.png?text=No+Image', // Default image
        sellerName: currentUser.name,
        datePosted: new Date().toISOString()
    };

    const listedProducts = getListedProductsFromStorage();
    listedProducts.push(newProduct);
    saveListedProductsToStorage(listedProducts);

    messageArea.innerHTML = `<div class="p-4 bg-green-700 border-l-4 border-green-500 text-green-200 rounded-md"><p>Item listed successfully!</p></div>`;
    form.reset();
    setTimeout(() => messageArea.innerHTML = '', 5000);
}


function renderAdminPage() {
    if (!isAdmin()) {
        navigateTo(isAuthenticated() ? '#' : '#auth=login'); // Redirect to home if logged in but not admin, else to login
        return;
    }
    appMain.innerHTML = `
        <div class="bg-gray-800 border-l-4 border-orange-500 text-orange-400 p-4 mb-6 rounded-md" role="alert">
            <p>Logged in as: <strong class="text-orange-500">${currentUser.name}</strong> (Administrator)</p>
        </div>
        <h2 class="text-3xl font-semibold text-gray-200 mb-6">Admin Panel</h2>
        <p class="text-gray-300 mb-6">Admin functionalities will be available here. This section is a placeholder for managing users, products, and site settings.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-3 text-orange-400">Manage Users</h3>
                <p class="text-gray-400">View, edit, or remove user accounts.</p>
                <button class="mt-4 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">View Users</button>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-3 text-orange-400">Manage Products</h3>
                <p class="text-gray-400">View, edit, or remove product listings.</p>
                <button class="mt-4 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">View Products</button>
            </div>
        </div>
    `;
}

function renderCartPage() {
    if (cartItems.length === 0) {
        appMain.innerHTML = `
            <div class="text-center py-10">
                <h2 class="text-3xl font-semibold text-gray-200 mb-4">Your Cart is Empty</h2>
                <p class="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <a href="#browse" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded">Start Shopping</a>
            </div>
        `;
        return;
    }

    const itemsHTML = cartItems.map(item => `
        <div class="flex flex-col sm:flex-row items-center justify-between py-4 border-b border-gray-700 last:border-b-0">
            <div class="flex items-center mb-4 sm:mb-0">
                <img src="${item.imageUrl}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md mr-4" />
                <div>
                    <h3 class="text-lg font-medium text-orange-400">${item.name}</h3>
                    <p class="text-sm text-gray-400">Category: ${item.category}</p>
                    <p class="text-md font-semibold text-orange-500">R${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <div class="flex items-center border border-gray-600 rounded">
                    <button data-id="${item.id}" data-action="decrease" class="cart-quantity-btn px-3 py-1 text-gray-300 hover:bg-gray-700 rounded-l">-</button>
                    <input type="number" value="${item.quantity}" data-id="${item.id}" class="cart-quantity-input w-12 text-center bg-gray-700 text-white border-l border-r border-gray-600 py-1" />
                    <button data-id="${item.id}" data-action="increase" class="cart-quantity-btn px-3 py-1 text-gray-300 hover:bg-gray-700 rounded-r">+</button>
                </div>
                <p class="text-md font-semibold text-gray-200 w-24 text-right">R${(item.price * item.quantity).toFixed(2)}</p>
                <button data-id="${item.id}" class="remove-from-cart-btn text-orange-500 hover:text-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    `).join('');

    appMain.innerHTML = `
        <h2 class="text-3xl font-semibold text-gray-200 mb-8">Your Shopping Cart</h2>
        <div class="bg-gray-800 shadow-md rounded-lg p-6">
            ${itemsHTML}
            <div class="mt-8 pt-6 border-t border-gray-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-gray-200">Total:</h3>
                    <p class="text-2xl font-bold text-orange-500">R${getCartTotal().toFixed(2)}</p>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button id="clear-cart-btn" class="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded">Clear Cart</button>
                    <button id="checkout-btn" class="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.cart-quantity-btn').forEach(btn => btn.addEventListener('click', e => {
        const id = e.target.dataset.id;
        const currentItem = cartItems.find(item => item.id === id);
        if(!currentItem) return;
        const newQuantity = e.target.dataset.action === 'increase' ? currentItem.quantity + 1 : currentItem.quantity - 1;
        updateItemQuantity(id, newQuantity);
    }));
    document.querySelectorAll('.cart-quantity-input').forEach(input => input.addEventListener('change', e => {
        updateItemQuantity(e.target.dataset.id, e.target.value);
    }));
    document.querySelectorAll('.remove-from-cart-btn').forEach(btn => btn.addEventListener('click', e => {
        removeFromCart(e.target.closest('button').dataset.id);
    }));
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (!isAuthenticated()) {
            navigateTo('#auth=register');
        } else {
            alert('Checkout functionality not yet implemented.');
        }
    });
}

function renderAuthPage(initialView = 'login') {
    appMain.innerHTML = `
        <div class="max-w-md mx-auto mt-10 bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 id="auth-title" class="text-3xl font-bold text-orange-500 text-center mb-8">${initialView === 'login' ? 'Login' : 'Create Account'}</h2>
            <div id="auth-error-message" class="mb-4 text-center text-red-400"></div>
            <form id="auth-form">
                <!-- Form fields will be injected here -->
            </form>
            <p id="auth-toggle-text" class="text-center text-gray-400 text-sm mt-6">
                ${initialView === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button id="auth-toggle-button" class="font-medium text-orange-500 hover:text-orange-400 focus:outline-none">
                    ${initialView === 'login' ? 'Register here' : 'Login here'}
                </button>
            </p>
        </div>
    `;
    renderAuthForm(initialView);
    document.getElementById('auth-toggle-button').addEventListener('click', () => {
        renderAuthPage(initialView === 'login' ? 'register' : 'login');
    });
}

function renderAuthForm(view) {
    const form = document.getElementById('auth-form');
    let fields = `
        <div class="mb-6">
            <label for="email" class="block text-gray-300 text-sm font-bold mb-2">Email Address</label>
            <input type="email" id="email" name="email" required class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500">
        </div>
        <div class="mb-6">
            <label for="password" class="block text-gray-300 text-sm font-bold mb-2">Password</label>
            <input type="password" id="password" name="password" required class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500">
        </div>
    `;
    if (view === 'register') {
        fields = `
            <div class="mb-6">
                <label for="name" class="block text-gray-300 text-sm font-bold mb-2">Full Name</label>
                <input type="text" id="name" name="name" required class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
        ` + fields + `
            <div class="mb-6">
                <label for="confirmPassword" class="block text-gray-300 text-sm font-bold mb-2">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required class="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
        `;
    }
    form.innerHTML = fields + `
        <div class="mb-6">
            <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline">
                ${view === 'login' ? 'Login' : 'Register'}
            </button>
        </div>
    `;
    form.addEventListener('submit', view === 'login' ? handleLoginSubmit : handleRegisterSubmit);
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    const errorMessageDiv = document.getElementById('auth-error-message');
    errorMessageDiv.textContent = '';

    if (!email || !password) {
        errorMessageDiv.textContent = 'Email and password are required.';
        return;
    }
    if (login(email, password)) {
        renderHeader();
        const hashParts = (window.location.hash.split('?from=')[1] || '').split('&initialView=')[0];
        const fromPath = hashParts ? `#${decodeURIComponent(hashParts)}` : '#';
        navigateTo(fromPath === '#auth' || fromPath === '#auth=login' || fromPath === '#auth=register' ? '#' : fromPath);
    } else {
        errorMessageDiv.textContent = 'Invalid email or password.';
    }
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;
    const errorMessageDiv = document.getElementById('auth-error-message');
    errorMessageDiv.textContent = '';

    if (!name || !email || !password || !confirmPassword) {
        errorMessageDiv.textContent = 'All fields are required.';
        return;
    }
    if (password !== confirmPassword) {
        errorMessageDiv.textContent = 'Passwords do not match.';
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        errorMessageDiv.textContent = 'Please enter a valid email address.';
        return;
    }
    if(password.length < 6) {
        errorMessageDiv.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    const registrationResult = register(name, email, password);
    if (registrationResult.success) {
        renderHeader();
        navigateTo('#');
    } else {
        errorMessageDiv.textContent = registrationResult.message || 'Failed to register. Please try again.';
    }
}

function renderNotFoundPage() {
  appMain.innerHTML = `
    <div class="text-center py-10">
      <h1 class="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <h2 class="text-3xl font-semibold text-gray-200 mb-4">Page Not Found</h2>
      <p class="text-lg text-gray-300 mb-8">Sorry, the page you are looking for does not exist.</p>
      <a href="#" class="text-orange-500 hover:text-orange-400 font-medium text-lg">Go to Homepage</a>
    </div>
  `;
}

// --- ROUTING ---
const routes = {
  '': renderHomePage,
  '#browse': renderBrowsePage,
  '#sell': renderSellItemPage,
  '#admin': renderAdminPage,
  '#cart': renderCartPage,
  '#auth': (params) => renderAuthPage(params) // Param 'login' or 'register'
};

function router() {
  let hash = window.location.hash;
  appMain.className = "flex-grow container mx-auto px-4 py-8"; // Reset main class

  if (hash === '' || hash === '#') {
    appMain.className = ""; // Remove container for full-width home page
    renderHomePage();
  } else if (hash.startsWith('#auth')) {
    const param = hash.split('=')[1] || 'login';
    renderAuthPage(param);
  } else if (routes[hash]) {
    routes[hash]();
  } else {
    renderNotFoundPage();
  }
  updateActiveNavLink();
  window.scrollTo(0, 0); // Scroll to top on page change
}

function navigateTo(hash) {
  window.location.hash = hash;
}

function updateActiveNavLink() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        // Handle base '#' for home and exact match for others
        const linkHash = link.getAttribute('href');
        if ((window.location.hash === '' || window.location.hash === '#') && (linkHash === '#' || linkHash === '/')) {
            link.classList.add('active');
        } else if (linkHash === window.location.hash) {
            link.classList.add('active');
        } else if (window.location.hash.startsWith('#auth') && linkHash.startsWith('#auth')) {
            // Special handling for auth links if needed, e.g. based on param
            const currentView = window.location.hash.split('=')[1] || 'login';
            if (linkHash === `#auth=${currentView}`) {
                link.classList.add('active');
            }
        }
    });
}


// --- INITIALIZATION ---
function initializeApp() {
  // Load current user from localStorage
  const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
  // Load cart from localStorage
  cartItems = getCartFromStorage();
  
  // Seed users if necessary
  seedInitialUsers();

  renderHeader();
  renderFooter();
  router(); // Initial route
  window.addEventListener('hashchange', router);
}

document.addEventListener('DOMContentLoaded', initializeApp);
