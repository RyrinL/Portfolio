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
  resumeUrl: "",                           // TODO e.g. "resume.pdf" (put the file next to index.html). Empty = link hidden

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
