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
// A szerver elérhetősége a képekhez
const serverUrl = "https://unantagonized-delisa-oneiric.ngrok-free.dev";

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
        // ngrok-skip-browser-warning hozzáadva a zavartalan betöltéshez
        fetch(`${serverUrl}/kutyak`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        })
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
    if (oldal > osszesOldalSzama && osszesOldalSzama > 0) oldal = osszesOldalSzama;
    
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
        let kepUrl = `${serverUrl}/img/1770806719489-image.jpg`; 

        if (kutya.kep_url) {
            // Ha véletlenül benne maradt a localhost, azt vágjuk le
            let tisztaUt = kutya.kep_url.replace('http://localhost:3000', '');
            
            if (tisztaUt.startsWith('http')) {
                // Ha valódi külső link (pl. egy másik weboldalról)
                kepUrl = tisztaUt;
            } else {
                // Ha relatív út, akkor rakjuk elé az ngrok szerverünket
                if (!tisztaUt.startsWith('/')) tisztaUt = '/' + tisztaUt;
                kepUrl = `${serverUrl}${tisztaUt}`;
            }
        }

        const utolsoVizit = kutya.utolso_vizit 
        ? new Date(kutya.utolso_vizit).toLocaleDateString('hu-HU') 
        : 'Nincs adat';
    
        const oltasIkon = kutya.utolso_oltas_statusz === 1 
            ? '<span class="text-success"><i class="fas fa-check-circle"></i> Oltva</span>' 
            : '<span class="text-danger"><i class="fas fa-times-circle"></i> Oltás szükséges</span>';
        
        const card = document.createElement('div');
        card.className = 'kutya-card';
        card.innerHTML = `
            <div class="kutya-card-img-wrapper">
                <img class="kutya-card-img" src="${kepUrl}" alt="${kutya.nev}" onerror="this.src='img/kutyak/1770806719489-image.jpg'">
            </div>
            <div class="kutya-card-body">
                <h3>${kutya.nev}</h3>
                <p class="mb-1"><strong>${kutya.fajta}</strong></p>
                <p class="mb-2 text-muted">${kutya.eletkor} éves • ${kutya.nem}</p>
                <div class="medical-info-mini border-top pt-2" style="background: #f9f9f9; padding: 5px; border-radius: 4px; margin-top: 8px;">
                    <small class="d-block text-muted">Legutóbbi vizit: ${utolsoVizit}</small>
                    <small class="d-block font-weight-bold">${oltasIkon}</small>
                </div>
                <span class="btn-reszletek-custom mt-2 d-inline-block">Részletek</span>
            </div>`;
        
        card.addEventListener('click', () => {
            const bejelentkezve = localStorage.getItem('loggedInUser');
            if (bejelentkezve) {
                megnyitKutyaModalt(kutya);
            } else {
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

    let kepUrl = `${serverUrl}/img/1770806719489-image.jpg`; 

    if (kutya.kep_url) {
        // Ha véletlenül benne maradt a localhost, azt vágjuk le
        let tisztaUt = kutya.kep_url.replace('http://localhost:3000', '');
        
        if (tisztaUt.startsWith('http')) {
            // Ha valódi külső link (pl. egy másik weboldalról)
            kepUrl = tisztaUt;
        } else {
            // Ha relatív út, akkor rakjuk elé az ngrok szerverünket
            if (!tisztaUt.startsWith('/')) tisztaUt = '/' + tisztaUt;
            kepUrl = `${serverUrl}${tisztaUt}`;
        }
    }

    $('#kutyaModalNev').text(kutya.nev);
    $('#kutyaModalKep').attr('src', kepUrl);
    $('#kutyaModalFajta').text(kutya.fajta);
    $('#kutyaModalEletkor').text(kutya.eletkor + ' éves');
    $('#kutyaModalNem').text(kutya.nem);
    
    if (kutya.leiras && kutya.leiras.trim() !== '' && kutya.leiras !== "null") {
        $('#kutyaModalLeiras').text(kutya.leiras);
    } else {
        $('#kutyaModalLeiras').text('Nincs megadott leírás ennél a kutyánál.');
    }
    
    $('#orokbeBtn').off('click').on('click', function() {
        $('#dogModal').modal('hide');
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (user) {
            $('#adoptNev').val(user.nev || user.felhasznalonev).attr('readonly', true);
            $('#adoptEmail').val(user.email).attr('readonly', true);
        }
        $('#adoptKutyaId').val(kutya.kutya_id);
        $('#adoptKutyaNev').val(kutya.nev);
        
        setTimeout(() => {
            $('#adoptModal').modal('show');
        }, 300);
    });
    
    $('#dogModal').modal('show');
}

// --- Örökbefogadási űrlap kezelése ---
$(document).ready(function() {
    $('#adoptForm').on('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        if (!data.elfogadom) {
            showAdoptError('Kérlek, fogadd el az örökbefogadási feltételeket!');
            return;
        }
        
        $.ajax({
            url: `${serverUrl}/api/adoption`,
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    $('#adoptForm').hide();
                    $('#adoptSuccessMessage').show();
                    setTimeout(() => {
                        $('#adoptModal').modal('hide');
                        $('#adoptForm')[0].reset();
                        $('#adoptForm').show();
                        $('#adoptSuccessMessage').hide();
                    }, 3000);
                } else {
                    showAdoptError(response.error || 'Hiba történt.');
                }
            },
            error: function() {
                showAdoptError('Hálózati hiba történt.');
            }
        });
    });
});

