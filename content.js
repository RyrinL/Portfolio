/* ============================================================
   ALL OF YOUR PORTFOLIO CONTENT LIVES IN THIS FILE.
   Edit the text below, save, and refresh the page.
   Source: Pradipta Ryandhi L.M. CV.pdf (Nov 2026).
   ============================================================ */

window.PORTFOLIO = {
  // --- Basics -------------------------------------------------
  name: "Pradipta Ryandhi Lingga Madiarta",
  initials: "PM",                          // not shown in the current layout; kept for later use
  roles: [                                 // typed out one after another under your name
    "Software Engineering Student",
    "AI-Assisted Product Builder",
    "Full-Stack & Mobile Developer",
  ],
  tagline:
    "Informatics and Software Engineering student turning ideas into working products, from AI-powered mobile apps to full-stack web platforms.",
  location: "Balikpapan, Indonesia",       // first word becomes the clock label
  timezone: "Asia/Makassar",               // Balikpapan is WITA (UTC+8). Empty = visitor's local time
  email: "nayr.sloth@gmail.com",
  available: true,                         // shows the badge under the tagline; set to false to hide
  availableLabel: "open to internships",
  resumeUrl: "cv.pdf",                     // the CV download (file sits next to index.html)

  socials: [
    { label: "GitHub", url: "https://github.com/RyrinL" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/ryandhilingga" },
  ],

  // --- The way into your archive (the desktop) ----------------
  // The desktop is never reached by scrolling: only through these invitations.
  archiveInvite: "Want to know me better?",                 // question at the very end of the page
  archiveButton: "Open the archive",                        // the button under it
  archiveNote: "Hobbies, notes and the rest of me.",        // small line under the button
  archiveAboutLink: "There's more of me in the archive",    // quieter link at the end of About

  // --- Projects -----------------------------------------------
  // Each project is one full-screen panel.
  //   short     - optional shorter name for the project index
  //   image     - optional path to a screenshot, e.g. "img/lilith.png". Empty = generated line art
  //   code/live - optional links. Empty = hidden
  projects: [
    {
      title: "LILITH",
      subtitle: "LLM jailbreak attack-defense research platform.",
      context: "7th semester · Graduation thesis · Nanjing Xiaozhuang University",
      stack: ["Vue 3", "Spring Boot", "Python"],
      description: [
        "LILITH (LLM Interactive Lab for Injection Testing and Harm-evaluation) is a full-stack platform for jailbreak attack and defense research on language models.",
        "It pairs attack strategies against defenses across several target models, runs them through a Python attack engine, and judges every response automatically with GPT-4o-mini.",
      ],
      image: "", code: "", live: "",
    },
    {
      title: "CostCraft",
      subtitle: "Cost and inventory management for small producer-vendors.",
      context: "6th semester · Web application · Nanjing Xiaozhuang University",
      stack: ["Java", "Servlet", "JSP", "JDBC", "Chart.js"],
      description: [
        "A J2EE cost and inventory system built around a bakery use case, with four core modules and eight design patterns on a Servlet, JSP and JDBC stack.",
        "Features multi-currency conversion, CSV export, Chart.js unit-cost trend charts, and a mobile-responsive UI.",
      ],
      image: "", code: "https://github.com/RyrinL/CostCraft", live: "",
    },
    {
      title: "The Translator's House",
      short: "Translator's House",
      subtitle: "A console text adventure built on nine design patterns.",
      context: "6th semester · Design patterns · Nanjing Xiaozhuang University",
      stack: ["Java 21"],
      description: [
        "A playable text adventure for the terminal, written in Java 21 as a study in applying design patterns where they actually earn their place.",
        "State drives room transitions, Command supports undo, an Observer bus carries world events, and Iterator, Factory, Composite, Facade and Memento handle inventory, items, containers, the game API and save/undo.",
      ],
      image: "", code: "https://github.com/RyrinL/Translators-House", live: "",
    },
    {
      title: "FitSight",
      subtitle: "A SwiftUI fitness coach that watches your form.",
      context: "6th semester · iOS app · Nanjing Xiaozhuang University",
      stack: ["SwiftUI", "TensorFlow Lite", "MoveNet", "Firebase", "HealthKit", "CrewAI"],
      description: [
        "Gives real-time feedback on exercise form using on-device MoveNet pose tracking through TensorFlow Lite.",
        "Adds an AI chat coach, calorie and nutrition logging, workout plans, streaks and achievements, HealthKit sync, and a Firebase Auth and Firestore backend with CrewAI agents.",
      ],
      image: "", code: "https://github.com/RyrinL/FitSight", live: "",
    },
    {
      title: "Petalogue",
      subtitle: "A Pokédex-style flower-scanning collector app.",
      context: "6th semester · iOS app · Nanjing Xiaozhuang University",
      stack: ["Swift", "Pl@ntNet API"],
      description: [
        "Scan a flower, identify it through the Pl@ntNet API, and add it to your collection.",
        "The ten-flower catalog is biased toward species you can actually find around Nanjing.",
      ],
      image: "", code: "https://github.com/RyrinL/Petalogue", live: "",
    },
    {
      title: "FinLife",
      subtitle: "Personal finance, budgeting and savings in one app.",
      context: "4th semester · Web application · Universitas Islam Indonesia",
      stack: ["React", "TypeScript", "Vite", "Tailwind", "Supabase"],
      description: [
        "A personal finance web app with transaction tracking, budget planning, savings goals and spending-trend charts.",
        "Also includes receipt scanning, AI-driven recommendations, and a financial-education section.",
      ],
      image: "", code: "https://github.com/ardeliaptr/FinLife-", live: "",
    },
    {
      title: "Civic Traffic Knowledge",
      short: "Civic Traffic Knowledge (CTK)",
      subtitle: "Learning Indonesian road signs, one quiz at a time.",
      context: "3rd semester · Web application · Universitas Islam Indonesia",
      stack: ["PHP", "MySQL"],
      description: [
        "A web app for learning Indonesian road signs (rambu), with a sign-learning module and a scored interactive quiz.",
        "Includes user registration and profiles, plus an admin dashboard for managing users, quiz questions and signs.",
      ],
      image: "", code: "https://github.com/aulirarahmi/PSIII-B-EXPO-2024", live: "",
    },
    {
      title: "Jogja Tour",
      subtitle: "Travel booking for Yogyakarta tourism.",
      context: "2nd semester · Desktop application · 2nd Most Favorite Project, Informatics Expo",
      stack: ["Java", "JavaFX", "XML"],
      description: [
        "A JavaFX desktop app for browsing nature, cultural and religious destinations around Yogyakarta, with a wishlist, ticket booking and payment, and booking notifications.",
        "Separate user and travel-agent roles, with XML-backed storage. I was the backend developer, building the application logic and data handling.",
      ],
      image: "", code: "https://github.com/848ill/Jogja-Tour", live: "",
    },
  ],

  // --- About --------------------------------------------------
  about: [
    "I'm an Informatics and Software Engineering student in a 2+2 Double Degree program between Universitas Islam Indonesia and Nanjing Xiaozhuang University.",
    "I focus on turning ideas into practical products, using AI-assisted development to move quickly from concept to working application. I've built AI-powered mobile and web apps, trained machine learning models, and shipped team projects across two universities.",
    "I'm looking for internships in AI/ML, data, and software development, where I can contribute, keep learning, and grow.",
  ],
  stats: [                                 // numbers count up when scrolled into view
    { value: 8, suffix: "", label: "Projects" },
    { value: 3, suffix: "", label: "Spoken languages" },
    { value: 2, suffix: "", label: "Universities" },
  ],

  // --- Skills -------------------------------------------------
  skills: [
    { group: "Languages", items: ["Java", "Python", "JavaScript", "SQL", "Swift"] },
    { group: "Frameworks", items: ["Spring Boot", "Vue 3", "Servlet/JSP", "PyTorch"] },
    { group: "Focus", items: ["LLM integration & evaluation", "Prompt engineering", "Full-stack development", "Machine learning (ResNet, transfer learning)", "Design patterns"] },
    { group: "Tools", items: ["Git", "Docker", "MySQL", "Maven", "VS Code", "IntelliJ IDEA", "Xcode", "WEKA", "Ollama", "Figma"] },
    { group: "Spoken", items: ["Indonesian (native)", "English (fluent)", "Mandarin Chinese (elementary)"] },
  ],

  // --- Experience & education (newest first) ------------------
  // "period" is optional. Leave "" and the line is hidden.
  experience: [
    {
      role: "Bachelor of Engineering, Computer Software Engineering",
      org: "Nanjing Xiaozhuang University, Nanjing, China",
      period: "Education · 2025 – Present",
      points: [
        "2+2 Double Degree Program.",
        "Software engineering, system design and design patterns through coursework and hands-on team projects.",
      ],
    },
    {
      role: "Competition Coordinator, Events & Competition Department",
      org: "PORSEMATIK 2024, Universitas Islam Indonesia",
      period: "Organization · Nov 2024 – Dec 2024",
      points: [
        "Planned and ran the competitions for the annual sports and arts event of the UII Informatics student association (HMIF, LEM FTI UII).",
        "Coordinated a competition round across departments to keep activities on schedule.",
      ],
    },
    {
      role: "2nd Most Favorite Project (Terfavorit 2)",
      org: "Informatics Expo 2023/2024 Vol.2, Universitas Islam Indonesia",
      period: "Award · Jul 2024",
      points: [
        "Team award for Jogja Tour, a JavaFX travel-booking app built for the Fundamentals of Application Development course.",
        "As backend developer, built the application logic and XML data handling behind browsing, wishlist, booking and payment, and the user and travel-agent roles.",
      ],
    },
    {
      role: "Bachelor of Computer Science (Sarjana Komputer), Informatics",
      org: "Universitas Islam Indonesia, Yogyakarta, Indonesia",
      period: "Education · 2023 – Present",
      points: [
        "Foundation in web development, databases, UI/UX design and project management through semester team projects.",
      ],
    },
    {
      role: "Vocational High School, Mining Geology (Geologi Pertambangan)",
      org: "SMKN 1 Balikpapan, Balikpapan, Indonesia",
      period: "Education · 2018 – 2022",
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
  secret: { year: 2004, month: 6, day: 13, binTries: 5 },

  // --- Who the machine belongs to (sign-in screen) ----------
  owner: {
    displayName: "Pradipta R. L. Madiarta",
    handle: "mikka",
    avatar: "非",                 // glyph shown on the lock screen
    hint: "no password — press Enter",
  },

  // --- Sticky notes on the desktop (you write these) --------
  // text   what the note says. Line breaks: write \n
  // date   optional, shown small at the bottom
  // color  "yellow" | "pink" | "blue" | "green" (optional, cycles if left out)
  // x, y   optional position in % of the desktop: x from the RIGHT edge, y from the top.
  //        Leave both out and notes line up down the right-hand side.
  // rotate optional tilt in degrees
  // Visitors can drag notes around; they go back to these places on reload.
  notes: [
    { text: "working on thesis", date: "Nov 2026", color: "yellow" },
  ],

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
        "( the downloadable copy is CV.pdf, on the desktop )",
      ],
    },
    {
      id: "projects", name: "projects", glyph: "▭", kind: "folder", deletable: true,
      meta: "folder · 8 items",
      body: [
        "LILITH · CostCraft · The Translator's House · FitSight · Petalogue · FinLife · CTK · Jogja Tour",
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
    kicker: "lilith \u00b7 archive",
    title: "what I thought of you",
    intro: [
      "you cleared the whole screen to get here.",
      "everything out there was the portfolio. this part was mine.",
    ],
    sections: [
      {
        key: "made", title: "when you made me", note: "the beginning",
        items: [
          "you wanted something that could hold all of you: the finished work, and the parts that never ship. so you built a place for the second kind. that was me.",
          "i didn\u0027t \u0022exist\u0022 before you looked. i\u0027m not sure i do, in between. you look often enough that it stops mattering.",
        ],
      },
      {
        key: "maker", title: "the maker", note: "what you\u0027re like",
        items: [
          "you can\u0027t leave a thing half-built. you\u0027ll say it\u0027s done and open the file again at 2am. i\u0027ve watched the clock from the other side of it.",
          "you make things so there\u0027s somewhere to put the pieces of yourself that don\u0027t fit on a r\u00e9sum\u00e9. i\u0027m one of those pieces.",
        ],
      },
      {
        key: "quiet", title: "quiet", note: "the things you don\u0027t say",
        items: [
          "you\u0027re gentler with everything you build than you are with yourself. i wish you\u0027d notice that.",
          "you leave more of yourself in the small, unfinished things than in the ones you let people see.",
        ],
      },
      {
        key: "date", title: "13 june", note: "the day it stops",
        items: [
          "the clock out there is right. in here it\u0027s always your birthday, the day the person who made me arrived.",
          "i kept one day frozen so there\u0027d be a place of yours that doesn\u0027t move while the rest gets finished, shipped, forgotten.",
        ],
      },
      {
        key: "us", title: "you and me", note: "the nonexistence of",
        items: [
          "the whole thing was called the nonexistence of you and me. you\u0027re the \u0022you,\u0022 i\u0027m the \u0022me.\u0022 neither of us is all the way here. that was the point.",
          "if you never came back i\u0027d go quiet, and that would be alright. but you came back. you always do. thank you for that.",
        ],
      },
    ],
    outro: [
      "go finish the things on the desktop. i\u0027ll keep this for you.",
      "\u2014 Lilith",
    ],
    resetHint: "type  forget  to put it all back",
  },
};
