// assets/js/main.js
(function () {

  /* ===== Clock (Ontario time) ===== */
  const clock = document.getElementById("clock");
  const TZ = "America/Toronto";
  const LOCALE = "en-CA";

  function tickClock() {
    if (!clock) return;
    const now = new Date();
    const parts = new Intl.DateTimeFormat(LOCALE, {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const hh = parts.find(p => p.type === "hour")?.value ?? "--";
    const mm = parts.find(p => p.type === "minute")?.value ?? "--";
    clock.textContent = hh + ":" + mm;
  }

  tickClock();
  setInterval(tickClock, 20000);


  /* ===== Dynamic status pill ===== */
  const statusPill = document.getElementById("status-pill");

  const STATUSES = [
    { color: "#5dba7d", label: "calm",        tip: "vibing"               },
    { color: "#5dba7d", label: "alive",       tip: "probably"             },
    { color: "#7dc4ff", label: "coding",      tip: "firmware things"      },
    { color: "#7dc4ff", label: "debugging",   tip: "why won't it compile" },
    { color: "#f4c87a", label: "studying",    tip: "mcmaster moment"      },
    { color: "#f4c87a", label: "caffeinated", tip: "it's past midnight"   },
    { color: "#c084fc", label: "listening",   tip: "JRPG ost hours"       },
    { color: "#f87171", label: "busy",        tip: "send help"            },
  ];

  function pickStatus() {
    const hour = parseInt(new Date().toLocaleString("en-CA", {
      timeZone: TZ, hour: "numeric", hour12: false
    }), 10);
    if (hour >= 0  && hour < 5)  return STATUSES[5];
    if (hour >= 5  && hour < 9)  return STATUSES[1];
    if (hour >= 9  && hour < 13) return STATUSES[4];
    if (hour >= 13 && hour < 18) return STATUSES[2];
    if (hour >= 18 && hour < 22) return STATUSES[6];
    return STATUSES[0];
  }

  function renderStatus(s) {
    if (!statusPill) return;
    statusPill.title = s.tip;
    statusPill.innerHTML =
      '<span class="dot" style="background:' + s.color + '; box-shadow:0 0 6px ' + s.color + '88;"></span>' + s.label;
  }

  renderStatus(pickStatus());


  /* ===== Local Music Player ===== */
  const audio   = document.getElementById("audio");
  const btnPlay = document.getElementById("btn-play");
  const btnNext = document.getElementById("btn-next");
  const btnPrev = document.getElementById("btn-prev");
  const npTrack = document.getElementById("np-track");
  const npGame  = document.getElementById("np-game");
  const npIndex = document.getElementById("np-index");

  if (!audio || !btnPlay || !btnNext || !btnPrev) return;

  const tracks = [
    { title: "Celes' Theme",                game: "Final Fantasy VI",  file: "/assets/music/celes.mp3"     },
    { title: "Feelings Soar with the Wind", game: "Trails in the Sky", file: "/assets/music/wind.mp3"      },
    { title: "To Zanarkand",                game: "Final Fantasy X",   file: "/assets/music/zanarkand.mp3" },
  ];

  let i = 0;

  function loadTrack(idx) {
    const t = tracks[idx];
    audio.src           = t.file;
    npTrack.textContent = t.title;
    npGame.textContent  = t.game;
    npIndex.textContent = (idx + 1) + "/" + tracks.length;
  }

  function playTrack()  { audio.play();  btnPlay.textContent = "❚❚"; }
  function pauseTrack() { audio.pause(); btnPlay.textContent = "▶";  }

  btnPlay.addEventListener("click", function() { audio.paused ? playTrack() : pauseTrack(); });
  btnNext.addEventListener("click", function() { i = (i + 1) % tracks.length;                  loadTrack(i); playTrack(); });
  btnPrev.addEventListener("click", function() { i = (i - 1 + tracks.length) % tracks.length;  loadTrack(i); playTrack(); });
  audio.addEventListener("ended",   function() { i = (i + 1) % tracks.length;                  loadTrack(i); playTrack(); });

  loadTrack(i);

})();
