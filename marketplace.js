// Load all items from localStorage
let allItems = [];
let myItems = [];
let selectedMarketItem = null;
let selectedUserItem = null;
let isFullTopup = false;

const itemsGrid = document.getElementById("itemsGrid");
const tradeTypeFilter = document.getElementById("tradeTypeFilter");
const conditionFilter = document.getElementById("conditionFilter");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const applyFiltersBtn = document.getElementById("applyFilters");

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

// Load items from localStorage
function loadItems() {
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
    card.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/200'}" 
           alt="${item.name}" 
           class="w-full h-40 object-cover rounded-md mb-3"
           onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
      <h4 class="text-lg font-semibold">${item.name}</h4>
      <p class="text-gray-600 font-bold">Ksh ${item.price.toLocaleString()}</p>
      <p class="text-sm text-gray-500">Condition: ${item.condition}</p>
      <p class="text-sm text-gray-500">Category: ${item.category || 'N/A'}</p>
      <p class="text-xs text-blue-600 mt-1">${item.tradeType || 'Full Amount'}</p>
      <button onclick="openModal(${item.id})" class="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
  selectedMarketItem = allItems.find(item => item.id === itemId);
  
  if (!selectedMarketItem) {
    alert("Item not found!");
    return;
  }

  // Populate modal with selected item
  modalItemImg.src = selectedMarketItem.image || 'https://via.placeholder.com/200';
  modalItemName.textContent = selectedMarketItem.name;
  modalItemPrice.textContent = `Ksh ${selectedMarketItem.price.toLocaleString()}`;
  modalItemCondition.textContent = `Condition: ${selectedMarketItem.condition}`;

  // Populate user items dropdown
  userItemSelect.innerHTML = `<option value="">-- Select Your Item --</option>`;
  
  // Filter out the selected item from user's items
  const userOwnItems = myItems.filter(item => item.id !== itemId);
  
  if (userOwnItems.length === 0) {
    userItemSelect.innerHTML += `<option value="" disabled>You have no items to trade</option>`;
  } else {
    userOwnItems.forEach(item => {
      userItemSelect.innerHTML += `
        <option value="${item.id}">
          ${item.name} - Ksh ${item.price.toLocaleString()} (${item.condition})
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
  const selectedId = parseInt(userItemSelect.value);
  
  if (!selectedId) {
    userItemPreview.classList.add("hidden");
    document.getElementById("priceComparison").classList.add("hidden");
    selectedUserItem = null;
    isFullTopup = false;
    return;
  }
  
  selectedUserItem = myItems.find(item => item.id === selectedId);
  isFullTopup = false;
  
  if (selectedUserItem) {
    // Show user item preview
    userItemImg.src = selectedUserItem.image || 'https://via.placeholder.com/200';
    userItemName.textContent = selectedUserItem.name;
    userItemPrice.textContent = `Ksh ${selectedUserItem.price.toLocaleString()}`;
    userItemPreview.classList.remove("hidden");
    
    // Show price comparison
    showPriceComparison(selectedMarketItem.price, selectedUserItem.price);
  }
}

// Select full topup option
function selectFullTopup() {
  isFullTopup = true;
  selectedUserItem = null;
  userItemSelect.value = "";
  userItemPreview.classList.add("hidden");
  
  // Show price comparison for full topup
  showPriceComparison(selectedMarketItem.price, selectedMarketItem.price, true);
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
