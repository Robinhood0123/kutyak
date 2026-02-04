// --- Fejléc színváltás görgetésre ---
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  const nav = document.querySelector("nav");
  if (nav) {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      nav.style.backgroundColor = "#FFFFFF"; // Látható háttérszín görgetéskor
    } else {
      nav.style.backgroundColor = "transparent"; // Átlátszó háttérszín az oldal tetején
    }
  }
}

window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) {
    if (window.scrollY > 0) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  }
});

// --- Kutyák betöltése (MODERN, LAPOZHATÓ ÉS BIZTONSÁGOS VERZIÓ) ---
let osszesKutya = []; 
let szurtKutyak = []; // Szűrt kutyák tárolása
let jelenlegiOldal = 1;
const kutyakPerOldal = 9;

window.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('kutyaLista');
    const bejelentkezve = localStorage.getItem('loggedInUser');

    // Ha nincs belépve, vizuális jelzést adunk (opcionális CSS-hez)
    if (lista && !bejelentkezve) {
      lista.classList.add('not-logged-in');
      
      // Beszúrunk egy figyelmeztető üzenetet a lista elé
      const infoSáv = document.createElement('div');
      infoSáv.className = 'login-warning-bar';
      infoSáv.innerHTML = '<i class="fas fa-info-circle"></i> A kutyusok részletes adatainak megtekintéséhez kérjük, <a href="bejelentkezes.html">jelentkezz be</a>!';
      lista.parentNode.insertBefore(infoSáv, lista);
  }

    if (lista) {
        fetch('http://localhost:3000/kutyak')
            .then(res => res.json())
            .then(data => {
                osszesKutya = data;
                szurtKutyak = [...data]; // Kezdetben a szűrt lista megegyezik az eredetivel
                betoltFajtak(); // Fajták betöltése a szűrőbe
                megjelenitOldalt(1); 
                // Szűrő eseménykezelők beállítása
                beallitSzuroEsemenykezeloket();
            })
            .catch(() => {
                lista.innerHTML = '<p style="text-align:center;color:red;">Hiba a betöltéskor. Ellenőrizd a szerver futását!</p>';
            });
    }
});

// --- Fajták betöltése a szűrőbe ---
function betoltFajtak() {
    const fajtak = [...new Set(osszesKutya.map(kutya => kutya.fajta))].sort();
    const fajtaFilter = document.getElementById('fajtaFilter');
    
    if (fajtaFilter) {
        fajtak.forEach(fajta => {
            const option = document.createElement('option');
            option.value = fajta;
            option.textContent = fajta;
            fajtaFilter.appendChild(option);
        });
    }
}

// --- Szűrő eseménykezelők beállítása ---
function beallitSzuroEsemenykezeloket() {
    const filterBtn = document.getElementById('filterBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', szures);
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', szuroReset);
    }
    
    // Enter billentyű a kereső mezőben
    const kereso = document.getElementById('kereso');
    if (kereso) {
        kereso.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                szures();
            }
        });
    }
}

