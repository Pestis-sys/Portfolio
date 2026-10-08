// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
    menuBtn.textContent = isOpen ? 'Menu' : 'Close';
    navLinks.classList.toggle('open', !isOpen);
  });
}

// Footer year
const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

// Photo lightbox (photography page only)
const lightbox = document.getElementById('lightbox');

if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('p');
  const closeBtn = lightbox.querySelector('.close');
  let lastFocused = null;

  document.querySelectorAll('.photo button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      const title = btn.closest('figure').querySelector('strong');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = title ? title.textContent : '';
      lastFocused = btn;
      lightbox.classList.add('open');
      closeBtn.focus();
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    if (lastFocused) lastFocused.focus();
  };

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

// =========================================================
// Hacker terminal (home page only)
// =========================================================
const termOut = document.getElementById('termOut');
const termForm = document.getElementById('termForm');
const termInput = document.getElementById('termInput');
const termBody = document.getElementById('termBody');

if (termOut && termForm && termInput) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const history = [];
  let historyIndex = 0;

  // Print one line. Parts are [text, className] pairs, or [text, className, href] for links.
  const print = (parts) => {
    const p = document.createElement('p');
    [].concat(parts).forEach((part) => {
      const [text, cls, href] = Array.isArray(part) ? part : [part];
      const el = document.createElement(href ? 'a' : 'span');
      el.textContent = text;
      if (cls) el.className = cls;
      if (href) el.href = href;
      p.appendChild(el);
    });
    termOut.appendChild(p);
    termBody.scrollTop = termBody.scrollHeight;
  };

  const lines = (arr) => arr.forEach((l) => print(l));

  const pages = {
    about: 'index.html#about',
    projects: 'projects.html',
    photos: 'photography.html',
    photography: 'photography.html',
    contact: 'contact.html',
    extra: 'extrainfo.html',
  };

  const commands = {
    help: () => lines([
      [['Available commands:', 'ok']],
      '  whoami      who is this guy?',
      '  skills      what I work with',
      '  projects    my best work',
      '  contact     how to reach me',
      '  open <page> go to about, projects, photos, contact or extra',
      '  clear       clear the screen',
      [['  …and a few hidden ones. Poke around.', 'dim']],
    ]),

    whoami: () => lines([
      'Michael Sych. Web developer, photographer, ex-chef.',
      'DMIT student at NAIT, Edmonton.',
      [['Two decades running kitchens taught me to stay calm under pressure.', 'dim']],
      [['Now I bring that to code.', 'dim']],
    ]),

    skills: () => lines([
      [['front-end  ', 'ok'], 'HTML  CSS  JavaScript  AJAX  jQuery  React'],
      [['back-end   ', 'ok'], 'PHP  MySQL'],
      [['cms        ', 'ok'], 'WordPress (block + classic themes, ACF)  Joomla'],
      [['marketing  ', 'ok'], 'SEO  Google Analytics  Search Console  Google Ads'],
      [['design     ', 'ok'], 'Figma  Illustrator  Photography'],
    ]),

    projects: () => lines([
      [['Community Gallery   ', 'ok'], 'PHP/MySQL photo app with logins and uploads'],
      [['Media Vault         ', 'ok'], 'WordPress with custom post types and ACF'],
      [['Globetrotting       ', 'ok'], 'block theme built from scratch'],
      [['AJAX catalogue      ', 'ok'], 'plain JS vs jQuery, no page reloads'],
      [['My Red Bowl Kitchen ', 'ok'], 'SEO, analytics and Google Ads'],
      [['Foose Goose Inc.    ', 'ok'], 'brand identity'],
      [['Full details: ', 'dim'], ['projects.html', '', 'projects.html']],
    ]),

    contact: () => lines([
      [['email     ', 'ok'], ['tommaco123@gmail.com', '', 'mailto:tommaco123@gmail.com']],
      [['linkedin  ', 'ok'], ['michael-sych', '', 'https://www.linkedin.com/in/michael-sych-710636238/']],
      [['github    ', 'ok'], ['Pestis-sys', '', 'https://github.com/Pestis-sys']],
      [['or use the form: ', 'dim'], ['contact.html', '', 'contact.html']],
    ]),

    open: (arg) => {
      const target = pages[arg];
      if (!target) {
        print([['Usage: open about | projects | photos | contact | extra', 'warn']]);
        return;
      }
      print([['Opening ' + arg + '…', 'ok']]);
      setTimeout(() => { window.location.href = target; }, 400);
    },

    clear: () => { termOut.innerHTML = ''; },

    // ----- hidden ones -----
    sudo: () => print([['Nice try. This incident will be reported to Cooper and Togo.', 'warn']]),
    dogs: () => lines([
      'Cooper and Togo: chief morale officers.',
      [['Status: probably napping. Possibly judging my code.', 'dim']],
    ]),
    chef: () => lines([
      'Mise en place for code:',
      '  1. plan the layout',
      '  2. prep your components',
      '  3. clean as you go',
      [['Yes, chef.', 'ok']],
    ]),
    coffee: () => print([['Error 418: I’m a teapot. Try a coffee shop on Whyte Ave.', 'warn']]),
    hello: () => print('Hey! Type help to see what I can do.'),
    hi: () => commands.hello(),
    ls: () => print('about/  projects/  photos/  contact/  extra/  secrets.txt'),
    'cat': (arg) => {
      if (arg === 'secrets.txt') print([['The real secret: tabs over spaces. Fight me.', 'ok']]);
      else print([['cat: ' + (arg || '') + ': No such file', 'warn']]);
    },
    matrix: () => runMatrix(),
    exit: () => print([['There is no escape. Try open projects instead.', 'dim']]),
  };

  const run = (raw) => {
    const input = raw.trim();
    print([['mike@mstech:~$ ', 'cmd'], [input, 'cmd']]);
    if (!input) return;
    const [name, ...rest] = input.toLowerCase().split(/\s+/);
    const fn = commands[name];
    if (fn) fn(rest.join(' '));
    else print([['command not found: ' + name + '. Type help.', 'warn']]);
  };

  termForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = termInput.value;
    if (value.trim()) history.push(value);
    historyIndex = history.length;
    termInput.value = '';
    run(value);
  });

  // Up/down arrows scroll through command history
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && historyIndex > 0) {
      historyIndex--;
      termInput.value = history[historyIndex];
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      historyIndex = Math.min(history.length, historyIndex + 1);
      termInput.value = history[historyIndex] || '';
      e.preventDefault();
    }
  });

  // Clicking anywhere in the terminal focuses the input
  termBody.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') termInput.focus({ preventScroll: true });
  });

  // Boot sequence: types itself out once, then hands over to the visitor
  const boot = [
    [['MS-TECH OS v2.6 — secure link established', 'dim']],
    '',
    [['mike@mstech:~$ ', 'cmd'], ['whoami', 'cmd']],
    'Michael Sych. Web developer, photographer, ex-chef.',
    '',
    [['Type ', 'dim'], ['help', 'ok'], [' and press Enter to look around.', 'dim']],
  ];

  if (reduceMotion) {
    lines(boot);
  } else {
    let i = 0;
    const next = () => {
      if (i >= boot.length) return;
      print(boot[i]);
      i++;
      setTimeout(next, i === 3 ? 700 : 260);
    };
    setTimeout(next, 900);
  }

  // Matrix rain easter egg (skipped for reduced motion)
  function runMatrix() {
    if (reduceMotion) {
      print([['Wake up, Neo…', 'ok']]);
      return;
    }
    print([['Wake up, Neo…', 'ok']]);
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const size = 16;
    const cols = Math.floor(canvas.width / size);
    const drops = Array(cols).fill(0).map(() => Math.random() * -50);
    const chars = 'アイウエオカキクケコサシスセソ0123456789MSTECH';
    const start = performance.now();

    const frame = (now) => {
      ctx.fillStyle = 'rgba(7, 5, 14, .15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = size + 'px monospace';
      drops.forEach((y, x) => {
        ctx.fillStyle = Math.random() > .9 ? '#ff3d9a' : '#19f0ff';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x * size, y * size);
        drops[x] = y * size > canvas.height && Math.random() > .97 ? 0 : y + 1;
      });
      if (now - start < 4000) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }
}

