/* =========================================================
   script.js — all the JavaScript for michaelsych.com
   ---------------------------------------------------------
   One file is shared by every page. Each section first checks
   that its elements exist, so code for one page never breaks
   another page.

   Main reference used throughout: MDN Web Docs
   https://developer.mozilla.org/en-US/docs/Web/JavaScript
   ========================================================= */


// =========================================================
// Mobile menu (every page)
// =========================================================

// getElementById finds one element by its id="" attribute.
// https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

// Only run if both elements are on this page.
if (menuBtn && navLinks) {
  // addEventListener runs a function when something happens (here: a click).
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  menuBtn.addEventListener('click', () => {
    // aria-expanded tells screen readers whether the menu is open.
    // getAttribute returns a string, so compare against 'true'.
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';

    // Flip the state. String() turns the boolean back into 'true'/'false'.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
    menuBtn.setAttribute('aria-expanded', String(!isOpen));

    // Ternary operator: condition ? valueIfTrue : valueIfFalse
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator
    menuBtn.textContent = isOpen ? 'Menu' : 'Close';

    // classList.toggle(name, force) adds the class when force is true,
    // removes it when false. The CSS shows .nav-links.open on mobile.
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
    navLinks.classList.toggle('open', !isOpen);
  });
}


// =========================================================
// Footer year (every page)
// =========================================================

// Puts the current year in the footer so it never goes out of date.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getFullYear
const year = document.getElementById('year');
if (year) {
  // textContent sets plain text (safer than innerHTML: no HTML is parsed).
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  year.textContent = new Date().getFullYear();
}


// =========================================================
// Photo lightbox (photography page only)
// Click a photo → it opens large in an overlay.
// =========================================================
const lightbox = document.getElementById('lightbox');

if (lightbox) {
  // querySelector finds the first element matching a CSS selector,
  // searching only inside the lightbox.
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('p');
  const closeBtn = lightbox.querySelector('.close');

  // Remembers which photo was clicked, so keyboard focus can go back
  // to it when the lightbox closes (an accessibility best practice).
  let lastFocused = null;

  // querySelectorAll returns every match; forEach loops over them.
  // https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
  // https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
  document.querySelectorAll('.photo button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');

      // closest() walks UP the page to the nearest matching parent.
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
      const title = btn.closest('figure').querySelector('strong');

      // Copy the clicked photo into the big lightbox image.
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = title ? title.textContent : '';

      lastFocused = btn;
      lightbox.classList.add('open'); // CSS: .lightbox.open { display: grid }

      // Move keyboard focus into the dialog.
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
      closeBtn.focus();
    });
  });

  // Arrow function stored in a variable so three different events can reuse it.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    if (lastFocused) lastFocused.focus();
  };

  // 1. Close button
  closeBtn.addEventListener('click', closeLightbox);

  // 2. Clicking the dark background (but not the photo itself).
  //    e.target is the exact element that was clicked.
  //    https://developer.mozilla.org/en-US/docs/Web/API/Event/target
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // 3. Pressing Escape.
  //    https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}


// =========================================================
// Hacker terminal (home page only)
// =========================================================
const termOut = document.getElementById('termOut');     // the "screen"
const termForm = document.getElementById('termForm');   // the prompt line
const termInput = document.getElementById('termInput'); // the text box
const termBody = document.getElementById('termBody');   // scrollable area

