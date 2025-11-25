document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#consultantsTable tbody");

  async function loadConsultants(filters = {}) {
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/consultants/filter?${params.toString()}`);
    const json = await res.json();
    if (json.success) {
      tableBody.innerHTML = "";
      json.data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.CONSULTANT_ID}</td>
          <td>${row.NAME}</td>
          <td>${row.LICENSE_NUMBER}</td>
          <td>${row.YEARS_EXPERIENCE}</td>
          <td>${row.SPECIALIZATION}</td>
          <td>${row.CONTACT_DETAILS}</td>
        `;
        tableBody.appendChild(tr);
      });
    }
  }

  // Initial load
  loadConsultants();

  // Refresh button
  document.getElementById("refreshBtn").addEventListener("click", () => {
    loadConsultants();
  });

  // Filter
  document.getElementById("filterBtn").addEventListener("click", () => {
    const filters = {
      name: document.getElementById("filterName").value,
      license_number: document.getElementById("filterLicense").value,
      min_exp: document.getElementById("filterMinExp").value,
      max_exp: document.getElementById("filterMaxExp").value,
      specialization: document.getElementById("filterSpec").value,
      contact: document.getElementById("filterContact").value
    };
    loadConsultants(filters);
  });

  // Reset filter
  document.getElementById("resetBtn").addEventListener("click", () => {
    document.querySelectorAll('.search-grid input').forEach(i => i.value = '');
    loadConsultants();
  });

  // Update
  document.getElementById("consultantForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const id = form.consultant_id.value;
    const data = {
      name: form.name.value,
      license_number: form.license_number.value,
      years_experience: form.years_experience.value,
      specialization: form.specialization.value,
      contact_details: form.contact_details.value
    };

    const res = await fetch(`/api/consultants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      alert("Consultant updated!");
      loadConsultants();
      form.reset();
    } else {
      alert("Error: " + result.message);
    }
  });

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", () => {
    document.getElementById("consultantForm").reset();
  });
});
