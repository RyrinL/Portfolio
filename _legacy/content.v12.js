/* ============================================================
   ALL OF YOUR PORTFOLIO CONTENT LIVES IN THIS FILE.
   Edit the text below, save, and refresh the page.
   Everything marked "TODO" is still missing from your CV.
   ============================================================ */

window.PORTFOLIO = {
  // --- Basics -------------------------------------------------
  name: "Pradipta Ryandhi Lingga Madiarta",
  initials: "PM",                          // not shown in the current layout; kept for later use
  roles: [                                 // typed out one after another under your name
    "Software Engineering Student",
    "Full-Stack Developer",
    "LLM Security Evaluation",
  ],
  tagline:
    "Software engineering student building full-stack systems, machine-learning experiments, and tools for testing how language models break.",
  location: "Nanjing, China",              // first word becomes the clock label
  timezone: "Asia/Shanghai",               // IANA zone for the live clock. Empty = visitor's local time
  email: "nayr.sloth@gmail.com",
  available: true,                         // shows the badge under the tagline; set to false to hide
  availableLabel: "open to internships",
  resumeUrl: "cv.pdf",                    // the CV download (file sits next to index.html)

  socials: [
    { label: "GitHub", url: "https://github.com/RyrinL" },
    // TODO add LinkedIn when ready:
    // { label: "LinkedIn", url: "https://www.linkedin.com/in/your-username" },
  ],

  // --- Projects -----------------------------------------------
  // Each project is one full-screen panel.
  //   short    — optional shorter name for the project index on the left
  //   image    — optional path to a screenshot, e.g. "img/lilith.png". Empty = generated line art
  //   code/live — optional links. Empty = hidden
  projects: [
    {
      title: "LILITH",
      subtitle: "LLM jailbreak attack–defense evaluation platform.",
      context: "7th semester · Graduation thesis · in progress",
      stack: ["Vue 3", "Spring Boot", "Python"],
      description: [
        "LILITH — LLM Interactive Lab for Injection Testing and Harm-evaluation — is a full-stack platform for running jailbreak attack and defense experiments against language models.",
        "A Python attack engine tests 2 attack strategies against 2 defenses on 2 target models, and GPT-4o-mini judges every response automatically. Currently in development as my graduation thesis.",
      ],
      image: "", code: "", live: "",       // TODO links
    },
    {
      title: "Skin Lesion Classification on Imbalanced Data",
      short: "Skin Lesion Classification",
      subtitle: "Medical imaging when the classes are far from balanced.",
      context: "7th semester · Medical AI · Team of 3",
      stack: ["PyTorch", "ResNet18", "Transfer learning"],
      description: [
        "A team study comparing ways to handle class imbalance on the HAM10000 skin-lesion dataset: data augmentation, class-weighted loss, and oversampling.",
        "Each strategy was evaluated on a ResNet18 fine-tuned with transfer learning in PyTorch.",
      ],
      image: "", code: "", live: "",
    },
    {
      title: "CostCraft",
      subtitle: "Bakery cost management system.",
      context: "6th semester · Web application",
      stack: ["Java", "Servlet", "JSP", "JDBC", "Chart.js"],
      description: [
        "A J2EE web application that helps a bakery track what its products actually cost to make, built on Servlet, JSP and JDBC with 8 design patterns in the codebase.",
        "Features multi-currency conversion, CSV export, Chart.js trend charts, and a mobile-responsive UI.",
      ],
      image: "", code: "", live: "",
    },
    {
      title: "The Translator's House",
      subtitle: "A console text adventure built on nine design patterns.",
      context: "6th semester · Design patterns",
      stack: ["Java 21"],
      description: [
        "A text adventure for the terminal, written in Java 21 as a study in applying design patterns to a real, playable program.",
        "It implements Singleton, State, Command, Composite, Iterator, Observer, Template Method, Facade, and Memento.",
      ],
      image: "", code: "", live: "",
    },
    {
      title: "Nadi",
      subtitle: "Southeast Asian cultural events booking platform.",
      context: "6th semester · Human-computer interaction",
      stack: ["UX research", "Personas", "Storyboard", "Experience map"],
      description: [
        "A booking platform concept for Southeast Asian cultural events, taken through a full UX process.",
        "Deliverables include personas, a storyboard, an experience map, and Android-first technical recommendations.",
      ],
      image: "", code: "", live: "",
    },
    {
      title: "Petalogue",
      subtitle: "A flower-scanning collector app for iOS.",
      context: "iOS app",                  // TODO add the semester
      stack: ["Swift", "Pl@ntNet API"],
      description: [
        "A Swift iOS app design for scanning and collecting flowers, identifying each one through the Pl@ntNet API.",
        "Ships with a catalog of 10 species local to Nanjing.",
      ],
      image: "", code: "", live: "",
    },
  ],

  // --- About --------------------------------------------------
  about: [
    "I'm a Software Engineering student at Nanjing Xiaozhuang University, on a 2+2 double degree with Universitas Islam Indonesia. My background spans full-stack web development, machine learning, and human-computer interaction.",
    "I build end-to-end systems with Java, Spring Boot, Vue and Python, across coursework and independent projects. Right now I'm developing an LLM jailbreak evaluation platform as my graduation thesis.",
    "I'm looking for internships in software engineering and AI, where I can bring technical depth, creative problem-solving, and the adaptability that comes from studying across cultures.",
  ],
  stats: [                                 // numbers count up when scrolled into view
    { value: 6, suffix: "", label: "Projects" },
    { value: 3, suffix: "", label: "Spoken languages" },
    { value: 2, suffix: "", label: "Countries studied in" },
  ],

  // --- Skills -------------------------------------------------
  skills: [
    { group: "Languages", items: ["Java", "Python", "JavaScript", "SQL", "HTML/CSS"] },
    { group: "Frameworks", items: ["Spring Boot", "Vue 3", "Servlet/JSP", "PyTorch"] },
    { group: "Focus", items: ["Full-stack development", "Machine learning", "LLM integration & evaluation", "UI/UX prototyping"] },
    { group: "Tools", items: ["Git", "Docker", "MySQL", "Maven", "VS Code", "IntelliJ IDEA", "WEKA", "Ollama"] },
    { group: "Spoken", items: ["Indonesian — native", "English — fluent", "Mandarin — intermediate"] },
  ],

  // --- Experience & education (newest first) ------------------
  // "period" is optional — leave "" and the line is hidden.
  experience: [
    {
      role: "Bachelor of Software Engineering",
      org: "Nanjing Xiaozhuang University — Nanjing, China",
      period: "Education · Sep 2025 — Present",
      points: [
        "Software engineering, system design, and AI-driven application development through coursework and collaborative projects.",
        "Interested in LLM security evaluation, full-stack development, and the intersection of technology and creative storytelling.",
      ],
    },
    {
      role: "Event and Competition Coordinator",
      org: "Nanjing Xiaozhuang University",   // TODO department name
      period: "Organization",                  // TODO dates
      points: [
        "Coordinated logistics, scheduling, and communications for the department's annual competition event.",
      ],
    },
    {
      role: "Bachelor of Informatics Engineering",
      org: "Universitas Islam Indonesia — Yogyakarta, Indonesia",
      period: "Education",                     // TODO years
      points: ["2+2 Double Degree Program."],  // TODO coursework, projects, achievements
    },
    {
      role: "Mining Geology (Geologi Pertambangan)",
      org: "SMKN 1 Balikpapan — Balikpapan, Indonesia",
      period: "Education",                     // TODO years
      points: [],
    },
  ],
};


