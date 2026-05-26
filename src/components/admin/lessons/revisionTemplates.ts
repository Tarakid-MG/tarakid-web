export interface RevisionAsset {
  key: string;
  name: string;
  url: string;
}

export interface RevisionTemplateFormValues {
  badge: string;
  heroTitle: string;
  lessonTitle: string;
  lessonDescription: string;
  introText: string;
  sentencePattern: string;
  keywords: string;
  bucketName: string;
}

interface RevisionTemplateWord {
  word: string;
  label: string;
  url: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSentence(pattern: string, word: string): string {
  if (pattern.includes("{word}")) {
    return pattern.replaceAll("{word}", word);
  }

  const trimmedPattern = pattern.trim();
  if (!trimmedPattern) return word;
  if (/[.!?]$/.test(trimmedPattern)) {
    return `${trimmedPattern.slice(0, -1)} ${word}${trimmedPattern.slice(-1)}`;
  }
  return `${trimmedPattern} ${word}`;
}

function parseKeywords(keywords: string): string[] {
  return keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function matchAssetForKeyword(assets: RevisionAsset[], keyword: string) {
  const target = slugify(keyword);
  return assets.find((asset) => slugify(asset.name) === target);
}

function buildTemplateWords(
  keywords: string,
  assets: RevisionAsset[],
): RevisionTemplateWord[] {
  return parseKeywords(keywords).map((keyword) => {
    const word = keyword.toLowerCase();
    const match = matchAssetForKeyword(assets, keyword);

    return {
      word,
      label: titleCase(keyword),
      url: match?.url || "",
    };
  });
}

export function createFavoriteToysPreset(): RevisionTemplateFormValues {
  return {
    badge: "Level 0 Revision",
    heroTitle: "My Favorite Toys",
    lessonTitle: "Revision - My Favorite Toys",
    lessonDescription:
      "Vocabulary flip cards, an exercise, and a memory game to revise Unit 1 Lesson 1 for Level 0.",
    introText:
      "Let’s revise the key sentence “It’s a...” with toy flip cards, a choose-the-picture exercise, and a fun memory game.",
    sentencePattern: "It's a {word}.",
    keywords: "ball, bike, car, doll, train",
    bucketName: "level0",
  };
}

export function createRevisionTemplateDefaults(
  levelCode = "L0",
): RevisionTemplateFormValues {
  const normalizedLevel = levelCode.toUpperCase();
  const levelNumber = normalizedLevel.replace(/^L/, "");

  return {
    badge: `${normalizedLevel} Revision`,
    heroTitle: "My Revision Lesson",
    lessonTitle: "Revision Lesson",
    lessonDescription:
      "Interactive vocabulary revision with flip cards, an exercise, and a memory game.",
    introText:
      "Let’s revise the key words with flip cards, a choose-the-picture exercise, and a fun memory game.",
    sentencePattern: "It's a {word}.",
    keywords: "",
    bucketName: `level${levelNumber || "0"}`,
  };
}

export function buildRevisionLesson(
  config: RevisionTemplateFormValues,
  assets: RevisionAsset[],
) {
  const words = buildTemplateWords(config.keywords, assets);
  const safeWords = words.map((word) => ({
    ...word,
    label: escapeHtml(word.label),
    url: escapeHtml(word.url),
    sentence: escapeHtml(buildSentence(config.sentencePattern, word.word)),
  }));
  const assetJson = JSON.stringify(
    words.map((word) => ({
      ...word,
      sentence: buildSentence(config.sentencePattern, word.word),
    })),
  );

  const content = `
<div id="tarakid-revision-root">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Trebuchet MS', 'Comic Sans MS', sans-serif; background: linear-gradient(180deg, #dff6ff 0%, #fffbea 100%); color: #202a44; }
    #tarakid-revision-root { min-height: 100vh; padding: 24px; background:
      radial-gradient(circle at top left, rgba(255,255,255,0.95), transparent 35%),
      radial-gradient(circle at top right, rgba(255,220,120,0.32), transparent 28%),
      linear-gradient(180deg, #d8f3ff 0%, #fff7db 55%, #ffffff 100%); }
    .shell { max-width: 1120px; margin: 0 auto; display: grid; gap: 24px; }
    .hero { border-radius: 32px; padding: 28px; background: linear-gradient(135deg, #ffffff 0%, #fff8de 100%); box-shadow: 0 20px 45px rgba(32, 42, 68, 0.14); border: 4px solid rgba(255,255,255,0.9); position: relative; overflow: hidden; }
    .hero::after { content: ""; position: absolute; inset: auto -80px -80px auto; width: 220px; height: 220px; background: radial-gradient(circle, rgba(33,158,188,0.18), transparent 68%); }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: rgba(33,158,188,0.12); color: #219ebc; font-size: 12px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
    h1 { margin: 16px 0 10px; font-size: clamp(34px, 5vw, 54px); line-height: 1; color: #219ebc; text-shadow: 0 4px 0 rgba(255,255,255,0.9); }
    .hero p { margin: 0; font-size: 18px; font-weight: 700; color: rgba(32,42,68,0.8); max-width: 720px; }
    .toy-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
    .toy-pill { padding: 10px 16px; border-radius: 999px; background: white; border: 2px solid rgba(33,158,188,0.12); box-shadow: 0 10px 20px rgba(32,42,68,0.08); font-size: 14px; font-weight: 900; color: #202a44; }
    .section { border-radius: 32px; background: rgba(255,255,255,0.95); border: 4px solid rgba(255,255,255,0.9); box-shadow: 0 18px 38px rgba(32,42,68,0.1); padding: 24px; }
    .section-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
    .section-title { margin: 0; font-size: clamp(24px, 3vw, 36px); color: #202a44; }
    .section-copy { margin: 6px 0 0; color: rgba(32,42,68,0.72); font-weight: 700; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .flip-card { perspective: 1200px; min-height: 252px; }
    .flip-card button { width: 100%; min-height: 252px; border: none; background: transparent; padding: 0; cursor: pointer; }
    .flip-inner { position: relative; width: 100%; min-height: 252px; transform-style: preserve-3d; transition: transform 0.55s; }
    .flip-card.is-flipped .flip-inner { transform: rotateY(180deg); }
    .face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 18px; text-align: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8); }
    .face-front { background: linear-gradient(180deg, #f0fbff 0%, #ffffff 100%); border: 3px solid rgba(33,158,188,0.18); }
    .face-back { background: linear-gradient(180deg, #219ebc 0%, #49c9f0 100%); color: white; transform: rotateY(180deg); border: 3px solid rgba(255,255,255,0.8); }
    .face img { width: 112px; height: 112px; object-fit: contain; filter: drop-shadow(0 10px 16px rgba(32,42,68,0.16)); }
    .face .toy-word { font-size: 26px; font-weight: 900; margin: 0; }
    .face .toy-line { font-size: 18px; font-weight: 900; margin: 0; }
    .face .tiny { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 900; opacity: 0.72; }
    .exercise-stage { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: start; }
    .prompt-card { border-radius: 28px; padding: 24px; background: linear-gradient(145deg, #202a44 0%, #2c3e66 100%); color: white; box-shadow: 0 16px 36px rgba(32,42,68,0.22); }
    .prompt-label { font-size: 12px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.72); }
    .prompt-text { margin: 14px 0 10px; font-size: clamp(28px, 4vw, 44px); font-weight: 900; }
    .prompt-subtext { margin: 0; font-size: 16px; color: rgba(255,255,255,0.84); font-weight: 700; }
    .choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 14px; }
    .choice { border: none; cursor: pointer; border-radius: 24px; padding: 14px; background: white; border: 3px solid rgba(32,42,68,0.08); box-shadow: 0 12px 24px rgba(32,42,68,0.08); transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
    .choice:hover { transform: translateY(-3px); border-color: rgba(33,158,188,0.3); box-shadow: 0 14px 28px rgba(33,158,188,0.14); }
    .choice img { width: 90px; height: 90px; object-fit: contain; }
    .choice span { display: block; margin-top: 8px; font-size: 18px; font-weight: 900; color: #202a44; }
    .choice.correct { border-color: #38b000; background: linear-gradient(180deg, #f0ffe7 0%, #ffffff 100%); }
    .choice.wrong { border-color: #ef476f; background: linear-gradient(180deg, #fff1f4 0%, #ffffff 100%); }
    .feedback { margin-top: 16px; padding: 14px 18px; border-radius: 18px; font-weight: 900; font-size: 16px; display: inline-block; }
    .feedback.good { background: rgba(56,176,0,0.12); color: #2b9348; }
    .feedback.bad { background: rgba(239,71,111,0.12); color: #d90429; }
    .game-board { display: grid; grid-template-columns: repeat(5, minmax(110px, 1fr)); gap: 14px; }
    .memory-card { aspect-ratio: 1 / 1; border: none; border-radius: 24px; background: transparent; cursor: pointer; perspective: 1200px; padding: 0; }
    .memory-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.5s; }
    .memory-card.is-open .memory-inner { transform: rotateY(180deg); }
    .memory-face { position: absolute; inset: 0; border-radius: 24px; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; text-align: center; padding: 12px; font-weight: 900; box-shadow: 0 14px 24px rgba(32,42,68,0.1); }
    .memory-front { background: linear-gradient(145deg, #219ebc 0%, #49c9f0 100%); color: white; font-size: 40px; border: 3px solid rgba(255,255,255,0.92); }
    .memory-back { transform: rotateY(180deg); background: linear-gradient(180deg, #ffffff 0%, #fff6db 100%); border: 3px solid rgba(255,200,87,0.35); color: #202a44; flex-direction: column; gap: 8px; }
    .memory-back img { width: 74px; height: 74px; object-fit: contain; }
    .scorebar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .score-chip { padding: 10px 16px; border-radius: 999px; background: rgba(33,158,188,0.12); color: #219ebc; font-weight: 900; }
    .cta { margin-top: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 18px; border: none; border-radius: 999px; background: #f77f00; color: white; font-weight: 900; cursor: pointer; box-shadow: 0 12px 24px rgba(247,127,0,0.24); }
    @media (max-width: 860px) {
      #tarakid-revision-root { padding: 14px; }
      .exercise-stage { grid-template-columns: 1fr; }
      .game-board { grid-template-columns: repeat(2, minmax(120px, 1fr)); }
    }
  </style>

  <div class="shell">
    <section class="hero">
      <div class="badge">${escapeHtml(config.badge)}</div>
      <h1>${escapeHtml(config.heroTitle)}</h1>
      <p>${escapeHtml(config.introText)}</p>
      <div class="toy-row">
        ${safeWords.map((word) => `<div class="toy-pill">${word.sentence}</div>`).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Vocabulary Flip Cards</h2>
          <p class="section-copy">Tap each card, say the word, then read the sentence.</p>
        </div>
        <div class="score-chip">Flip and speak</div>
      </div>
      <div class="cards">
        ${safeWords
          .map(
            (word, index) => `
              <div class="flip-card" data-flip-card="${index}">
                <button type="button" aria-label="Flip ${word.label} card">
                  <div class="flip-inner">
                    <div class="face face-front">
                      <div class="tiny">Tap to discover</div>
                      <img src="${word.url}" alt="${word.label}" />
                      <p class="toy-line">What is it?</p>
                    </div>
                    <div class="face face-back">
                      <div class="tiny">Great job</div>
                      <p class="toy-word">${word.label}</p>
                      <p class="toy-line">${word.sentence}</p>
                    </div>
                  </div>
                </button>
              </div>`,
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Exercise Time</h2>
          <p class="section-copy">Read the sentence and click the matching picture.</p>
        </div>
        <div class="scorebar">
          <div class="score-chip" id="exercise-score">Score: 0 / ${safeWords.length}</div>
        </div>
      </div>

      <div class="exercise-stage">
        <div class="prompt-card">
          <div class="prompt-label">Read aloud</div>
          <div class="prompt-text" id="exercise-prompt">${safeWords[0]?.sentence || ""}</div>
          <p class="prompt-subtext">Can you choose the correct picture?</p>
          <div id="exercise-feedback"></div>
          <button type="button" class="cta" id="exercise-next">Next word</button>
        </div>
        <div class="choices" id="exercise-choices"></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Memory Match Game</h2>
          <p class="section-copy">Match each picture with its word.</p>
        </div>
        <div class="scorebar">
          <div class="score-chip" id="match-count">Pairs found: 0 / ${safeWords.length}</div>
          <button type="button" class="cta" id="restart-memory">Play again</button>
        </div>
      </div>
      <div class="game-board" id="memory-board"></div>
    </section>
  </div>

  <script>
    (function () {
      const lessonWords = ${assetJson};

      document.querySelectorAll('[data-flip-card]').forEach((card) => {
        card.addEventListener('click', function () {
          card.classList.toggle('is-flipped');
        });
      });

      let exerciseIndex = 0;
      let exerciseScore = 0;
      const promptEl = document.getElementById('exercise-prompt');
      const choicesEl = document.getElementById('exercise-choices');
      const feedbackEl = document.getElementById('exercise-feedback');
      const scoreEl = document.getElementById('exercise-score');
      const nextBtn = document.getElementById('exercise-next');

      function renderExercise() {
        const current = lessonWords[exerciseIndex];
        promptEl.textContent = current.sentence;
        feedbackEl.innerHTML = "";
        choicesEl.innerHTML = "";

        lessonWords.forEach((asset) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'choice';
          button.innerHTML = '<img src="' + asset.url + '" alt="' + asset.word + '" /><span>' + asset.word + '</span>';
          button.addEventListener('click', function () {
            const isCorrect = asset.word === current.word;
            choicesEl.querySelectorAll('.choice').forEach((choice) => {
              choice.disabled = true;
            });
            button.classList.add(isCorrect ? 'correct' : 'wrong');
            if (isCorrect) {
              exerciseScore += 1;
              feedbackEl.innerHTML = '<div class="feedback good">Super! ' + current.sentence + '</div>';
            } else {
              feedbackEl.innerHTML = '<div class="feedback bad">Try again next one. ' + current.sentence + '</div>';
              Array.from(choicesEl.children).forEach((child, index) => {
                if (lessonWords[index].word === current.word) child.classList.add('correct');
              });
            }
            scoreEl.textContent = 'Score: ' + exerciseScore + ' / ' + lessonWords.length;
          });
          choicesEl.appendChild(button);
        });
      }

      nextBtn.addEventListener('click', function () {
        exerciseIndex = (exerciseIndex + 1) % lessonWords.length;
        renderExercise();
      });

      const boardEl = document.getElementById('memory-board');
      const matchCountEl = document.getElementById('match-count');
      const restartMemoryBtn = document.getElementById('restart-memory');
      let firstCard = null;
      let secondCard = null;
      let lockBoard = false;
      let foundPairs = 0;

      function shuffle(items) {
        return items
          .map((item) => ({ item, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ item }) => item);
      }

      function createMemoryDeck() {
        const cards = [];
        lessonWords.forEach((asset) => {
          cards.push({ pairId: asset.word, type: 'image', label: asset.word, url: asset.url, sentence: asset.sentence });
          cards.push({ pairId: asset.word, type: 'word', label: asset.word, url: asset.url, sentence: asset.sentence });
        });
        return shuffle(cards);
      }

      function resetMemoryTurn() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
      }

      function updateMatchCount() {
        matchCountEl.textContent = 'Pairs found: ' + foundPairs + ' / ' + lessonWords.length;
      }

      function renderMemoryGame() {
        const deck = createMemoryDeck();
        boardEl.innerHTML = '';
        foundPairs = 0;
        updateMatchCount();
        resetMemoryTurn();

        deck.forEach((cardData) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'memory-card';
          button.dataset.pairId = cardData.pairId;
          button.dataset.cardType = cardData.type;
          button.innerHTML =
            '<div class="memory-inner">' +
              '<div class="memory-face memory-front">★</div>' +
              '<div class="memory-face memory-back">' +
                (cardData.type === 'image'
                  ? '<img src="' + cardData.url + '" alt="' + cardData.label + '" /><div>' + cardData.label + '</div>'
                  : '<div style="font-size:28px;">' + cardData.label + '</div><div class="tiny">' + cardData.sentence + '</div>') +
              '</div>' +
            '</div>';

          button.addEventListener('click', function () {
            if (lockBoard || button === firstCard || button.classList.contains('is-open')) return;

            button.classList.add('is-open');

            if (!firstCard) {
              firstCard = button;
              return;
            }

            secondCard = button;
            lockBoard = true;

            const isMatch =
              firstCard.dataset.pairId === secondCard.dataset.pairId &&
              firstCard.dataset.cardType !== secondCard.dataset.cardType;

            if (isMatch) {
              foundPairs += 1;
              updateMatchCount();
              if (foundPairs === lessonWords.length) {
                matchCountEl.textContent = 'Pairs found: ' + foundPairs + ' / ' + lessonWords.length + ' - Amazing!';
              }
              resetMemoryTurn();
              return;
            }

            setTimeout(function () {
              firstCard.classList.remove('is-open');
              secondCard.classList.remove('is-open');
              resetMemoryTurn();
            }, 900);
          });

          boardEl.appendChild(button);
        });
      }

      restartMemoryBtn.addEventListener('click', renderMemoryGame);

      renderExercise();
      renderMemoryGame();
    })();
  </script>
</div>`.trim();

  return {
    title: config.lessonTitle,
    description: config.lessonDescription,
    content,
  };
}

export function buildFavoriteToysRevisionLesson(assets: RevisionAsset[]) {
  return buildRevisionLesson(createFavoriteToysPreset(), assets);
}
