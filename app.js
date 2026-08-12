// ========================================
// HASTA ÖDEME TAKİP
// ========================================

let patients = [];
let selectedPatientId = null;


// ========================================
// VERİLERİ YÜKLE
// ========================================

function loadPatients() {

  try {

    const saved =
      localStorage.getItem("patients");

    patients = saved
      ? JSON.parse(saved)
      : [];

  } catch (error) {

    console.error(
      "Veriler yüklenemedi:",
      error
    );

    patients = [];
  }
}


// ========================================
// VERİLERİ KAYDET
// ========================================

function savePatients() {

  localStorage.setItem(
    "patients",
    JSON.stringify(patients)
  );
}


// ========================================
// ELEMENTLER
// ========================================

const homePage =
  document.getElementById("homePage");

const patientPage =
  document.getElementById("patientPage");

const patientModal =
  document.getElementById("patientModal");

const patientList =
  document.getElementById("patientList");

const searchInput =
  document.getElementById("searchInput");

const patientName =
  document.getElementById("patientName");

const patientPhone =
  document.getElementById("patientPhone");

const patientPrice =
  document.getElementById("patientPrice");

const detailPatientName =
  document.getElementById("detailPatientName");

const detailPatientPhone =
  document.getElementById("detailPatientPhone");

const detailPatientPrice =
  document.getElementById("detailPatientPrice");

const paymentDate =
  document.getElementById("paymentDate");

const paymentAmount =
  document.getElementById("paymentAmount");

const paymentHistory =
  document.getElementById("paymentHistory");


// ========================================
// BUGÜNÜN TARİHİ
// ========================================

function getToday() {

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ========================================
// TARİHİ GÖRÜNTÜLE
// ========================================

function formatDate(date) {

  if (!date) {
    return "-";
  }

  const parts =
    date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}


// ========================================
// PARA FORMAT
// ========================================

function formatMoney(amount) {

  const number =
    Number(amount) || 0;

  return number.toLocaleString(
    "tr-TR"
  ) + " TL";
}


// ========================================
// HTML GÜVENLİĞİ
// ========================================

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text ?? "";

  return div.innerHTML;
}


// ========================================
// ANA SAYFAYI GÖSTER
// ========================================

function showHomePage() {

  homePage.classList.remove("hidden");

  patientPage.classList.add("hidden");

  selectedPatientId = null;

  renderPatients();
}


// ========================================
// HASTA SAYFASINI GÖSTER
// ========================================

function showPatientPage(patient) {

  homePage.classList.add("hidden");

  patientPage.classList.remove("hidden");

  selectedPatientId =
    patient.id;

  detailPatientName.textContent =
    patient.name;

  detailPatientPhone.textContent =
    patient.phone || "Telefon yok";

  detailPatientPrice.textContent =
    patient.price
      ? formatMoney(patient.price)
      : "-";

  paymentDate.value =
    getToday();

  paymentAmount.value =
    patient.price || "";

  renderPaymentHistory(patient);
}


// ========================================
// HASTA LİSTESİ
// ========================================

function renderPatients() {

  const search =
    searchInput.value
      .toLowerCase()
      .trim();

  const filtered =
    patients.filter(patient =>
      patient.name
        .toLowerCase()
        .includes(search)
  );


  if (filtered.length === 0) {

    patientList.innerHTML = `
      <div class="empty-state">

        <div class="icon">
          👤
        </div>

        <h3>Henüz hasta yok</h3>

        <p>
          Yeni Hasta butonuna
          basarak hasta ekleyebilirsin.
        </p>

      </div>
    `;

    return;
  }


  patientList.innerHTML =
    filtered.map(patient => {

      const payments =
        Array.isArray(patient.payments)
          ? patient.payments
          : [];


      const unpaid =
        payments.filter(
          payment =>
            payment.paid !== true
        ).length;


      let statusHtml = "";

      if (unpaid > 0) {

        statusHtml = `
          <div class="payment-status unpaid">
            ${unpaid} ödenmemiş kayıt
          </div>
        `;

      } else if (payments.length > 0) {

        statusHtml = `
          <div class="payment-status paid">
            ✓ Ödemeler tamam
          </div>
        `;
      }


      return `

        <div
          class="patient-card"
          data-id="${patient.id}"
        >

          <h3>
            ${escapeHtml(patient.name)}
          </h3>

          <p>
            📞
            ${escapeHtml(
              patient.phone ||
              "Telefon belirtilmemiş"
            )}
          </p>

          <p>
            💰 Haftalık:
            ${
              patient.price
                ? formatMoney(patient.price)
                : "-"
            }
          </p>

          ${statusHtml}

        </div>

      `;

    }).join("");


  document
    .querySelectorAll(".patient-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const id =
            Number(card.dataset.id);

          openPatient(id);
        }
      );

    });
}


