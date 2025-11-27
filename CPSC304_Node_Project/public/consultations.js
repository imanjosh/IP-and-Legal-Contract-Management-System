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
    let name = document.getElementById('joinName').value.trim();
    let type = document.getElementById('joinType').value.trim();
    let date_from = document.getElementById('joinDateFrom').value;
    let date_to = document.getElementById('joinDateTo').value;

    if (!name && !type && !date_from && !date_to) {
        alert(json.message || 'Please enter at least one search filter.');
        return;
    }

    if (name === "") name = null;
    if (type === "") type = null;
    if (date_from === "") date_from = null;
    if (date_to === "") date_to = null;

    const params = new URLSearchParams({
        name: name === null ? "" : name,
        type: type === null ? "" : type,
        date_from: date_from === null ? "" : date_from,
        date_to: date_to === null ? "" : date_to
    });
    try {
      const res = await fetch(`/consultations/join?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
          renderTable(json.data, 'joinTable');
      } else {
          alert(json.message || "Error running join query.");
      }
    } catch (error) {
      alert('Error running join query: ' + error.message);
      console.error('Error running join query:', error);
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
    try {      
      const res = await fetch('/consultations/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ min_count: Number(minCount) })
      });
    
      const json = await res.json();
    
      if (json.success) {
        renderTable(json.data, 'aggTable');
      } else {
        alert(json.message || 'Error running aggregate query');
      }
    } catch (error) {
        // Catch any errors during the fetch or JSON parsing
        console.error("Error running aggregate query:", error);
        alert("Error running aggregate query:", error);
    }
  }
  
  document.getElementById('joinBtn').addEventListener('click', runJoinQuery);
  document.getElementById('joinReset').addEventListener('click', resetJoinFilters);
  document.getElementById('aggBtn').addEventListener('click', runAggregateQuery);
  