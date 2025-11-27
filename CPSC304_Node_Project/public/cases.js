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
  
  async function loadCases() {
    const res = await fetch('/cases/all');
    const json = await res.json();
    if (json.success) {
      renderTable(json.data, 'casesTable');
    }
  }
  
  async function insertCase(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const caseObj = Object.fromEntries(formData.entries());
  
    const res = await fetch('/cases/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseObj)
    });
    const json = await res.json();
    if (json.success) {
      alert('Case inserted.');
      loadCases();
      event.target.reset();
    }
  }
  
  async function deleteCase() {
    const caseId = document.getElementById('deleteCaseId').value;
    if (!caseId) return;
  
    const res = await fetch(`/cases/delete/${caseId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      alert('Deleted.');
      loadCases();
    }
  }
  
  async function loadGroupByCourt() {
    const res = await fetch('/cases/group-by-court');
    const json = await res.json();
    if (json.success) {
      renderTable(json.data, 'groupByCourtTable');
    }
  }
  
  document.getElementById('refreshCasesBtn').addEventListener('click', loadCases);
  document.getElementById('caseForm').addEventListener('submit', insertCase);
  document.getElementById('cancelCaseBtn').addEventListener('click', () =>
    document.getElementById('caseForm').reset()
  );
  document.getElementById('deleteCaseBtn').addEventListener('click', deleteCase);
  document.getElementById('groupByCourtBtn').addEventListener('click', loadGroupByCourt);
  
  loadCases();
  