// ========================================
// HASTA AÇ
// ========================================

function openPatient(id) {

  const patient =
    patients.find(
      item => item.id === id
    );

  if (!patient) {
    return;
  }

  if (!Array.isArray(patient.payments)) {
    patient.payments = [];
  }

  showPatientPage(patient);
}


// ========================================
// HASTA MODALI AÇ
// ========================================

function openPatientModal() {

  patientName.value = "";

  patientPhone.value = "";

  patientPrice.value = "";

  patientModal.classList.remove(
    "hidden"
  );

  setTimeout(() => {

    patientName.focus();

  }, 100);
}


// ========================================
// HASTA MODALI KAPAT
// ========================================

function closePatientModal() {

  patientModal.classList.add(
    "hidden"
  );
}


// ========================================
// HASTA EKLE
// ========================================

function addPatient() {

  const name =
    patientName.value.trim();

  const phone =
    patientPhone.value.trim();

  const price =
    patientPrice.value.trim();


  if (!name) {

    alert(
      "Lütfen hasta adını gir."
    );

    patientName.focus();

    return;
  }


  const newPatient = {

    id: Date.now(),

    name,

    phone,

    price,

    payments: []

  };


  patients.push(
    newPatient
  );

  savePatients();

  closePatientModal();

  renderPatients();
}


// ========================================
// HASTA DÜZENLEME
// ========================================

function editPatient() {

  const patient =
    patients.find(
      item =>
        item.id === selectedPatientId
    );

  if (!patient) {
    return;
  }


  const newName =
    prompt(
      "Hasta adı:",
      patient.name
    );


  if (
    newName === null ||
    !newName.trim()
  ) {
    return;
  }


  const newPhone =
    prompt(
      "Telefon:",
      patient.phone || ""
    );


  if (newPhone === null) {
    return;
  }


  const newPrice =
    prompt(
      "Haftalık ücret:",
      patient.price || ""
    );


  if (newPrice === null) {
    return;
  }


  patient.name =
    newName.trim();

  patient.phone =
    newPhone.trim();

  patient.price =
    newPrice.trim();


  savePatients();

  showPatientPage(patient);
}


// ========================================
// HASTA SİL
// ========================================

function deletePatient() {

  const patient =
    patients.find(
      item =>
        item.id === selectedPatientId
    );

  if (!patient) {
    return;
  }


  const confirmDelete =
    confirm(
      `"${patient.name}" adlı hastayı ve tüm ödeme kayıtlarını silmek istediğine emin misin?`
    );


  if (!confirmDelete) {
    return;
  }


  patients =
    patients.filter(
      item =>
        item.id !== selectedPatientId
    );


  savePatients();

  showHomePage();
}


// ========================================
// ÖDEME EKLE
// ========================================

function savePayment() {

  const patient =
    patients.find(
      item =>
        item.id === selectedPatientId
    );

  if (!patient) {
    return;
  }


  const date =
    paymentDate.value;

  const amount =
    paymentAmount.value.trim();


  if (!date) {

    alert(
      "Lütfen ödeme tarihini seç."
    );

    return;
  }


  if (
    !amount ||
    Number(amount) <= 0
  ) {

    alert(
      "Lütfen geçerli bir ödeme tutarı gir."
    );

    return;
  }


  if (!Array.isArray(patient.payments)) {
    patient.payments = [];
  }


  const payment = {

    id: Date.now(),

    date,

    amount: Number(amount),

    paid: false

  };


  patient.payments.unshift(
    payment
  );


  savePatients();

  paymentAmount.value =
    patient.price || "";

  renderPaymentHistory(patient);

  renderPatients();
}


// ========================================
// ÖDEME GEÇMİŞİ
// ========================================

function renderPaymentHistory(patient) {

  const payments =
    Array.isArray(patient.payments)
      ? patient.payments
      : [];


  if (payments.length === 0) {

    paymentHistory.innerHTML = `

      <div class="payment-history-empty">

        Henüz ödeme kaydı yok.

      </div>

    `;

    return;
  }


  paymentHistory.innerHTML =
    payments.map(payment => {

      const paid =
        payment.paid === true;


      return `

        <div
          class="payment-item"
          data-payment-id="${payment.id}"
        >

          <div class="payment-top">

            <div class="payment-date">
              📅 ${formatDate(payment.date)}
            </div>

            <div class="payment-amount">
              ${formatMoney(payment.amount)}
            </div>

          </div>


          <div
            class="payment-status ${
              paid ? "paid" : "unpaid"
            }"
          >

            ${
              paid
                ? "✓ Ödendi"
                : "✕ Ödenmedi"
            }

          </div>


          <div class="payment-actions">

            ${
              !paid
                ? `
                  <button
                    class="pay-button"
                    onclick="markPaymentPaid(${payment.id})"
                  >
                    ✓ Ödendi
                  </button>
                `
                : `
                  <button
                    class="edit-button"
                    onclick="markPaymentUnpaid(${payment.id})"
                  >
                    ↩ Ödenmedi
                  </button>
                `
            }


            <button
              class="edit-button"
              onclick="editPayment(${payment.id})"
            >
              Düzenle
            </button>


            <button
              class="delete-button"
              onclick="deletePayment(${payment.id})"
            >
              Sil
            </button>

          </div>

        </div>

      `;

    }).join("");
}


