$(document).ready(function() {

const firebaseConfig = {
apiKey: "AIzaSyDPJgS0qeNI-4WIE6MQPKj4D9pOQyd187w",
authDomain: "dbasecust.firebaseapp.com",
databaseURL: "https://dbasecust-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "dbasecust",
storageBucket: "dbasecust.appspot.com",
messagingSenderId: "208378127361",
appId: "1:208378127361:web:48fde529e27891adf30c00"
};

// Function to show alert
function showAlert(message) {
const alertElement = $('#zisalert');
alertElement.text(message);
alertElement.addClass('show');

setTimeout(() => {
alertElement.removeClass('show');
location.reload();
}, 1000);
}

function showZisAlert(message) {
const alertElement = $('#zisalert');
alertElement.text(message);
alertElement.addClass('show');

setTimeout(() => {
alertElement.removeClass('show');
}, 1000);
}

// Initialize Firebase
if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}

// Get a reference to the database service
const database = firebase.database();

let customers = [];
let currentPage = 1;
const itemsPerPage = 6;
const maxPageButtons = 3; // Maximum number of page buttons to display

// Spinner
function showSpinner() {
$('#spinner').show();
}

function hideSpinner() {
$('#spinner').hide();
$('.pagination').removeClass('d-none');
$('.bawah').removeClass('d-none');
}

// Load customers from Firebase
function loadCustomers() {
showSpinner();
database.ref('customers').once('value').then(snapshot => {
const data = snapshot.val();
if (data) {
customers = Object.keys(data).map(key => {
return { id: key, ...data[key] };
});
renderPage(currentPage);
setupPagination();
updateUniqueCompanyCount();
// Update total customer count
$('#totalCustomer').text(customers.length);
}
hideSpinner();
}).catch(error => {
console.error('Error loading customers:', error);
hideSpinner();
});
}

// Function to create card from data
function createCard(customer) {
let iconClass;
if (customer.title === 'BAPAK') {
iconClass = 'ri-user-4-fill';
} else if (customer.title === 'IBU') {
iconClass = 'ri-user-6-fill';
}

return `
<div class="col-md-4 mb-4 card-item">
<div class="card position-relative">
<div class="card-body">
<h5 class="card-title">${customer.title} ${customer.name}</h5>
<p class="card-text">
<i class="ri-building-2-line"></i> : ${customer.phone}<br>
<i class="ri-whatsapp-line"></i> : <a target="_blank" href="https://api.whatsapp.com/send?phone=${formatPhoneNumber(customer.whatsapp).replace('+62', '62')}">${customer.whatsapp}</a><br>
<i class="ri-mail-line"></i> : <a target="_blank" href="mailto:${customer.email}">${customer.email}</a><br>
<i class="ri-hotel-line"></i> :  ${customer.company}
</p>
<button class="btn btn-warning btn-sm edit-btn" data-id="${customer.id}"><i class="ri-edit-2-line"></i> Edit</button>
<button class="btn btn-danger btn-sm delete-btn" data-id="${customer.id}"><i class="ri-delete-bin-6-line"></i>  Delete</button>
</div>
<span class='display-1 position-absolute bottom-0 end-0 me-2 mb-2'><i class="${iconClass} opacity-25"></i></span>
</div>
</div>
`;
}

// Render current page
function renderPage(page) {
    $('#card-container').empty();
    const start = (page - 1) * itemsPerPage;
    const end = page * itemsPerPage;
    const paginatedItems = customers.slice(start, end);
    paginatedItems.forEach(customer => {
        $('#card-container').append(createCard(customer));
    });
}

// Setup pagination
function setupPagination() {
    const pageCount = Math.ceil(customers.length / itemsPerPage);
    $('.pagination').empty();
    $('.pagination').append(`<li class="page-item"><a class="page-link" href="#" id="prev-page">&laquo;</a></li>`);

    let startPage, endPage;
    if (pageCount <= maxPageButtons) {
        startPage = 1;
        endPage = pageCount;
    } else {
        const maxPagesBeforeCurrentPage = Math.floor(maxPageButtons / 2);
        const maxPagesAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
            startPage = 1;
            endPage = maxPageButtons;
        } else if (currentPage + maxPagesAfterCurrentPage >= pageCount) {
            startPage = pageCount - maxPageButtons + 1;
            endPage = pageCount;
        } else {
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
    }

    if (startPage > 1) {
        $('.pagination').append(`<li class="page-item"><a class="page-link" href="#">1</a></li>`);
        if (startPage > 2) {
            $('.pagination').append(`<li class="page-item"><span class="page-link disabled">...</span></li>`);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        $('.pagination').append(`<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link page-number" href="#">${i}</a></li>`);
    }

    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            $('.pagination').append(`<li class="page-item"><span class="page-link disabled">...</span></li>`);
        }
        $('.pagination').append(`<li class="page-item"><a class="page-link" href="#">${pageCount}</a></li>`);
    }

    $('.pagination').append(`<li class="page-item"><a class="page-link" href="#" id="next-page">&raquo;</a></li>`);

    updatePageButtons(currentPage);

    $('.pagination .page-link').on('click', function(e) {
        e.preventDefault();
        if ($(this).attr('id') === 'prev-page') {
            if (currentPage > 1) {
                currentPage--;
            }
        } else if ($(this).attr('id') === 'next-page') {
            if (currentPage < pageCount) {
                currentPage++;
            }
        } else if (!$(this).hasClass('disabled')) {
            currentPage = parseInt($(this).text());
        }
        renderPage(currentPage);
        setupPagination();
    });
}

