// Admin Dashboard JavaScript
let allItems = [];
let allTrades = [];
let itemToDelete = null;

// Load data on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  setupTabNavigation();
});

// Load all dashboard data
function loadDashboardData() {
  allItems = JSON.parse(localStorage.getItem("myItems")) || [];
  allTrades = JSON.parse(localStorage.getItem("trades")) || [];
  
  updateStatistics();
  renderItemsTable();
  renderTradesTable();
  renderAnalytics();
}

// Update statistics cards
function updateStatistics() {
  const totalItems = allItems.length;
  const activeTrades = allTrades.filter(t => t.status === "Pending").length;
  const pendingRequests = allTrades.filter(t => t.status === "Pending").length;
  const totalValue = allItems.reduce((sum, item) => sum + (item.price || 0), 0);
  
  // Count flagged trades (trades with >30% price difference)
  const flaggedTrades = allTrades.filter(t => {
    const requestedPrice = t.requestedItem?.price || t.requestingValue || 0;
    const offeredValue = t.offeringValue || 0;
    const diffPercentage = requestedPrice > 0 ? Math.abs(((offeredValue - requestedPrice) / requestedPrice) * 100) : 0;
    return t.needsReview || diffPercentage > 30;
  }).length;

  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("activeTrades").textContent = activeTrades;
  document.getElementById("pendingRequests").textContent = pendingRequests;
  document.getElementById("totalValue").textContent = `Ksh ${totalValue.toLocaleString()}`;
  
  // Update trade monitor counters
  const flaggedCountEl = document.getElementById("flaggedTradesCount");
  const pendingCountEl = document.getElementById("pendingTradesCount");
  if (flaggedCountEl) flaggedCountEl.textContent = flaggedTrades;
  if (pendingCountEl) pendingCountEl.textContent = pendingRequests;
}

