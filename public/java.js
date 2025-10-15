window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    document.querySelector("nav").style.backgroundColor = "#FFFFFF"; // Változtasd meg a háttérszínt a kívánt színre
  } else {
    document.querySelector("nav").style.backgroundColor = "transparent"; // Állítsd vissza az eredeti színt
  }
}


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
  .catch(error => {
    console.error('Hiba:', error);
    errorMessage.innerHTML = 'Nem sikerült menteni az adatokat.';
  });
}



window.onload = function() {
  if (localStorage.getItem('buttonClicked') === 'true') {
      alert('Sikeresen elküldted az adatokat!');
      localStorage.removeItem('buttonClicked'); // Töröljük az értéket, hogy a következő alkalommal ne jelenjen meg az üzenet
  }
}


