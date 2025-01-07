document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-form');
    const fields = Array.from(form.elements); // Convert form elements to an array
    let currentPage = 1;
    const limit = 10;

    // Fetch data and populate table on page load
    fetchData(currentPage, limit);

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
        const tomSelectInstance = document.querySelector('.tom-select-custom').tomselect;
        if (tomSelectInstance.isOpen) {
            return; // Do not handle table navigation if Tom Select dropdown is open
        }

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

    // Pagination controls listeners
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchData(currentPage, limit);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        fetchData(currentPage, limit);
    });

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

                // Format the issue date to display only the date
                const issueDate = new Date(item.issue_date).toLocaleDateString();

                row.innerHTML = `
                    <td>${issueDate}</td>
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
            paginationInfo.textContent = `Page ${result.currentPage} of ${result.totalPages} (${result.totalItems} Items)`;

            // Enable/disable pagination buttons
            document.getElementById('prev-page').disabled = result.currentPage === 1;
            document.getElementById('next-page').disabled = result.currentPage === result.totalPages;
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

            // Clear form except for issue_date and antibiotic_name
            document.getElementById('ward_name').value = '';
            document.getElementById('quantity').value = '';
            fields[2].focus(); // Return focus to the ward_name field
            fetchData(currentPage, limit); // Refresh the table

            // remove the selected entry in tom-select
            document.querySelector('.tom-select-custom').tomselect.clear();

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
        const issueYear = new Date(cells[0].textContent).getFullYear();
        const issueMonth = new Date(cells[0].textContent).getMonth() + 1;
        const issueDay = new Date(cells[0].textContent).getDate();

        document.getElementById('issue_date').value = String(issueYear) + '-' + String(issueMonth).padStart(2, '0') + '-' + String(issueDay).padStart(2, '0');
        document.getElementById('antibiotic_name').value = cells[1].textContent;
        document.getElementById('ward_name').tomselect.addItem(cells[2].textContent);
        document.getElementById('quantity').value = cells[3].textContent;

        form.dataset.editId = id; // Set the ID of the row being edited
        fields[0].focus(); // Focus the first field
    };

    // Delete row functionality
    window.deleteRow = async function(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                await fetch(`http://localhost:3000/api/delete-data/${id}`, { method: 'DELETE' });
                fetchData(currentPage, limit); // Refresh the table
                //clear the text fields
                document.getElementById('issue_date').value = '';
                document.getElementById('antibiotic_name').value = '';
                document.getElementById('quantity').value = '';
                // remove the selected entry in tom-select
                document.querySelector('.tom-select-custom').tomselect.clear();

            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the data.');
            }
        }
    };
});
