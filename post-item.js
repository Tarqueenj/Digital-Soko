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

// Check if editing existing item
const urlParams = new URLSearchParams(window.location.search);
const editItemId = urlParams.get('edit');
let isEditMode = false;
let currentEditItem = null;

// Load item data if editing
if (editItemId) {
  isEditMode = true;
  const myItems = JSON.parse(localStorage.getItem("myItems")) || [];
  currentEditItem = myItems.find(item => item.id == editItemId);
  
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
    if (currentEditItem.image && currentEditItem.image !== "https://via.placeholder.com/200?text=No+Image") {
      document.getElementById("previewImg").src = currentEditItem.image;
      imagePreview.classList.remove("hidden");
    }
  }
}

// Handle Post Item Form Submission
document.getElementById("postItemForm").addEventListener("submit", function(e) {
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

  // Handle image
  let imageUrl = isEditMode && currentEditItem.image 
    ? currentEditItem.image 
    : "https://via.placeholder.com/200?text=No+Image";
  
  if (itemImgInput.files && itemImgInput.files[0]) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      imageUrl = event.target.result;
      saveItem(imageUrl);
    };
    
    reader.readAsDataURL(itemImgInput.files[0]);
  } else {
    saveItem(imageUrl);
  }

  function saveItem(image) {
    // Get existing items from localStorage
    const myItems = JSON.parse(localStorage.getItem("myItems")) || [];

    if (isEditMode && currentEditItem) {
      // Update existing item
      const itemIndex = myItems.findIndex(item => item.id == editItemId);
      
      if (itemIndex !== -1) {
        myItems[itemIndex] = {
          ...myItems[itemIndex],
          name: itemName,
          description: itemDesc,
          category: itemCategory,
          condition: itemCondition,
          price: itemPrice,
          tradeType: itemTradeType,
          image: image,
          dateUpdated: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem("myItems", JSON.stringify(myItems));
        
        // Show success message
        showSuccessModal("Item updated successfully!");
        
        // Clear edit mode
        localStorage.removeItem("editItemId");
      }
    } else {
      // Create new item
      const newItem = {
        id: Date.now(), // Simple unique ID
        name: itemName,
        description: itemDesc,
        category: itemCategory,
        condition: itemCondition,
        price: itemPrice,
        tradeType: itemTradeType,
        image: image,
        datePosted: new Date().toISOString()
      };

      // Add to items array
      myItems.push(newItem);

      // Save to localStorage
      localStorage.setItem("myItems", JSON.stringify(myItems));

      // Show success message
      showSuccessModal("Item posted successfully!");

      // Reset form
      document.getElementById("postItemForm").reset();
    }
  }
});

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
