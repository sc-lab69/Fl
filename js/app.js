// ==========================================================================
// Main Application Controller
// Navigation, Scratch Block Interactive Explorer, Quiz, Asset Downloads
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Sound
  try {
    if (window.soundManager) {
      updateMuteButtonUI();
    }
  } catch (e) {
    console.warn('Sound init warning:', e);
  }

  // 2. Initialize 3D Hero
  try {
    if (typeof initThreeHero === 'function') {
      initThreeHero();
    }
  } catch (e) {
    console.warn('Three.js hero scene init warning:', e);
  }

  // 3. Initialize Mini Game
  try {
    if (typeof initMiniGame === 'function') {
      initMiniGame();
    }
  } catch (e) {
    console.warn('Mini-game init warning:', e);
  }

  // 4. Initialize Showcase
  try {
    if (typeof initShowcase === 'function') {
      initShowcase();
    }
  } catch (e) {
    console.warn('Showcase init warning:', e);
  }

  // 5. Setup Navigation
  try { setupNavigation(); } catch (e) { console.error('Navigation error:', e); }

  // 6. Setup Block Category Filter
  try { setupBlockExplorer(); } catch (e) { console.error('Block explorer error:', e); }

  // 7. Setup Interactive Quiz
  try { setupQuiz(); } catch (e) { console.error('Quiz error:', e); }

  // 8. Setup Sound Toggle Button
  try { setupSoundToggle(); } catch (e) { console.error('Sound toggle error:', e); }

  // 9. Setup Asset Download Generator
  try { setupAssetDownload(); } catch (e) { console.error('Asset download error:', e); }
});

// Navigation Handling
function setupNavigation() {
  const navLinks = document.querySelectorAll('[data-tab-target]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-tab-target');
      switchTab(targetId);
      if (window.soundManager) window.soundManager.playClick();
    });
  });
}

function switchTab(tabId) {
  // Update nav links active styling
  const navLinks = document.querySelectorAll('[data-tab-target]');
  navLinks.forEach(link => {
    if (link.getAttribute('data-tab-target') === tabId) {
      link.classList.add('text-blue-600', 'font-bold');
      link.classList.remove('text-slate-600');
    } else {
      link.classList.remove('text-blue-600', 'font-bold');
      link.classList.add('text-slate-600');
    }
  });

  // Switch tab visibility
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    if (tab.id === `tab-${tabId}`) {
      tab.classList.remove('hidden');
      setTimeout(() => tab.classList.add('active'), 10);
    } else {
      tab.classList.remove('active');
      tab.classList.add('hidden');
    }
  });

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // If switched to mini-game, trigger resize and render
  if (tabId === 'play-game' && window.miniGame) {
    setTimeout(() => {
      window.miniGame.initCanvas();
      window.miniGame.render();
    }, 100);
  }
}

// Sound toggle button setup
function setupSoundToggle() {
  const muteBtn = document.getElementById('btn-sound-toggle');
  if (!muteBtn) return;

  muteBtn.addEventListener('click', () => {
    if (window.soundManager) {
      const isMuted = window.soundManager.toggleMute();
      updateMuteButtonUI();
      if (!isMuted) window.soundManager.playClick();
    }
  });
}

function updateMuteButtonUI() {
  const muteBtn = document.getElementById('btn-sound-toggle');
  const icon = document.getElementById('sound-icon');
  const text = document.getElementById('sound-text');
  if (!muteBtn || !window.soundManager) return;

  if (window.soundManager.isMuted) {
    if (icon) icon.innerText = '🔇';
    if (text) text.innerText = 'ปิดเสียง';
    muteBtn.classList.add('bg-slate-200', 'text-slate-600');
    muteBtn.classList.remove('bg-blue-50', 'text-blue-600');
  } else {
    if (icon) icon.innerText = '🔊';
    if (text) text.innerText = 'เปิดเสียง';
    muteBtn.classList.add('bg-blue-50', 'text-blue-600');
    muteBtn.classList.remove('bg-slate-200', 'text-slate-600');
  }
}