/* ============================================================
   THE DESKTOP / ARG LAYER
   Everything below drives the simulated OS that wraps the
   portfolio above: the sign-in, the desktop, the files you
   can delete, the presence that watches, and the hidden
   archive it guards. Edit the text freely.

   NOTE ON THE ARCHIVE: the archive is intentionally made of
   PLACEHOLDERS. Fill the [ ... ] slots with your own words.
   Nothing here invents memories on your behalf.
   ============================================================ */

window.OS = {
  // The ARG is built but hidden. Flip to true when the archive is ready.
  argEnabled: false,

  // --- Who the machine belongs to (sign-in screen) ----------
  owner: {
    displayName: "Pradipta R. L. Madiarta",
    handle: "mikka",
    avatar: "非",                 // glyph shown on the lock screen
    hint: "no password — press Enter",
  },

  // --- The date that keeps surfacing ------------------------
  // Real birthday. Public desktop shows the REAL current time;
  // only the archive is frozen here.
  arg: {
    dateDisplay: "13 · 06 · 2004",
    dateLong: "13 June 2004",
    dateISO: "2004-06-13",
    // the unlock key is lenient — any of these digit strings pass
    keyDigits: ["06132004", "13062004", "130604", "061304", "20040613", "0613", "613"],
    keyHint: "a date. the one that keeps surfacing.",
  },

  // --- Dock / launcher apps (not deletable) -----------------
  // desktop:false hides an app from the desktop, dock:false from the dock
  apps: [
    { id: "projects",   name: "Projects",   glyph: "◱", kind: "pf-projects" },
    { id: "about",      name: "About",      glyph: "◎", kind: "pf-about" },
    { id: "experience", name: "Experience", glyph: "☰", kind: "pf-experience" },
    { id: "cv",         name: "CV.pdf",     glyph: "⎙", kind: "download", dock: false },
    { id: "terminal",   name: "Terminal",   glyph: "›_", kind: "terminal" },
    { id: "bin",        name: "Bin",        glyph: "⌫", kind: "bin" },
  ],

  // --- Desktop files (these ARE the ARG) --------------------
  // deletable:true  → can be sent to the Bin
  // resists:true    → refuses deletion; this one is the way in
  files: [
    {
      id: "readme", name: "read_me.txt", glyph: "≡", kind: "text", deletable: true,
      meta: "text · modified 13/06/2004",
      body: [
        "If you're reading this, the portfolio is in the Portfolio app. Everything you'd want is in there.",
        "This desktop is just where the rest of it lives.",
        "Some of these files are old. You can clear them out if you like. It won't mind.",
      ],
    },
    {
      id: "resume", name: "resume.pdf", glyph: "⎙", kind: "text", deletable: true,
      meta: "document · 1 page",
      body: [
        "[ résumé ]",
        "Open the Portfolio app for the full, current version — projects, skills, experience, contact.",
        "( drop your real resume.pdf next to index.html and point content.js → resumeUrl at it )",
      ],
    },
    {
      id: "projects", name: "projects", glyph: "▭", kind: "folder", deletable: true,
      meta: "folder · 6 items",
      body: [
        "LILITH · Skin Lesion Classification · CostCraft · The Translator's House · Nadi · Petalogue",
        "The real writeups live in the Portfolio app. This is just the shortcut nobody updates.",
      ],
    },
    {
      id: "photos", name: "photos", glyph: "▦", kind: "folder", deletable: true,
      meta: "folder · last opened 13/06/2004",
      body: [
        "[ empty — or it looks empty ]",
        "The thumbnails never loaded. The folder date never changed either.",
      ],
    },
    {
      id: "notes", name: "notes.txt", glyph: "≡", kind: "text", deletable: true,
      meta: "text · 0.2 KB",
      body: [
        "- remember to update the projects folder (never did)",
        "- the clock is right. everything else is a guess.",
        "- 13/06 again.",
      ],
    },
    {
      id: "log0613", name: "0613.log", glyph: "❖", kind: "text", deletable: true,
      meta: "log · system",
      body: [
        "2004-06-13 00:00:00  session opened",
        "2004-06-13 00:00:00  archive mounted",
        "2004-06-13 00:00:00  archive still in use",
        "----  every entry is the same day. nobody fixed the clock on this one.  ----",
      ],
    },
    {
      // The one that won't go. Double-click it to find the way in.
      id: "nonexistence", name: "非存在", glyph: "◍", kind: "seed", deletable: false, resists: true,
      meta: "— · in use",
      body: [
        "This one is still in use.",
        "You already know the date. It's been on half the files you opened.",
      ],
    },
  ],

  // --- The presence in the machine --------------------------
  // Passive. Dry. Occasional. Never explains itself.
  observer: {
    minGapMs: 8000,   // never speak more often than this
    idleMs: 45000,    // after this long idle on the desktop, it may murmur once
    lines: {
      firstDelete: ["You have been warned."],
      delete:      ["This operation is not recommended.", "Some things are better left where they are."],
      resist:      ["The archive is still in use.", "Some things are better left where they are.", "This operation is not recommended."],
      emptyBin:    ["Gone, then.", "That won't be the end of it."],
      emptied:     ["You seem interested in what remains."],
      seedWake:    ["I suppose you were going to find it eventually."],
      openSeed:    ["You seem interested in what remains."],
      wrongKey:    ["That is not the day.", "No."],
      unlocked:    ["I suppose you were going to find it eventually."],
      enterArchive:["Some things are better left where they are."],
      idle:        ["The archive is still in use.", "Still here.", "Take your time."],
      reset:       ["We can do this again."],
    },
  },

  // --- The hidden archive (the other side of the person) ----
  // PLACEHOLDERS ONLY. Replace the [ ... ] lines with your words.
  archive: {
    clockLabel: "13 June 2004",
    kicker: "personal archive",
    title: "the other half",
    intro: [
      "This is the part that doesn't go on a résumé.",
      "The desktop out there is what I do. This is closer to who's doing it.",
    ],
    sections: [
      {
        key: "interests", title: "what I keep", note: "interests & hobbies",
        items: [
          "[ a hobby, in your own words ]",
          "[ something you make or collect ]",
          "[ the thing you'd talk about for an hour ]",
        ],
      },
      {
        key: "self", title: "off the clock", note: "personality outside work",
        items: [
          "[ how friends would describe you ]",
          "[ a small, true, un-professional thing ]",
        ],
      },
      {
        key: "memories", title: "13 June", note: "milestones & memories",
        items: [
          "[ a real memory — only ones that are actually yours go here ]",
          "[ a milestone that mattered ]",
        ],
      },
      {
        key: "influences", title: "what shaped this", note: "creative influences",
        items: [
          "[ a book / game / film / person that left a mark ]",
          "[ where your taste comes from ]",
        ],
      },
      {
        key: "thoughts", title: "notes to no one", note: "thoughts & philosophies",
        items: [
          "[ something you believe and keep coming back to ]",
          "[ a line you'd leave for whoever found this ]",
        ],
      },
    ],
    outro: [
      "That's most of it.",
      "Thanks for digging. Most people just read the résumé.",
    ],
    resetHint: "type  forget  to put it all back",
  },
};
