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
    const hh = parts.find((p) => p.type === "hour")?.value ?? "--";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "--";
    clock.textContent = hh + ":" + mm;
  }

  tickClock();
  setInterval(tickClock, 20000);

  /* ===== Dynamic status pill ===== */
  const statusPill = document.getElementById("status-pill");

  const STATUSES = [
    { color: "#5dba7d", label: "calm", tip: "vibing" },
    { color: "#5dba7d", label: "alive", tip: "probably" },
    { color: "#7dc4ff", label: "coding", tip: "firmware things" },
    { color: "#7dc4ff", label: "debugging", tip: "why won't it compile" },
    { color: "#f4c87a", label: "studying", tip: "mcmaster moment" },
    { color: "#f4c87a", label: "caffeinated", tip: "it's past midnight" },
    { color: "#c084fc", label: "listening", tip: "JRPG ost hours" },
    { color: "#f87171", label: "busy", tip: "send help" },
  ];

  function pickStatus() {
    const hour = parseInt(
      new Date().toLocaleString("en-CA", {
        timeZone: TZ,
        hour: "numeric",
        hour12: false,
      }),
      10
    );
    if (hour >= 0 && hour < 5) return STATUSES[5];
    if (hour >= 5 && hour < 9) return STATUSES[1];
    if (hour >= 9 && hour < 13) return STATUSES[4];
    if (hour >= 13 && hour < 18) return STATUSES[2];
    if (hour >= 18 && hour < 22) return STATUSES[6];
    return STATUSES[0];
  }

  function renderStatus(s) {
    if (!statusPill) return;
    statusPill.title = s.tip;
    statusPill.innerHTML =
      '<span class="dot" style="background:' +
      s.color +
      "; box-shadow:0 0 6px " +
      s.color +
      '88;"></span>' +
      s.label;
  }

  renderStatus(pickStatus());

  /* ===== Local Music Player ===== */
  const audio = document.getElementById("audio");
  const btnPlay = document.getElementById("btn-play");
  const btnNext = document.getElementById("btn-next");
  const btnPrev = document.getElementById("btn-prev");
  const npTrack = document.getElementById("np-track");
  const npGame = document.getElementById("np-game");
  const npIndex = document.getElementById("np-index");

  if (audio && btnPlay && btnNext && btnPrev && npTrack && npGame && npIndex) {
    const tracks = [
      { title: "Celes' Theme", game: "Final Fantasy VI", file: "/assets/music/celes.mp3" },
      { title: "Feelings Soar with the Wind", game: "Trails in the Sky", file: "/assets/music/wind.mp3" },
      { title: "To Zanarkand", game: "Final Fantasy X", file: "/assets/music/zanarkand.mp3" },
    ];

    let i = 0;

    function loadTrack(idx) {
      const t = tracks[idx];
      audio.src = t.file;
      npTrack.textContent = t.title;
      npGame.textContent = t.game;
      npIndex.textContent = idx + 1 + "/" + tracks.length;
    }

    function playTrack() {
      audio.play();
      btnPlay.textContent = "||";
    }

    function pauseTrack() {
      audio.pause();
      btnPlay.textContent = ">";
    }

    btnPlay.addEventListener("click", function () {
      audio.paused ? playTrack() : pauseTrack();
    });
    btnNext.addEventListener("click", function () {
      i = (i + 1) % tracks.length;
      loadTrack(i);
      playTrack();
    });
    btnPrev.addEventListener("click", function () {
      i = (i - 1 + tracks.length) % tracks.length;
      loadTrack(i);
      playTrack();
    });
    audio.addEventListener("ended", function () {
      i = (i + 1) % tracks.length;
      loadTrack(i);
      playTrack();
    });

    loadTrack(i);
  }

  /* ===== Right-side pseudo terminal ===== */
  const terminalScreen = document.getElementById("terminal-screen");
  const terminalOutput = document.getElementById("terminal-output");
  const terminalForm = document.getElementById("terminal-form");
  const terminalPrompt = terminalForm.querySelector(".terminal-prompt");
  const terminalInput = document.getElementById("terminal-input");
  const terminalCard = document.querySelector(".terminal-card");

  if (!terminalScreen || !terminalOutput || !terminalForm || !terminalPrompt || !terminalInput || !terminalCard) return;

  const HOME = "/home/talha";

  const terminalState = {
    cwd: HOME,
    game: null,
  };

  const files = {
    "/home/talha/about/bio.txt":
      "Talha Ahmad\n\nMechatronics engineering student at McMaster University focused on embedded systems, firmware, and reliable real-time hardware/software work.",
    "/home/talha/about/interests.txt":
      "embedded systems\nfirmware\ntelemetry\navionics\nrobotics\nJRPG soundtracks\nanime aesthetics",
    "/home/talha/projects/visionnode.txt":
      "VisionNode\n\nBuilt a real-time facial recognition system using an ESP32-CAM for imaging and an STM32 for control/display logic.\n\nStack: ESP32-CAM, STM32, Edge Impulse, TensorFlow Lite, MbedOS.",
    "/home/talha/projects/self_balancing_robot.txt":
      "Self-Balancing Robot\n\nDesigned and 3D printed a two-wheel robot, then implemented PID stabilization using MPU6050 IMU feedback and UART logging for tuning.",
    "/home/talha/projects/digital_counter.txt":
      "Digital Counter Display\n\nSequential logic project using JK flip-flops and multiplexers to drive a stable 7-segment display sequence.",
    "/home/talha/experience/taylor_systems.txt":
      "Taylor Systems - Embedded Systems Engineer Intern\n\nRedesigned Modbus RS-485 hardware, improved acquisition success from 83% to 98%, programmed ESP32/Arduino interfaces, and built MQTT telemetry simulation tooling.",
    "/home/talha/experience/rocketry.txt":
      "McMaster Rocketry - Controls Engineer\n\nWorking on STM32-based data acquisition and CAN communication hardware, firmware for sensor interfacing/telemetry, and avionics integration.",
    "/home/talha/contact/email.txt": "talha05ahmad@gmail.com",
    "/home/talha/contact/github.txt": "https://github.com/damhahlat",
    "/home/talha/contact/linkedin.txt": "https://www.linkedin.com/in/talha-a-ahmad/",
    "/home/talha/fun/music.txt":
      "Favorite loop:\n- Celes' Theme\n- Feelings Soar with the Wind\n- To Zanarkand",
    "/home/talha/fun/favorites.txt":
      "Current aesthetic fuel:\n- Initial D energy\n- terminal UIs\n- JRPG menus\n- pixel-art sprites",
  };

  const directories = {
    "/": ["home"],
    "/home": ["talha"],
    "/home/talha": ["about", "projects", "experience", "contact", "fun"],
    "/home/talha/about": ["bio.txt", "interests.txt"],
    "/home/talha/projects": ["visionnode.txt", "self_balancing_robot.txt", "digital_counter.txt"],
    "/home/talha/experience": ["taylor_systems.txt", "rocketry.txt"],
    "/home/talha/contact": ["email.txt", "github.txt", "linkedin.txt"],
    "/home/talha/fun": ["music.txt", "favorites.txt"],
  };

  const navMap = {
    about: "/about/",
    musings: "/musings/",
    projects: "/projects/",
    home: "/",
  };

  function appendLine(text, className) {
    const line = document.createElement("div");
    line.className = "terminal-line" + (className ? " " + className : "");
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  }

  function promptString() {
    const shortCwd = terminalState.cwd.replace(HOME, "~");
    return "talha@portfolio:" + shortCwd + "$";
  }

  function syncPrompt() {
    terminalPrompt.textContent = promptString();
  }

  function appendCommand(raw) {
    appendLine(promptString() + " " + raw, "terminal-command");
  }

  function normalizePath(path) {
    if (!path) return terminalState.cwd;
    const segments = [];
    const input = path.startsWith("/") ? path.split("/") : (terminalState.cwd + "/" + path).split("/");

    input.forEach(function (part) {
      if (!part || part === ".") return;
      if (part === "..") {
        segments.pop();
        return;
      }
      segments.push(part);
    });

    return "/" + segments.join("/");
  }

  function isDirectory(path) {
    return Object.prototype.hasOwnProperty.call(directories, path);
  }

  function isFile(path) {
    return Object.prototype.hasOwnProperty.call(files, path);
  }

  function listDirectory(path) {
    return (directories[path] || []).slice().sort();
  }

  function renderNeofetch() {
    const lines = [
      "                   -`                    talha@portfolio",
      "                  .o+`                   ----------------",
      "                 `ooo/                   OS: portfolio shell",
      "                `+oooo:                  Host: damhahlat.github.io",
      "               `+oooooo:                 WM: github pages",
      "               -+oooooo+:                Theme: midnight terminal",
      "             `/:-:++oooo+:               Focus: embedded + firmware",
      "            `/++++/+++++++:              School: McMaster University",
      "           `/++++++++++++++:             Shell: pseudo-linux",
      "          `/+++ooooooooooooo/`           Mood: shipping cool stuff",
      "         ./ooosssso++osssssso+`",
      "        .oossssso-````/ossssss+`",
      "       -osssssso.      :ssssssso.",
      "      :osssssss/        osssso+++.",
      "     /ossssssss/        +ssssooo/-",
      "   `/ossssso+/:-        -:/+osssso+-",
      "  `+sso+:-`                 `.-/+oso:",
      " `++:.                           `-/+/",
      " .`                                 `/",
    ];
    appendLine(lines.join("\n"), "terminal-accent terminal-pre");
  }

  function renderHelp() {
    appendLine("Commands", "terminal-accent");
    appendLine("help      - show this list", "terminal-system");
    appendLine("neofetch  - system card", "terminal-system");
    appendLine("ls        - list current directory", "terminal-system");
    appendLine("cd DIR    - change directory", "terminal-system");
    appendLine("pwd       - print current path", "terminal-system");
    appendLine("cat FILE  - read a file", "terminal-system");
    appendLine("tree      - show filesystem tree", "terminal-system");
    appendLine("open X    - open a page or link", "terminal-system");
    appendLine("play      - start the mini game", "terminal-system");
    appendLine("clear     - clear terminal output", "terminal-system");
  }

  function renderTree() {
    appendLine(
      [
        "/home/talha",
        "|-- about",
        "|   |-- bio.txt",
        "|   `-- interests.txt",
        "|-- projects",
        "|   |-- visionnode.txt",
        "|   |-- self_balancing_robot.txt",
        "|   `-- digital_counter.txt",
        "|-- experience",
        "|   |-- taylor_systems.txt",
        "|   `-- rocketry.txt",
        "|-- contact",
        "|   |-- email.txt",
        "|   |-- github.txt",
        "|   `-- linkedin.txt",
        "`-- fun",
        "    |-- music.txt",
        "    `-- favorites.txt",
      ].join("\n"),
      "terminal-system"
    );
  }

  function startGame() {
    terminalState.game = {
      target: Math.floor(Math.random() * 9) + 1,
      tries: 0,
    };
    appendLine("Guess a number from 1 to 9. Type a number, or type quit to bail.", "terminal-accent");
  }

  function handleGameInput(raw) {
    if (!terminalState.game) return false;

    if (raw === "quit") {
      terminalState.game = null;
      appendLine("Game over. Back to the shell.", "terminal-system");
      return true;
    }

    const guess = parseInt(raw, 10);
    if (Number.isNaN(guess) || guess < 1 || guess > 9) {
      appendLine("Pick a number between 1 and 9, or type quit.", "terminal-error");
      return true;
    }

    terminalState.game.tries += 1;
    if (guess === terminalState.game.target) {
      appendLine("Nice. You got it in " + terminalState.game.tries + " guess(es).", "terminal-accent");
      terminalState.game = null;
      return true;
    }

    appendLine(guess < terminalState.game.target ? "Too low." : "Too high.", "terminal-system");
    return true;
  }

  function openTarget(target) {
    if (!target) {
      appendLine("open needs a target. Try: open resume", "terminal-error");
      return;
    }

    const lower = target.toLowerCase();
    if (navMap[lower]) {
      const link = document.querySelector('.navlist a[href="' + navMap[lower] + '"]');
      if (link) link.click();
      appendLine("Opening " + lower + "...", "terminal-system");
      return;
    }

    if (lower === "resume") {
      window.open("/assets/docs/resume_summer_2026.pdf", "_blank", "noopener");
      appendLine("Opening resume...", "terminal-system");
      return;
    }

    if (lower === "github") {
      window.open("https://github.com/damhahlat", "_blank", "noopener");
      appendLine("Opening github...", "terminal-system");
      return;
    }

    if (lower === "linkedin") {
      window.open("https://www.linkedin.com/in/talha-a-ahmad/", "_blank", "noopener");
      appendLine("Opening linkedin...", "terminal-system");
      return;
    }

    appendLine("Unknown open target: " + target, "terminal-error");
  }

  function runCommand(rawInput) {
    const raw = rawInput.trim();
    if (!raw) return;

    appendCommand(raw);

    if (handleGameInput(raw.toLowerCase())) return;

    const parts = raw.split(/\s+/);
    const command = parts[0].toLowerCase();
    const arg = raw.slice(parts[0].length).trim();

    switch (command) {
      case "help":
        renderHelp();
        break;
      case "neofetch":
        renderNeofetch();
        break;
      case "pwd":
        appendLine(terminalState.cwd, "terminal-system");
        break;
      case "ls": {
        const target = normalizePath(arg || terminalState.cwd);
        if (!isDirectory(target)) {
          appendLine("ls: cannot access '" + (arg || target) + "'", "terminal-error");
          break;
        }
        appendLine(listDirectory(target).join("  "), "terminal-system");
        break;
      }
      case "cd": {
        const target = normalizePath(arg || HOME);
        if (!isDirectory(target)) {
          appendLine("cd: no such directory: " + (arg || "~"), "terminal-error");
          break;
        }
        terminalState.cwd = target;
        syncPrompt();
        break;
      }
      case "cat": {
        if (!arg) {
          appendLine("cat: missing file name", "terminal-error");
          break;
        }
        const target = normalizePath(arg);
        if (!isFile(target)) {
          appendLine("cat: file not found: " + arg, "terminal-error");
          break;
        }
        appendLine(files[target], "terminal-system");
        break;
      }
      case "tree":
        renderTree();
        break;
      case "clear":
        terminalOutput.innerHTML = "";
        break;
      case "whoami":
        appendLine("talha", "terminal-accent");
        break;
      case "open":
        openTarget(arg);
        break;
      case "play":
        startGame();
        break;
      default:
        appendLine("command not found: " + command + ". Try help.", "terminal-error");
        break;
    }
  }

  terminalForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const raw = terminalInput.value;
    terminalInput.value = "";
    runCommand(raw);
  });

  terminalCard.addEventListener("click", function () {
    terminalInput.focus();
  });

  syncPrompt();
  appendLine("Welcome to the portfolio shell. Type help to explore.", "terminal-system");
  renderNeofetch();
  renderHelp();
})();