// Render items table
function renderItemsTable() {
  const tbody = document.getElementById("itemsTableBody");
  
  if (allItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-gray-500">No items found</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allItems.map(item => `
    <tr class="hover:bg-gray-50">
      <td class="border p-3">#${item.id}</td>
      <td class="border p-3">
        <img src="${item.image || 'https://via.placeholder.com/50'}" 
             alt="${item.name}" 
             class="w-12 h-12 object-cover rounded"
             onerror="this.src='https://via.placeholder.com/50'">
      </td>
      <td class="border p-3 font-semibold">${item.name}</td>
      <td class="border p-3">Ksh ${item.price.toLocaleString()}</td>
      <td class="border p-3">
        <span class="px-2 py-1 rounded text-xs ${item.condition === 'New' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
          ${item.condition}
        </span>
      </td>
      <td class="border p-3">${item.category || 'N/A'}</td>
      <td class="border p-3">
        <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          ${item.tradeType || 'Full Amount'}
        </span>
      </td>
      <td class="border p-3">
        <div class="flex gap-2">
          <button onclick="viewItem(${item.id})" class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
            👁️ View
          </button>
          <button onclick="deleteItem(${item.id})" class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Render trades table with enhanced details
function renderTradesTable() {
  const tbody = document.getElementById("tradesTableBody");
  
  if (allTrades.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-gray-500">No trades found</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allTrades.map(trade => {
    const requestedItemName = trade.requestedItem?.name || 'Unknown Item';
    const requestedPrice = trade.requestedItem?.price || trade.requestingValue || 0;
    
    let offeredDescription = '';
    let offeredValue = trade.offeringValue || 0;
    
    if (trade.tradeType === 'BarterOnly' && trade.offeredItem) {
      offeredDescription = `${trade.offeredItem.name} (Ksh ${trade.offeredItem.price.toLocaleString()})`;
      offeredValue = trade.offeredItem.price;
    } else if (trade.tradeType === 'MoneyOnly') {
      offeredDescription = `Cash: Ksh ${trade.moneyAmount.toLocaleString()}`;
      offeredValue = trade.moneyAmount;
    } else if (trade.tradeType === 'BarterPlusMoney' && trade.offeredItem) {
      offeredDescription = `${trade.offeredItem.name} + Ksh ${trade.moneyAmount.toLocaleString()}`;
      offeredValue = trade.offeredItem.price + trade.moneyAmount;
    } else {
      // Fallback for old format
      offeredDescription = typeof trade.offeredItem === 'string' 
        ? trade.offeredItem 
        : trade.offeredItem?.name || 'Unknown';
    }
    
    const valueDiff = trade.valueDifference || (offeredValue - requestedPrice);
    const diffPercentage = requestedPrice > 0 ? Math.abs((valueDiff / requestedPrice) * 100) : 0;
    const fairnessScore = trade.fairnessScore || Math.max(0, 100 - diffPercentage).toFixed(1);
    const needsReview = trade.needsReview || diffPercentage > 30;
    
    return `
      <tr class="hover:bg-gray-50 ${needsReview ? 'bg-red-50' : ''}">
        <td class="border p-3">#${trade.id}</td>
        <td class="border p-3">
          <div class="font-semibold">${requestedItemName}</div>
          <div class="text-xs text-gray-600">Ksh ${requestedPrice.toLocaleString()}</div>
        </td>
        <td class="border p-3">
          <div class="text-sm">${offeredDescription}</div>
          <div class="text-xs text-gray-600">Total: Ksh ${offeredValue.toLocaleString()}</div>
        </td>
        <td class="border p-3">
          <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
            ${trade.tradeType || 'N/A'}
          </span>
        </td>
        <td class="border p-3 text-center">
          <div class="font-semibold ${valueDiff >= 0 ? 'text-green-600' : 'text-red-600'}">
            ${valueDiff >= 0 ? '+' : ''}Ksh ${Math.abs(valueDiff).toLocaleString()}
          </div>
          <div class="text-xs text-gray-500">${diffPercentage.toFixed(1)}%</div>
        </td>
        <td class="border p-3 text-center">
          <div class="font-bold ${fairnessScore >= 70 ? 'text-green-600' : fairnessScore >= 50 ? 'text-yellow-600' : 'text-red-600'}">
            ${fairnessScore}%
          </div>
          ${needsReview ? '<div class="text-xs text-red-600 font-semibold">⚠️ Review</div>' : ''}
        </td>
        <td class="border p-3">
          <span class="px-2 py-1 rounded text-xs ${
            trade.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            trade.status === 'Approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }">
            ${trade.status}
          </span>
        </td>
        <td class="border p-3">
          <div class="flex gap-2">
            <button onclick="viewTradeDetails(${trade.id})" class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
              👁️ View
            </button>
            ${trade.status === 'Pending' ? `
              <button onclick="approveTrade(${trade.id})" class="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
                ✓ Approve
              </button>
              <button onclick="rejectTrade(${trade.id})" class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                ✗ Reject
              </button>
            ` : `
              <button onclick="deleteTrade(${trade.id})" class="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
                🗑️ Delete
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Render analytics charts
function renderAnalytics() {
  renderCategoryChart();
  renderTradeTypeChart();
  renderConditionChart();
  renderPriceRangeChart();
}

// Category distribution chart
function renderCategoryChart() {
  const categories = {};
  allItems.forEach(item => {
    const cat = item.category || 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const chartHtml = Object.entries(categories).map(([cat, count]) => {
    const percentage = (count / allItems.length * 100).toFixed(1);
    return `
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium">${cat}</span>
          <span class="text-sm text-gray-600">${count} (${percentage}%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById("categoryChart").innerHTML = chartHtml || '<p class="text-gray-500">No data available</p>';
}

// Trade type distribution chart
function renderTradeTypeChart() {
  const tradeTypes = {};
  allItems.forEach(item => {
    const type = item.tradeType || 'Full Amount';
    tradeTypes[type] = (tradeTypes[type] || 0) + 1;
  });

  const chartHtml = Object.entries(tradeTypes).map(([type, count]) => {
    const percentage = (count / allItems.length * 100).toFixed(1);
    return `
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium">${type}</span>
          <span class="text-sm text-gray-600">${count} (${percentage}%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById("tradeTypeChart").innerHTML = chartHtml || '<p class="text-gray-500">No data available</p>';
}

// Condition distribution chart
function renderConditionChart() {
  const conditions = {};
  allItems.forEach(item => {
    const cond = item.condition || 'Unknown';
    conditions[cond] = (conditions[cond] || 0) + 1;
  });

  const chartHtml = Object.entries(conditions).map(([cond, count]) => {
    const percentage = (count / allItems.length * 100).toFixed(1);
    return `
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium">${cond}</span>
          <span class="text-sm text-gray-600">${count} (${percentage}%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-yellow-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById("conditionChart").innerHTML = chartHtml || '<p class="text-gray-500">No data available</p>';
}

// Price range distribution chart
function renderPriceRangeChart() {
  const ranges = {
    '0-5000': 0,
    '5001-10000': 0,
    '10001-20000': 0,
    '20001-50000': 0,
    '50000+': 0
  };

  allItems.forEach(item => {
    const price = item.price || 0;
    if (price <= 5000) ranges['0-5000']++;
    else if (price <= 10000) ranges['5001-10000']++;
    else if (price <= 20000) ranges['10001-20000']++;
    else if (price <= 50000) ranges['20001-50000']++;
    else ranges['50000+']++;
  });

  const chartHtml = Object.entries(ranges).map(([range, count]) => {
    const percentage = allItems.length > 0 ? (count / allItems.length * 100).toFixed(1) : 0;
    return `
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium">Ksh ${range}</span>
          <span class="text-sm text-gray-600">${count} (${percentage}%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-purple-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById("priceRangeChart").innerHTML = chartHtml || '<p class="text-gray-500">No data available</p>';
}

// Tab navigation
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Remove active state from all buttons
      tabButtons.forEach(b => {
        b.classList.remove('border-purple-600', 'text-purple-600');
        b.classList.add('text-gray-600');
      });

      // Add active state to clicked button
      btn.classList.add('border-purple-600', 'text-purple-600');
      btn.classList.remove('text-gray-600');

      // Hide all tab contents
      tabContents.forEach(content => content.classList.add('hidden'));

      // Show target tab content
      document.getElementById(`${targetTab}-tab`).classList.remove('hidden');
    });
  });
}

// View item details
function viewItem(itemId) {
  const item = allItems.find(i => i.id === itemId);
  if (!item) {
    alert("Item not found!");
    return;
  }

  alert(`Item Details:\n\nName: ${item.name}\nPrice: Ksh ${item.price.toLocaleString()}\nCondition: ${item.condition}\nCategory: ${item.category || 'N/A'}\nTrade Type: ${item.tradeType || 'Full Amount'}\nDescription: ${item.description || 'No description'}`);
}

// Delete item
function deleteItem(itemId) {
  itemToDelete = itemId;
  document.getElementById("deleteModal").classList.remove("hidden");
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("deleteModal").classList.add("hidden");
  itemToDelete = null;
}

// Confirm delete
function confirmDelete() {
  if (itemToDelete === null) return;

  allItems = allItems.filter(item => item.id !== itemToDelete);
  localStorage.setItem("myItems", JSON.stringify(allItems));
  
  loadDashboardData();
  closeDeleteModal();
  alert("Item deleted successfully!");
}

// Clear all items
function clearAllItems() {
  if (!confirm("Are you sure you want to delete ALL items? This action cannot be undone!")) {
    return;
  }

  localStorage.removeItem("myItems");
  allItems = [];
  loadDashboardData();
  alert("All items have been deleted!");
}

// View trade details
function viewTradeDetails(tradeId) {
  const trade = allTrades.find(t => t.id === tradeId);
  if (!trade) {
    alert("Trade not found!");
    return;
  }

  const requestedItemName = trade.requestedItem?.name || 'Unknown';
  const requestedPrice = trade.requestedItem?.price || trade.requestingValue || 0;
  
  let offeredDescription = '';
  let offeredValue = trade.offeringValue || 0;
  
  if (trade.tradeType === 'BarterOnly' && trade.offeredItem) {
    offeredDescription = `${trade.offeredItem.name}\nValue: Ksh ${trade.offeredItem.price.toLocaleString()}`;
  } else if (trade.tradeType === 'MoneyOnly') {
    offeredDescription = `Cash Payment\nAmount: Ksh ${trade.moneyAmount.toLocaleString()}`;
  } else if (trade.tradeType === 'BarterPlusMoney' && trade.offeredItem) {
    offeredDescription = `${trade.offeredItem.name} (Ksh ${trade.offeredItem.price.toLocaleString()})\n+ Cash: Ksh ${trade.moneyAmount.toLocaleString()}`;
  }
  
  const valueDiff = trade.valueDifference || (offeredValue - requestedPrice);
  const diffPercentage = requestedPrice > 0 ? Math.abs((valueDiff / requestedPrice) * 100) : 0;
  const fairnessScore = trade.fairnessScore || Math.max(0, 100 - diffPercentage).toFixed(1);
  
  let details = `📊 TRADE DETAILS\n\n`;
  details += `Trade ID: #${trade.id}\n`;
  details += `Status: ${trade.status}\n`;
  details += `Date: ${new Date(trade.date).toLocaleString()}\n\n`;
  details += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  details += `📦 REQUESTED ITEM:\n${requestedItemName}\nValue: Ksh ${requestedPrice.toLocaleString()}\n\n`;
  details += `💰 OFFERED:\n${offeredDescription}\nTotal Value: Ksh ${offeredValue.toLocaleString()}\n\n`;
  details += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  details += `📈 TRADE ANALYSIS:\n`;
  details += `Value Difference: ${valueDiff >= 0 ? '+' : ''}Ksh ${Math.abs(valueDiff).toLocaleString()}\n`;
  details += `Difference %: ${diffPercentage.toFixed(1)}%\n`;
  details += `Fairness Score: ${fairnessScore}%\n`;
  details += `Trade Type: ${trade.tradeType || 'N/A'}\n\n`;
  
  if (trade.needsReview || diffPercentage > 30) {
    details += `⚠️ WARNING: Large price difference detected!\n`;
    details += `This trade requires careful review.\n`;
  } else {
    details += `✅ Trade appears fair and balanced.\n`;
  }
  
  alert(details);
}

// Approve trade
function approveTrade(tradeId) {
  const trade = allTrades.find(t => t.id === tradeId);
  if (!trade) return;
  
  // Check if trade needs review
  const requestedPrice = trade.requestedItem?.price || trade.requestingValue || 0;
  const offeredValue = trade.offeringValue || 0;
  const valueDiff = trade.valueDifference || (offeredValue - requestedPrice);
  const diffPercentage = requestedPrice > 0 ? Math.abs((valueDiff / requestedPrice) * 100) : 0;
  
  if (diffPercentage > 30) {
    const confirm = window.confirm(
      `⚠️ WARNING: This trade has a ${diffPercentage.toFixed(1)}% price difference!\n\n` +
      `Offered: Ksh ${offeredValue.toLocaleString()}\n` +
      `Requested: Ksh ${requestedPrice.toLocaleString()}\n` +
      `Difference: ${valueDiff >= 0 ? '+' : ''}Ksh ${Math.abs(valueDiff).toLocaleString()}\n\n` +
      `Are you sure you want to approve this potentially unfair trade?`
    );
    
    if (!confirm) {
      return;
    }
  }

  trade.status = "Approved";
  trade.approvedBy = "Admin";
  trade.approvedDate = new Date().toISOString();
  localStorage.setItem("trades", JSON.stringify(allTrades));
  loadDashboardData();
  alert("✅ Trade approved successfully!");
}

// Reject trade
function rejectTrade(tradeId) {
  const trade = allTrades.find(t => t.id === tradeId);
  if (!trade) return;
  
  const reason = prompt("Enter rejection reason (optional):");

  trade.status = "Rejected";
  trade.rejectedBy = "Admin";
  trade.rejectedDate = new Date().toISOString();
  trade.rejectionReason = reason || "Not specified";
  localStorage.setItem("trades", JSON.stringify(allTrades));
  loadDashboardData();
  alert("❌ Trade rejected!");
}

// Delete trade
function deleteTrade(tradeId) {
  if (!confirm("Delete this trade record?")) return;

  allTrades = allTrades.filter(t => t.id !== tradeId);
  localStorage.setItem("trades", JSON.stringify(allTrades));
  loadDashboardData();
  alert("Trade deleted!");
}

// Export data
function exportData() {
  const data = {
    items: allItems,
    trades: allTrades,
    exportDate: new Date().toISOString()
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `digital-soko-export-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  alert("Data exported successfully!");
}

// Backup data
function backupData() {
  const backup = {
    items: localStorage.getItem("myItems"),
    trades: localStorage.getItem("trades"),
    backupDate: new Date().toISOString()
  };

  const backupStr = JSON.stringify(backup, null, 2);
  const backupBlob = new Blob([backupStr], { type: 'application/json' });
  const url = URL.createObjectURL(backupBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `digital-soko-backup-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  alert("Backup created successfully!");
}

// Restore data
function restoreData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        
        if (backup.items) {
          localStorage.setItem("myItems", backup.items);
        }
        if (backup.trades) {
          localStorage.setItem("trades", backup.trades);
        }
        
        loadDashboardData();
        alert("Data restored successfully!");
      } catch (error) {
        alert("Error restoring data: Invalid backup file");
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

// Reset platform
function resetPlatform() {
  const confirmation = prompt("Type 'RESET' to confirm platform reset:");
  
  if (confirmation !== 'RESET') {
    alert("Reset cancelled");
    return;
  }

  localStorage.clear();
  allItems = [];
  allTrades = [];
  loadDashboardData();
  alert("Platform has been reset!");
}
