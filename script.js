let transactions = [];

const balanceDisplay = document.getElementById("balance");
const transactionForm = document.getElementById("transactionForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
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
  }
};

// Add transaction
transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const desc = descInput.value.trim();
  const amt = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = categoryInput.value;

  if (!desc || isNaN(amt) || !date || !category) return;

  const newTransaction = {
    desc,
    amt,
    date,
    category
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

// Save and Update
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
      ₹${t.amt.toFixed(2)} | ${t.category} | ${t.date}
    `;
    transactionList.appendChild(li);
    balance += t.amt;
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
