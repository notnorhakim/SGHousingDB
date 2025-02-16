// Fetch dropdown options from the backend when the page loads
window.onload = function() {
    fetch('/getDropdownOptions')
        .then(response => response.json())
        .then(data => {
            populateDropdown('town', data.towns);
            populateYearMonthDropdowns();  // Populate year and month dropdowns
        })
        .catch(error => console.error('Error fetching town options:', error));
};

// Function to populate dropdown with options
function populateDropdown(elementId, options) {
    const dropdown = document.getElementById(elementId);
    dropdown.innerHTML = ''; // Clear any existing options
    const anyOption = document.createElement('option');
    anyOption.value = 'Any';
    anyOption.textContent = 'Any';
    dropdown.appendChild(anyOption);  // Add "Any" option first

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.town || option.street_name || option.block;  // Set the value
        optionElement.textContent = option.town || option.street_name || option.block;  // Set the text
        dropdown.appendChild(optionElement);
    });
}

// Function to populate year and month dropdowns
function populateYearMonthDropdowns() {
    const startYearDropdown = document.getElementById('start_year');
    const endYearDropdown = document.getElementById('end_year');
    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];

    // Populate years from 2017 to 2025
    for (let year = 2017; year <= 2025; year++) {
        const optionStart = document.createElement('option');
        optionStart.value = year;
        optionStart.textContent = year;
        startYearDropdown.appendChild(optionStart);

        const optionEnd = document.createElement('option');
        optionEnd.value = year;
        optionEnd.textContent = year;
        endYearDropdown.appendChild(optionEnd);
    }

    // Populate months from January to December
    const startMonthDropdown = document.getElementById('start_month');
    const endMonthDropdown = document.getElementById('end_month');
    months.forEach((month, index) => {
        const optionStartMonth = document.createElement('option');
        optionStartMonth.value = index + 1; // Month index (1-based)
        optionStartMonth.textContent = month;
        startMonthDropdown.appendChild(optionStartMonth);

        const optionEndMonth = document.createElement('option');
        optionEndMonth.value = index + 1; // Month index (1-based)
        optionEndMonth.textContent = month;
        endMonthDropdown.appendChild(optionEndMonth);
    });
}

// Function to update the street names dropdown based on the selected town
function updateStreetNames() {
    const town = document.getElementById('town').value;
    
    const streetDropdown = document.getElementById('street_name');
    streetDropdown.innerHTML = ''; // Clear previous options

    const anyOption = document.createElement('option');
    anyOption.value = 'Any';
    anyOption.textContent = 'Any';
    streetDropdown.appendChild(anyOption);  // Add "Any" option first

    if (!town || town === "Any") {
        // If no town or "Any" is selected, clear the block dropdown
        document.getElementById('block').innerHTML = '<option value="Any">Any</option>';
        return;
    }

    // Fetch the street names for the selected town from the server
    fetch(`/getStreetNamesForTown?town=${town}`)
        .then(response => response.json())
        .then(data => {
            // Populate the street name dropdown with the filtered data
            data.streetNames.forEach(street => {
                const optionElement = document.createElement('option');
                optionElement.value = street.street_name;
                optionElement.textContent = street.street_name;
                streetDropdown.appendChild(optionElement);
            });
        })
        .catch(error => console.error('Error fetching street names:', error));
}

// Function to update the block dropdown based on selected town and street
function updateBlocks() {
    const town = document.getElementById('town').value;
    const street_name = document.getElementById('street_name').value;

    const blockDropdown = document.getElementById('block');
    blockDropdown.innerHTML = ''; // Clear previous options

    // Add "Any" option first
    const anyOption = document.createElement('option');
    anyOption.value = 'Any';
    anyOption.textContent = 'Any';
    blockDropdown.appendChild(anyOption);

    // If no town or street is selected or "Any" is selected, no need to fetch blocks
    if (street_name === "Any" || !street_name) {
        return;  // Skip fetching blocks if "Any" is selected
    }

    // Fetch the blocks for the selected town and street name from the server
    fetch(`/getBlocksForTownAndStreet?town=${town}&street_name=${street_name}`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched blocks:", data); // Log the fetched data for debugging

            // Use setTimeout to simulate delay in fetching data (for debugging purposes)
            setTimeout(() => {
                // If blocks are returned, populate the block dropdown
                if (data.blocks && data.blocks.length > 0) {
                    data.blocks.forEach(block => {
                        const optionElement = document.createElement('option');
                        optionElement.value = block.block;
                        optionElement.textContent = block.block;
                        blockDropdown.appendChild(optionElement);
                    });
                } else {
                    // If no blocks are found, add a "No blocks" option
                    const noBlocksOption = document.createElement('option');
                    noBlocksOption.value = '';
                    noBlocksOption.textContent = 'No blocks available';
                    blockDropdown.appendChild(noBlocksOption);
                }
            }, 500); // Adding a 500ms delay for debugging
        })
        .catch(error => {
            console.error('Error fetching blocks:', error);
            // Handle error if needed, like showing a message in the dropdown
        });
}

