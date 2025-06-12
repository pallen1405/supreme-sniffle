const app = document.getElementById('app');
let currentKid = null;

// ---- Kid management ----
function loadKids() {
  const str = localStorage.getItem('kids');
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

function saveKids(kids) {
  localStorage.setItem('kids', JSON.stringify(kids));
}

function addKidFlow(callback) {
  const name = prompt('New kid\'s name:');
  if (!name) return;
  const pin = prompt('PIN for ' + name + ':');
  if (!pin) return;
  const kids = loadKids();
  const kid = { id: Date.now(), name, pin: btoa(pin) };
  kids.push(kid);
  saveKids(kids);
  if (callback) callback(kid);
}

function getKidById(id) {
  const kids = loadKids();
  return kids.find(k => k.id === id);
}

// ---- Chore management ----
function loadChores(kidId) {
  const str = localStorage.getItem('chores_' + kidId);
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

function saveChores(kidId, chores) {
  localStorage.setItem('chores_' + kidId, JSON.stringify(chores));
}

// ---- UI helpers ----
function promptPaymentPin() {
  const pin = prompt('Enter PIN to confirm payment:');
  return pin && btoa(pin) === currentKid.pin;
}

function addChore() {
  const name = prompt('Chore name:');
  if (!name) return;
  const rateStr = prompt('Pay rate:');
  if (!rateStr) return;
  const rate = parseFloat(rateStr);
  const chores = loadChores(currentKid.id);
  chores.push({ id: Date.now(), name, rate, done: false, paid: false });
  saveChores(currentKid.id, chores);
  renderKid();
}

function toggleDone(id, checked) {
  const chores = loadChores(currentKid.id);
  const c = chores.find(ch => ch.id === id);
  if (c) {
    c.done = checked;
    if (!c.done) c.paid = false;
    saveChores(currentKid.id, chores);
    renderKid();
  }
}

function togglePaid(id, checked) {
  if (!promptPaymentPin()) {
    renderKid();
    return;
  }
  const chores = loadChores(currentKid.id);
  const c = chores.find(ch => ch.id === id);
  if (c) {
    c.paid = checked;
    saveChores(currentKid.id, chores);
    renderKid();
  }
}

// ---- Rendering ----
function showLogin() {
  const kids = loadKids();
  if (kids.length === 0) {
    addKidFlow(kid => {
      currentKid = kid;
      renderKid();
    });
    return;
  }

  const container = document.createElement('div');
  const select = document.createElement('select');
  kids.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k.id;
    opt.textContent = k.name;
    select.appendChild(opt);
  });
  container.appendChild(select);

  const pinInput = document.createElement('input');
  pinInput.type = 'password';
  pinInput.placeholder = 'PIN';
  container.appendChild(pinInput);

  const loginBtn = document.createElement('button');
  loginBtn.textContent = 'Login';
  loginBtn.onclick = () => {
    const kid = getKidById(parseInt(select.value, 10));
    if (!kid) return;
    if (btoa(pinInput.value) === kid.pin) {
      currentKid = kid;
      renderKid();
    } else {
      alert('Incorrect PIN');
    }
  };
  container.appendChild(loginBtn);

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Kid';
  addBtn.onclick = () => {
    addKidFlow(newKid => {
      select.appendChild(new Option(newKid.name, newKid.id));
      select.value = newKid.id;
    });
  };
  container.appendChild(addBtn);

  app.innerHTML = '';
  app.appendChild(container);
}

function renderKid() {
  const chores = loadChores(currentKid.id);
  const container = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = 'Chores for ' + currentKid.name;
  container.appendChild(heading);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Done</th><th>Paid</th><th>Chore</th><th>Rate</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  chores.forEach(ch => {
    const row = document.createElement('tr');
    const doneTd = document.createElement('td');
    const doneCb = document.createElement('input');
    doneCb.type = 'checkbox';
    doneCb.checked = ch.done;
    doneCb.onchange = () => toggleDone(ch.id, doneCb.checked);
    doneTd.appendChild(doneCb);
    row.appendChild(doneTd);

    const paidTd = document.createElement('td');
    const paidCb = document.createElement('input');
    paidCb.type = 'checkbox';
    paidCb.disabled = !ch.done;
    paidCb.checked = ch.paid;
    paidCb.onchange = () => togglePaid(ch.id, paidCb.checked);
    paidTd.appendChild(paidCb);
    row.appendChild(paidTd);

    const nameTd = document.createElement('td');
    nameTd.textContent = ch.name;
    row.appendChild(nameTd);

    const rateTd = document.createElement('td');
    rateTd.textContent = '$' + ch.rate.toFixed(2);
    row.appendChild(rateTd);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  const total = chores.filter(ch => ch.done && !ch.paid)
                      .reduce((sum, ch) => sum + ch.rate, 0);
  const totalDiv = document.createElement('div');
  totalDiv.innerHTML = '<strong>Total Owed: $' + total.toFixed(2) + '</strong>';
  container.appendChild(totalDiv);

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Chore';
  addBtn.onclick = addChore;
  container.appendChild(addBtn);

  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.onclick = () => {
    currentKid = null;
    showLogin();
  };
  container.appendChild(logoutBtn);

  app.innerHTML = '';
  app.appendChild(container);
}

// ---- Initialization ----
showLogin();
