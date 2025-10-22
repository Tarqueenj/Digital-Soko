
function loadMyItems() {
  const container = document.getElementById("my-items-list");
  const myItems = JSON.parse(localStorage.getItem("myItems")) || [];
  
  container.innerHTML = "";

  if (myItems.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500 text-lg mb-4">You haven't posted any items yet.</p>
        <a href="post-item.html" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Post Your First Item
        </a>
      </div>
    `;
    return;
  }

  myItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow hover:shadow-lg transition";
    card.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/200'}" 
           alt="${item.name}" 
           class="w-full h-40 object-cover rounded-md mb-3"
           onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
      <h3 class="text-lg font-bold">${item.name}</h3>
      <p class="text-gray-600">Condition: ${item.condition}</p>
      <p class="text-gray-600">Category: ${item.category || 'N/A'}</p>
      <p class="text-gray-800 font-semibold">Ksh ${item.price.toLocaleString()}</p>
      <div class="mt-4 flex justify-between gap-2">
        <button onclick="editItem(${item.id})" class="flex-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
        <button onclick="deleteItem(${item.id})" class="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function editItem(id) {
  // Redirect to post-item page with edit parameter
  window.location.href = "post-item.html?edit=" + id;
}

function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) {
    return;
  }
  
  const myItems = JSON.parse(localStorage.getItem("myItems")) || [];
  const index = myItems.findIndex(item => item.id === id);
  
  if (index !== -1) {
    myItems.splice(index, 1);
    localStorage.setItem("myItems", JSON.stringify(myItems));
    loadMyItems();
    alert("Item deleted successfully!");
  } else {
    alert("Item not found!");
  }
}

// Load items on page load
window.onload = loadMyItems;