if (termOut && termForm && termInput) {
  // Respects the visitor's "reduce motion" system setting.
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Everything the visitor has typed, for the up/down arrow keys.
  const history = [];
  let historyIndex = 0;

  // ---------------------------------------------------------
  // print(): writes one line to the terminal screen.
  // A line is made of "parts". Each part is either:
  //   'plain text'
  //   ['text', 'className']             → coloured text (ok / warn / dim / cmd)
  //   ['text', 'className', 'url']      → a link
  // Example: print([['back-end ', 'ok'], 'PHP MySQL'])
  // ---------------------------------------------------------
  const print = (parts) => {
    // createElement builds a new element in memory (not on the page yet).
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
    const p = document.createElement('p');

    // [].concat(parts) makes sure we always have an array to loop over.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat
    [].concat(parts).forEach((part) => {
      // Destructuring: unpacks an array into separate variables in one line.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
      const [text, cls, href] = Array.isArray(part) ? part : [part];

      const el = document.createElement(href ? 'a' : 'span');
      el.textContent = text; // textContent = visitors' typing can never run as code
      if (cls) el.className = cls;
      if (href) el.href = href;

      // appendChild adds the element inside its parent.
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
      p.appendChild(el);
    });

    termOut.appendChild(p);

    // Auto-scroll to the newest line.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
    termBody.scrollTop = termBody.scrollHeight;
  };

  // Prints several lines at once.
  const lines = (arr) => arr.forEach((l) => print(l));

  // Page names the "open" command understands → the file they go to.
  const pages = {
    about: 'index.html#about',
    projects: 'projects.html',
    photos: 'photography.html',
    photography: 'photography.html',
    contact: 'contact.html',
    extra: 'extrainfo.html',
  };

  // ---------------------------------------------------------
  // The commands object: the "brain" of the terminal.
  // Each key is a command name, each value is a function that runs it.
  // To add a command, add one new line here.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
  // ---------------------------------------------------------
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

    // "open projects" → arg is 'projects'
    open: (arg) => {
      const target = pages[arg]; // look up the page; undefined if not found
      if (!target) {
        print([['Usage: open about | projects | photos | contact | extra', 'warn']]);
        return;
      }
      print([['Opening ' + arg + '…', 'ok']]);

      // Wait 400 ms so the message is visible, then change page.
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
      // https://developer.mozilla.org/en-US/docs/Web/API/Location/href
      setTimeout(() => { window.location.href = target; }, 400);
    },

    // innerHTML = '' removes everything inside the screen.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
    clear: () => { termOut.innerHTML = ''; },

    // ----- hidden ones (not listed in help) -----
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
    // 418 "I'm a teapot" is a real (joke) HTTP status code.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418
    coffee: () => print([['Error 418: I’m a teapot. Try a coffee shop on Whyte Ave.', 'warn']]),
    hello: () => print('Hey! Type help to see what I can do.'),
    hi: () => commands.hello(), // reuses the hello command
    ls: () => print('about/  projects/  photos/  contact/  extra/  secrets.txt'),
    'cat': (arg) => {
      if (arg === 'secrets.txt') print([['The real secret: tabs over spaces. Fight me.', 'ok']]);
      else print([['cat: ' + (arg || '') + ': No such file', 'warn']]);
    },
    matrix: () => runMatrix(),
    exit: () => print([['There is no escape. Try open projects instead.', 'dim']]),
  };

  // ---------------------------------------------------------
  // run(): works out which command was typed and runs it.
  // e.g. "open projects" → name = 'open', rest = ['projects']
  // ---------------------------------------------------------
  const run = (raw) => {
    // trim() removes spaces from both ends.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
    const input = raw.trim();

    print([['mike@mstech:~$ ', 'cmd'], [input, 'cmd']]); // echo what was typed
    if (!input) return;

    // toLowerCase() so "HELP" works too; split(/\s+/) breaks on any spaces.
    // ...rest collects everything after the first word into an array.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
    const [name, ...rest] = input.toLowerCase().split(/\s+/);

    // Bracket notation looks up a property using a variable.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors
    const fn = commands[name];

    if (fn) fn(rest.join(' '));
    else print([['command not found: ' + name + '. Type help.', 'warn']]);
  };

  // Pressing Enter submits the form.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
  termForm.addEventListener('submit', (e) => {
    // Stops the browser's normal form behaviour (reloading the page).
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
    e.preventDefault();

    const value = termInput.value;
    if (value.trim()) history.push(value); // remember it for the arrow keys
    historyIndex = history.length;
    termInput.value = '';                  // clear the box
    run(value);
  });

  // Up/down arrows step through command history, like a real terminal.
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && historyIndex > 0) {
      historyIndex--;
      termInput.value = history[historyIndex];
      e.preventDefault(); // stop the cursor jumping to the start of the line
    } else if (e.key === 'ArrowDown') {
      // Math.min keeps the index from going past the end.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
      historyIndex = Math.min(history.length, historyIndex + 1);
      termInput.value = history[historyIndex] || ''; // || '' = empty box past the end
      e.preventDefault();
    }
  });

  // Clicking anywhere in the terminal focuses the input (except on links).
  // preventScroll stops the page jumping when it focuses.
  termBody.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') termInput.focus({ preventScroll: true });
  });

  // ---------------------------------------------------------
  // Boot sequence: types itself out once when the page loads.
  // ---------------------------------------------------------
  const boot = [
    [['MS-TECH OS v2.6 — secure link established', 'dim']],
    '',
    [['mike@mstech:~$ ', 'cmd'], ['whoami', 'cmd']],
    'Michael Sych. Web developer, photographer, ex-chef.',
    '',
    [['Type ', 'dim'], ['help', 'ok'], [' and press Enter to look around.', 'dim']],
  ];

  if (reduceMotion) {
    lines(boot); // print it all at once, no animation
  } else {
    // A function that calls itself with setTimeout prints one line at a time.
    let i = 0;
    const next = () => {
      if (i >= boot.length) return;
      print(boot[i]);
      i++;
      setTimeout(next, i === 3 ? 700 : 260); // longer pause after "whoami"
    };
    setTimeout(next, 900); // short delay before the boot starts
  }

  // ---------------------------------------------------------
  // Matrix rain easter egg: draws falling characters on a <canvas>
  // for 4 seconds, then removes itself.
  // Canvas tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
  // ---------------------------------------------------------
  function runMatrix() {
    if (reduceMotion) {
      print([['Wake up, Neo…', 'ok']]);
      return;
    }
    print([['Wake up, Neo…', 'ok']]);

    const canvas = document.createElement('canvas');
    canvas.className = 'matrix'; // CSS makes it cover the whole screen
    document.body.appendChild(canvas);

    // The 2D drawing context is what you actually draw with.
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const size = 16;                               // character size in px
    const cols = Math.floor(canvas.width / size);  // how many columns fit

    // One number per column = how far down that column's "drop" is.
    // Random negative starts make the columns fall at different times.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    const drops = Array(cols).fill(0).map(() => Math.random() * -50);
    const chars = 'アイウエオカキクケコサシスセソ0123456789MSTECH';

    // High-precision timestamp, used to stop after 4 seconds.
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    const start = performance.now();

    const frame = (now) => {
      // A see-through dark rectangle over the last frame makes the "trails".
      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect
      ctx.fillStyle = 'rgba(7, 5, 14, .15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = size + 'px monospace';

      drops.forEach((y, x) => {
        ctx.fillStyle = Math.random() > .9 ? '#ff3d9a' : '#19f0ff'; // 10% pink, 90% cyan
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x * size, y * size);
        // Past the bottom? Sometimes restart at the top; otherwise move down one row.
        drops[x] = y * size > canvas.height && Math.random() > .97 ? 0 : y + 1;
      });

      // requestAnimationFrame calls frame() again before the next screen refresh
      // (about 60 times a second). After 4 s, remove the canvas.
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
      if (now - start < 4000) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }
}


