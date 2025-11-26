// consultants.js

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
// Load all consultants (with optional filters)
async function loadConsultants(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`/consultants/filter?${query}`);
  const json = await res.json();
  if (json.success) {
    renderTable(json.data, 'consultantsTable');
  } else {
    alert('Error loading consultants');
  }
}

// -------------------------
// Update consultant
async function updateConsultantForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const consultant = Object.fromEntries(formData.entries());

  const res = await fetch(`/consultants/${consultant.consultant_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consultant)
  });
  const json = await res.json();
  if (json.success) {
    alert('Consultant updated successfully');
    loadConsultants();
    event.target.reset();
  } else {
    alert(json.message || 'Update failed');
  }
}

// -------------------------
// Division query
async function loadDivisionResults() {
  const res = await fetch('/consultants/division');
  const json = await res.json();
  if (json.success) {
    renderTable(json.data, 'divisionTable');
  } else {
    alert('Error loading division results');
  }
}

// -------------------------
// Event listeners
document.getElementById('refreshBtn').addEventListener('click', () => loadConsultants());

document.getElementById('filterBtn').addEventListener('click', () => {
  const filters = {
    name: document.getElementById('filterName').value,
    license_number: document.getElementById('filterLicense').value,
    min_exp: document.getElementById('filterMinExp').value,
    max_exp: document.getElementById('filterMaxExp').value,
    specialization: document.getElementById('filterSpec').value,
    contact: document.getElementById('filterContact').value
  };
  loadConsultants(filters);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('filterName').value = '';
  document.getElementById('filterLicense').value = '';
  document.getElementById('filterMinExp').value = '';
  document.getElementById('filterMaxExp').value = '';
  document.getElementById('filterSpec').value = '';
  document.getElementById('filterContact').value = '';
  loadConsultants();
});

document.getElementById('consultantForm').addEventListener('submit', updateConsultantForm);

document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('consultantForm').reset();
});

document.getElementById('divisionBtn').addEventListener('click', loadDivisionResults);

// -------------------------
// Initial load
loadConsultants();
