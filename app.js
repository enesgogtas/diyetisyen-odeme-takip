const KEY = "dietisyen_pwa_patients_v1";

const days = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar"
];

let patients = JSON.parse(localStorage.getItem(KEY) || "[]");
let editing = null;

const $ = id => document.getElementById(id);

days.forEach((day, i) => {
  $("day").insertAdjacentHTML(
    "beforeend",
    `<option value="${i + 1}">${day}</option>`
  );
});

function monday(date = new Date()) {
  const d = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  d.setDate(d.getDate() - (d.getDay() || 7) + 1);

  return d;
}

function key(date) {
  return date.toISOString().slice(0, 10);
}

function paymentState(patient) {
  const currentMonday = monday();

  const paid =
    (patient.paidWeeks || []).includes(key(currentMonday));

  if (paid) {
    return ["Ödendi", "green"];
  }

  const dueDate = new Date(currentMonday);

  dueDate.setDate(
    dueDate.getDate() + patient.day - 1
  );

  const today = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  const due = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const daysLate = Math.floor(
    (today - due) / 86400000
  );

  if (daysLate > 3) {
    return ["Gecikti", "red"];
  }

  return ["Bekliyor", "orange"];
}

function saveAll() {
  localStorage.setItem(
    KEY,
    JSON.stringify(patients)
  );

  render();
}

function render() {
  $("count").textContent = patients.length;

  let pending = 0;
  let late = 0;
  let total = 0;

  patients.forEach(patient => {
    const state = paymentState(patient)[0];

    if (state === "Bekliyor") pending++;
    if (state === "Gecikti") late++;

    total += Number(patient.fee) || 0;
  });

  $("pending").textContent = pending;
  $("late").textContent = late;

  $("total").textContent =
    Math.round(total).toLocaleString("tr-TR") +
    " TL";

  const list = $("list");

  list.innerHTML = "";

  if (!patients.length) {
    list.innerHTML =
      '<div class="empty">' +
      "Henüz hasta eklenmedi.<br><br>" +
      "+ Hasta butonundan ilk kaydı oluştur." +
      "</div>";

    return;
  }

  patients.forEach(patient => {
    const state = paymentState(patient);

    const initial =
      (patient.name || "?")
        .trim()[0]
        ?.toUpperCase() || "?";

    const element =
      document.createElement("div");

    element.className = "card";

    element.innerHTML = `
      <div class="avatar">${initial}</div>

      <div class="info">

        <div class="name">
          ${escapeHtml(patient.name)}
        </div>

        <div class="sub">
          ${Number(patient.fee).toLocaleString("tr-TR")}
          TL / hafta ·
          ${days[patient.day - 1]}
        </div>

        <div class="status ${state[1]}">
          ● ${state[0]}
        </div>

      </div>

      <button class="menu">⋮</button>
    `;

    element.querySelector(".menu").onclick =
      () => showMenu(patient);

    list.appendChild(element);
  });
}

function showMenu(patient) {
  const choice = prompt(
    `${patient.name}

1 = Ödeme Alındı
2 = Düzenle
3 = Sil`
  );

  if (choice === "1") {
    patient.paidWeeks =
      patient.paidWeeks || [];

    const currentWeek =
      key(monday());

    if (
      !patient.paidWeeks.includes(
        currentWeek
      )
    ) {
      patient.paidWeeks.push(
        currentWeek
      );
    }

    saveAll();
  }

  if (choice === "2") {
    openForm(patient);
  }

  if (choice === "3") {
    if (
      confirm(
        "Hasta silinsin mi?"
      )
    ) {
      patients =
        patients.filter(
          x => x.id !== patient.id
        );

      saveAll();
    }
  }
}

function openForm(patient = null) {
  editing = patient;

  $("modalTitle").textContent =
    patient
      ? "Hasta Düzenle"
      : "Hasta Ekle";

  $("name").value =
    patient?.name || "";

  $("phone").value =
    patient?.phone || "";

  $("fee").value =
    patient?.fee || "";

  $("day").value =
    patient?.day || 1;

  $("note").value =
    patient?.note || "";

  $("modal").classList.remove(
    "hidden"
  );

  $("name").focus();
}

function closeForm() {
  $("modal").classList.add(
    "hidden"
  );

  editing = null;
}

$("addBtn").onclick =
  () => openForm();

$("close").onclick =
  closeForm;

$("cancel").onclick =
  closeForm;

$("save").onclick = () => {

  const name =
    $("name").value.trim();

  const fee =
    parseFloat(
      $("fee").value.replace(",", ".")
    );

  if (
    !name ||
    !fee ||
    fee <= 0
  ) {
    alert(
      "Ad soyad ve geçerli bir ücret gir."
    );

    return;
  }

  const patient =
    editing || {
      id:
        Date.now().toString(),

      paidWeeks: []
    };

  Object.assign(
    patient,
    {
      name: name,

      phone:
        $("phone").value.trim(),

      fee: fee,

      day:
        Number($("day").value),

      note:
        $("note").value.trim()
    }
  );

  if (!editing) {
    patients.push(patient);
  }

  saveAll();

  closeForm();
};

function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );
}

render();

if ("serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker.register(
        "sw.js"
      );
    }
  );
}
