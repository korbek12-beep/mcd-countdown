(function () {
  // =========================
  // USTAWIENIA
  // =========================

  // Docelowa data: 17.03 godzina 16:00
  var TARGET_MONTH = 3;   // marzec (1-12)
  var TARGET_DAY = 17;
  var TARGET_HOUR = 16;
  var TARGET_MINUTE = 0;
  var TARGET_SECOND = 0;

  // Jeśli chcesz "realny czas" niezależny od zegara urządzenia:
  // true  -> spróbuj pobrać czas z API i policzyć offset
  // false -> użyj czasu urządzenia
  var USE_TIME_API = true;

  // API czasu (Warszawa) - jak w Twoim poprzednim podejściu [2](https://share.mcd.com/personal/sebastian_korbin_pl_mcd_com/Documents/Microsoft%20Teams%20Chat%20Files/Microsoft%20Copilot%20Chat%20Files/polyfills-legacy.js)
  var TIME_API_URL = "https://time.now/developer/api/timezone/Europe/Warsaw";

  // Maks. ile prób synchronizacji
  var MAX_SYNC_TRIES = 3;

  // =========================
  // DOM
  // =========================
  var dd = document.getElementById("dd");
  var hh = document.getElementById("hh");
  var mm = document.getElementById("mm");
  var ss = document.getElementById("ss");
  var statusEl = document.getElementById("status");
  var titleEl = document.getElementById("title");

  // =========================
  // HELPERY
  // =========================
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function setStatus(txt) {
    if (statusEl) statusEl.innerHTML = txt || "";
  }

  // =========================
  // "REALNY CZAS" przez offset
  // =========================
  var timeOffsetMs = 0;
  var haveOffset = false;

  function nowMs() {
    return Date.now() + (haveOffset ? timeOffsetMs : 0);
  }

  function syncTime(tryNo, done) {
    if (!USE_TIME_API) return done(false);

    tryNo = tryNo || 1;

    var start = Date.now();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", TIME_API_URL, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var end = Date.now();
          var rtt = end - start;
          var data = JSON.parse(xhr.responseText);

          // time.now zwraca unixtime (sekundy) [2](https://share.mcd.com/personal/sebastian_korbin_pl_mcd_com/Documents/Microsoft%20Teams%20Chat%20Files/Microsoft%20Copilot%20Chat%20Files/polyfills-legacy.js)
          var serverSec = parseInt(data.unixtime, 10);

          if (!isNaN(serverSec) && serverSec > 0) {
            // zakładamy "połowę RTT" jako opóźnienie w jedną stronę
            var estimatedServerNowMs = (serverSec * 1000) + Math.floor(rtt / 2);
            timeOffsetMs = estimatedServerNowMs - end;
            haveOffset = true;
            return done(true);
          }
        } catch (e) {}
      }

      if (tryNo < MAX_SYNC_TRIES) {
        return setTimeout(function () {
          syncTime(tryNo + 1, done);
        }, 1000);
      }

      done(false);
    };

    try { xhr.send(); } catch (e2) { done(false); }
  }

  // =========================
  // TARGET: najbliższe 17.03 16:00
  // =========================
  function computeTargetMs() {
    var now = new Date(nowMs());
    var year = now.getFullYear();

    // Budujemy target w czasie lokalnym urządzenia:
    // miesiąc w Date() jest 0-11, więc TARGET_MONTH-1
    var target = new Date(year, TARGET_MONTH - 1, TARGET_DAY, TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);

    // Jeśli już minęło -> kolejny rok
    if (target.getTime() <= now.getTime()) {
      target = new Date(year + 1, TARGET_MONTH - 1, TARGET_DAY, TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);
    }

    return target.getTime();
  }

  // =========================
  // RENDER
  // =========================
  var targetMs = 0;
  var timerId = null;

  function tick() {
    var left = targetMs - nowMs();
    if (left < 0) left = 0;

    var totalSec = Math.floor(left / 1000);
    var days = Math.floor(totalSec / 86400);
    totalSec = totalSec % 86400;
    var hours = Math.floor(totalSec / 3600);
    totalSec = totalSec % 3600;
    var mins = Math.floor(totalSec / 60);
    var secs = totalSec % 60;

    dd.innerHTML = pad2(days);
    hh.innerHTML = pad2(hours);
    mm.innerHTML = pad2(mins);
    ss.innerHTML = pad2(secs);

    if (left === 0) {
      setStatus("KONIEC");
      clearInterval(timerId);
      timerId = null;
    }
  }

  function start() {
    targetMs = computeTargetMs();

    // Podmień tytuł, żeby było jasne do czego liczymy
    if (titleEl) {
      var t = new Date(targetMs);
      titleEl.innerHTML = "Odliczanie do " + pad2(t.getDate()) + "." + pad2(t.getMonth() + 1) + "." + t.getFullYear() + " " + pad2(t.getHours()) + ":" + pad2(t.getMinutes());
    }

    tick();
    timerId = setInterval(tick, 1000);
  }

  // =========================
  // START FLOW
  // =========================
  setStatus("Start...");
  syncTime(1, function (ok) {
    if (ok) setStatus("Czas zsynchronizowany (API)");
    else setStatus("Używam czasu urządzenia");

    start();
  });
})();