// Function to update the flat type dropdown based on selected town and street
function updateFlatTypes() {
    console.log("Updating flat types dropdown");
    const town = document.getElementById('town').value;
    const street_name = document.getElementById('street_name').value;

    const flatTypeDropdown = document.getElementById('flat_type');
    flatTypeDropdown.innerHTML = ''; // Clear previous options

    // Add "Any" option first
    const anyOption = document.createElement('option');
    anyOption.value = 'Any';
    anyOption.textContent = 'Any';
    flatTypeDropdown.appendChild(anyOption);

    // If no town or street is selected or "Any" is selected, no need to fetch flat types
    if (street_name === "Any" || !street_name) {
        return;  // Skip fetching flat types if "Any" is selected
    }

    // Fetch the flat types for the selected town and street name from the server
    fetch(`/getFlatTypesForTownAndStreet?town=${town}&street_name=${street_name}`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched flat types:", data); // Log the fetched data for debugging

            // Use setTimeout to simulate delay in fetching data (for debugging purposes)
            setTimeout(() => {
                // If flat types are returned, populate the flat type dropdown
                if (data.flatTypes && data.flatTypes.length > 0) {
                    data.flatTypes.forEach(flatType => {
                        const optionElement = document.createElement('option');
                        optionElement.value = flatType;
                        optionElement.textContent = flatType;
                        flatTypeDropdown.appendChild(optionElement);
                    });
                } else {
                    // If no flat types are found, add a "No flat types" option
                    const noFlatTypesOption = document.createElement('option');
                    noFlatTypesOption.value = '';
                    noFlatTypesOption.textContent = 'No flat types available';
                    flatTypeDropdown.appendChild(noFlatTypesOption);
                }
            }, 500); // Adding a 500ms delay for debugging
        })
        .catch(error => {
            console.error('Error fetching flat types:', error);
            // Handle error if needed, like showing a message in the dropdown
        });
}




// Function to search for housing based on user input
function searchHousing() {
    const town = document.getElementById('town').value;
    const street_name = document.getElementById('street_name').value;
    const block = document.getElementById('block').value;
    const start_year = document.getElementById('start_year').value;
    const start_month = document.getElementById('start_month').value;
    const end_year = document.getElementById('end_year').value;
    const end_month = document.getElementById('end_month').value;
    const flat_type = document.getElementById('flat_type').value;

    // Format the start and end dates to YYYY-MM-01
    const start_date = start_year && start_month ? `${start_year}-${padMonth(start_month)}-01` : '';
    const end_date = end_year && end_month ? `${end_year}-${padMonth(end_month)}-01` : '';

    // Create an object with filter parameters
    const filters = {
        town: town === "Any" ? "*" : town,  // "*" means no filter
        street_name: street_name === "Any" ? "*" : street_name, // "*" means no filter
        block: block === "Any" ? "*" : block, // "*" means no filter
        flat_type: flat_type === "Any" ? "*" : flat_type, // "*" means no filter
        start_date,
        end_date
    };

    // Fetch data from the server (using a POST request)
    fetch('/searchHousing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
    })
    .then(response => response.json())
    .then(data => displayResults(data))
    .catch(error => console.error('Error:', error));
}

