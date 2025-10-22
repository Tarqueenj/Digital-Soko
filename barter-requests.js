// Toggle navbar menu on mobile
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("hidden");
});

// Load requests from localStorage
const requestsList = document.getElementById("requestsList");
let requests = JSON.parse(localStorage.getItem("barterRequests")) || [];

function renderRequests() {
  requestsList.innerHTML = "";

  if (requests.length === 0) {
    requestsList.innerHTML = `
      <p class="text-gray-600">No barter requests yet.</p>
    `;
    return;
  }

  requests.forEach((req, index) => {
    const card = document.createElement("div");
    card.className = "bg-white p-6 rounded-xl shadow flex justify-between items-center";

    card.innerHTML = `
      <div>
        <p><span class="font-bold text-blue-600">${req.userItem}</span> offered for 
        <span class="font-bold text-green-600">${req.selectedItem}</span></p>
      </div>
      <div class="flex space-x-3">
        <button class="accept-btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" data-index="${index}">
          Accept
        </button>
        <button class="decline-btn bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" data-index="${index}">
          Decline
        </button>
      </div>
    `;

    requestsList.appendChild(card);
  });

  // Accept / Decline event handlers
  document.querySelectorAll(".accept-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = e.target.dataset.index;
      alert(`✅ Trade accepted: ${requests[i].userItem} for ${requests[i].selectedItem}`);
      requests.splice(i, 1);
      localStorage.setItem("barterRequests", JSON.stringify(requests));
      renderRequests();
    });
  });

  document.querySelectorAll(".decline-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = e.target.dataset.index;
      alert(`❌ Trade declined.`);
      requests.splice(i, 1);
      localStorage.setItem("barterRequests", JSON.stringify(requests));
      renderRequests();
    });
  });
}

// Render on page load
renderRequests();
