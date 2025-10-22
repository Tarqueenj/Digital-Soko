// Load all items from backend or localStorage
let allItems = [];
let myItems = [];
let selectedMarketItem = null;
let selectedUserItem = null;
let isFullTopup = false;
let useBackend = true;

const itemsGrid = document.getElementById("itemsGrid");
const tradeTypeFilter = document.getElementById("tradeTypeFilter");
const conditionFilter = document.getElementById("conditionFilter");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const applyFiltersBtn = document.getElementById("applyFilters");

// Check if backend is available
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:5000/health');
    return response.ok;
  } catch (error) {
    console.warn('Backend not available, using localStorage');
    return false;
  }
}

// Modal refs
const tradeModal = document.getElementById("tradeModal");
const modalItemImg = document.getElementById("modalItemImg");
const modalItemName = document.getElementById("modalItemName");
const modalItemPrice = document.getElementById("modalItemPrice");
const modalItemCondition = document.getElementById("modalItemCondition");
const userItemSelect = document.getElementById("userItemSelect");
const fullTopupBtn = document.getElementById("fullTopupBtn");
const userItemPreview = document.getElementById("userItemPreview");
const userItemImg = document.getElementById("userItemImg");
const userItemName = document.getElementById("userItemName");
const userItemPrice = document.getElementById("userItemPrice");

// Load items from backend or localStorage
async function loadItems() {
  itemsGrid.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-500 text-lg">Loading items...</p></div>';
  
  try {
    // Try to load from backend first
    if (useBackend && window.productsAPI) {
      const backendAvailable = await checkBackend();
      if (backendAvailable) {
        const response = await productsAPI.getAll();
        // Handle nested products array in response
        allItems = response.data?.products || response.data || [];
        myItems = [...allItems];
        renderItems(allItems);
        return;
      }
    }
  } catch (error) {
    console.error('Error loading from backend:', error);
  }
  
  // Fallback to localStorage
  allItems = JSON.parse(localStorage.getItem("myItems")) || [];
  myItems = [...allItems];
  renderItems(allItems);
}

// Render items to grid
function renderItems(items) {
  itemsGrid.innerHTML = "";
  
  if (items.length === 0) {
    itemsGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500 text-lg mb-4">No items available in the marketplace</p>
        <a href="post-item.html" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Post an Item
        </a>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow hover:shadow-lg transition p-4";
    
    // Handle both backend and localStorage formats
    const imageUrl = item.images?.[0]?.url || item.image || 'https://via.placeholder.com/200';
    const itemId = item._id || item.id;
    const itemPrice = item.price || 0;
    const itemCondition = item.condition || 'N/A';
    const itemCategory = item.category || 'N/A';
    const itemTradeType = item.tradeType || 'FullAmount';
    
    card.innerHTML = `
      <img src="${imageUrl}" 
           alt="${item.name}" 
           class="w-full h-40 object-cover rounded-md mb-3"
           onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
      <h4 class="text-lg font-semibold">${item.name}</h4>
      <p class="text-gray-600 font-bold">Ksh ${itemPrice.toLocaleString()}</p>
      <p class="text-sm text-gray-500">Condition: ${itemCondition}</p>
      <p class="text-sm text-gray-500">Category: ${itemCategory}</p>
      <p class="text-xs text-blue-600 mt-1">${itemTradeType}</p>
      <button onclick="openModal('${itemId}')" class="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        🔄 Trade Now
      </button>
    `;
    itemsGrid.appendChild(card);
  });
}

// Apply filters
function applyFilters() {
  const tradeType = tradeTypeFilter.value;
  const condition = conditionFilter.value;
  const minPriceVal = parseInt(minPrice.value) || 0;
  const maxPriceVal = parseInt(maxPrice.value) || Infinity;

  let filtered = allItems.filter(item => {
    // Trade type filter
    const matchesTradeType = tradeType === "all" || 
      (tradeType === "full" && item.tradeType === "FullAmount") ||
      (tradeType === "topup" && item.tradeType === "TopUp") ||
      (tradeType === "barter" && item.tradeType === "Barter");

    // Condition filter
    const matchesCondition = condition === "all" || 
      item.condition.toLowerCase() === condition.toLowerCase();

    // Price filter
    const matchesPrice = item.price >= minPriceVal && item.price <= maxPriceVal;

    return matchesTradeType && matchesCondition && matchesPrice;
  });

  renderItems(filtered);
}

// Open modal
function openModal(itemId) {
  selectedMarketItem = allItems.find(item => (item._id || item.id).toString() === itemId.toString());
  
  if (!selectedMarketItem) {
    alert("Item not found!");
    return;
  }

  // Populate modal with selected item
  const imageUrl = selectedMarketItem.images?.[0]?.url || selectedMarketItem.image || 'https://via.placeholder.com/200';
  const itemPrice = selectedMarketItem.price || 0;
  const itemCondition = selectedMarketItem.condition || 'N/A';
  
  modalItemImg.src = imageUrl;
  modalItemName.textContent = selectedMarketItem.name;
  modalItemPrice.textContent = `Ksh ${itemPrice.toLocaleString()}`;
  modalItemCondition.textContent = `Condition: ${itemCondition}`;

  // Populate user items dropdown
  userItemSelect.innerHTML = `<option value="">-- Select Your Item --</option>`;
  
  // Filter out the selected item from user's items
  const currentItemId = (selectedMarketItem._id || selectedMarketItem.id).toString();
  const userOwnItems = myItems.filter(item => (item._id || item.id).toString() !== currentItemId);
  
  if (userOwnItems.length === 0) {
    userItemSelect.innerHTML += `<option value="" disabled>You have no items to trade</option>`;
  } else {
    userOwnItems.forEach(item => {
      const itemId = item._id || item.id;
      const itemPrice = item.price || 0;
      const itemCondition = item.condition || 'N/A';
      userItemSelect.innerHTML += `
        <option value="${itemId}">
          ${item.name} - Ksh ${itemPrice.toLocaleString()} (${itemCondition})
        </option>
      `;
    });
  }

  // Reset selection
  selectedUserItem = null;
  isFullTopup = false;
  userItemPreview.classList.add("hidden");
  document.getElementById("priceComparison").classList.add("hidden");

  // Show modal
  tradeModal.classList.remove("hidden");
}