// Function to display the search results in a table
function displayResults(data) {
    const resultsTableBody = document.getElementById('results_table').getElementsByTagName('tbody')[0];
    const resultsCount = document.getElementById('results-count'); // The element to display result count
    
    resultsTableBody.innerHTML = ''; // Clear previous results

    if (data.length === 0) {
        resultsTableBody.innerHTML = '<tr><td colspan="9">No results found.</td></tr>';
        resultsCount.textContent = 'Displaying 0 results';
    } else {
        data.forEach(item => {
            // Convert remaining lease from months to years and months
            const years = Math.floor(item.remaining_lease / 12); // Calculate years
            const months = item.remaining_lease % 12;          // Calculate remaining months
            const remainingLeaseText = `${years} years ${months} months`;  // Format the remaining lease text

            // Format the resale price with commas and a dollar sign for display
            const formattedResalePrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(item.resale_price); // For display purposes

            // Format the date to show the month and year
            const resaleDate = new Date(item.month); // Assuming item.month is a valid date string (e.g., "2022-05-01")
            const formattedDate = `${resaleDate.toLocaleString('default', { month: 'long' })} ${resaleDate.getFullYear()}`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.block}</td>
                <td>${item.storey_range}</td>
                <td>${item.flat_type}</td>
                <td>${item.flat_model}</td>
                <td>${item.town}</td>
                <td>${item.street_name}</td>
                <td>${remainingLeaseText}</td>
                <td class="resale-price" data-price="${item.resale_price}">${formattedResalePrice}</td>
                <td>${formattedDate}</td>
            `;
            resultsTableBody.appendChild(row);
        });

        // Update the result count at the top of the table
        resultsCount.textContent = `Displaying ${data.length} result${data.length > 1 ? 's' : ''}`;
    }
}




// Function to sort the table based on the column index
function sortTable(columnIndex) {
    const table = document.getElementById("results_table");
    const rows = Array.from(table.rows).slice(1);  // Get all rows (excluding the header)
    const isAscending = table.querySelector(`th:nth-child(${columnIndex + 1})`).classList.contains('asc');

    // Sort rows based on the column index and the current sorting order
    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex];
        const cellB = rowB.cells[columnIndex];

        if (columnIndex === 4) {  // If sorting by resale price (column 4)
            const priceA = parseFloat(cellA.getAttribute('data-price'));
            const priceB = parseFloat(cellB.getAttribute('data-price'));
            return (priceA - priceB) * (isAscending ? 1 : -1);
        }

        const cellAValue = cellA.innerText.trim();
        const cellBValue = cellB.innerText.trim();

        // If not sorting by numeric columns, use localeCompare for strings
        return cellAValue.localeCompare(cellBValue) * (isAscending ? 1 : -1);
    });

    // Append sorted rows to the table body
    rows.forEach(row => table.appendChild(row));

    // Toggle the sorting direction (ascending or descending)
    const headers = table.querySelectorAll("th");
    headers.forEach(header => header.classList.remove("asc", "desc"));
    table.querySelector(`th:nth-child(${columnIndex + 1})`).classList.toggle(isAscending ? "desc" : "asc");
}

// Function to calculate mean, highest, and lowest prices based on selected filters
function calculateStatistics() {
    const town = document.getElementById('town').value;
    const street_name = document.getElementById('street_name').value;
    const block = document.getElementById('block').value;
    const flat_type = document.getElementById('flat_type').value;
    const start_year = document.getElementById('start_year').value;
    const start_month = document.getElementById('start_month').value;
    const end_year = document.getElementById('end_year').value;
    const end_month = document.getElementById('end_month').value;

    // Format the start and end dates to YYYY-MM-01
    const start_date = start_year && start_month ? `${start_year}-${padMonth(start_month)}-01` : '';
    const end_date = end_year && end_month ? `${end_year}-${padMonth(end_month)}-01` : '';

    // Create an object with filter parameters
    const filters = {
        town: town === "Any" ? "*" : town,  // "*" means no filter
        street_name: street_name === "Any" ? "*" : street_name, // "*" means no filter
        block: block === "Any" ? "*" : block, // "*" means no filter
        flat_type: flat_type === "Any" ? "*" : flat_type,
        start_date,
        end_date
    };

    // Fetch data from the server (using a POST request)
    fetch('/searchHousing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
    })
    .then(response => response.json())
    .then(data => {
        calculatePriceStats(data);  // Call function to calculate statistics
    })
    .catch(error => console.error('Error:', error));
}

// Function to calculate mean, highest, and lowest prices
function calculatePriceStats(data) {
    if (data.length === 0) {
        document.getElementById('mean-price').textContent = 'Mean Price: $0';
        document.getElementById('highest-price').textContent = 'Highest Price: $0';
        document.getElementById('lowest-price').textContent = 'Lowest Price: $0';
        return;
    }

    let totalPrice = 0;
    let highestPrice = -Infinity;
    let lowestPrice = Infinity;

    data.forEach(item => {
        const price = item.resale_price;

        // Calculate total price for mean
        totalPrice += price;

        // Calculate highest and lowest price
        if (price > highestPrice) {
            highestPrice = price;
        }

        if (price < lowestPrice) {
            lowestPrice = price;
        }
    });

    const meanPrice = totalPrice / data.length;

    // Update the statistics
    document.getElementById('mean-price').textContent = `Mean Price: ${formatPrice(meanPrice)}`;
    document.getElementById('highest-price').textContent = `Highest Price: ${formatPrice(highestPrice)}`;
    document.getElementById('lowest-price').textContent = `Lowest Price: ${formatPrice(lowestPrice)}`;
}

// Helper function to format price with commas and $ sign
function formatPrice(price) {
    return `$${price.toLocaleString()}`;
}

// Helper function to pad month (e.g., 1 becomes 01)
function padMonth(month) {
    return month < 10 ? `0${month}` : month;
}