// --- Szűrés funkció ---
function szures() {
    const fajtaFilter = document.getElementById('fajtaFilter').value.toLowerCase();
    const nemFilter = document.getElementById('nemFilter').value.toLowerCase();
    const korFilter = document.getElementById('korFilter').value.toLowerCase();
    const kereso = document.getElementById('kereso').value.toLowerCase();
    
    szurtKutyak = osszesKutya.filter(kutya => {
        // Fajta szűrés
        if (fajtaFilter && kutya.fajta.toLowerCase() !== fajtaFilter) {
            return false;
        }
        
        // Nem szűrés
        if (nemFilter && kutya.nem.toLowerCase() !== nemFilter) {
            return false;
        }
        
        // Kor szűrés
        if (korFilter) {
            const kutyaKor = parseInt(kutya.eletkor) || 0;
            switch(korFilter) {
                case 'kölyök':
                    if (kutyaKor > 1) return false;
                    break;
                case 'fiatal':
                    if (kutyaKor < 1 || kutyaKor > 3) return false;
                    break;
                case 'felnőtt':
                    if (kutyaKor < 3 || kutyaKor > 8) return false;
                    break;
                case 'idős':
                    if (kutyaKor < 8) return false;
                    break;
            }
        }
        
        // Név szerinti keresés
        if (kereso && kutya.nev.toLowerCase().indexOf(kereso) === -1) {
            return false;
        }
        
        return true;
    });
    
    jelenlegiOldal = 1; // Vissza az első oldalra
    megjelenitOldalt(1);
    
    // Státusz üzenet
    const lista = document.getElementById('kutyaLista');
    if (szurtKutyak.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color: #666; font-size: 18px; margin-top: 50px;">A megadott szűrőkkel nem található kutya. <br><small>Próbáld meg módosítani a szűrőfeltételeket!</small></p>';
    }
}

// --- Szűrők törlése ---
function szuroReset() {
    document.getElementById('fajtaFilter').value = '';
    document.getElementById('nemFilter').value = '';
    document.getElementById('korFilter').value = '';
    document.getElementById('kereso').value = '';
    
    szurtKutyak = [...osszesKutya];
    jelenlegiOldal = 1;
    megjelenitOldalt(1);
}

function megjelenitOldalt(oldal) {
    const osszesOldalSzama = Math.ceil(szurtKutyak.length / kutyakPerOldal);
    
    // Határértékek kezelése
    if (oldal < 1) oldal = 1;
    if (oldal > osszesOldalSzama) oldal = osszesOldalSzama;
    
    jelenlegiOldal = oldal;
    const lista = document.getElementById('kutyaLista');
    if (!lista) return;
    
    lista.innerHTML = '';

    const start = (oldal - 1) * kutyakPerOldal;
    const end = start + kutyakPerOldal;
    const aktualisKutyak = szurtKutyak.slice(start, end);

    if (aktualisKutyak.length === 0) {
        lista.innerHTML = '<p style="text-align:center;">Jelenleg nincsenek kutyák az adatbázisban.</p>';
        return;
    }

    aktualisKutyak.forEach(kutya => {
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
        
        // --- KATTINTÁS ELLENŐRZÉSE ---
        card.addEventListener('click', () => {
            const bejelentkezve = localStorage.getItem('loggedInUser');
            if (bejelentkezve) {
                // Ha be van jelentkezve, megnyitjuk a részleteket
                megnyitKutyaModalt(kutya);
            } else {
                // Ha nincs bejelentkezve, hibaüzenet
                Swal.fire({
                    icon: 'info',
                    title: 'Bejelentkezés szükséges',
                    text: 'A kutyusok részleteit csak regisztrált tagok láthatják!',
                    confirmButtonText: 'Értem',
                    confirmButtonColor: '#007bff'
                });
            }
        });

        lista.appendChild(card);
    });

    frissitPagination(osszesOldalSzama);
}

// --- Kutya modal megnyitása ---
function megnyitKutyaModalt(kutya) {
    $('#kutyaModalNev').text(kutya.nev);
    $('#kutyaModalKep').attr('src', kutya.kep_url || 'img/alap.png');
    $('#kutyaModalFajta').text(kutya.fajta);
    $('#kutyaModalEletkor').text(kutya.eletkor + ' éves');
    $('#kutyaModalNem').text(kutya.nem);
    
    // Leírás kezelése - ha van, azt mutatja, ha nincs, alapértelmezett szöveget
    if (kutya.leiras && kutya.leiras.trim() !== '') {
        $('#kutyaModalLeiras').text(kutya.leiras);
    } else {
        $('#kutyaModalLeiras').text('Nincs megadott leírás ennél a kutyánál.');
    }
    
    // Örökbefogadás gomb eseménykezelője
    $('#orokbeBtn').off('click').on('click', function() {
        // Bezárjuk a kutya modalt
        $('#dogModal').modal('hide');
        
        // Kitöltjük a rejtett mezőket a kutya adataival
        $('#adoptKutyaId').val(kutya.kutya_id);
        $('#adoptKutyaNev').val(kutya.nev);
        
        // Megnyitjuk az örökbefogadási modalt
        setTimeout(() => {
            $('#adoptModal').modal('show');
        }, 300);
    });
    
    $('#dogModal').modal('show');
}