function updatePageButtons(page) {
    $('.page-item').removeClass('active');
    $(`.pagination .page-number:contains(${page})`).parent().addClass('active');
}

// Function to update unique company count
function updateUniqueCompanyCount() {
    const uniqueCompanies = [...new Set(customers.map(customer => customer.company))];
    $('#totalUniqueCompanies').text(uniqueCompanies.length);
}

// Handle form submission
$('#customerForm').on('submit', function(event) {
event.preventDefault();
const customerId = $('#customerId').val();
const customer = {
title: $('input[name="title"]:checked').val(),
name: $('#name').val().toUpperCase(),
phone: formatPhoneNumber($('#phone').val()),
whatsapp: formatPhoneNumber($('#whatsapp').val()),
email: $('#email').val(),
company: formatCompanyName($('#company').val().toUpperCase())
};

if (customerId) {
updateCustomer(customerId, customer);
} else {
addCustomer(customer);
}

$('#customerForm').trigger('reset');
$('#customerModal').modal('hide');
});

// Add customer to Firebase
function addCustomer(customer) {
const newCustomerRef = database.ref('customers').push();
newCustomerRef.set(customer).then(() => {
customers.push({ id: newCustomerRef.key, ...customer });
renderPage(currentPage);
setupPagination();
showAlert('Data berhasil ditambahkan');
updateCustomerCount();
}).catch(error => {
console.error('Error adding customer:', error);
});
}

// Update customer in Firebase
function updateCustomer(customerId, customer) {
database.ref('customers/' + customerId).set(customer).then(() => {
const index = customers.findIndex(c => c.id === customerId);
customers[index] = { id: customerId, ...customer };
renderPage(currentPage);
showAlert('Data berhasil diedit');
}).catch(error => {
console.error('Error updating customer:', error);
});
}

// Delete customer from Firebase
$('#card-container').on('click', '.delete-btn', function() {
const customerId = $(this).data('id');
const card = $(this).closest('.col-md-4');

database.ref('customers/' + customerId).remove().then(() => {
customers = customers.filter(c => c.id !== customerId);
renderPage(currentPage);
setupPagination();
updateCustomerCount();
showZisAlert('Data berhasil dihapus');
}).catch(error => {
console.error('Error deleting customer:', error);
});
});

// Edit customer
$('#card-container').on('click', '.edit-btn', function() {
const customerId = $(this).data('id');
database.ref('customers/' + customerId).once('value').then(snapshot => {
const customer = snapshot.val();
if (customer) {
$('#customerId').val(customerId);
$(`input[name="title"][value="${customer.title}"]`).prop('checked', true);
$('#name').val(customer.name);
$('#phone').val(customer.phone);
$('#whatsapp').val(customer.whatsapp);
$('#email').val(customer.email);
$('#company').val(customer.company);
$('#customerModal').modal('show');
}
}).catch(error => {
console.error('Error retrieving customer:', error);
});
});

// Initial load
loadCustomers();

