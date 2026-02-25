(function () {
  // Stały target: 17.03.2026 16:00 czasu Polski (Warszawa).
  // 17 marca 2026 to jeszcze CET (UTC+1), więc w UTC to 15:00.
  var TARGET_UTC_MS = Date.UTC(2026, 2, 17, 15, 0, 0); // (miesiąc 0-11)

  var elDD = document.getElementById("dd");
  var elHH = document.getElementById("hh");
  var elMM = document.getElementById("mm");
  var elSS = document.getElementById("ss");
  var elStatus = document.getElementById("status");
  var elTitle = document.getElementById("title");

  function pad2(n) {
    n = n < 0 ? 0 : n;
    return (n < 10 ? "0" : "") + n;
  }

  function setStatus(txt) {
    if (elStatus) elStatus.innerHTML = txt || "";
  }

  function tick() {
    var now = Date.now();
    var left = TARGET_UTC_MS - now;
    if (left < 0) left = 0;

    var totalSec = Math.floor(left / 1000);
    var days = Math.floor(totalSec / 86400);
    totalSec = totalSec % 86400;

    var hours = Math.floor(totalSec / 3600);
    totalSec = totalSec % 3600;

    var mins = Math.floor(totalSec / 60);
    var secs = totalSec % 60;

    if (elDD) elDD.innerHTML = pad2(days);
    if (elHH) elHH.innerHTML = pad2(hours);
    if (elMM) elMM.innerHTML = pad2(mins);
    if (elSS) elSS.innerHTML = pad2(secs);

    if (left === 0) {
      setStatus("KONIEC");
      clearInterval(timerId);
      timerId = null;
    }
  }

  // Opcjonalnie: pokaż w tytule dokładną datę docelową (lokalnie)
  (function setTitle() {
    if (!elTitle) return;
    var t = new Date(TARGET_UTC_MS);
    // To pokaże czas w strefie urządzenia; tekst stały zostawiamy po polsku.
    elTitle.innerHTML = "Odliczanie do 17.03.2026 16:00";
  })();

  // Start
  if (!elDD || !elHH || !elMM || !elSS) {
    setStatus("BŁĄD: brakuje elementów dd/hh/mm/ss w HTML");
    return;
  }

  setStatus("JS działa. Odliczanie uruchomione.");
  tick();
  var timerId = setInterval(tick, 1000);
})();
``
