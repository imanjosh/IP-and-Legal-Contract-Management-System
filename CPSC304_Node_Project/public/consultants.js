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
    ['CONSULTANT_ID', 'NAME', 'SPECIALIZATION', 'NUM_CONSULTATIONS'].forEach(k => {
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
    try {
      const res = await fetch("/consultants/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters)
      });
    
      const json = await res.json();
    
      if (json.success) {
        renderTable(json.data, 'consultantsTable');
      }
    } catch (error) {
      console.error("Failed to load consultants:", error);
    }
  }
  

// -------------------------
// Update consultant
async function updateConsultantForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const consultant = {};
  
  // Only include fields that have values
  for (let [key, value] of formData.entries()) {
    if (value && value.trim() !== '') {
      consultant[key] = value;
    }
  }
  
  // Consultant ID is always required
  if (!consultant.consultant_id) {
    alert('Consultant ID is required');
    return;
  }
  
  // Check if there's at least one field to update besides ID
  if (Object.keys(consultant).length === 1) {
    alert('Please provide at least one field to update');
    return;
  }

  const res = await fetch(`/consultants/${consultant.consultant_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consultant)
  });
  const json = await res.json();
  if (json.success) {
    alert(json.message);
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
  const checkboxes = [
    document.getElementById('proj_consultant_id'),
    document.getElementById('proj_name'),
    document.getElementById('proj_license_number'),
    document.getElementById('proj_years_experience'),
    document.getElementById('proj_specialization'),
    document.getElementById('proj_contact_details')
  ];

  const selectedAttributes = checkboxes
    .filter(cb => cb && cb.checked)
    .map(cb => cb.value);

  if (selectedAttributes.length === 0) {
    alert('Please select at least one attribute to display');
    return;
  }

  const query = selectedAttributes.join(',');
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
    if (!json.data || json.data.length === 0) {
      alert('No consultants found with above-average consultations. This could mean:\n- No consultation data exists\n- All consultants have equal consultations\n- No consultants exceed the average');
    }
    renderAboveAvgTable(json.data);
  } else {
    alert('Error loading above-average consultants: ' + (json.message || 'Unknown error'));
  }
}


// -------------------------
// Event listeners

// Enable/disable inputs based on checkboxes
document.getElementById('enableName').addEventListener('change', (e) => {
  document.getElementById('filterName').disabled = !e.target.checked;
});

document.getElementById('enableLicense').addEventListener('change', (e) => {
  document.getElementById('filterLicense').disabled = !e.target.checked;
  document.getElementById('conn2').disabled = !e.target.checked;
});

document.getElementById('enableExp').addEventListener('change', (e) => {
  document.getElementById('filterMinExp').disabled = !e.target.checked;
  document.getElementById('filterMaxExp').disabled = !e.target.checked;
  document.getElementById('conn3').disabled = !e.target.checked;
});

document.getElementById('enableSpec').addEventListener('change', (e) => {
  document.getElementById('filterSpec').disabled = !e.target.checked;
  document.getElementById('conn4').disabled = !e.target.checked;
});

document.getElementById('enableContact').addEventListener('change', (e) => {
  document.getElementById('filterContact').disabled = !e.target.checked;
  document.getElementById('conn5').disabled = !e.target.checked;
});

document.getElementById('filterBtn').addEventListener('click', async () => {
    const filters = {
      name: document.getElementById('enableName').checked ? 
        (document.getElementById("filterName").value.trim() || null) : null,
      nameOp: "AND",
  
      license_number: document.getElementById('enableLicense').checked ?
        (document.getElementById("filterLicense").value.trim() || null) : null,
      licenseOp: document.getElementById("conn2").value,
  
      min_exp: document.getElementById('enableExp').checked ?
        (document.getElementById("filterMinExp").value.trim() || null) : null,
      minExpOp: document.getElementById("conn3").value,
  
      max_exp: document.getElementById('enableExp').checked ?
        (document.getElementById("filterMaxExp").value.trim() || null) : null,
      maxExpOp: document.getElementById("conn3").value,
  
      specialization: document.getElementById('enableSpec').checked ?
        (document.getElementById("filterSpec").value.trim() || null) : null,
      specializationOp: document.getElementById("conn4").value,
  
      contact: document.getElementById('enableContact').checked ?
        (document.getElementById("filterContact").value.trim() || null) : null,
      contactOp: document.getElementById("conn5").value
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
  // Uncheck all checkboxes
  ['enableName', 'enableLicense', 'enableExp', 'enableSpec', 'enableContact']
    .forEach(id => document.getElementById(id).checked = false);
  
  // Clear all inputs
  ['filterName','filterLicense','filterMinExp','filterMaxExp','filterSpec','filterContact']
    .forEach(id => {
      const el = document.getElementById(id);
      el.value = '';
      el.disabled = true;
    });
  
  // Reset and disable all dropdowns
  ['conn2','conn3','conn4','conn5'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = 'AND';
      el.disabled = true;
    }
  });
  
  loadConsultants();
});

document.getElementById('consultantForm').addEventListener('submit', updateConsultantForm);

document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('consultantForm').reset();
});

document.getElementById('divisionBtn').addEventListener('click', loadDivisionResults);

const projBtn = document.getElementById('projBtn');
if (projBtn) {
  projBtn.addEventListener('click', loadProjection);
}

const aboveAvgBtn = document.getElementById('aboveAvgBtn');
if (aboveAvgBtn) {
  aboveAvgBtn.addEventListener('click', loadAboveAverage);
}

// -------------------------
// Initial load
loadConsultants();