// --- Örökbefogadási űrlap kezelése ---
$(document).ready(function() {
    // Űrlap küldése
    $('#adoptForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Validáció
        if (!data.elfogadom) {
            showAdoptError('Kérlek, fogadd el az örökbefogadási feltételeket!');
            return;
        }
        
        // Adatok küldése a szervernek
        $.ajax({
            url: '/api/adoption',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    $('#adoptForm').hide();
                    $('#adoptSuccessMessage').show();
                    // Modal bezárása 3 másodperc után
                    setTimeout(() => {
                        $('#adoptModal').modal('hide');
                        // Reset form
                        $('#adoptForm')[0].reset();
                        $('#adoptForm').show();
                        $('#adoptSuccessMessage').hide();
                    }, 3000);
                } else {
                    showAdoptError(response.error || 'Hiba történt a jelentkezés feldolgozása során.');
                }
            },
            error: function() {
                showAdoptError('Hálózati hiba történt. Kérlek, próbáld újra később.');
            }
        });
    });
});

function showAdoptError(message) {
    $('#adoptErrorMessage').text(message).show();
    setTimeout(() => {
        $('#adoptErrorMessage').fadeOut();
    }, 5000);
}

function frissitPagination(osszesOldalSzama) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    if (osszesOldalSzama <= 1) return;

    // "Előző" nyíl
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '←'; 
    prevBtn.className = 'page-btn nav-btn';
    prevBtn.disabled = jelenlegiOldal === 1;
    prevBtn.onclick = () => {
        megjelenitOldalt(jelenlegiOldal - 1);
        document.getElementById('kutyaink').scrollIntoView({ behavior: 'smooth' });
    };
    pagination.appendChild(prevBtn);

    // Számozott gombok
    for (let i = 1; i <= osszesOldalSzama; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `page-btn ${i === jelenlegiOldal ? 'active' : ''}`;
        btn.onclick = () => {
            megjelenitOldalt(i);
            document.getElementById('kutyaink').scrollIntoView({ behavior: 'smooth' });
        };
        pagination.appendChild(btn);
    }

    // "Következő" nyíl
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '→'; 
    nextBtn.className = 'page-btn nav-btn';
    nextBtn.disabled = jelenlegiOldal === osszesOldalSzama;
    nextBtn.onclick = () => {
        megjelenitOldalt(jelenlegiOldal + 1);
        document.getElementById('kutyaink').scrollIntoView({ behavior: 'smooth' });
    };
    pagination.appendChild(nextBtn);
}

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