function closeModal() {
  tradeModal.classList.add("hidden");
  // Reset comparison
  document.getElementById("priceComparison").classList.add("hidden");
  userItemPreview.classList.add("hidden");
  selectedUserItem = null;
  isFullTopup = false;
}

// Show item comparison when user selects their item
function showItemComparison() {
  const selectedId = userItemSelect.value;
  
  if (!selectedId) {
    userItemPreview.classList.add("hidden");
    document.getElementById("priceComparison").classList.add("hidden");
    selectedUserItem = null;
    isFullTopup = false;
    return;
  }
  
  selectedUserItem = myItems.find(item => (item._id || item.id).toString() === selectedId.toString());
  isFullTopup = false;
  
  if (selectedUserItem) {
    // Show user item preview
    const itemImage = selectedUserItem.images?.[0]?.url || selectedUserItem.image || 'https://via.placeholder.com/200';
    const itemPrice = selectedUserItem.price || 0;
    userItemImg.src = itemImage;
    userItemName.textContent = selectedUserItem.name;
    userItemPrice.textContent = `Ksh ${itemPrice.toLocaleString()}`;
    userItemPreview.classList.remove("hidden");
    
    // Show price comparison
    const marketPrice = selectedMarketItem.price || 0;
    showPriceComparison(marketPrice, itemPrice);
  }
}

// Select full topup option
function selectFullTopup() {
  isFullTopup = true;
  selectedUserItem = null;
  userItemSelect.value = "";
  userItemPreview.classList.add("hidden");
  
  // Show price comparison for full topup
  const marketPrice = selectedMarketItem.price || 0;
  showPriceComparison(marketPrice, marketPrice, true);
}

// Show price comparison analysis
function showPriceComparison(wantPrice, offerPrice, isFullTopup = false) {
  const comparisonSection = document.getElementById("priceComparison");
  const compareWantPrice = document.getElementById("compareWantPrice");
  const compareOfferPrice = document.getElementById("compareOfferPrice");
  const compareDifference = document.getElementById("compareDifference");
  const topupMessage = document.getElementById("topupMessage");
  
  compareWantPrice.textContent = `Ksh ${wantPrice.toLocaleString()}`;
  compareOfferPrice.textContent = `Ksh ${offerPrice.toLocaleString()}`;
  
  const difference = wantPrice - offerPrice;
  const absDifference = Math.abs(difference);
  
  if (isFullTopup) {
    compareDifference.textContent = `Ksh 0`;
    compareDifference.className = "text-xl font-bold text-green-600";
    topupMessage.classList.remove("hidden");
    topupMessage.querySelector("p").textContent = `✓ You will pay the full price of Ksh ${wantPrice.toLocaleString()}`;
    topupMessage.className = "mt-4 p-3 bg-green-100 border-l-4 border-green-500 rounded";
  } else if (difference > 0) {
    compareDifference.textContent = `+Ksh ${absDifference.toLocaleString()}`;
    compareDifference.className = "text-xl font-bold text-red-600";
    topupMessage.classList.remove("hidden");
    topupMessage.querySelector("p").textContent = `⚠️ You need to top up Ksh ${absDifference.toLocaleString()} to complete this trade`;
    topupMessage.className = "mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded";
  } else if (difference < 0) {
    compareDifference.textContent = `-Ksh ${absDifference.toLocaleString()}`;
    compareDifference.className = "text-xl font-bold text-green-600";
    topupMessage.classList.remove("hidden");
    topupMessage.querySelector("p").textContent = `✓ Great deal! Your item is worth Ksh ${absDifference.toLocaleString()} more`;
    topupMessage.className = "mt-4 p-3 bg-green-100 border-l-4 border-green-500 rounded";
  } else {
    compareDifference.textContent = `Ksh 0`;
    compareDifference.className = "text-xl font-bold text-green-600";
    topupMessage.classList.remove("hidden");
    topupMessage.querySelector("p").textContent = `✓ Perfect match! Items have equal value`;
    topupMessage.className = "mt-4 p-3 bg-green-100 border-l-4 border-green-500 rounded";
  }
  
  comparisonSection.classList.remove("hidden");
}

function confirmTrade() {
  if (!selectedUserItem && !isFullTopup) {
    alert("Select your item or choose Full Top-Up.");
    return;
  }

  const trades = JSON.parse(localStorage.getItem("trades") || "[]");
  trades.push({
    id: Date.now(),
    requestedItem: selectedMarketItem,
    offeredItem: isFullTopup ? "Full Top-Up" : selectedUserItem,
    status: "Pending"
  });
  localStorage.setItem("trades", JSON.stringify(trades));

  alert("Trade request sent!");
  closeModal();
}

// Event listeners
applyFiltersBtn.addEventListener("click", applyFilters);

// Initial render
loadItems();
