document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-form');
    const fields = Array.from(form.elements); // Convert form elements to an array

    // Fetch data and populate table on page load
    fetchData();

    // Auto-focus next field after input
    fields.forEach((field, index) => {
        field.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < fields.length - 1) {
                    fields[index + 1].focus();
                } else {
                    submitForm(); // Automatically submit on last field
                }
            }
        });
    });

    // Handle global hotkeys for edit and delete
    document.addEventListener('keydown', (e) => {
        const rows = Array.from(document.querySelectorAll('tr[data-id]')); // Rows with data-id attributes
        let focusedRowIndex = rows.findIndex(row => row.classList.contains('focused'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (focusedRowIndex < rows.length - 1) {
                rows[focusedRowIndex]?.classList.remove('focused');
                rows[++focusedRowIndex].classList.add('focused');
                rows[focusedRowIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (focusedRowIndex > 0) {
                rows[focusedRowIndex]?.classList.remove('focused');
                rows[--focusedRowIndex].classList.add('focused');
                rows[focusedRowIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        if (e.key === 'Enter' && focusedRowIndex !== -1) {
            editRow(rows[focusedRowIndex].dataset.id);
        }
    });

    // Submit button listener
    document.getElementById('submit-button').addEventListener('click', submitForm);

    // Function to fetch data from the server and populate the table
    async function fetchData(page = 1, limit = 10) {
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear the table body before populating

        try {
            const response = await fetch(`http://localhost:3000/api/get-data?page=${page}&limit=${limit}`);
            const result = await response.json();
            const data = result.data;

            data.forEach(item => {
                const row = document.createElement('tr');
                row.dataset.id = item.id; // Store item ID in dataset
                row.innerHTML = `
                    <td>${item.issue_date}</td>
                    <td>${item.antibiotic_name}</td>
                    <td>${item.ward_name}</td>
                    <td>${item.quantity}</td>
                    <td>
                        <button onclick="editRow(${item.id})">Edit</button>
                        <button onclick="deleteRow(${item.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Handle pagination (if needed)
            const paginationInfo = document.getElementById('pagination-info');
            paginationInfo.textContent = `Page ${result.currentPage} of ${result.totalPages}`;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Submit the form (POST or PUT request depending on context)
    async function submitForm() {
        const issue_date = document.getElementById('issue_date').value;
        const antibiotic_name = document.getElementById('antibiotic_name').value;
        const ward_name = document.getElementById('ward_name').value;
        const quantity = parseInt(document.getElementById('quantity').value, 10);

        if (!issue_date || !antibiotic_name || !ward_name || !quantity) {
            alert('Please fill all fields!');
            return;
        }

        const editId = form.dataset.editId;

        try {
            if (editId) {
                // Update existing entry
                await fetch(`http://localhost:3000/api/update-data/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ issue_date, antibiotic_name, ward_name, quantity }),
                });
                delete form.dataset.editId;
            } else {
                // Save new entry
                await fetch('http://localhost:3000/api/save-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ issue_date, antibiotic_name, ward_name, quantity }),
                });
            }

            // Clear form and refresh
            fields[2].value = '' // Clear the fields
            fields[3].value = '';
            // form.reset();
            fields[2].focus(); // Return focus to the first field
            fetchData(); // Refresh the table
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving data.');
        }
    }

    // Edit row functionality
    window.editRow = function(id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        const cells = row.querySelectorAll('td');

        // Convert the date to the format YYYY-MM-DD
        const issueDate = new Date(cells[0].textContent).toISOString().split('T')[0];

        document.getElementById('issue_date').value = issueDate;
        document.getElementById('antibiotic_name').value = cells[1].textContent;
        document.getElementById('ward_name').value = cells[2].textContent;
        document.getElementById('quantity').value = cells[3].textContent;

        form.dataset.editId = id; // Set the ID of the row being edited
        fields[0].focus(); // Focus the first field
    };

    // Delete row functionality
    window.deleteRow = async function(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                await fetch(`http://localhost:3000/api/delete-data/${id}`, { method: 'DELETE' });
                fetchData(); // Refresh the table
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the data.');
            }
        }
    };
});