// --- Bejelentkezés Form ---
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bejelentkezési oldal betöltve');
    const loginForm = document.getElementById('loginForm');
    console.log('Login form elem:', loginForm);
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            console.log('Bejelentkezési űrlap elküldve');
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const jelszo = document.getElementById('loginJelszo').value;
            const loginError = document.getElementById('loginError');
            console.log('Bejelentkezési adatok:', { email, jelszo: jelszo ? '***' : '' });

            try {
                const res = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, jelszo })
                });
                console.log('Válasz státusz:', res.status);

                const data = await res.json();
                console.log('Válasz adatok:', data);

                if (res.ok) {
                    console.log('Bejelentkezés sikeres, adatok mentése...');
                    // 1. Mentés localStorage-ba
                    localStorage.setItem('loggedInUser', JSON.stringify({ 
                        id: data.user.id,
                        nev: data.user.nev, 
                        email: data.user.email,
                        szerepkor: data.user.szerepkor,
                        kep: data.user.kep
                    }));
                    console.log('Felhasználói adatok elmentve a localStorage-ba');
                    
                    // 2. SZÉP ÉRTESÍTÉS MEGJELENÍTÉSE
                    console.log('Sikeres bejelentkezés üzenet megjelenítése');
                    Swal.fire({
                        icon: 'success',
                        title: 'Sikeres belépés',
                        text: 'Üdvözlünk újra, ' + data.user.nev + '!',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#ffffff',
                        iconColor: '#28a745'
                    }).then(() => {
                        console.log('Átirányítás az index.html-re');
                        // 3. Frissítés csak az üzenet lefutása után
                        window.location.href = 'index.html';
                    });

                } else {
                    console.log('Bejelentkezés sikertelen:', data.error);
                    if (loginError) loginError.textContent = data.error || 'Hibás email vagy jelszó!';
                }
            } catch (err) {
                console.log('Bejelentkezés közben hiba történt:', err);
                if (loginError) loginError.textContent = 'Szerverhiba: ' + err.message;
            }
        });
    }
});