// Scratch Block Explorer interactive filtering
function setupBlockExplorer() {
  const categoryBtns = document.querySelectorAll('.block-cat-btn');
  const blockItems = document.querySelectorAll('.block-item-card');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'scale-105'));
      btn.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500', 'scale-105');

      const cat = btn.getAttribute('data-block-category');
      if (window.soundManager) window.soundManager.playClick();

      blockItems.forEach(item => {
        if (cat === 'all' || item.getAttribute('data-block-cat') === cat) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

// Interactive Quiz Logic
const QUIZ_QUESTIONS = [
  {
    q: '1. ซองขนมกรุบกรอบหรือซองบะหมี่กึ่งสำเร็จรูป ควรทิ้งลงถังขยะสีใดในโรงเรียน?',
    options: [
      { text: 'ถังสีน้ำเงิน (ขยะทั่วไป)', correct: true, exp: 'ถูกต้อง! ซองขนมเป็นพลาสติกเคลือบอลูมิเนียมฟอยล์ รีไซเคิลไม่ได้ จัดเป็นขยะทั่วไป' },
      { text: 'ถังสีเหลือง (ขยะรีไซเคิล)', correct: false, exp: 'ไม่ถูกต้องนะจ๊ะ ซองขนมไม่สามารถนำไปหลอมรีไซเคิลได้ตามปกติ' },
      { text: 'ถังสีเขียว (ขยะเปียก)', correct: false, exp: 'ไม่ถูกต้อง! ซองขนมย่อยสลายเป็นปุ๋ยไม่ได้' },
      { text: 'ถังสีแดง (ขยะอันตราย)', correct: false, exp: 'ไม่ถูกต้อง! ซองขนมไม่มีสารเคมีอันตรายหรือสารพิษตกค้าง' }
    ]
  },
  {
    q: '2. หากต้องการให้ตัวละครขยะสุ่มตำแหน่งและตกลงมาจากด้านบนเรื่อยๆ ใน Scratch ควรใช้คำสั่งคู่ใด?',
    options: [
      { text: 'pick random (-200 to 200) ร่วมกับ change y by (-5)', correct: true, exp: 'ถูกต้อง! สุ่มพิกัดแกน X แล้วค่อยๆ ลดค่า Y ลงเรื่อยๆ เพื่อให้ขยะลอยลงมา' },
      { text: 'turn 15 degrees ร่วมกับ say Hello', correct: false, exp: 'ยังไม่ใช่จ้า นั่นเป็นการหมุนและส่งเสียงทักทาย' },
      { text: 'mouse x ร่วมกับ set volume to 100%', correct: false, exp: 'ยังไม่ใช่จ้า คำสั่งนี้ใช้กับตำแหน่งเมาส์และระดับเสียง' },
      { text: 'delete this clone ร่วมกับ stop all', correct: false, exp: 'ยังไม่ถูก คำสั่งนี้จะหยุดโปรแกรมทันที' }
    ]
  },
  {
    q: '3. บล็อกคำสั่งใดใช้ตรวจสอบว่า "ตัวละครขยะแตะโดนถังขยะสีเขียว" หรือไม่?',
    options: [
      { text: 'touching [ถังขยะเปียก]? ในหมวด Sensing', correct: true, exp: 'ถูกต้อง! บล็อกสีฟ้า Sensing ใช้ตรวจสอบการสัมผัสระหว่างตัวละคร' },
      { text: 'key space pressed? ในหมวด Motion', correct: false, exp: 'ไม่ใช่จ้า นั่นเป็นการตรวจจับการกดปุ่ม Spacebar' },
      { text: 'pick random 1 to 10 ในหมวด Operators', correct: false, exp: 'ไม่ใช่จ้า นั่นเป็นการสุ่มตัวเลข' },
      { text: 'change size by 10 ในหมวด Looks', correct: false, exp: 'ไม่ใช่จ้า นั่นคือการปรับขนาดตัวละคร' }
    ]
  },
  {
    q: '4. ข้อใดคือตัวอย่างของ "ขยะอันตราย" ที่ต้องทิ้งในถังขยะสีแดงเท่านั้น?',
    options: [
      { text: 'ถ่านไฟฉาย, หลอดไฟนีออน, ขวดน้ำยาล้างห้องน้ำ', correct: true, exp: 'ถูกต้อง! มีสารปรอท ตะกั่ว และสารเคมีกัดกร่อน ห้ามทิ้งปะปนเด็ดขาด' },
      { text: 'แกนแอปเปิ้ล, เปลือกแตงโม', correct: false, exp: 'ผิดจ้า สิ่งเหล่านี้คือขยะเปียก (ถังสีเขียว)' },
      { text: 'กระป๋องโค้ก, ขวดน้ำดื่ม PET', correct: false, exp: 'ผิดจ้า สิ่งเหล่านี้คือขยะรีไซเคิล (ถังสีเหลือง)' },
      { text: 'กระดาษทิชชูเปื้อน', correct: false, exp: 'ผิดจ้า ทิชชูใช้แล้วคือขยะทั่วไป (ถังสีน้ำเงิน)' }
    ]
  }
];

let currentQuizIndex = 0;
let quizScore = 0;

function setupQuiz() {
  renderQuizQuestion();

  const restartBtn = document.getElementById('quiz-restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentQuizIndex = 0;
      quizScore = 0;
      renderQuizQuestion();
      if (window.soundManager) window.soundManager.playClick();
    });
  }
}

