const productForm = document.getElementById('product-form');
const productList = document.getElementById('admin-product-list');
const productCount = document.getElementById('product-count');
const logoutAdminButton = document.getElementById('logout-admin-button');

let products = [];

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

function setBusy(button, isBusy, text) {
  if (!button) return;
  button.disabled = isBusy;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = isBusy ? text : button.dataset.originalText;
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
    if (Array.isArray(parsed) && parsed.length === 0) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });
}

async function loadAdminProducts() {
  const storedProducts = getStoredProducts();
  if (storedProducts && Array.isArray(storedProducts)) {
    products = storedProducts;
  } else {
    try {
      const response = await fetch('./data/products.json', { cache: 'no-store' });
      const data = await response.json();
      products = Array.isArray(data) ? data : [];
      saveProducts(products);
    } catch (error) {
      products = [];
    }
  }

  productList.innerHTML = '';
  productCount.textContent = `Products loaded: ${products.length}`;

  if (!products.length) {
    productList.innerHTML = '<p class="empty-state">No products yet. Add one from the form above.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card admin-product';
    card.innerHTML = `
      <span class="tag">${product.category || 'General'}</span>
      <img src="${resolveAssetPath(product.imageUrl)}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description || 'No description provided.'}</p>
      <div class="price">₹${Number(product.price || 0).toFixed(2)}</div>
      <button class="button button-secondary" data-id="${product.id}">Remove Product</button>
    `;

    const removeButton = card.querySelector('button');
    removeButton.addEventListener('click', () => removeProduct(product.id));
    productList.appendChild(card);
  });
}

async function removeProduct(productId) {
  if (!confirm('Remove this product permanently?')) return;

  products = products.filter((item) => item.id !== productId);
  saveProducts(products);
  showToast('Product removed successfully.', 'success');
  loadAdminProducts();
}

async function addProduct(event) {
  event.preventDefault();
  const formData = new FormData(productForm);
  const name = formData.get('name')?.toString().trim();
  const price = formData.get('price')?.toString().trim();

  if (!name || !price) {
    showToast('Please enter a product name and price.', 'error');
    return;
  }

  setBusy(productForm.querySelector('button[type="submit"]'), true, 'Adding...');

  try {
    const imageInput = productForm.querySelector('input[name="image"]');
    const file = imageInput?.files?.[0];
    const imageUrl = file ? await readFileAsDataUrl(file) : './uploads/default-product.svg';

    const newProduct = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      category: (formData.get('category')?.toString().trim() || 'General').trim(),
      price: parseFloat(price),
      description: (formData.get('description')?.toString().trim() || '').trim(),
      imageUrl
    };

    products.unshift(newProduct);
    saveProducts(products);
    productForm.reset();
    showToast('Product added successfully.', 'success');
    loadAdminProducts();
  } catch (error) {
    showToast('Could not add product. Please try again.', 'error');
  } finally {
    setBusy(productForm.querySelector('button[type="submit"]'), false, 'Add Product');
  }
}

function logoutAdmin() {
  window.location.href = './index.html';
}

window.addEventListener('DOMContentLoaded', () => {
  loadAdminProducts();

  if (productForm) productForm.addEventListener('submit', addProduct);
  if (logoutAdminButton) logoutAdminButton.addEventListener('click', logoutAdmin);
});
