// Image preview functionality
const itemImgInput = document.getElementById("itemImg");
const imagePreview = document.createElement("div");
imagePreview.id = "imagePreview";
imagePreview.className = "mt-3 hidden";
imagePreview.innerHTML = `
  <p class="text-sm text-gray-600 mb-2">Image Preview:</p>
  <img id="previewImg" class="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-300" />
  <button type="button" id="removeImage" class="mt-2 text-sm text-red-600 hover:text-red-800">Remove Image</button>
`;
itemImgInput.parentElement.appendChild(imagePreview);

// Handle image selection and preview
itemImgInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      itemImgInput.value = "";
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      itemImgInput.value = "";
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById("previewImg").src = event.target.result;
      imagePreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

// Remove image button
document.addEventListener("click", function(e) {
  if (e.target && e.target.id === "removeImage") {
    itemImgInput.value = "";
    imagePreview.classList.add("hidden");
  }
});

// Check backend availability
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:5000/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Check if editing existing item
const urlParams = new URLSearchParams(window.location.search);
const editItemId = urlParams.get('edit');
let isEditMode = false;
let currentEditItem = null;

// Load item data if editing
if (editItemId) {
  isEditMode = true;
  loadItemForEdit(editItemId);
}

async function loadItemForEdit(itemId) {
  try {
    if (!window.productsAPI) return;
    
    const backendAvailable = await checkBackend();
    if (!backendAvailable) return;
    
    const response = await productsAPI.getById(itemId);
    currentEditItem = response.data;
  
    if (currentEditItem) {
      // Update page title
      const pageTitle = document.querySelector("h1");
      if (pageTitle) {
        pageTitle.textContent = "Edit Item";
      }
      
      // Update button text
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = "Update Item";
      }
      
      // Pre-fill form with existing data
      document.getElementById("itemName").value = currentEditItem.name;
      document.getElementById("itemDesc").value = currentEditItem.description || "";
      document.getElementById("itemCategory").value = currentEditItem.category;
      document.getElementById("itemCondition").value = currentEditItem.condition;
      document.getElementById("itemPrice").value = currentEditItem.price;
      document.getElementById("itemTradeType").value = currentEditItem.tradeType;
      
      // Show existing image if available
      const imageUrl = currentEditItem.images?.[0]?.url || currentEditItem.image;
      if (imageUrl && imageUrl !== "https://via.placeholder.com/200?text=No+Image") {
        document.getElementById("previewImg").src = imageUrl;
        imagePreview.classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error('Error loading item for edit:', error);
  }
}

// Handle Post Item Form Submission
document.getElementById("postItemForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  // Get form values
  const itemName = document.getElementById("itemName").value.trim();
  const itemDesc = document.getElementById("itemDesc").value.trim();
  const itemCategory = document.getElementById("itemCategory").value;
  const itemCondition = document.getElementById("itemCondition").value;
  const itemPrice = parseFloat(document.getElementById("itemPrice").value);
  const itemTradeType = document.getElementById("itemTradeType").value;

  // Validation
  if (!itemName || !itemCategory || !itemCondition || !itemPrice || !itemTradeType) {
    alert("Please fill in all required fields!");
    return;
  }

  // Get current user and token
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token') || user.token;
  const userId = user._id || user.id || user.user?._id || user.user?.id;
  
  console.log('User:', user);
  console.log('Token:', token);
  console.log('User ID:', userId);
  
  if (!userId || !token) {
    alert("Please login to post items. User ID or token missing.");
    window.location.href = 'login.html';
    return;
  }
  
  // Ensure token is set in API client
  if (window.api && token) {
    api.setToken(token);
    // Also store it in localStorage for future use
    localStorage.setItem('token', token);
  }

  // Disable submit button
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = isEditMode ? 'Updating...' : 'Posting...';

  try {
    // Get uploaded image file if any
    const imageFile = itemImgInput.files && itemImgInput.files[0] ? itemImgInput.files[0] : null;
    await saveItemToDatabase(itemName, itemDesc, itemCategory, itemCondition, itemPrice, itemTradeType, imageFile);
  } catch (error) {
    console.error('Error saving item:', error);
    alert('Failed to save item: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = isEditMode ? 'Update Item' : 'Post Item';
  }

});

async function saveItemToDatabase(itemName, itemDesc, itemCategory, itemCondition, itemPrice, itemTradeType, imageFile) {
  // Check backend availability
  if (!window.productsAPI) {
    throw new Error('API client not available');
  }

  const backendAvailable = await checkBackend();
  if (!backendAvailable) {
    throw new Error('Backend server is not running');
  }

  // Get category-specific default image
  const categoryImages = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    'Clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500',
    'Books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
    'Home & Garden': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500',
    'Toys': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500',
    'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
    'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500',
    'Food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
    'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
    'Other': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
  };

  // Use category image or generic placeholder
  const defaultImageUrl = categoryImages[itemCategory] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

  try {
    if (isEditMode && currentEditItem) {
      // Update existing item
      const productId = currentEditItem._id || currentEditItem.id;
      
      if (imageFile) {
        // Create FormData with image and other fields
        const formData = new FormData();
        formData.append('images', imageFile);
        formData.append('name', itemName);
        formData.append('description', itemDesc);
        formData.append('category', itemCategory);
        formData.append('condition', itemCondition);
        formData.append('price', itemPrice);
        formData.append('tradeType', itemTradeType);
        formData.append('stock', 1);
        
        await productsAPI.updateWithImages(productId, formData);
      } else {
        // Update without image
        const productData = {
          name: itemName,
          description: itemDesc,
          category: itemCategory,
          condition: itemCondition,
          price: itemPrice,
          tradeType: itemTradeType,
          stock: 1
        };
        await productsAPI.update(productId, productData);
      }
      
      showSuccessModal("Item updated successfully in database!");
    } else {
      // Create new item
      if (imageFile) {
        // Create FormData with image and other fields
        const formData = new FormData();
        formData.append('images', imageFile);
        formData.append('name', itemName);
        formData.append('description', itemDesc);
        formData.append('category', itemCategory);
        formData.append('condition', itemCondition);
        formData.append('price', itemPrice);
        formData.append('tradeType', itemTradeType);
        formData.append('stock', 1);
        
        await productsAPI.createWithImages(formData);
      } else {
        // Create without image, use default
        const productData = {
          name: itemName,
          description: itemDesc,
          category: itemCategory,
          condition: itemCondition,
          price: itemPrice,
          tradeType: itemTradeType,
          stock: 1,
          images: [{
            public_id: 'category_default_' + Date.now(),
            url: defaultImageUrl
          }]
        };
        await productsAPI.create(productData);
      }
      
      showSuccessModal("Item posted successfully to database!");
      document.getElementById("postItemForm").reset();
      imagePreview.classList.add("hidden");
    }
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// Success Modal Functions
function showSuccessModal(message) {
  const modal = document.getElementById("successModal");
  const messageEl = document.getElementById("successMessage");
  messageEl.textContent = message;
  modal.classList.remove("hidden");
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.classList.add("hidden");
  // Redirect to My Items page
  setTimeout(() => {
    window.location.href = "my-items.html";
  }, 300);
}

// Mobile Menu Toggle (if needed)
const menuToggle = document.getElementById("menu-toggle");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
  });
}
