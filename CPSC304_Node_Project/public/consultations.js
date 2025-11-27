function renderTable(rows, tableId) {
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
        if (typeof val === "string" && /\d{4}-\d{2}-\d{2}/.test(val)) {
          td.textContent = val.substring(0, 10);
        } else {
          td.textContent = val;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  
  async function runJoinQuery() {
    const name = document.getElementById('joinName').value.trim();
    const type = document.getElementById('joinType').value.trim();
    const date_from = document.getElementById('joinDateFrom').value.trim();
    const date_to = document.getElementById('joinDateTo').value.trim();
  
    const filters = { name, type, date_from, date_to };
    const query = new URLSearchParams(filters).toString();
  
    const res = await fetch(`/consultations/join?${query}`);
    const json = await res.json();
  
    if (json.success) {
      renderTable(json.data, 'joinTable');
    } else {
      alert('Error running join query');
    }
  }
  
  function resetJoinFilters() {
    document.getElementById('joinName').value = '';
    document.getElementById('joinType').value = '';
    document.getElementById('joinDateFrom').value = '';
    document.getElementById('joinDateTo').value = '';
    document.querySelector('#joinTable tbody').innerHTML = '';
  }
  
  async function runAggregateQuery() {
    const minCount = document.getElementById('aggMinCount').value || 0;
  
    const res = await fetch('/consultations/aggregate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ min_count: Number(minCount) })
    });
  
    const json = await res.json();
  
    if (json.success) {
      renderTable(json.data, 'aggTable');
    } else {
      alert('Error running aggregate query');
    }
  }
  
  document.getElementById('joinBtn').addEventListener('click', runJoinQuery);
  document.getElementById('joinReset').addEventListener('click', resetJoinFilters);
  document.getElementById('aggBtn').addEventListener('click', runAggregateQuery);
  