function showAdoptError(message) {
    $('#adoptErrorMessage').text(message).show();
    setTimeout(() => { $('#adoptErrorMessage').fadeOut(); }, 5000);
}

function frissitPagination(osszesOldalSzama) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    if (osszesOldalSzama <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '←'; 
    prevBtn.className = 'page-btn nav-btn';
    prevBtn.disabled = jelenlegiOldal === 1;
    prevBtn.onclick = () => {
        megjelenitOldalt(jelenlegiOldal - 1);
        document.getElementById('kutyaink').scrollIntoView({ behavior: 'smooth' });
    };
    pagination.appendChild(prevBtn);

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

  fetch(`${serverUrl}/visszajelzes`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email: email, szoveg: szoveg })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message || 'Sikeres mentés!');
    if (document.getElementById('registrationForm')) document.getElementById('registrationForm').reset();
  })
  .catch(() => {
    errorMessage.innerHTML = 'Nem sikerült menteni az adatokat.';
  });
}

// --- Kutya hozzáadás Form ---
const kutyaForm = document.getElementById('kutyaForm');
if (kutyaForm) {
    const újForm = kutyaForm.cloneNode(true);
    kutyaForm.parentNode.replaceChild(újForm, kutyaForm);

    újForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = újForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const formData = new FormData(újForm);

        try {
            const res = await fetch(`${serverUrl}/kutyak`, {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (res.ok) {
                alert('Sikeres mentés: ' + data.message);
                újForm.reset();
                location.reload();
            } else {
                alert('Hiba: ' + (data.error || 'Ismeretlen hiba történt.'));
                if (submitBtn) submitBtn.disabled = false;
            }
        } catch (err) {
            alert('Szerverhiba: ' + err.message);
            if (submitBtn) submitBtn.disabled = false;
        }
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
        const res = await fetch(`${serverUrl}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nev, email, jelszo })
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          regForm.reset();
        } else {
          if (error) error.textContent = data.error || 'Hiba történt.';
        }
      } catch (err) {
        if (error) error.textContent = 'Szerverhiba: ' + err.message;
      }
    });
}

// --- Bejelentkezés Form ---
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const jelszo = document.getElementById('loginJelszo').value;
            const loginError = document.getElementById('loginError');

            try {
                const res = await fetch(`${serverUrl}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, jelszo })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('loggedInUser', JSON.stringify({ 
                        id: data.user.id,
                        nev: data.user.nev, 
                        email: data.user.email,
                        szerepkor: data.user.szerepkor,
                        kep: data.user.kep
                    }));
                    Swal.fire({
                        icon: 'success',
                        title: 'Sikeres belépés',
                        text: 'Üdvözlünk újra!',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => { window.location.href = 'index.html'; });
                } else {
                    if (loginError) loginError.textContent = data.error || 'Hibás adatok!';
                }
            } catch (err) {
                if (loginError) loginError.textContent = 'Szerverhiba.';
            }
        });
    }
});

// --- Profil és Navigáció kezelése ---
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const loginNavItem = document.getElementById('loginNavItem');
  const profileNavItem = document.getElementById('profileNavItem');
  const adminNavItem = document.getElementById('adminNavItem'); 
  const navIcon = document.getElementById('profileIcon');
  const profileModal = document.getElementById('profileModal');
  const profileModalImg = document.getElementById('profileModalImg');
  const profileModalEmail = document.getElementById('profileModalEmail');
  const editNameInput = document.getElementById('editNameInput');
  const editPasswordInput = document.getElementById('editPasswordInput');
  const profileImageInput = document.getElementById('profileImageInput');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const logoutBtnModal = document.getElementById('logoutBtnModal');
  const saveProfileBtn = document.getElementById('saveProfileBtn');

  // --- JAVÍTOTT Profil és Navigáció kezelése ---