// --- Profil és Navigáció kezelése ---
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const serverUrl = "http://localhost:3000";

  // Navigációs elemek
  const loginNavItem = document.getElementById('loginNavItem');
  const profileNavItem = document.getElementById('profileNavItem');
  const adminNavItem = document.getElementById('adminNavItem'); 
  const navIcon = document.getElementById('profileIcon');
  
  // Modal elemek
  const profileModal = document.getElementById('profileModal');
  const profileModalImg = document.getElementById('profileModalImg');
  const profileModalEmail = document.getElementById('profileModalEmail');
  const editNameInput = document.getElementById('editNameInput');
  const editPasswordInput = document.getElementById('editPasswordInput');
  const profileImageInput = document.getElementById('profileImageInput');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const logoutBtnModal = document.getElementById('logoutBtnModal');
  const saveProfileBtn = document.getElementById('saveProfileBtn');

  if (user) {
      // 1. Menüpontok láthatósága
      if (loginNavItem) loginNavItem.style.display = 'none';
      if (profileNavItem) profileNavItem.style.display = 'inline-block';

      // 2. ADMIN ELLENŐRZÉS
      if (user.szerepkor === 'admin') {
          if (adminNavItem) adminNavItem.style.display = 'inline-block';
      } else {
          if (adminNavItem) adminNavItem.style.display = 'none';
      }

      // 3. Profilkép útvonalának kiszámítása
      const kepUtvonal = user.kep 
          ? (user.kep.startsWith('http') ? user.kep : serverUrl + user.kep) 
          : 'img/default-profile.png';
          
      if (navIcon) navIcon.src = kepUtvonal;

      // 4. Profil Modal megnyitása
      if (navIcon) {
          navIcon.addEventListener('click', () => {
              if (profileModal) {
                  profileModal.style.display = 'flex';
                  if (profileModalImg) profileModalImg.src = kepUtvonal;
                  if (profileModalEmail) profileModalEmail.innerText = user.email;
                  if (editNameInput) editNameInput.value = user.nev;
                  if (editPasswordInput) editPasswordInput.value = ''; 
              }
          });
      }

      // 5. Adatok mentése
      if (saveProfileBtn) {
          saveProfileBtn.addEventListener('click', async () => {
              const formData = new FormData();
              formData.append('email', user.email);
              if (editNameInput.value) formData.append('nev', editNameInput.value);
              if (editPasswordInput.value) formData.append('jelszo', editPasswordInput.value);
              if (profileImageInput.files[0]) formData.append('profilkep', profileImageInput.files[0]);

              try {
                  const res = await fetch(`${serverUrl}/user/update`, {
                      method: 'POST',
                      body: formData
                  });

                  const data = await res.json();

                  if (res.ok) {
                      // LocalStorage frissítése az új adatokkal
                      localStorage.setItem('loggedInUser', JSON.stringify({
                          id: user.id,
                          nev: data.user.nev,
                          email: data.user.email,
                          kep: data.user.kep,
                          szerepkor: user.szerepkor // A szerepkört megőrizzük
                      }));

                      alert('Sikeres mentés! A profilod frissült.');
                      location.reload();
                  } else {
                      alert('Hiba: ' + (data.error || 'Sikertelen mentés.'));
                  }
              } catch (err) {
                  console.error('Szerver hiba:', err);
                  alert('Hálózati hiba történt.');
              }
          });
      }

      // 6. Kijelentkezés
      if (logoutBtnModal) {
          logoutBtnModal.addEventListener('click', () => {
              localStorage.removeItem('loggedInUser');
              location.href = 'index.html';
          });
      }

  } else {
      // Ha nincs bejelentkezve
      if (adminNavItem) adminNavItem.style.display = 'none';
      if (profileNavItem) profileNavItem.style.display = 'none';
      if (loginNavItem) loginNavItem.style.display = 'inline-block';
  }

  // --- Segédfunkciók (Kép választás és Modal bezárás) ---

  // Kép előnézet a modalban
  if (profileModalImg && profileImageInput) {
      profileModalImg.addEventListener('click', () => profileImageInput.click());

      profileImageInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                  profileModalImg.src = event.target.result;
              };
              reader.readAsDataURL(file);
          }
      });
  }

  // Modal bezárása X-szel
  if (closeProfileModal) {
      closeProfileModal.addEventListener('click', () => {
          profileModal.style.display = 'none';
      });
  }

  // Modal bezárása mellékattintással
  window.addEventListener('click', (e) => {
      if (e.target === profileModal) {
          profileModal.style.display = 'none';
      }
  });
});


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
  const mLeiras = document.getElementById('kutyaModalLeiras'); // Az index.html modaljában lévő <p>
  const mKutyaId = document.getElementById('kutya_id');

  if (mKep) mKep.src = kutya.kep_url || 'img/alap.png';
  if (mNev) mNev.innerText = kutya.nev;
  if (mEletkor) mEletkor.innerText = kutya.eletkor + " év";
  if (mNem) mNem.innerText = kutya.nem;
  if (mFajta) mFajta.innerText = kutya.fajta;
  
  if (mLeiras) {
      // Ha az adatbázisból null jön vagy üres, adjunk meg alapértelmezett szöveget
      mLeiras.innerText = (kutya.leiras && kutya.leiras !== "null") 
          ? kutya.leiras 
          : "Sajnos ehhez a kutyushoz még nem tartozik leírás.";
  }

  if (mKutyaId) mKutyaId.value = kutya.kutya_id;

  $('#dogModal').modal('show');
  setupOrkbeBtn();
}

let currentAmount = 5000;

function selectAmount(btn, amount) {
    // Gombok stílusának kezelése
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentAmount = amount;
    document.getElementById('selected-sum').innerText = amount.toLocaleString();
    document.getElementById('customInput').value = ""; // Törli az egyedi mezőt
}

function updateSelectedSum() {
    let customVal = document.getElementById('customInput').value;
    if (customVal > 0) {
        currentAmount = customVal;
        document.getElementById('selected-sum').innerText = parseInt(customVal).toLocaleString();
        // Leveszi a kijelölést a fix gombokról
        document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
    }
}

function payWithRevolut() {
    // IDE ÍRD A SAJÁT REVOLUT ME LINKEDET!
    // Példa: https://revolut.me/ricsiandnorbi/
    const url = `https://revolut.me/szentpalir`;
    
    window.open(url, '_blank');
}

function payWithPaypal() {
  const url = `https://www.paypal.com/paypalme/TothRobert00`;
  
  window.open(url, '_blank');
}

