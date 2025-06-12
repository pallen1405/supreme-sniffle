const app = document.getElementById('app');

function getPin() {
  return localStorage.getItem('pin');
}

function setPin() {
  while (true) {
    const newPin = prompt('Create a PIN for this tracker:');
    if (newPin) {
      localStorage.setItem('pin', btoa(newPin));
      break;
    }
  }
}

function checkPin() {
  const stored = getPin();
  if (!stored) {
    setPin();
    return true;
  }
  while (true) {
    const pin = prompt('Enter PIN to continue:');
    if (pin === null) continue;
    if (btoa(pin) === stored) return true;
    alert('Incorrect PIN');
  }
}

function promptPin() {
  const stored = getPin();
  const pin = prompt('Enter PIN to confirm payment:');
  return pin && btoa(pin) === stored;
}

function loadChores() {
  const str = localStorage.getItem('chores');
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

function saveChores(chores) {
  localStorage.setItem('chores', JSON.stringify(chores));
}

function addChore() {
  const name = prompt('Chore name:');
  if (!name) return;
  const rateStr = prompt('Pay rate:');
  if (!rateStr) return;
  const rate = parseFloat(rateStr);
  const chores = loadChores();
  chores.push({ id: Date.now(), name, rate, done: false, paid: false });
  saveChores(chores);
  render();
}

function toggleDone(id, checked) {
  const chores = loadChores();
  const c = chores.find(ch => ch.id === id);
  if (c) {
    c.done = checked;
    if (!c.done) c.paid = false;
    saveChores(chores);
    render();
  }
}

function togglePaid(id, checked) {
  if (!promptPin()) {
    render();
    return;
  }
  const chores = loadChores();
  const c = chores.find(ch => ch.id === id);
  if (c) {
    c.paid = checked;
    saveChores(chores);
    render();
  }
}

function render() {
  const chores = loadChores();
  const container = document.createElement('div');

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

  app.innerHTML = '';
  app.appendChild(container);
}

if (checkPin()) {
  render();
}
