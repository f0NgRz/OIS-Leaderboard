const firebaseConfig = {
  apiKey: "AIzaSyDy7f5bnfNr7b9VE4XzUv2CPAnbJAXnGwU",
  authDomain: "ois-leaderboard-87d79.firebaseapp.com",
  projectId: "ois-leaderboard-87d79",
  storageBucket: "ois-leaderboard-87d79.firebasestorage.app",
  messagingSenderId: "682466996014",
  appId: "1:682466996014:web:8de9ed2eb3082233ac94bf",
  measurementId: "G-NS1FT50VWP"
};

    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    console.log("Firebase initialized"); // test
    console.log("DB object:", db); // test

    const houseEls = Array.from(document.querySelectorAll('.house'));
    let currentData = {};
    let initialized = false;
    

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

    function animateCards(sortedEls) {
      const firstPositions = new Map();
      
      houseEls.forEach(el => {
        firstPositions.set(el, el.getBoundingClientRect().top);
      });

      sortedEls.forEach((el, i) => {
        el.style.order = i;
      });

      requestAnimationFrame(() => {
        houseEls.forEach(el => {
          const lastTop = el.getBoundingClientRect().top;
          const firstTop = firstPositions.get(el);
          const dy = firstTop - lastTop;

          if (dy !== 0) {
            if (el.classList.contains('updating')) {
              el.style.setProperty('--travel-dist', `${dy}px`);
              
              el.classList.remove('moving-up');
              void el.offsetWidth;
              el.classList.add('moving-up');
              
              setTimeout(() => {
                el.classList.remove('moving-up', 'updating');
                el.style.removeProperty('--travel-dist');
              }, 800);
            } else {

              el.style.transform = `translateY(${dy}px)`;
              el.style.transition = 'none';
              
              requestAnimationFrame(() => {
                el.style.transition = 'transform 0.6s ease-out';
                el.style.transform = '';
              });
            }
          }
        });


        houseEls.forEach(el => el.classList.remove('leader'));
        sortedEls[0].classList.add('leader');
      });
    }

    db.ref('Houses').on('value', snap => {
      const data = snap.val();
      if(!data) return;

      // 🟡 FIRST LOAD
      if(!initialized){
        houseEls.forEach(el => {
          const key = el.dataset.house;
          const scoreEl = el.querySelector('.score');
          const nameEl = el.querySelector('.name');

          const imgMap = {
            red: 'red.png',
            blue: 'blue.png',
            green: 'green.png',
            yellow: 'yellow.png'
          };
          
 
          el.innerHTML = `
            <img src="${imgMap[key]}" alt="${data[key].name}">
            <div class="info"><p class="name">${data[key].name}</p></div>
            <div class="score">${data[key].score}</div>
          `;

          currentData[key] = data[key].score;
        });


        const sorted = [...houseEls].sort(
          (a,b) => data[b.dataset.house].score - data[a.dataset.house].score
        );


        sorted.forEach((el, i) => {
          el.style.order = i;
        });


        sorted[0].classList.add('leader');

        initialized = true;
        return; 
      }


      let needsReorder = false;
      let activeHouseEl = null;

      houseEls.forEach(el => {
        const key = el.dataset.house;
        const scoreEl = el.querySelector('.score');
        const newScore = data[key].score;
        const oldScore = currentData[key];

        if (oldScore !== newScore) {
          needsReorder = true;
          activeHouseEl = el; 

  
          el.classList.add('updating');


          animateScore(
            scoreEl,
            oldScore,
            newScore,
            () => {

            }
          );

          currentData[key] = newScore;
        }
      });

      if (needsReorder) {

        setTimeout(() => {
          const sorted = [...houseEls].sort(
            (a, b) => data[b.dataset.house].score - data[a.dataset.house].score
          );
          

          animateCards(sorted);


          setTimeout(() => {
            if (activeHouseEl) {
              activeHouseEl.classList.remove('updating');
            }
          }, 600);
        }, 100); 
      }

    });