// ========================================
// ÖDENDİ YAP
// ========================================

function markPaymentPaid(paymentId) {

  const patient =
    patients.find(
      item =>
        item.id === selectedPatientId
    );

  if (!patient) {
    return;
  }


  const payment =
    patient.payments.find(
      item =>
        item.id === paymentId
    );

  if (!payment) {
    return;
  }


  payment.paid = true;

  payment.paidAt =
    new Date().toISOString();


  savePatients();

  renderPaymentHistory(patient);

  renderPatients();
}


// ========================================
// ÖDENMEDİ YAP
// ========================================

function markPaymentUnpaid(paymentId) {

  const patient =
    patients.find(
      item =>
        item.id === selectedPatientId
    );

  if (!patient) {
    return;
  }


  const payment =
    patient.payments.find(
      item =>
        item.id === paymentId
    );

  if (!payment) {
    return;
  }


  payment.paid = false;

  delete payment.paidAt;


  savePatients();

  renderPaymentHistory(patient);

  renderPatients();
}


// ========================================
// ÖDEME DÜZENLE
// ========================================

function editPayment(paymentId) {

  const patient =
    patients.find(
      item =>
        item.id === selectedPatientId
    );

  if (!patient) {
    return;
  }


  const payment =
    patient.payments.find(
      item =>
        item.id === paymentId
    );

  if (!payment) {
    return;
  }


  const newDate =
    prompt(
      "Ödeme tarihi (YYYY-AA-GG):",
      payment.date
    );


  if (newDate === null) {
    return;
  }


  const newAmount =
    prompt(
      "Ödeme tutarı:",
      payment.amount
    );


  if (newAmount === null) {
    return;
  }


  if (
    !newDate.trim() ||
    !newAmount.trim() ||
    Number(newAmount) <= 0
  ) {

    alert(
      "Geçerli tarih ve tutar gir."
    );

    return;
  }


  payment.date =
    newDate.trim();

  payment.amount =
    Number(newAmount);


  savePatients();

  renderPaymentHistory(patient);
}


// ========================================
// ÖDEME SİL
// ========================================

function deletePayment(paymentId) {

  const patient =
    patients.find(
      item =>
        item.id === selectedPatientId
    );

  if (!patient) {
    return;
  }


  const payment =
    patient.payments.find(
      item =>
        item.id === paymentId
    );

  if (!payment) {
    return;
  }


  const confirmDelete =
    confirm(
      "Bu ödeme kaydını silmek istediğine emin misin?"
    );


  if (!confirmDelete) {
    return;
  }


  patient.payments =
    patient.payments.filter(
      item =>
        item.id !== paymentId
    );


  savePatients();

  renderPaymentHistory(patient);

  renderPatients();
}


// ========================================
// BUTONLAR
// ========================================

document
  .getElementById("addPatientButton")
  .addEventListener(
    "click",
    openPatientModal
  );


document
  .getElementById("closeModalButton")
  .addEventListener(
    "click",
    closePatientModal
  );


document
  .getElementById("cancelPatientButton")
  .addEventListener(
    "click",
    closePatientModal
  );


document
  .getElementById("savePatientButton")
  .addEventListener(
    "click",
    addPatient
  );


document
  .getElementById("backButton")
  .addEventListener(
    "click",
    showHomePage
  );


document
  .getElementById("savePaymentButton")
  .addEventListener(
    "click",
    savePayment
  );


searchInput.addEventListener(
  "input",
  renderPatients
);


// ========================================
// MODAL DIŞINA BASINCA KAPAT
// ========================================

patientModal.addEventListener(
  "click",
  event => {

    if (
      event.target === patientModal
    ) {

      closePatientModal();

    }

  }
);


// ========================================
// BAŞLANGIÇ
// ========================================

loadPatients();

renderPatients();


// Bugünün tarihini otomatik seç
paymentDate.value =
  getToday();
