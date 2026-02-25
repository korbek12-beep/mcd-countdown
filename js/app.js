(function () {
  // Target: 17.03 16:00 (najbliższy termin; jeśli minął, to kolejny rok)
  var TARGET_MONTH = 3;   // 1-12
  var TARGET_DAY = 17;
  var TARGET_HOUR = 16;
  var TARGET_MINUTE = 0;
  var TARGET_SECOND = 0;

  // Elementy
  var elDD, elHH, elMM, elSS, elStatus, elTitle;

  function pad2(n) {
    n = n < 0 ? 0 : n;
    return (n < 10 ? "0" : "") + n;
  }

  function setStatus(txt) {
    if (elStatus) elStatus.innerHTML = txt || "";
  }

  function computeTargetMs() {
    // liczymy w lokalnej strefie urządzenia
    var now = new Date();
    var year = now.getFullYear();

    var target = new Date(year, TARGET_MONTH - 1, TARGET_DAY, TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);
    if (target.getTime() <= now.getTime()) {
      target = new Date(year + 1, TARGET_MONTH - 1, TARGET_DAY, TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);
    }
    return target.getTime();
  }

  var targetMs = 0;
  var timerId = null;

  function tick() {
    var nowMs = Date.now();
    var left = targetMs - nowMs;
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
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  }

  function start() {
    targetMs = computeTargetMs();

    // Ustaw tytuł z rokiem (żeby było jasne, do którego 17.03 liczy)
    if (elTitle) {
      var t = new Date(targetMs);
      elTitle.innerHTML =
        "Odliczanie do " + pad2(t.getDate()) + "." + pad2(t.getMonth() + 1) + "." + t.getFullYear() +
        " " + pad2(t.getHours()) + ":" + pad2(t.getMinutes());
    }

    setStatus("JS działa. Start odliczania…");

    tick();
    timerId = setInterval(tick, 1000);
  }

  function init() {
    elDD = document.getElementById("dd");
    elHH = document.getElementById("hh");
    elMM = document.getElementById("mm");
    elSS = document.getElementById("ss");
    elStatus = document.getElementById("status");
    elTitle = document.getElementById("title");

    if (!elDD || !elHH || !elMM || !elSS) {
      // jeśli tu trafisz, to znaczy że HTML nie ma tych ID
      setStatus("BŁĄD: Brakuje elementów dd/hh/mm/ss w HTML");
      return;
    }

    start();
  }

  // Start po załadowaniu DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