function renderQuizQuestion() {
  const container = document.getElementById('quiz-card-container');
  const scoreCard = document.getElementById('quiz-result-card');
  if (!container || !scoreCard) return;

  if (currentQuizIndex >= QUIZ_QUESTIONS.length) {
    // Show final score card
    container.classList.add('hidden');
    scoreCard.classList.remove('hidden');

    const scoreDisplay = document.getElementById('quiz-final-score');
    if (scoreDisplay) scoreDisplay.innerText = `${quizScore} / ${QUIZ_QUESTIONS.length}`;

    if (window.soundManager) window.soundManager.playVictory();
    return;
  }

  container.classList.remove('hidden');
  scoreCard.classList.add('hidden');

  const qData = QUIZ_QUESTIONS[currentQuizIndex];
  const qTitle = document.getElementById('quiz-question-title');
  const qProgress = document.getElementById('quiz-progress-text');
  const optionsBox = document.getElementById('quiz-options-box');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const nextBtn = document.getElementById('quiz-next-btn');

  if (qTitle) qTitle.innerText = qData.q;
  if (qProgress) qProgress.innerText = `คำถามข้อที่ ${currentQuizIndex + 1} จาก ${QUIZ_QUESTIONS.length}`;
  if (feedbackBox) feedbackBox.classList.add('hidden');
  if (nextBtn) nextBtn.classList.add('hidden');

  if (optionsBox) {
    optionsBox.innerHTML = qData.options.map((opt, i) => `
      <button 
        class="quiz-option-btn w-full text-left p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-slate-800 text-sm flex items-center justify-between"
        onclick="handleQuizAnswer(${i})"
      >
        <span>${opt.text}</span>
        <span class="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400">
          ${String.fromCharCode(65 + i)}
        </span>
      </button>
    `).join('');
  }
}

window.handleQuizAnswer = function(chosenIndex) {
  const qData = QUIZ_QUESTIONS[currentQuizIndex];
  const chosenOpt = qData.options[chosenIndex];
  const optionButtons = document.querySelectorAll('.quiz-option-btn');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const nextBtn = document.getElementById('quiz-next-btn');

  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (qData.options[idx].correct) {
      btn.classList.remove('border-slate-200', 'bg-white');
      btn.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-800', 'font-bold');
    } else if (idx === chosenIndex) {
      btn.classList.remove('border-slate-200', 'bg-white');
      btn.classList.add('border-rose-500', 'bg-rose-50', 'text-rose-800');
    }
  });

  if (chosenOpt.correct) {
    quizScore++;
    if (window.soundManager) window.soundManager.playCorrect();
  } else {
    if (window.soundManager) window.soundManager.playWrong();
  }

  if (feedbackBox) {
    feedbackBox.innerHTML = `
      <div class="p-4 rounded-2xl ${chosenOpt.correct ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'} text-xs leading-relaxed">
        <span class="font-bold">${chosenOpt.correct ? '🎉 ยอดเยี่ยมมาก!' : '💡 คำอธิบาย:'}</span> ${chosenOpt.exp}
      </div>
    `;
    feedbackBox.classList.remove('hidden');
  }

  if (nextBtn) {
    nextBtn.classList.remove('hidden');
  }
};

window.nextQuizQuestion = function() {
  currentQuizIndex++;
  renderQuizQuestion();
  if (window.soundManager) window.soundManager.playClick();
};

// Asset Starter Pack Download (Generates an SVG zip or direct assets for Scratch)
function setupAssetDownload() {
  const downloadBtn = document.getElementById('download-assets-btn');
  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', () => {
    if (window.soundManager) window.soundManager.playPop();

    // Create a data guide file + SVG assets text bundle
    const assetGuideContent = `================================================================================
ชุดสื่อ Assets สำหรับนำไปสร้างเกม "คัดแยกขยะในโรงเรียน" บนโปรแกรม Scratch 3.0
================================================================================

1. ถังขยะ 4 สีตามมาตรฐานโรงเรียนไทย:
   - ถังสีน้ำเงิน (ขยะทั่วไป): ทิชชู, ซองขนมขบเคี้ยว, กล่องโฟม
   - ถังสีเขียว (ขยะเปียก): เศษอาหาร, ก้างปลา, เปลือกกล้วย, ใบไม้แห้ง
   - ถังสีเหลือง (ขยะรีไซเคิล): ขวดพลาสติกใส PET, กระป๋องน้ำอัดลม, ลังกระดาษ
   - ถังสีแดง (ขยะอันตราย): ถ่านไฟฉาย, หลอดไฟนีออน, สเปรย์สารเคมี

2. ตัวแปรที่แนะนำให้สร้างใน Scratch:
   - "Score" (คะแนน)
   - "Timer" (เวลาที่เหลือ)
   - "Combo" (คอมโบการทิ้งถูกต่อเนื่อง)

3. ลิงก์โปรเจกต์ Scratch สำหรับดูตัวอย่างโค้ด:
   https://scratch.mit.edu/projects/10128407/

ขอให้น้องๆ สนุกกับการสร้างสรรค์ผลงานเกมรักษ์โลกด้วย Scratch ครับ!
`;

    const blob = new Blob([assetGuideContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Scratch_Waste_Sorting_Game_Assets_Guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showcaseManager) {
      window.showcaseManager.showToast('ดาวน์โหลดคู่มือและเตรียมข้อมูล Assets เรียบร้อยแล้ว!');
    }
  });
}