if (user) {
    if (loginNavItem) loginNavItem.style.display = 'none';
    if (profileNavItem) profileNavItem.style.display = 'inline-block';
    if (adminNavItem) {
        if (user.szerepkor === 'admin') {
            adminNavItem.style.display = 'inline-block';
        } else {
            adminNavItem.style.display = 'none'; // Ha nem admin, kényszerítve elrejtjük
        }
    }

    // A változó neve legyen következetesen kepUrl
    let kepUrl = `${serverUrl}/img/profilok/blank-profile-picture-973460_640.webp`; 

    if (user.kep) {
        if (user.kep.startsWith('http')) {
            kepUrl = user.kep;
        } else {
            const tisztaProfilKep = user.kep.replace(/^.*[\\\/]/, '');
            kepUrl = `${serverUrl}/img/profilok/${tisztaProfilKep}`;
        }
    }
        
    // Most már a létező kepUrl változót használjuk
    if (navIcon) navIcon.src = kepUrl;

    if (navIcon) {
        navIcon.addEventListener('click', () => {
            console.log("Profil megnyitása..."); // Teszt üzenet
            if (profileModal) {
                profileModal.style.display = 'flex';
                if (profileModalImg) profileModalImg.src = kepUrl;
                if (profileModalEmail) profileModalEmail.innerText = user.email;
                if (editNameInput) editNameInput.value = user.nev;
            }
        });
    }
    // ... a többi marad változatlan (mentés, kijelentkezés gombok)


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
                      localStorage.setItem('loggedInUser', JSON.stringify({
                          id: user.id,
                          nev: data.user.nev,
                          email: data.user.email,
                          kep: data.user.kep,
                          szerepkor: user.szerepkor 
                      }));
                      alert('Sikeres mentés!');
                      location.reload();
                  } else { alert('Hiba történt.'); }
              } catch (err) { alert('Hiba történt.'); }
          });
      }

      if (logoutBtnModal) {
          logoutBtnModal.addEventListener('click', () => {
              localStorage.removeItem('loggedInUser');
              location.href = 'index.html';
          });
      }
  }

  if (profileModalImg && profileImageInput) {
      profileModalImg.addEventListener('click', () => profileImageInput.click());
      profileImageInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
              const reader = new FileReader();
              reader.onload = (event) => { profileModalImg.src = event.target.result; };
              reader.readAsDataURL(file);
          }
      });
  }

  if (closeProfileModal) closeProfileModal.addEventListener('click', () => { profileModal.style.display = 'none'; });
});


// --- Feedback Form ---
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');
  if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { name: form.name.value, email: form.email.value, message: form.message.value };
        try {
          const res = await fetch(`${serverUrl}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const json = await res.json();
          alert(json.success ? 'Üzenet elküldve!' : 'Hiba történt.');
        } catch (err) { alert('Hiba történt.'); }
      });
  }
});

let currentAmount = 5000;
function payWithRevolut() { window.open(`https://revolut.me/szentpalir`, '_blank'); }
function payWithPaypal() { window.open(`https://www.paypal.com/paypalme/TothRobert00`, '_blank'); }

document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('nav ul li a');
    const checkbox = document.getElementById('check');

    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    event.preventDefault();
                    window.scrollTo({ top: targetElement.offsetTop - 75, behavior: 'smooth' });
                }
            }
            if (checkbox) checkbox.checked = false; 
        });
    });
});

$(document).ready(function() {
    // Csak ez az egy maradjon meg!
    $('#adoptForm').off('submit').on('submit', function(e) {
        e.preventDefault();

        const formData = {
            kutyaId: $('#adoptKutyaId').val(),
            telefonszam: $('#adoptTelefon').val(),
            iranyitoszam: $('#adoptIrsz').val(),
            varos: $('#adoptVaros').val(),
            utcaHazszam: $('#adoptUtca').val(),
            lakasTipus: $('select[name="lakasTipus"]').val(),
            ingatlanTipus: $('select[name="ingatlanTipus"]').val(),
            kert: $('select[name="kert"]').val(),
            kutyaTapasztalat: $('select[name="kutyaTapasztalat"]').val(),
            csaladEgyetert: $('select[name="csaladEgyetert"]').val() || "igen",
            elfogadom: $('#adoptElfogadom').is(':checked') ? 1 : 0
        };

        // Figyelj a `${serverUrl}` használatára!
        fetch(`${serverUrl}/api/adoption`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Küldi a session sütit
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Siker esetén a korábbi szép animációd:
                $('#adoptForm').hide();
                $('#adoptSuccessMessage').show();
                setTimeout(() => {
                    $('#adoptModal').modal('hide');
                    $('#adoptForm')[0].reset();
                    $('#adoptForm').show();
                    $('#adoptSuccessMessage').hide();
                }, 3000);
            } else {
                alert(data.error || "Hiba történt.");
            }
        })
        .catch(err => {
            console.error('Hiba:', err);
            alert("Hálózati hiba a beküldés során.");
        });
    });
});

// --- Toggle Password Visibility ---
function togglePassword(inputId, icon) {
    const isRegPage = document.getElementById('jelszo') && document.getElementById('jelszo2');

    if (isRegPage) {
        const input1 = document.getElementById('jelszo');
        const input2 = document.getElementById('jelszo2');
        const icons = document.querySelectorAll('.toggle-password');
        const newType = input1.type === 'password' ? 'text' : 'password';

        input1.type = newType;
        input2.type = newType;

        icons.forEach(i => {
            i.classList.toggle('fa-eye', newType === 'password');
            i.classList.toggle('fa-eye-slash', newType === 'text');
        });
    } else {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// --- Jelszó megjelenítő ikon csak gépelés közben ---
document.addEventListener('DOMContentLoaded', () => {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const icon = input.parentElement.querySelector('.toggle-password');
        if (!icon) return;

        // Kezdetben rejtett
        icon.style.display = 'none';

        input.addEventListener('input', () => {
            icon.style.display = input.value.length > 0 ? 'block' : 'none';
        });
    });
});
