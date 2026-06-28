const productForm = document.getElementById('product-form');
const productList = document.getElementById('admin-product-list');
const productCount = document.getElementById('product-count');
const logoutAdminButton = document.getElementById('logout-admin-button');

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

async function loadAdminProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
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
        <img src="${product.imageUrl}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description || 'No description provided.'}</p>
        <div class="price">₹${product.price.toFixed(2)}</div>
        <button class="button button-secondary" data-id="${product.id}">Remove Product</button>
      `;

      const removeButton = card.querySelector('button');
      removeButton.addEventListener('click', () => removeProduct(product.id));
      productList.appendChild(card);
    });
  } catch (error) {
    showToast('Unable to load products right now. Please refresh and try again.', 'error');
  }
}

async function removeProduct(productId) {
  if (!confirm('Remove this product permanently?')) return;

  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    showToast('Product removed successfully.', 'success');
    loadAdminProducts();
  } else {
    showToast('Failed to remove product. Please refresh and try again.', 'error');
  }
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
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      productForm.reset();
      showToast('Product added successfully.', 'success');
      loadAdminProducts();
    } else {
      showToast('Could not add product. Please refresh the page and try again.', 'error');
    }
  } catch (error) {
    showToast('Network error while adding the product.', 'error');
  } finally {
    setBusy(productForm.querySelector('button[type="submit"]'), false, 'Add Product');
  }
}

function logoutAdmin() {
  window.location.href = '/';
}

window.addEventListener('DOMContentLoaded', () => {
  loadAdminProducts();

  if (productForm) productForm.addEventListener('submit', addProduct);
  if (logoutAdminButton) logoutAdminButton.addEventListener('click', logoutAdmin);
});
