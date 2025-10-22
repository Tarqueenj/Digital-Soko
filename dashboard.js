// Load recent items from localStorage
function loadRecentItems() {
  const grid = document.getElementById("recentItemsGrid");
  const myItems = JSON.parse(localStorage.getItem("myItems")) || [];
  
  // Clear loading message
  grid.innerHTML = "";
  
  if (myItems.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500 text-lg mb-4">No items posted yet</p>
        <a href="post-item.html" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Post Your First Item
        </a>
      </div>
    `;
    return;
  }
  
  // Get the 6 most recent items
  const recentItems = myItems.slice(-6).reverse();
  
  recentItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow hover:shadow-lg transition p-4";
    card.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/200'}" 
           alt="${item.name}"
           class="w-full h-40 object-cover rounded-md mb-3"
           onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
      <h4 class="text-lg font-semibold">${item.name}</h4>
      <p class="text-gray-600">Ksh ${item.price.toLocaleString()}</p>
      <p class="text-sm text-gray-500 mb-2">Condition: ${item.condition}</p>
      <button class="trade-btn mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              data-item="${item.name}"
              data-item-id="${item.id}">
        Trade Now
      </button>
    `;
    grid.appendChild(card);
  });
  
  // Attach event listeners to trade buttons
  attachTradeButtonListeners();
}

// Attach event listeners to trade buttons
function attachTradeButtonListeners() {
  const tradeButtons = document.querySelectorAll(".trade-btn");
  const modal = document.getElementById("tradeModal");
  const selectedItemDisplay = document.getElementById("selectedItem");
  
  tradeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const item = button.dataset.item;
      selectedItemDisplay.textContent = item;
      modal.classList.remove("hidden");
    });
  });
}

// Trade modal functionality
const modal = document.getElementById("tradeModal");
const selectedItemDisplay = document.getElementById("selectedItem");
const closeModalBtn = document.getElementById("closeModal");
const confirmTradeBtn = document.getElementById("confirmTrade");
const userItemSelect = document.getElementById("userItem");

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

if (confirmTradeBtn) {
  confirmTradeBtn.addEventListener("click", () => {
    const selectedItem = selectedItemDisplay.textContent;
    const userItem = userItemSelect.value;

    let requests = JSON.parse(localStorage.getItem("barterRequests")) || [];
    requests.push({ 
      selectedItem, 
      userItem,
      date: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem("barterRequests", JSON.stringify(requests));

    alert(`Trade request sent: ${userItem} for ${selectedItem}`);
    modal.classList.add("hidden");
  });
}

// Load items when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadRecentItems();
});

