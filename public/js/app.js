// API Base URL
const API_BASE = '';

// State
let products = [];
let currentProductId = null;
let deleteProductId = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Load all products
async function loadProducts() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('products-container');
    const emptyState = document.getElementById('empty-state');
    const errorMsg = document.getElementById('error-message');
    
    loading.classList.remove('hidden');
    container.innerHTML = '';
    emptyState.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();

        if (response.ok) {
            products = data.products || [];
            displayProducts(products);
        } else {
            showError(data.error || 'Failed to load products');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

// Display products in the grid
function displayProducts(productsList) {
    const container = document.getElementById('products-container');
    const emptyState = document.getElementById('empty-state');

    if (productsList.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');

    container.innerHTML = productsList.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    const quantityClass = product.quantity === 0 ? 'low' : 
                         product.quantity < 10 ? 'medium' : 'high';
    
    const createdDate = new Date(product.created_at).toLocaleDateString();
    const updatedDate = new Date(product.updated_at).toLocaleDateString();
    
    return `
        <div class="product-card">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-details">
                <div class="product-detail">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value price">LKR ${formatPrice(product.price)}</span>
                </div>
                <div class="product-detail">
                    <span class="detail-label">Quantity:</span>
                    <span class="detail-value">
                        <span class="quantity ${quantityClass}">${product.quantity}</span>
                    </span>
                </div>
            </div>
            <div class="product-meta">
                <div>Created: ${createdDate}</div>
                <div>Updated: ${updatedDate}</div>
            </div>
            <div class="product-actions">
                <button class="btn btn-edit" onclick="editProduct(${product.id})">✏️ Edit</button>
                <button class="btn btn-delete" onclick="openDeleteModal(${product.id}, '${escapeHtml(product.name)}')">🗑️ Delete</button>
            </div>
        </div>
    `;
}

// Open add product modal
function openAddModal() {
    currentProductId = null;
    document.getElementById('modal-title').textContent = 'Add New Product';
    document.getElementById('submit-btn').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').classList.remove('hidden');
}

// Open edit product modal
async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        showError('Product not found');
        return;
    }

    currentProductId = id;
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('submit-btn').textContent = 'Update Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-quantity').value = product.quantity;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-modal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.getElementById('product-form').reset();
    currentProductId = null;
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const productData = {
        name: document.getElementById('product-name').value.trim(),
        quantity: parseInt(document.getElementById('product-quantity').value),
        price: parseFloat(document.getElementById('product-price').value)
    };

    try {
        let response;
        if (currentProductId) {
            // Update existing product
            response = await fetch(`${API_BASE}/products/${currentProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }

        const data = await response.json();

        if (response.ok) {
            showSuccess(currentProductId ? 'Product updated successfully!' : 'Product added successfully!');
            closeModal();
            loadProducts();
        } else {
            showError(data.error || 'Failed to save product');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Open delete confirmation modal
function openDeleteModal(id, name) {
    deleteProductId = id;
    document.getElementById('delete-product-name').textContent = name;
    document.getElementById('delete-modal').classList.remove('hidden');
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    deleteProductId = null;
}

// Confirm and delete product
async function confirmDelete() {
    if (!deleteProductId) return;

    const deleteBtn = document.querySelector('#delete-modal .btn-danger');
    const originalText = deleteBtn.textContent;
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';

    try {
        const response = await fetch(`${API_BASE}/products/${deleteProductId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Product deleted successfully!');
            closeDeleteModal();
            loadProducts();
        } else {
            showError(data.error || 'Failed to delete product');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalText;
    }
}

// Show error message
function showError(message) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = '❌ ' + message;
    errorMsg.classList.remove('hidden');
    setTimeout(() => {
        errorMsg.classList.add('hidden');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successMsg = document.getElementById('success-message');
    successMsg.textContent = '✅ ' + message;
    successMsg.classList.remove('hidden');
    setTimeout(() => {
        successMsg.classList.add('hidden');
    }, 3000);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('product-modal');
    const deleteModal = document.getElementById('delete-modal');
    
    if (event.target === productModal) {
        closeModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
}

