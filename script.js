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

// Google Sign-In configuration
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Google Client ID

// Initialize Google Sign-In
function onSignIn(googleUser) {
  const profile = googleUser.getBasicProfile();
  const userID = profile.getId();
  const userName = profile.getName();
  const userEmail = profile.getEmail();

  console.log(`Signed in as: ${userName} (${userEmail})`);

  // Here you can store user info or handle login actions
  localStorage.setItem('user', JSON.stringify({
    userID,
    userName,
    userEmail
  }));

  // Hide sign-in button and show tracker
  document.getElementById('gSignIn').style.display = 'none';
  document.querySelector('.container').style.display = 'block';
}

// Sign out function
function signOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(() => {
    console.log('User signed out.');
    document.getElementById('gSignIn').style.display = 'block';
    document.querySelector('.container').style.display = 'none';
    localStorage.removeItem('user');
  });
}

// Add Google Sign-In button
gapi.load('auth2', function () {
  gapi.auth2.init({
    client_id: CLIENT_ID
  }).then(() => {
    gapi.signin2.render('gSignIn', {
      scope: 'profile email',
      width: 200,
      height: 50,
      longtitle: true,
      theme: 'dark',
      onsuccess: onSignIn
    });
  });
});

// Load from localStorage
window.onload = () => {
  const savedData = JSON.parse(localStorage.getItem("transactions"));
  if (savedData) {
    transactions = savedData.map(t => ({
      ...t,
      amt: parseFloat(t.amt)
    }));
    updateUI();
  }

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    document.getElementById('gSignIn').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
  } else {
    document.getElementById('gSignIn').style.display = 'block';
    document.querySelector('.container').style.display = 'none';
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

  let html = `
    <html>
      <head>
        <title>Expense Summary</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
          h1 { text-align: center; margin-bottom: 40px; }
          h2 { background: #4a90e2; color: white; padding: 10px; border-radius: 5px; margin-top: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; border: 1px solid #ccc; text-align: left; }
          th { background: #f2f2f2; }
          tr:nth-child(even) { background-color: #fafafa; }
        </style>
      </head>
      <body>
        <h1>Expense Summary</h1>
  `;

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
          </tr>
        </thead>
        <tbody>
    `;
    grouped[month].forEach(t => {
      html += `
        <tr>
          <td>${t.date}</td>
          <td>${t.desc}</td>
          <td>${t.category}</td>
          <td>${t.amt.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
  }

  html += `</body></html>`;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
});
