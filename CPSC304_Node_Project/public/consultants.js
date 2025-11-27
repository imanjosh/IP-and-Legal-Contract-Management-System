// consultants.js

// Utility: render rows into a table
/*function renderTable(rows, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = '';
  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 10;
    td.textContent = 'No results found';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  rows.forEach(row => {
    const tr = document.createElement('tr');
    Object.values(row).forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
} */

  function renderTable(rows, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
  
    rows.forEach(row => {
      const tr = document.createElement('tr');
  
      Object.values(row).forEach(val => {
        const td = document.createElement('td');
  
       
        if (typeof val === "string" && val.includes("T") && val.includes("Z")) {
          td.textContent = val.split("T")[0];  
        } else {
          td.textContent = val;
        }
  
        tr.appendChild(td);
      });
  
      tbody.appendChild(tr);
    });
  }
  
  

function renderProjectionTable(rows) {
  const thead = document.querySelector('#projectionTable thead');
  const tbody = document.querySelector('#projectionTable tbody');

  thead.innerHTML = '<tr></tr>';   // keep valid structure
  tbody.innerHTML = '';

  if (!rows || rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10">No results found</td></tr>';
      return;
  }

  const keys = Object.keys(rows[0]);

  const headerRow = document.createElement('tr');
  keys.forEach(k => {
    const th = document.createElement('th');
    th.textContent = k;
    headerRow.appendChild(th);
  });

  thead.querySelector('tr').replaceWith(headerRow);

  rows.forEach(row => {
    const tr = document.createElement('tr');
    keys.forEach(k => {
      const td = document.createElement('td');
      td.textContent = row[k];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}



function renderAboveAvgTable(rows) {
  const tbody = document.querySelector('#aboveAvgTable tbody');
  tbody.innerHTML = '';

  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'No results found';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');
    ['consultant_id', 'name', 'specialization', 'num_consultations'].forEach(k => {
      const td = document.createElement('td');
      td.textContent = row[k];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}




// -------------------------
// Load all consultants (with optional filters)
async function loadConsultants(filters = {}) {
    const res = await fetch("/consultants/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
  
    const json = await res.json();
  
    if (json.success) {
      renderTable(json.data, 'consultantsTable');
    } else {
      alert(json.message || "Error loading consultants");
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
// Projection query
async function loadProjection() {
  const raw = document.getElementById('projAttributes').value.trim();
  if (!raw) { alert('Please enter attributes'); return; }
  console.log("This worked.");
  const normalized = raw.split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '_'));
  const query = normalized.join(',');
  const res = await fetch(`/consultants/projection?attributes=${query}`);
  const json = await res.json();
  console.log('Projection response:', json);

  if (json.success) {
    renderProjectionTable(json.data);
  } else {
    alert(json.message || 'Error running projection query');
  }
}



// -------------------------
// Above-average query
async function loadAboveAverage() {
  const res = await fetch('/consultants/above-average');
  const json = await res.json();
  console.log('Above-average response:', json);

  if (json.success) {
    renderAboveAvgTable(json.data);
  } else {
    alert('Error loading above-average consultants');
  }
}


// -------------------------
// Event listeners
document.getElementById('refreshBtn').addEventListener('click', () => loadConsultants());

document.getElementById('filterBtn').addEventListener('click', async () => {
    const filters = {
      name: document.getElementById("filterName").value.trim() || null,
      nameOp: "AND",
  
      license_number: document.getElementById("filterLicense").value.trim() || null,
      licenseOp: document.getElementById("conn2").value,
  
      min_exp: document.getElementById("filterMinExp").value.trim() || null,
      minExpOp: document.getElementById("conn3").value,
  
      max_exp: document.getElementById("filterMaxExp").value.trim() || null,
      maxExpOp: document.getElementById("conn4").value,
  
      specialization: document.getElementById("filterSpec").value.trim() || null,
      specializationOp: document.getElementById("conn5").value,
  
      contact: document.getElementById("filterContact").value.trim() || null,
      contactOp: "AND"
    };
  
    const res = await fetch("/consultants/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
  
    const json = await res.json();
    if (json.success) {
      renderTable(json.data, 'consultantsTable');
    } else {
      alert(json.message || "Filter failed");
    }
  });
  
  

document.getElementById('resetBtn').addEventListener('click', () => {
  ['filterName','filterLicense','filterMinExp','filterMaxExp','filterSpec','filterContact']
    .forEach(id => document.getElementById(id).value = '');
  ['conn2','conn3','conn4','conn5'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 'AND';
  });
  loadConsultants();
});

document.getElementById('consultantForm').addEventListener('submit', updateConsultantForm);

document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('consultantForm').reset();
});

document.getElementById('divisionBtn').addEventListener('click', loadDivisionResults);
document.getElementById('projBtn').addEventListener('click', loadProjection);
document.getElementById('aboveAvgBtn').addEventListener('click', loadAboveAverage);

// -------------------------
// Initial load
loadConsultants();
