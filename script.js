const firebaseConfig = {
  apiKey: "AIzaSyDy7f5bnfNr7b9VE4XzUv2CPAnbJAXnGwU",
  authDomain: "ois-leaderboard-87d79.firebaseapp.com",
  projectId: "ois-leaderboard-87d79",
  storageBucket: "ois-leaderboard-87d79.firebasestorage.app",
  messagingSenderId: "682466996014",
  appId: "1:682466996014:web:8de9ed2eb3082233ac94bf",
  measurementId: "G-NS1FT50VWP"
};

// Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    console.log("Firebase initialized"); // test
    console.log("DB object:", db); // test

    // House IDs
    const houseEls = Array.from(document.querySelectorAll('.house')); // "const" is a local variable that value can't be changed and that can only be use under <script> = block-scoped
    //quearySelector select all components in website that is ".house" decalre in the CSS and html
    let currentData = {}; // "let" is a local variable that can only be use under <script> = block-scoped
    let initialized = false;
    

    // 🔢 Score animation
    function animateScore(el, from, to, done){
      const duration = 900;
      const start = performance.now();

      function step(now){
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(from + (to - from) * p);
        if(p < 1) requestAnimationFrame(step);
        else done && done();
      }
      requestAnimationFrame(step);
    }

    // 🎬 FLIP animation (whole card moves)
    function animateCards(sortedEls) {
      const firstPositions = new Map();
      
      // 1. Capture "First" positions
      houseEls.forEach(el => {
        firstPositions.set(el, el.getBoundingClientRect().top);
      });

      // 2. Apply new order (the "Last" position)
      sortedEls.forEach((el, i) => {
        el.style.order = i;
      });

      // 3. Play the animation
      requestAnimationFrame(() => {
        houseEls.forEach(el => {
          const lastTop = el.getBoundingClientRect().top;
          const firstTop = firstPositions.get(el);
          const dy = firstTop - lastTop;

          if (dy !== 0) {
            // If this is the card that actually gained points (has the 'updating' class)
            if (el.classList.contains('updating')) {
              // Pass the distance to CSS variable
              el.style.setProperty('--travel-dist', `${dy}px`);
              
              // Trigger the @keyframe animation
              el.classList.remove('moving-up');
              void el.offsetWidth; // Force reflow to restart animation
              el.classList.add('moving-up');

              // Clean up after animation finishes
              setTimeout(() => {
                el.classList.remove('moving-up', 'updating');
                el.style.removeProperty('--travel-dist');
              }, 800);
            } else {
              // For other cards (those being pushed down), use standard FLIP
              el.style.transform = `translateY(${dy}px)`;
              el.style.transition = 'none';
              
              requestAnimationFrame(() => {
                el.style.transition = 'transform 0.6s ease-out';
                el.style.transform = '';
              });
            }
          }
        });

        // Add visual glow to the current #1
        houseEls.forEach(el => el.classList.remove('leader'));
        sortedEls[0].classList.add('leader');
      });
    }

    // 🔥 Firebase realtime listener
    db.ref('Houses').on('value', snap => {
      const data = snap.val();
      if(!data) return;

      // 🟡 FIRST LOAD
      if(!initialized){
        houseEls.forEach(el => {
          const key = el.dataset.house;
          const scoreEl = el.querySelector('.score');
          const nameEl = el.querySelector('.name');

          // 1. Re-insert the real image (replaces the skeleton-img div)
          // Adjust the path to your local image files
          const imgMap = {
            red: 'icons8-red-panda-100.png',
            blue: 'icons8-animal-100.png',
            green: 'icons8-green-64.png',
            yellow: 'icons8-bee-top-view-100.png'
          };
          
          // 1. Set names and scores immediately after loading
          el.innerHTML = `
            <img src="${imgMap[key]}" alt="${data[key].name}">
            <div class="info"><p class="name">${data[key].name}</p></div>
            <div class="score">${data[key].score}</div>
          `;

          currentData[key] = data[key].score;
        });

        // 2. Sort them by score immediately
        const sorted = [...houseEls].sort(
          (a,b) => data[b.dataset.house].score - data[a.dataset.house].score
        );

        // 3. Apply the order right now
        sorted.forEach((el, i) => {
          el.style.order = i;
        });

        // 4. Mark the leader (optional)
        sorted[0].classList.add('leader');

        initialized = true; // Setup is done!
        return; // Stop here so we don't trigger the "Live Update" logic below
      }

      // 🟢 LIVE UPDATES
      let needsReorder = false;
      let activeHouseEl = null;

      houseEls.forEach(el => {
        const key = el.dataset.house;
        const scoreEl = el.querySelector('.score');
        const newScore = data[key].score;
        const oldScore = currentData[key];

        if (oldScore !== newScore) {
          needsReorder = true;
          activeHouseEl = el; // Track which card is actually changing

          // 1. Lift the card immediately
          el.classList.add('updating');

          // 2. Animate the numbers
          animateScore(
            scoreEl,
            oldScore,
            newScore,
            () => {
              // Optional: do something when counting finishes
            }
          );

          currentData[key] = newScore;
        }
      });

      if (needsReorder) {
        // 3. Small delay so the "lift" happens before the "slide"
        setTimeout(() => {
          const sorted = [...houseEls].sort(
            (a, b) => data[b.dataset.house].score - data[a.dataset.house].score
          );
          
          // This triggers the FLIP animation you already have
          animateCards(sorted);

          // 4. After the movement finishes (600ms is our CSS transition time)
          // Remove the "lifted" state
          setTimeout(() => {
            if (activeHouseEl) {
              activeHouseEl.classList.remove('updating');
            }
          }, 600);
        }, 100); 
      }

    });
