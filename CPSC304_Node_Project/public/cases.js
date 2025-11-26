// Utility: render rows into a table
function renderTable(rows, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = '';
  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10">No results found</td></tr>';
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
}

// -------------------------
// Load all cases (you may want to add a GET /cases endpoint in backend)
// Load all cases
async function loadCases() {
  const res = await fetch('/cases/group-by-court');
  const json = await res.json();
  if (json.success) {
    renderTable(json.data, 'casesTable');
  } else {
    alert('Error loading cases');
  }
}

// -------------------------
// Insert case
async function insertCase(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const caseObj = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('/cases/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseObj)
    });
    const json = await res.json();
    if (json.success) {
      alert('Case inserted successfully');
      loadCases();
      event.target.reset();
    } else {
      alert(json.message || 'Insert failed');
    }
  } catch (err) {
    console.error(err);
    alert('Error inserting case');
  }
}

// -------------------------
// Delete case
async function deleteCase() {
  const caseId = document.getElementById('deleteCaseId').value;
  if (!caseId) { alert('Enter a Case ID'); return; }

  try {
    const res = await fetch(`/cases/delete/${caseId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      alert('Case deleted successfully');
      loadCases();
    } else {
      alert(json.message || 'Delete failed');
    }
  } catch (err) {
    console.error(err);
    alert('Error deleting case');
  }
}

// -------------------------
// Group by court
async function loadGroupByCourt() {
  try {
    const res = await fetch('/cases/group-by-court');
    const json = await res.json();
    if (json.success) {
      renderTable(json.data, 'groupByCourtTable');
    } else {
      alert('Error running group by query');
    }
  } catch (err) {
    console.error(err);
    alert('Error running group by query');
  }
}

// -------------------------
// Event listeners
document.getElementById('refreshCasesBtn').addEventListener('click', loadCases);
document.getElementById('caseForm').addEventListener('submit', insertCase);
document.getElementById('cancelCaseBtn').addEventListener('click', () => {
  document.getElementById('caseForm').reset();
});
document.getElementById('deleteCaseBtn').addEventListener('click', deleteCase);
document.getElementById('groupByCourtBtn').addEventListener('click', loadGroupByCourt);

// -------------------------
// Initial load
loadCases();
