// consultations.js

// Utility: render rows into a table
function renderTable(rows, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = '';
  rows.forEach(row => {
    const tr = document.createElement('tr');
    Object.values(row).forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// -------------------------
// Run Join Query
async function runJoinQuery() {
  const filters = {
    name: document.getElementById('joinName').value,
    type: document.getElementById('joinType').value,
    date_from: document.getElementById('joinDateFrom').value,
    date_to: document.getElementById('joinDateTo').value
  };

  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`/consultations/join?${query}`);
  const json = await res.json();

  if (json.success) {
    renderTable(json.data, 'joinTable');
  } else {
    alert('Error running join query');
  }
}

// -------------------------
// Reset Join Filters
function resetJoinFilters() {
  document.getElementById('joinName').value = '';
  document.getElementById('joinType').value = '';
  document.getElementById('joinDateFrom').value = '';
  document.getElementById('joinDateTo').value = '';
  document.querySelector('#joinTable tbody').innerHTML = '';
}

// -------------------------
// Run Aggregate Query
async function runAggregateQuery() {
  const minCount = document.getElementById('aggMinCount').value || 1;
  const res = await fetch(`/consultations/aggregate?min_count=${minCount}`);
  const json = await res.json();

  if (json.success) {
    renderTable(json.data, 'aggTable');
  } else {
    alert('Error running aggregate query');
  }
}

// -------------------------
// Event listeners
document.getElementById('joinBtn').addEventListener('click', runJoinQuery);
document.getElementById('joinReset').addEventListener('click', resetJoinFilters);
document.getElementById('aggBtn').addEventListener('click', runAggregateQuery);
