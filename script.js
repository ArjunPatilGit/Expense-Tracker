let transactions = [];

const balanceDisplay = document.getElementById("balance");
const transactionForm = document.getElementById("transactionForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const creditDropdown = document.getElementById("creditDropdown");
const debitDropdown = document.getElementById("debitDropdown");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transactionList");
const resetBtn = document.getElementById("resetBtn");
const printBtn = document.getElementById("printBtn");

// Load from localStorage
window.onload = () => {
  const savedData = JSON.parse(localStorage.getItem("transactions"));
  if (savedData) {
    transactions = savedData;
    updateUI();
};

// Add transaction
transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = categoryInput.value;
  const creditSelected = creditDropdown.value === 'credit';
  const debitSelected = debitDropdown.value === 'debit';

  if (!desc || isNaN(amount) || !date || !category || (!creditSelected && !debitSelected)) return;

  let transactionAmount = 0;
  if (creditSelected) {
    transactionAmount = amount;
  } else if (debitSelected) {
    transactionAmount = -amount;
  }

  const newTransaction = {
    desc,
    amount: transactionAmount,
    date,
    category,
    type: creditSelected ? "Credit" : "Debit"
  };

  transactions.push(newTransaction);
  saveAndRender();

  transactionForm.reset();
});

// Reset Data
resetBtn.addEventListener("click", () => {
  if (confirm("Clear all data?")) {
    transactions = [];
    saveAndRender();
  }
});

// Save and Update function
function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

// Render Transactions
function updateUI() {
  transactionList.innerHTML = "";
  let balance = 0;

  transactions.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${t.desc}</strong><br/>
      ₹${t.amount.toFixed(2)} | ${t.type} | ${t.category} | ${t.date}
    `;
    transactionList.appendChild(li);

    balance += t.amount;
  });

  balanceDisplay.textContent = balance.toFixed(2);
}

// Print Summary
printBtn.addEventListener("click", () => {
  const grouped = {};

  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(t);
  });

  let html = `
    <html>
      <head>
        <title>Expense Summary</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 40px;
            color: #333;
          }
          h1 {
            text-align: center;
            margin-bottom: 40px;
          }
          h2 {
            background: #4a90e2;
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-top: 40px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            padding: 12px;
            border: 1px solid #ccc;
            text-align: left;
          }
          th {
            background: #f2f2f2;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
        </style>
      </head>
      <body>
        <h1>Expense Summary</h1>`;

  for (const month in grouped) {
    html += `<h2>${month}</h2>`;
    html += `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount (₹)</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>`;
    
    grouped[month].forEach(t => {
      html += `
        <tr>
          <td>${t.date}</td>
          <td>${t.desc}</td>
          <td>${t.category}</td>
          <td>${t.amount.toFixed(2)}</td>
          <td>${t.type}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
  }

  html += `</body></html>`;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
});