// Search functionality
$('#searchInput').on('keyup', function() {
const value = $(this).val().toLowerCase();
if (value) {
// Filter customers based on search value
const filteredCustomers = customers.filter(customer => 
customer.name.toLowerCase().includes(value) || 
customer.phone.toLowerCase().includes(value) ||
customer.whatsapp.toLowerCase().includes(value) ||
customer.email.toLowerCase().includes(value) ||
customer.company.toLowerCase().includes(value)
);

$('#searchInput').on('input', function() {
var $clearIcon = $('.clear-icon');
if ($(this).val()) {
$clearIcon.show();
} else {
$clearIcon.hide();
}
});

$('.clear-icon').on('click', function() {
$('#searchInput').val('').focus();
$(this).hide();
renderPage(currentPage);
setupPagination();
$('.pagination').show();
});

// Render filtered results
$('#card-container').empty();
if (filteredCustomers.length > 0) {
filteredCustomers.forEach(customer => {
$('#card-container').append(createCard(customer));
});
} else {
$('#card-container').append('<div class="col-12"><p class="text-center">Tidak ada data</p></div>');
}

// Hide pagination during search
$('.pagination').hide();
} else {
// If search input is empty, show all data with pagination
renderPage(currentPage);
setupPagination();
$('.pagination').show();
}
});


// Export to Excel
$('#exportButton').on('click', function() {
database.ref('customers').once('value').then(snapshot => {
const customers = snapshot.val();
if (customers) {
const customerArray = Object.keys(customers).map(key => customers[key]);
const worksheet = XLSX.utils.json_to_sheet(customerArray);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

XLSX.writeFile(workbook, "customers.xlsx");
showAlert('Data berhasil diexport');
}
}).catch(error => {
console.error('Error exporting data:', error);
});
});

// Function to ensure company name starts with PT. or CV.
function formatCompanyName(companyName) {
companyName = companyName.trim();

if (companyName.startsWith("PT.") || companyName.startsWith("CV.")) {
return companyName;
} else if (companyName.startsWith("PT") || companyName.startsWith("CV")) {
return companyName.replace(/^(PT|CV)/, '$1.');
} else {
return "PT. " + companyName;
}
}

// Function to format phone number with +62
function formatPhoneNumber(phoneNumber) {
if (typeof phoneNumber !== 'string') {
phoneNumber = phoneNumber.toString();
}
phoneNumber = phoneNumber.replace(/-/g, '');
phoneNumber = phoneNumber.trim();
if (phoneNumber.startsWith("0")) {
return "+62" + phoneNumber.slice(1);
} else if (!phoneNumber.startsWith("+62")) {
return "+62" + phoneNumber;
}
return phoneNumber;
}

// Import from Excel
$('#importButton').on('click', function() {
$('#importFile').click();
});

$('#importFile').on('change', function(event) {
const file = event.target.files[0];
if (!file) {
return;
}

const reader = new FileReader();
reader.onload = function(e) {
try {
const data = new Uint8Array(e.target.result);
const workbook = XLSX.read(data, { type: 'array' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const json = XLSX.utils.sheet_to_json(worksheet);

if (!Array.isArray(json) || json.length === 0) {
return;
}

json.forEach(rawCustomer => {
const customer = {
title: rawCustomer.title ? rawCustomer.title.toUpperCase() : '',
name: rawCustomer.name ? rawCustomer.name.toUpperCase() : '',
phone: rawCustomer.phone ? formatPhoneNumber(rawCustomer.phone) : '',
whatsapp: rawCustomer.whatsapp ? formatPhoneNumber(rawCustomer.whatsapp) : '',
email: rawCustomer.email ? rawCustomer.email : '',
company: rawCustomer.company ? formatCompanyName(rawCustomer.company.toUpperCase()) : ''
};
addCustomer(customer);
});
showAlert(`${json.length} data berhasil diimpor!`);
} catch (error) {
console.error("Error processing file:", error);
}
};
reader.readAsArrayBuffer(file);
});

$('#addDataButton').on('click', function() {
$('#customerModal').modal('show');
setTimeout(function() {
$('#name').focus();
}, 500);
});

// Function to update total customer count
function updateCustomerCount() {
database.ref('customers').once('value').then(snapshot => {
const customers = snapshot.val();
const customerCount = customers ? Object.keys(customers).length : 0;
$('#totalCustomer').text(customerCount);
}).catch(error => {
console.error('Error updating customer count:', error);
});
}
});
