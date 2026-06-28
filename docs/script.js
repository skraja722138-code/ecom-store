const cartButton = document.getElementById('view-cart-button');
const closeCartButton = document.getElementById('close-cart');
const checkoutButton = document.getElementById('checkout-button');
const cartPanel = document.getElementById('cart-panel');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const productSearch = document.getElementById('product-search');
const categoryList = document.getElementById('category-list');
const shopNowButton = document.getElementById('shop-now');
const viewProductsButton = document.getElementById('view-products');
const logoutButton = document.getElementById('logout-button');
const productList = document.getElementById('product-list');

const productSource = './data/products.json';
const fallbackProducts = [
  {
    id: 'p1',
    name: 'Classic Sneakers',
    category: 'Fashion',
    price: 499,
    description: 'Comfortable shoes for daily wear.',
    imageUrl: './uploads/sample-sneakers.svg'
  },
  {
    id: 'p2',
    name: 'Leather Wallet',
    category: 'Accessories',
    price: 299,
    description: 'Premium wallet with card slots and a coin pocket.',
    imageUrl: './uploads/sample-wallet.svg'
  }
];

let products = [];
let cart = [];
let activeCategory = 'All';
let cartCloseTimer = null;

try {
  const savedCart = JSON.parse(localStorage.getItem('martnowCart') || '[]');
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch (error) {
  cart = [];
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  window.setTimeout(() => {
    toast.classList.remove('visible');
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function resolveAssetPath(value) {
  if (!value) return './uploads/default-product.svg';
  if (/^(https?:|data:)/i.test(value)) return value;
  return value.startsWith('/') ? `.${value}` : value;
}

function saveProducts(productsToSave) {
  localStorage.setItem('martnowProducts', JSON.stringify(productsToSave));
}

function getStoredProducts() {
  try {
    const raw = localStorage.getItem('martnowProducts');
    const parsed = raw ? JSON.parse(raw) : null;
    // Treat an empty array as "no stored products" so the bundled catalog can load
    if (Array.isArray(parsed) && parsed.length === 0) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function saveCart() {
  try {
    localStorage.setItem('martnowCart', JSON.stringify(cart));
  } catch (error) {
    showToast('Unable to save cart right now.', 'error');
  }
}

function updateCartSummary() {
  if (!cartCountEl || !cartTotalEl) return;

  const itemCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  cartCountEl.textContent = itemCount;
  cartTotalEl.textContent = `₹${total.toFixed(2)}`;
}

function renderCart() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';

  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="empty-state">Your cart is empty. Add products to continue.</p>';
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${resolveAssetPath(item.imageUrl)}" alt="${item.name}" />
      <div>
        <p class="cart-item-title">${item.name}</p>
        <p class="cart-item-meta">₹${Number(item.price || 0).toFixed(2)} each</p>
        <div class="quantity-controls">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
          <span class="quantity">${Number(item.quantity || 1)}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="button button-secondary remove-btn" data-id="${item.id}">Remove</button>
    `;
    cartItemsContainer.appendChild(row);
  });
}

function openCart() {
  if (cartCloseTimer) {
    clearTimeout(cartCloseTimer);
    cartCloseTimer = null;
  }

  if (!cartPanel || !cartBackdrop) return;

  cartPanel.classList.remove('hidden');
  cartBackdrop.classList.remove('hidden');

  requestAnimationFrame(() => {
    cartPanel.classList.add('visible');
    cartBackdrop.classList.add('visible');
  });

  renderCart();
  updateCartSummary();
}

function closeCart() {
  if (!cartPanel || !cartBackdrop) return;

  cartPanel.classList.remove('visible');
  cartBackdrop.classList.remove('visible');

  clearTimeout(cartCloseTimer);
  cartCloseTimer = window.setTimeout(() => {
    cartPanel.classList.add('hidden');
    cartBackdrop.classList.add('hidden');
  }, 220);
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartSummary();
  showToast(`${product.name} added to cart.`, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartSummary();
  renderCart();
  showToast('Item removed from cart.', 'success');
}

function increaseQuantity(productId) {
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity = Number(item.quantity || 0) + 1;
    saveCart();
    updateCartSummary();
    renderCart();
  }
}

function decreaseQuantity(productId) {
  const item = cart.find((item) => item.id === productId);

  if (!item) return;

  item.quantity = Number(item.quantity || 1) - 1;

  if (item.quantity <= 0) {
    cart = cart.filter((currentItem) => currentItem.id !== productId);
  }

  saveCart();
  updateCartSummary();
  renderCart();

  if (cart.some((currentItem) => currentItem.id === productId)) {
    showToast('Quantity updated.', 'success');
  }
}

function checkoutCart() {
  if (!cart.length) {
    showToast('Your cart is empty. Add products before checkout.', 'error');
    return;
  }

  if (!window.confirm('Place this order now and clear the cart?')) {
    return;
  }

  cart = [];
  saveCart();
  updateCartSummary();
  renderCart();
  closeCart();
  showToast('Order placed successfully. Thank you for shopping.', 'success');
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.innerHTML = `
    <span class="tag">${product.category || 'General'}</span>
    <img src="${resolveAssetPath(product.imageUrl || './uploads/default-product.svg')}" alt="${product.name}" />
    <h3>${product.name}</h3>
    <p>${product.description || 'Fresh quality product from the catalog.'}</p>
    <div class="price">₹${Number(product.price || 0).toFixed(2)}</div>
    <button class="button button-primary">Add to Cart</button>
  `;

  card.querySelector('button').addEventListener('click', () => addToCart(product));
  return card;
}

function renderProducts(filteredProducts) {
  if (!productList) return;

  productList.innerHTML = '';

  if (!filteredProducts.length) {
    productList.innerHTML = '<p class="empty-state">No matching products found. Try another search or category.</p>';
    return;
  }

  filteredProducts.forEach((product) => {
    productList.appendChild(createProductCard(product));
  });
}

function filterProducts() {
  const query = productSearch?.value.trim().toLowerCase() || '';
  const filtered = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesQuery = [product.name, product.description, product.category].some((value) =>
      value?.toLowerCase().includes(query)
    );
    return matchesCategory && matchesQuery;
  });
  renderProducts(filtered);
}

function renderCategories() {
  if (!categoryList) return;

  const categories = ['All', ...new Set(products.map((product) => product.category || 'General'))];
  categoryList.innerHTML = '';

  categories.forEach((category) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'category-pill' + (category === activeCategory ? ' active' : '');
    pill.textContent = category;
    pill.addEventListener('click', () => {
      activeCategory = category;
      renderCategories();
      filterProducts();
    });
    categoryList.appendChild(pill);
  });
}

async function loadProducts() {
  const storedProducts = getStoredProducts();
  if (storedProducts && Array.isArray(storedProducts)) {
    products = storedProducts;
    renderCategories();
    filterProducts();
    updateCartSummary();
    return;
  }

  try {
    const response = await fetch(productSource, { cache: 'no-store' });
    const data = await response.json();
    products = Array.isArray(data) && data.length ? data : fallbackProducts;
    saveProducts(products);
    renderCategories();
    filterProducts();
  } catch (error) {
    products = fallbackProducts;
    saveProducts(products);
    renderCategories();
    filterProducts();
    showToast('Using the built-in demo catalog.', 'info');
  } finally {
    updateCartSummary();
  }
}

function logoutUser() {
  localStorage.removeItem('martnowUser');
  localStorage.removeItem('adminPassword');
  localStorage.removeItem('martnowCart');
  window.location.href = './index.html';
}

window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('martnowUser')) localStorage.setItem('martnowUser', 'user');

  loadProducts();
  updateCartSummary();

  if (cartButton) cartButton.addEventListener('click', openCart);
  if (closeCartButton) closeCartButton.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);
  if (checkoutButton) checkoutButton.addEventListener('click', checkoutCart);
  if (productSearch) productSearch.addEventListener('input', filterProducts);
  if (shopNowButton) shopNowButton.addEventListener('click', () => document.getElementById('products').scrollIntoView({ behavior: 'smooth' }));
  if (viewProductsButton) viewProductsButton.addEventListener('click', () => document.getElementById('products').scrollIntoView({ behavior: 'smooth' }));
  if (logoutButton) logoutButton.addEventListener('click', logoutUser);

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (!target.classList.contains('remove-btn') && !target.classList.contains('qty-btn')) {
        return;
      }

      const productId = target.dataset.id;

      if (target.classList.contains('remove-btn')) {
        removeFromCart(productId);
      } else if (target.classList.contains('qty-btn')) {
        if (target.dataset.action === 'increase') {
          increaseQuantity(productId);
        } else if (target.dataset.action === 'decrease') {
          decreaseQuantity(productId);
        }
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCart();
    }
  });

  showUserPanel();
  setActiveButton('user');
});

const btnAdmin = document.getElementById('btn-admin-panel');
const btnUser = document.getElementById('btn-user-panel');

function setActiveButton(active) {
  if (btnAdmin) btnAdmin.classList.toggle('active', active === 'admin');
  if (btnUser) btnUser.classList.toggle('active', active === 'user');
}

function showUserPanel() {
  const userView = document.getElementById('user-view');
  const adminView = document.getElementById('admin-view');
  if (userView) userView.classList.remove('hidden');
  if (adminView) adminView.classList.add('hidden');
  setActiveButton('user');
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

function showAdminPanel() {
  const userView = document.getElementById('user-view');
  const adminView = document.getElementById('admin-view');
  if (userView) userView.classList.add('hidden');
  if (adminView) adminView.classList.remove('hidden');
  setActiveButton('admin');
  document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
}

if (btnAdmin) btnAdmin.addEventListener('click', () => {
  window.location.href = './admin.html';
});
if (btnUser) btnUser.addEventListener('click', showUserPanel);

window.addEventListener('storage', (event) => {
  if (event.key === 'adminPassword') {
    if (event.newValue) {
      showAdminPanel();
    } else {
      showUserPanel();
    }
  }
});