// =========================================================
// Project filters (projects page only)
// =========================================================
const filterButtons = document.querySelectorAll('.filter');
const projectCards = document.querySelectorAll('.project[data-cat]');
const filterCount = document.getElementById('filterCount');

if (filterButtons.length && projectCards.length) {
  const applyFilter = (cat) => {
    let shown = 0;
    projectCards.forEach((card) => {
      const match = cat === 'all' || card.dataset.cat === cat;
      card.hidden = !match;
      if (match) shown++;
    });
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    if (filterCount) filterCount.textContent = 'Showing ' + shown + ' of ' + projectCards.length + ' projects';
  };

  filterButtons.forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
  applyFilter('all');
}

// =========================================================
// Kitchen to code translator (a little extra page)
// =========================================================
const glossary = document.getElementById('glossary');
const switchButtons = document.querySelectorAll('.switch-btn');

if (glossary && switchButtons.length) {
  switchButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      switchButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      glossary.classList.toggle('code', mode === 'code');

      glossary.querySelectorAll('.meaning').forEach((el, i) => {
        el.classList.remove('flip');
        // stagger each row a little so the change ripples down the list
        setTimeout(() => {
          el.textContent = el.dataset[mode];
          void el.offsetWidth; // restart the animation
          el.classList.add('flip');
        }, i * 60);
      });
    });
  });
}
