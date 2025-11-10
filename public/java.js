// --- Fejléc színváltás görgetésre ---
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    document.querySelector("nav").style.backgroundColor = "#FFFFFF";
  } else {
    document.querySelector("nav").style.backgroundColor = "transparent";
  }
}

// --- Kutyák betöltése ---
window.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('kutyaLista');
  lista.innerHTML = ''; 

  fetch('http://localhost:3000/kutyak')
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        lista.innerHTML = '<p style="text-align:center;color:red;">Jelenleg nincsenek kutyák az adatbázisban.</p>';
        return;
      }

      data.forEach(kutya => {
        const div = document.createElement('div');
        div.className = 'row';
        div.innerHTML = `
          <div class="row-inner">
            <div class="row-front">
              <img src="${kutya.kep_url || 'img/alap.png'}" alt="${kutya.nev || 'Ismeretlen kutya'}">
            </div>
            <div class="row-back">
              <h1>${kutya.nev || 'Ismeretlen'}<br>${kutya.fajta || 'Ismeretlen fajta'}</h1>
              <p>Kor: ${kutya.eletkor || 'n/a'} év<br>
              Nem: ${kutya.nem || '-'}<br></p>
              <button class="gomb">Örökbe fogadás</button>
            </div>
          </div>`;
        lista.appendChild(div);
      });
    })
    .catch(() => {
      lista.innerHTML = '<p style="text-align:center;color:red;">Nem sikerült betölteni a kutyák adatait.</p>';
    });
});

// --- Visszajelzés küldése ---
function validateForm() {
  var email = document.getElementById('email').value;
  var szoveg = document.getElementById('szoveg').value;
  var errorMessage = document.getElementById('errorMessage');

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
    document.getElementById('registrationForm').reset();
  })
  .catch(() => {
    errorMessage.innerHTML = 'Nem sikerült menteni az adatokat.';
  });
}

const kutyaForm = document.getElementById('kutyaForm');

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
          kutyaForm.reset(); // üríti az űrlapot
        } else {
          alert(' Hiba: ' + (data.error || 'Ismeretlen hiba történt.'));
        }

      } catch (err) {
        alert(' Szerverhiba: ' + err.message);
      }
    });

    function openAdoptModal(kutyaId) {
    document.getElementById('kutya_id').value = kutyaId;
    document.getElementById('adoptModal').style.display = 'flex';
  }

  // Bezárás gomb
  function closeModal() {
    document.getElementById('adoptModal').style.display = 'none';
  }

  // Örökbefogadás gomb esemény
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('gomb')) {
    const card = e.target.closest('.row-back');
    const kutyaNev = card.querySelector('h1').innerText.split('\n')[0];
    const kutyaId = card.getAttribute('data-kutya-id'); // ezt a backendből kell adni

    document.getElementById('adoptModalLabel').innerText = `Örökbefogadás: ${kutyaNev}`;
    document.getElementById('kutya_id').value = kutyaId;

    // Bootstrap modal megnyitása
    $('#adoptModal').modal('show');
  }
});

// Form feldolgozása
document.getElementById("adoptForm").addEventListener("submit", function(e) {
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






document.getElementById('regForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nev = document.getElementById('nev').value;
  const email = document.getElementById('email').value;
  const jelszo = document.getElementById('jelszo').value;
  const jelszo2 = document.getElementById('jelszo2').value;
  const error = document.getElementById('regError');

  if (jelszo !== jelszo2) {
    error.textContent = 'A két jelszó nem egyezik!';
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
      document.getElementById('regForm').reset();
    } else {
      error.textContent = data.error || 'Ismeretlen hiba történt.';
    }
  } catch (err) {
    error.textContent = 'Szerverhiba: ' + err.message;
  }
});
  