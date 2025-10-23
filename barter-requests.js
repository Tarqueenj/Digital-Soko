// Check backend availability
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:5000/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

const requestsList = document.getElementById("requestsList");
let trades = [];

// Load trades from backend
async function loadTrades() {
  requestsList.innerHTML = '<p class="text-gray-500">Loading trade requests...</p>';
  
  try {
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id || user.user?._id || user.user?.id;
    
    if (!userId) {
      requestsList.innerHTML = `
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-yellow-800">Please log in to view trade requests.</p>
          <a href="login.html" class="text-blue-600 hover:underline">Login</a>
        </div>
      `;
      return;
    }
    
    if (!window.tradesAPI) {
      requestsList.innerHTML = '<p class="text-red-500">API client not available. Please refresh the page.</p>';
      return;
    }
    
    const backendAvailable = await checkBackend();
    if (!backendAvailable) {
      requestsList.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">Backend server is not running.</p>
          <p class="text-sm text-gray-600 mt-2">Please start: <code class="bg-gray-100 px-2 py-1 rounded">cd Backend && npm run dev</code></p>
        </div>
      `;
      return;
    }
    
    // Load trades where user is the receiver (incoming requests)
    const response = await tradesAPI.getMyTrades();
    const allTrades = response.data?.trades || response.data || [];
    
    // Filter for pending trades where current user is the receiver
    trades = allTrades.filter(trade => {
      const receiverId = trade.receiver?._id || trade.receiver;
      return receiverId === userId && trade.status === 'pending';
    });
    
    renderTrades();
  } catch (error) {
    console.error('Error loading trades:', error);
    requestsList.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">Error loading trade requests: ${error.message}</p>
        <button onclick="loadTrades()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
      </div>
    `;
  }
}

function renderTrades() {
  requestsList.innerHTML = "";

  if (trades.length === 0) {
    requestsList.innerHTML = `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p class="text-gray-600 text-lg">No pending trade requests.</p>
        <p class="text-sm text-gray-500 mt-2">Trade requests will appear here when other users want to trade with you.</p>
      </div>
    `;
    return;
  }

  trades.forEach((trade) => {
    const card = document.createElement("div");
    card.className = "bg-white p-6 rounded-xl shadow hover:shadow-lg transition";

    const offeredItem = trade.offeredProduct?.name || 'Unknown Item';
    const requestedItem = trade.requestedProduct?.name || 'Unknown Item';
    const offeredPrice = trade.offeredProduct?.price || 0;
    const requestedPrice = trade.requestedProduct?.price || 0;
    const topupAmount = trade.topupAmount || 0;
    const fairnessScore = trade.fairnessAnalysis?.score || 0;
    const requesterName = trade.requester?.firstName || 'Unknown';
    
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-semibold text-gray-500">From: ${requesterName}</span>
            <span class="px-2 py-1 text-xs rounded-full ${
              fairnessScore >= 80 ? 'bg-green-100 text-green-700' :
              fairnessScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }">Fairness: ${fairnessScore}%</span>
          </div>
          <p class="text-lg">
            <span class="font-bold text-blue-600">${offeredItem}</span> 
            <span class="text-gray-500">(Ksh ${offeredPrice.toLocaleString()})</span>
            <br>
            <span class="text-gray-600">for your</span>
            <br>
            <span class="font-bold text-green-600">${requestedItem}</span>
            <span class="text-gray-500">(Ksh ${requestedPrice.toLocaleString()})</span>
          </p>
          ${topupAmount > 0 ? `<p class="text-sm text-purple-600 mt-2">+ Top-up: Ksh ${topupAmount.toLocaleString()}</p>` : ''}
        </div>
        <div class="flex flex-col space-y-2 ml-4">
          <button onclick="acceptTrade('${trade._id}')" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
            ✓ Accept
          </button>
          <button onclick="rejectTrade('${trade._id}')" class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
            ✗ Reject
          </button>
        </div>
      </div>
    `;

    requestsList.appendChild(card);
  });
}

// Accept trade
async function acceptTrade(tradeId) {
  if (!confirm('Are you sure you want to accept this trade?')) return;
  
  try {
    await tradesAPI.approve(tradeId);
    alert('✅ Trade accepted! The requester will be notified.');
    loadTrades();
  } catch (error) {
    console.error('Error accepting trade:', error);
    alert('Failed to accept trade: ' + error.message);
  }
}

// Reject trade
async function rejectTrade(tradeId) {
  if (!confirm('Are you sure you want to reject this trade?')) return;
  
  try {
    await tradesAPI.reject(tradeId, 'Declined by user');
    alert('❌ Trade rejected.');
    loadTrades();
  } catch (error) {
    console.error('Error rejecting trade:', error);
    alert('Failed to reject trade: ' + error.message);
  }
}

// Load trades on page load
loadTrades();
