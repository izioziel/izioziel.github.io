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

const customerForm = $('#customerForm');
const customerTable = $('#customerTable').DataTable();

// Spinner
function showSpinner() {
$('#spinner').show();
}

function hideSpinner() {
$('#spinner').hide();
}

// Load customers from Firebase
function loadCustomers() {
showSpinner();
database.ref('customers').once('value').then(snapshot => {
const customers = snapshot.val();
if (customers) {
customerTable.clear(); // Clear existing data
const customerKeys = Object.keys(customers);
customerKeys.forEach(key => {
const customer = customers[key];
customerTable.row.add([
customer.title, // Add title column here
customer.name,
customer.phone,
`<a target="_blank" href="https://api.whatsapp.com/send?phone=${formatPhoneNumber(customer.whatsapp).replace('+62', '62')}">${customer.whatsapp}</a>`,
`<a target="_blank" href="mailto:${customer.email}">${customer.email}</a>`,
customer.company,
`<button class="btn btn-warning btn-sm edit-btn" data-id="${key}">Edit</button>
 <button class="btn btn-danger btn-sm delete-btn" data-id="${key}">Delete</button>`
]).draw(false);
});
// Update total customer count
$('#totalCustomer').text(customerKeys.length);
}
hideSpinner();
}).catch(error => {
console.error('Error loading customers:', error);
hideSpinner();
});
}

// Handle form submission
customerForm.on('submit', function(event) {
event.preventDefault();
const customerId = $('#customerId').val();
const customer = {
title: $('input[name="title"]:checked').val(), // Add title field here
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

customerForm.trigger('reset');
$('#customerModal').modal('hide');
});

// Add customer to Firebase
function addCustomer(customer) {
const newCustomerRef = database.ref('customers').push();
newCustomerRef.set(customer).then(() => {
customerTable.row.add([
customer.title, // Add title column here
customer.name,
customer.phone,
`<a target="_blank" href="https://api.whatsapp.com/send?phone=${formatPhoneNumber(customer.whatsapp).replace('+62', '62')}">${customer.whatsapp}</a>`,
`<a target="_blank" href="mailto:${customer.email}">${customer.email}</a>`,
customer.company,
`<button class="btn btn-warning btn-sm edit-btn" data-id="${newCustomerRef.key}">Edit</button>
 <button class="btn btn-danger btn-sm delete-btn" data-id="${newCustomerRef.key}">Delete</button>`
]).draw(false);
console.log('Customer added successfully:', customer);
// Update total customer count
updateCustomerCount();
showAlert('Data berhasil ditambahkan');
}).catch(error => {
console.error('Error adding customer:', error);
});
}

// Update customer in Firebase
function updateCustomer(customerId, customer) {
database.ref('customers/' + customerId).set(customer).then(() => {
const row = customerTable.row($(`button[data-id='${customerId}']`).closest('tr'));
row.data([
customer.title, // Add title column here
customer.name,
customer.phone,
`<a target="_blank" href="https://api.whatsapp.com/send?phone=${formatPhoneNumber(customer.whatsapp).replace('+62', '62')}">${customer.whatsapp}</a>`,
`<a target="_blank" href="mailto:${customer.email}">${customer.email}</a>`,
customer.company,
`<button class="btn btn-warning btn-sm edit-btn" data-id="${customerId}">Edit</button>
 <button class="btn btn-danger btn-sm delete-btn" data-id="${customerId}">Delete</button>`
]).draw(false);
console.log('Customer updated successfully:', customer);
showAlert('Data berhasil diedit');
}).catch(error => {
console.error('Error updating customer:', error);
});
}

// Delete customer from Firebase
$('#customerTable tbody').on('click', '.delete-btn', function() {
const customerId = $(this).data('id');
const row = $(this).closest('tr'); // Get the row element

database.ref('customers/' + customerId).remove().then(() => {
customerTable.row(row).remove().draw(false); // Remove the row from DataTable
console.log('Customer deleted successfully:', customerId);
// Update total customer count
updateCustomerCount();
showZisAlert('Data berhasil dihapus');
}).catch(error => {
console.error('Error deleting customer:', error);
});
});

// Edit customer
$('#customerTable tbody').on('click', '.edit-btn', function() {
const customerId = $(this).data('id');
database.ref('customers/' + customerId).once('value').then(snapshot => {
const customer = snapshot.val();
if (customer) {
$('#customerId').val(customerId);
$(`input[name="title"][value="${customer.title}"]`).prop('checked', true); // Add title field here
$('#name').val(customer.name);
$('#phone').val(customer.phone);
$('#whatsapp').val(customer.whatsapp);
$('#email').val(customer.email);
$('#company').val(customer.company);
$('#customerModal').modal('show');
console.log('Customer retrieved for edit:', customer);
}
}).catch(error => {
console.error('Error retrieving customer:', error);
});
});

// Initial load
loadCustomers();

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
phoneNumber = phoneNumber.toString(); // Convert to string if not already
console.warn("Phone number converted to string:", phoneNumber);
}

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
console.log("No file selected.");
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

console.log("Imported Data:", json);

if (!Array.isArray(json) || json.length === 0) {
console.log("No data found in the sheet.");
return;
}

// Count the number of data entries
const dataCount = json.length;

json.forEach(rawCustomer => {
const customer = {
title: rawCustomer.title ? rawCustomer.title.toUpperCase() : '', // Add title field here
name: rawCustomer.name ? rawCustomer.name.toUpperCase() : '',
phone: rawCustomer.phone ? formatPhoneNumber(rawCustomer.phone) : '',
whatsapp: rawCustomer.whatsapp ? formatPhoneNumber(rawCustomer.whatsapp) : '',
email: rawCustomer.email ? rawCustomer.email : '',
company: rawCustomer.company ? formatCompanyName(rawCustomer.company.toUpperCase()) : ''
};
console.log("Processed Customer:", customer);
addCustomer(customer);
});
showAlert(`${dataCount} data berhasil diimpor!`);
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
}, 500); // Menambahkan penundaan 500ms sebelum menetapkan fokus
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