// =========================================================
// Project filters (projects page only)
// Buttons show/hide project cards by category.
// =========================================================
const filterButtons = document.querySelectorAll('.filter');

// [data-cat] matches only cards that have a data-cat="" attribute.
// https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
const projectCards = document.querySelectorAll('.project[data-cat]');
const filterCount = document.getElementById('filterCount');

if (filterButtons.length && projectCards.length) {
  const applyFilter = (cat) => {
    let shown = 0;

    projectCards.forEach((card) => {
      // dataset reads data-* attributes: data-cat="code" → card.dataset.cat
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
      const match = cat === 'all' || card.dataset.cat === cat;

      // The hidden property hides an element (CSS: .project[hidden] { display: none }).
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/hidden
      card.hidden = !match;
      if (match) shown++;
    });

    // aria-pressed tells screen readers which filter button is active.
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));

    // This element has aria-live in the HTML, so screen readers announce the change.
    if (filterCount) filterCount.textContent = 'Showing ' + shown + ' of ' + projectCards.length + ' projects';
  };

  filterButtons.forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
  applyFilter('all'); // start with everything shown
}


// =========================================================
// Kitchen to code translator ("A little extra" page)
// The switch swaps every meaning between its kitchen and code version.
// =========================================================
const glossary = document.getElementById('glossary');
const switchButtons = document.querySelectorAll('.switch-btn');

if (glossary && switchButtons.length) {
  switchButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode; // 'kitchen' or 'code'

      switchButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

      // Adds the .code class in code mode (CSS turns the text cyan and monospace).
      glossary.classList.toggle('code', mode === 'code');

      // forEach also gives the index (i), used to delay each row a little more.
      glossary.querySelectorAll('.meaning').forEach((el, i) => {
        el.classList.remove('flip');

        // Stagger each row so the change ripples down the list.
        setTimeout(() => {
          // Each meaning stores both versions: data-kitchen="…" and data-code="…"
          el.textContent = el.dataset[mode];

          // Reading offsetWidth forces the browser to apply the class removal
          // first, so the CSS animation restarts every time.
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void
          void el.offsetWidth;
          el.classList.add('flip');
        }, i * 60);
      });
    });
  });
}
