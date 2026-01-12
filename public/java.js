// --- Fejléc színváltás görgetésre ---
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  const nav = document.querySelector("nav");
  if (nav) {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      nav.style.backgroundColor = "#FFFFFF";
    } else {
      nav.style.backgroundColor = "transparent";
    }
  }
}

// --- Kutyák betöltése (MODERN VERZIÓ) ---
window.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('kutyaLista');
  if (lista) { // CSAK AKKOR FUT HA VAN LISTA ELEM
    lista.innerHTML = ''; 

    fetch('http://localhost:3000/kutyak')
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          lista.innerHTML = '<p style="text-align:center;color:red;">Jelenleg nincsenek kutyák az adatbázisban.</p>';
          return;
        }

        data.forEach(kutya => {
          const card = document.createElement('div');
          card.className = 'kutya-card'; 
          
          card.innerHTML = `
            <div class="kutya-card-img-wrapper">
              <img class="kutya-card-img" src="${kutya.kep_url || 'img/alap.png'}" alt="${kutya.nev}">
            </div>
            <div class="kutya-card-body">
              <h3>${kutya.nev}</h3>
              <p>${kutya.fajta} <br> ${kutya.eletkor} éves • ${kutya.nem}</p>
              <span class="btn-reszletek-custom">Részletek</span>
            </div>`;
          
          card.addEventListener('click', () => {
            megnyitKutyaModalt(kutya);
          });
        
          lista.appendChild(card);
        });
      })
      .catch(() => {
        lista.innerHTML = '<p style="text-align:center;color:red;">Nem sikerült betölteni a kutyák adatait.</p>';
      });
  }
});

// --- Visszajelzés küldése ---
function validateForm() {
  var emailElem = document.getElementById('email');
  var szovegElem = document.getElementById('szoveg');
  var errorMessage = document.getElementById('errorMessage');

  if (!emailElem || !szovegElem || !errorMessage) return;

  var email = emailElem.value;
  var szoveg = szovegElem.value;
  errorMessage.innerHTML = '';

  if (!email || !szoveg) {
    errorMessage.innerHTML = 'Kérlek töltsd ki az összes mezőt helyesen!';
    return;
  }

  fetch('http://localhost:3000/visszajelzes', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email: email, szoveg: szoveg })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message || 'Sikeres mentés!');
    const regForm = document.getElementById('registrationForm');
    if (regForm) regForm.reset();
  })
  .catch(() => {
    errorMessage.innerHTML = 'Nem sikerült menteni az adatokat.';
  });
}

// --- Kutya hozzáadás Form ---
const kutyaForm = document.getElementById('kutyaForm');
if (kutyaForm) {
    kutyaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(kutyaForm);

      try {
        const res = await fetch('http://localhost:3000/kutyak', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          alert(' ' + data.message);
          kutyaForm.reset(); 
        } else {
          alert(' Hiba: ' + (data.error || 'Ismeretlen hiba történt.'));
        }

      } catch (err) {
        alert(' Szerverhiba: ' + err.message);
      }
    });
}

function openAdoptModal(kutyaId) {
  const kIdInput = document.getElementById('kutya_id');
  const aModal = document.getElementById('adoptModal');
  if (kIdInput) kIdInput.value = kutyaId;
  if (aModal) aModal.style.display = 'flex';
}

function closeModal() {
  const aModal = document.getElementById('adoptModal');
  if (aModal) aModal.style.display = 'none';
}

// Örökbefogadás gomb esemény
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('gomb')) {
    const card = e.target.closest('.row-back');
    if (!card) return;
    const kutyaNev = card.querySelector('h1').innerText.split('\n')[0];
    const kutyaId = card.getAttribute('data-kutya-id');

    const label = document.getElementById('adoptModalLabel');
    const kIdInput = document.getElementById('kutya_id');
    
    if (label) label.innerText = `Örökbefogadás: ${kutyaNev}`;
    if (kIdInput) kIdInput.value = kutyaId;

    $('#adoptModal').modal('show');
  }
});

// Form feldolgozása (Örökbefogadás)
const adoptForm = document.getElementById("adoptForm");
if (adoptForm) {
    adoptForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const nev = document.getElementById("nev").value;
      const telefonszam = document.getElementById("telefonszam").value;
      const cim = document.getElementById("cim").value;
      const kutya_id = document.getElementById("kutya_id").value;

      fetch('http://localhost:3000/orokbefogadas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nev, telefonszam, cim, kutya_id })
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Sikeres örökbefogadási jelentkezés!");
        $('#adoptModal').modal('hide');
        this.reset();
      })
      .catch(() => {
        alert("Hiba történt a mentés közben.");
      });
    });
}

// --- Regisztráció Form ---
const regForm = document.getElementById('regForm');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nev = document.getElementById('nev').value;
      const email = document.getElementById('email').value;
      const jelszo = document.getElementById('jelszo').value;
      const jelszo2 = document.getElementById('jelszo2').value;
      const error = document.getElementById('regError');

      if (jelszo !== jelszo2) {
        if (error) error.textContent = 'A két jelszó nem egyezik!';
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nev, email, jelszo })
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          regForm.reset();
        } else {
          if (error) error.textContent = data.error || 'Ismeretlen hiba történt.';
        }
      } catch (err) {
        if (error) error.textContent = 'Szerverhiba: ' + err.message;
      }
    });
}

// --- Feedback Form ---
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');
  if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          name: form.name.value,
          email: form.email.value,
          message: form.message.value
        };
        try {
          const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const json = await res.json();
          alert(json.success ? 'Köszönjük, üzeneted elküldve.' : ('Hiba: ' + (json.error || 'Ismeretlen hiba')));
        } catch (err) {
          alert('Hálózati hiba: ' + err.message);
        }
      });
  }
});

function setupOrkbeBtn() {
  const orokbeBtn = document.getElementById('orokbeBtn');
  if (orokbeBtn) {
      orokbeBtn.addEventListener('click', () => {
          $('#dogModal').modal('hide');
          $('#adoptModal').modal('show');
      });
  }
}

// Minden kutya modal megnyitásakor futtasd:
function megnyitKutyaModalt(kutya) {
  const mKep = document.getElementById('kutyaModalKep');
  const mNev = document.getElementById('kutyaModalNev');
  const mEletkor = document.getElementById('kutyaModalEletkor');
  const mNem = document.getElementById('kutyaModalNem');
  const mFajta = document.getElementById('kutyaModalFajta');
  const mLeiras = document.getElementById('kutyaModalLeiras');
  const mKutyaId = document.getElementById('kutya_id');

  if (mKep) mKep.src = kutya.kep_url || 'img/alap.png';
  if (mNev) mNev.innerText = kutya.nev;
  if (mEletkor) mEletkor.innerText = kutya.eletkor;
  if (mNem) mNem.innerText = kutya.nem;
  if (mFajta) mFajta.innerText = kutya.fajta;
  
  if (mLeiras) {
      mLeiras.innerText = kutya.leiras || "Sajnos ehhez a kutyushoz még nem tartozik leírás, de érdeklődj telefonon!";
  }

  if (mKutyaId) mKutyaId.value = kutya.kutya_id;

  $('#dogModal').modal('show');
  setupOrkbeBtn();
}