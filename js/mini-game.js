// ==========================================================================
// Mini Waste Sorting Simulator Game (HTML5 Canvas 2D with 3D-Style Bins)
// Designed to match the 3D stylized recycling bins from the Scratch Cat reference
// ==========================================================================

class MiniWasteGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Game State
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('waste_game_highscore') || '0', 10);
    this.timeLeft = 60;
    this.combo = 0;
    this.maxCombo = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.timerInterval = null;
    this.spawnInterval = null;

    // Items and Effects
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];
    this.draggedItem = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // Load Mascot Image for visual feedback
    this.mascotImg = new Image();
    this.mascotImg.src = 'assets/scratch_cat_3d_bins.png';
    this.mascotLoaded = false;
    this.mascotImg.onload = () => { this.mascotLoaded = true; };

    // Waste Database strictly aligned with the 4 bins in reference photo:
    // 🟢 Green: Organic (Apple, Banana, Lettuce)
    // 🔵 Blue: Paper & Cardboard (Paper, Boxes, Tissue)
    // 🟡 Yellow: Plastics (Bottles, Jugs, Bags)
    // 🟣 Purple: Metals & Cans (Soda cans, Tin cans, Battery)
    this.wasteLibrary = [
      // 🟢 Organic (Green Bin)
      { name: 'กล้วยหอมสุก', type: 'organic', color: '#16a34a', icon: '🍌', hint: 'เปลือกกล้วยและผลไม้ เป็นขยะเปียกอินทรีย์ นำไปทำปุ๋ยหมักได้' },
      { name: 'แอปเปิ้ลแดง', type: 'organic', color: '#16a34a', icon: '🍎', hint: 'เศษผลไม้ย่อยสลายได้ตามธรรมชาติ ทิ้งถังสีเขียว' },
      { name: 'ผักกาดและเศษผัก', type: 'organic', color: '#16a34a', icon: '🥬', hint: 'เศษพืชผักจากโรงอาหาร ทิ้งลงถังขยะเปียก' },
      { name: 'เศษข้าวโพด & อาหาร', type: 'organic', color: '#16a34a', icon: '🌽', hint: 'เศษอาหารเน่าเสียง่าย เป็นขยะอินทรีย์' },

      // 🔵 Paper & Cardboard (Blue Bin)
      { name: 'ลังกระดาษลูกฟูก', type: 'paper', color: '#2563eb', icon: '📦', hint: 'กล่องกระดาษสะอาด สามารถนำไปรีไซเคิลทำกระดาษใหม่ได้' },
      { name: 'หนังสือพิมพ์เก่า', type: 'paper', color: '#2563eb', icon: '📰', hint: 'กระดาษหนังสือพิมพ์สะอาด จัดเป็นขยะกระดาษ' },
      { name: 'กระดาษรายงาน A4', type: 'paper', color: '#2563eb', icon: '📄', hint: 'เศษกระดาษสมุดหรือเอกสาร นำกลับมารีไซเคิลได้' },
      { name: 'แก้วกาแฟกระดาษ', type: 'paper', color: '#2563eb', icon: '☕', hint: 'บรรจุภัณฑ์กระดาษ ทิ้งลงถังกระดาษสีน้ำเงิน' },

      // 🟡 Plastics (Yellow Bin)
      { name: 'ขวดน้ำดื่มใส PET', type: 'plastic', color: '#eab308', icon: '🍶', hint: 'ขวดพลาสติกใส แปรรูปเป็นเส้นใยเสื้อผ้าหรือขวดใหม่ได้' },
      { name: 'แกลลอนนมพลาสติก', type: 'plastic', color: '#eab308', icon: '🥛', hint: 'พลาสติกขาวขุ่น (HDPE) นำไปหลอมรีไซเคิลได้' },
      { name: 'แก้วน้ำพลาสติก', type: 'plastic', color: '#eab308', icon: '🥤', hint: 'พลาสติกเนื้อใส ทิ้งลงถังพลาสติกรีไซเคิลสีเหลือง' },
      { name: 'ขวดแชมพู / สบู่', type: 'plastic', color: '#eab308', icon: '🧴', hint: 'ขวดบรรจุภัณฑ์พลาสติก ทำความสะอาดแล้วรีไซเคิลได้' },

      // 🟣 Metals & Cans (Purple Bin)
      { name: 'กระป๋องน้ำอัดลม', type: 'metal', color: '#9333ea', icon: '🥤', hint: 'กระป๋องอะลูมิเนียม หลอมใหม่ได้ 100% ประหยัดพลังงานมาก' },
      { name: 'กระป๋องปลากระป๋อง', type: 'metal', color: '#9333ea', icon: '🥫', hint: 'กระป๋องโลหะ/ดีบุก ล้างแล้วแยกทิ้งถังโลหะ' },
      { name: 'กระป๋องบี้แบน', type: 'metal', color: '#9333ea', icon: '⚙️', hint: 'เศษกระป๋องเครื่องดื่มอลูมิเนียม จัดเป็นขยะโลหะ' },
      { name: 'ถ่านไฟฉายเก่า', type: 'metal', color: '#9333ea', icon: '🔋', hint: 'มีสารเคมีโลหะอันตราย ทิ้งในถังแยกพิเศษ' }
    ];

    this.bins = [];

    this.initCanvas();
    this.bindEvents();
    this.updateUI();
    this.render();
  }

  initCanvas() {
    const parent = this.canvas ? this.canvas.parentElement : null;
    const parentW = (parent && parent.clientWidth > 100) ? parent.clientWidth : 850;
    const width = Math.min(Math.max(parentW - 32, 320), 920);
    const height = 570;

    this.canvas.width = width;
    this.canvas.height = height;

    const binWidth = Math.min(160, (width - 50) / 4);
    const binHeight = 130;
    const binSpacing = (width - (binWidth * 4)) / 5;
    const binY = height - binHeight - 92;

    // 4 Stylized 3D Bins strictly following the attached image:
    // Green -> Blue -> Yellow -> Purple
    // Each bin has explicit symbols, bin type label, and accepted waste description
    this.bins = [
      {
        id: 'organic',
        type: 'organic',
        title: 'ขยะเปียก (อินทรีย์)',
        shortTitle: 'ขยะเปียก',
        sub: 'ย่อยสลายได้ • ทำปุ๋ยหมัก',
        accepts: 'เศษอาหาร • ผลไม้ • ผัก',
        shortAccepts: 'อาหาร/ผลไม้/ผัก',
        mainColor: '#22c55e',
        lightColor: '#86efac',
        darkColor: '#15803d',
        deepColor: '#14532d',
        rimColor: '#16a34a',
        innerColor: '#052e16',
        badgeBg: '#15803d',
        icon: '🍌',
        colorPill: '🟢 ถังเขียว',
        itemsPeeking: ['🍌', '🍎'],
        symbols: ['🍌', '🍎', '🥬'],
        x: binSpacing,
        y: binY,
        w: binWidth,
        h: binHeight,
        scale: 1
      },
      {
        id: 'paper',
        type: 'paper',
        title: 'ขยะกระดาษ & ลัง',
        shortTitle: 'ขยะกระดาษ',
        sub: 'กระดาษแห้ง • รีไซเคิล',
        accepts: 'ลังลูกฟูก • กล่อง • สมุด',
        shortAccepts: 'ลัง/กล่อง/สมุด',
        mainColor: '#3b82f6',
        lightColor: '#93c5fd',
        darkColor: '#1d4ed8',
        deepColor: '#1e3a8a',
        rimColor: '#2563eb',
        innerColor: '#0f172a',
        badgeBg: '#1d4ed8',
        icon: '📦',
        colorPill: '🔵 ถังน้ำเงิน',
        itemsPeeking: ['📦', '📄'],
        symbols: ['📦', '📄', '📰'],
        x: binSpacing * 2 + binWidth,
        y: binY,
        w: binWidth,
        h: binHeight,
        scale: 1
      },
      {
        id: 'plastic',
        type: 'plastic',
        title: 'ขยะพลาสติก (รีไซเคิล)',
        shortTitle: 'ขยะพลาสติก',
        sub: 'ขวด/แก้ว • หลอมใหม่',
        accepts: 'ขวดใส PET • แกลลอน • แก้ว',
        shortAccepts: 'ขวดPET/แก้ว/ถุง',
        mainColor: '#eab308',
        lightColor: '#fef08a',
        darkColor: '#a16207',
        deepColor: '#713f12',
        rimColor: '#ca8a04',
        innerColor: '#451a03',
        badgeBg: '#b45309',
        icon: '🍶',
        colorPill: '🟡 ถังเหลือง',
        itemsPeeking: ['🍶', '🥛'],
        symbols: ['🍶', '🥛', '🧃'],
        x: binSpacing * 3 + binWidth * 2,
        y: binY,
        w: binWidth,
        h: binHeight,
        scale: 1
      },
      {
        id: 'metal',
        type: 'metal',
        title: 'ขยะโลหะ & กระป๋อง',
        shortTitle: 'ขยะโลหะ',
        sub: 'อลูมิเนียม • แยกพิเศษ',
        accepts: 'กระป๋อง • อลูมิเนียม • ถ่าน',
        shortAccepts: 'กระป๋อง/โลหะ/ถ่าน',
        mainColor: '#a855f7',
        lightColor: '#d8b4fe',
        darkColor: '#7e22ce',
        deepColor: '#581c87',
        rimColor: '#9333ea',
        innerColor: '#2e1065',
        badgeBg: '#7e22ce',
        icon: '🥤',
        colorPill: '🟣 ถังม่วง',
        itemsPeeking: ['🥫', '🥤'],
        symbols: ['🥤', '🥫', '🔋'],
        x: binSpacing * 4 + binWidth * 3,
        y: binY,
        w: binWidth,
        h: binHeight,
        scale: 1
      }
    ];
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.isPlaying) this.initCanvas();
    });

    // Mouse Controls
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    window.addEventListener('mouseup', (e) => this.handlePointerUp(e));

    // Touch Controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handlePointerDown(touch);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.draggedItem) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handlePointerMove(touch);
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (this.draggedItem) {
        this.handlePointerUp(e);
      }
    });
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handlePointerDown(e) {
    if (!this.isPlaying) return;
    const pos = this.getPointerPos(e);

    // Look for top item under pointer
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const dist = Math.hypot(pos.x - item.x, pos.y - item.y);
      if (dist <= item.radius + 12) {
        this.draggedItem = item;
        item.isDragging = true;
        this.dragOffsetX = pos.x - item.x;
        this.dragOffsetY = pos.y - item.y;
        if (window.soundManager) window.soundManager.playPop();
        break;
      }
    }
  }

  handlePointerMove(e) {
    if (!this.draggedItem) return;
    const pos = this.getPointerPos(e);
    this.draggedItem.x = pos.x - this.dragOffsetX;
    this.draggedItem.y = pos.y - this.dragOffsetY;
  }

  handlePointerUp() {
    if (!this.draggedItem) return;
    const item = this.draggedItem;
    this.draggedItem = null;
    item.isDragging = false;

    // Check collision with 3D bins (wide drop area at top rim)
    let droppedInBin = null;
    for (const bin of this.bins) {
      if (
        item.x >= bin.x - 14 &&
        item.x <= bin.x + bin.w + 14 &&
        item.y >= bin.y - 50 &&
        item.y <= bin.y + bin.h + 25
      ) {
        droppedInBin = bin;
        break;
      }
    }

    if (droppedInBin) {
      this.evaluateDrop(item, droppedInBin);
    }
  }

  evaluateDrop(item, bin) {
    this.items = this.items.filter(i => i !== item);

    // 3D Bin bounce animation
    bin.scale = 1.14;
    setTimeout(() => { bin.scale = 1.0; }, 220);

    const isCorrect = (item.type === bin.type);

    if (isCorrect) {
      // Correct!
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const pts = 10 * (this.combo > 3 ? 2 : 1);
      this.score += pts;

      if (window.soundManager) window.soundManager.playCorrect();

      // Floating text
      this.floatingTexts.push({
        text: `+${pts} ถูกต้อง! ${this.combo >= 3 ? `(x2 คอมโบ 🔥)` : ''}`,
        x: bin.x + bin.w / 2,
        y: bin.y - 20,
        color: '#16a34a',
        alpha: 1.0,
        vy: -1.6
      });

      // Confetti burst particles
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 2;
        this.particles.push({
          x: bin.x + bin.w / 2,
          y: bin.y + 15,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          color: bin.mainColor,
          size: Math.random() * 5 + 3,
          alpha: 1.0,
          decay: 0.03
        });
      }
    } else {
      // Wrong!
      this.combo = 0;
      this.score = Math.max(0, this.score - 5);

      if (window.soundManager) window.soundManager.playWrong();

      this.floatingTexts.push({
        text: `-5 ผิดถังนะ!`,
        x: bin.x + bin.w / 2,
        y: bin.y - 20,
        color: '#ef4444',
        alpha: 1.0,
        vy: -1.6
      });

      this.showHintBanner(`${item.icon} ${item.name}: ${item.hint}`);
    }

    this.updateUI();
  }

  showHintBanner(msg) {
    const hintEl = document.getElementById('game-hint-box');
    if (hintEl) {
      hintEl.innerHTML = `<span class="font-bold text-amber-600">💡 เกร็ดความรู้จากแมวสแครช:</span> ${msg}`;
      hintEl.classList.remove('hidden');
      clearTimeout(this.hintTimeout);
      this.hintTimeout = setTimeout(() => {
        hintEl.classList.add('hidden');
      }, 5000);
    }
  }

  startGame() {
    this.initCanvas();
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60;
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];
    this.isPlaying = true;

    if (window.soundManager) window.soundManager.playPop();

    clearInterval(this.timerInterval);
    clearInterval(this.spawnInterval);

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateUI();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    this.spawnInterval = setInterval(() => {
      if (this.isPlaying && this.items.length < 5) {
        this.spawnWasteItem();
      }
    }, 2100);

    this.spawnWasteItem();
    this.spawnWasteItem();

    this.loop();
    this.updateUI();
  }

  spawnWasteItem() {
    const data = this.wasteLibrary[Math.floor(Math.random() * this.wasteLibrary.length)];
    const radius = 34;
    const padding = 70;
    const x = Math.random() * (this.canvas.width - padding * 2) + padding;

    this.items.push({
      ...data,
      x: x,
      y: -radius - 10,
      targetY: Math.random() * 110 + 65,
      vy: 1.8 + Math.random() * 0.8,
      radius: radius,
      isDragging: false,
      pulse: 0
    });
  }

  endGame() {
    this.isPlaying = false;
    clearInterval(this.timerInterval);
    clearInterval(this.spawnInterval);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('waste_game_highscore', this.highScore.toString());
    }

    if (window.soundManager) window.soundManager.playVictory();

    this.showGameOverModal();
    this.updateUI();
  }

  showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const finalScoreEl = document.getElementById('modal-final-score');
    const highScoreEl = document.getElementById('modal-high-score');
    const starsEl = document.getElementById('modal-stars-container');

    if (finalScoreEl) finalScoreEl.innerText = this.score;
    if (highScoreEl) highScoreEl.innerText = this.highScore;

    let stars = 1;
    if (this.score >= 120) stars = 3;
    else if (this.score >= 60) stars = 2;

    if (starsEl) {
      starsEl.innerHTML = `
        <span class="text-3xl ${stars >= 1 ? 'text-amber-400' : 'text-slate-300'}">★</span>
        <span class="text-4xl ${stars >= 2 ? 'text-amber-400' : 'text-slate-300'}">★</span>
        <span class="text-3xl ${stars >= 3 ? 'text-amber-400' : 'text-slate-300'}">★</span>
      `;
    }

    if (modal) modal.classList.remove('hidden');
  }

  loop() {
    if (!this.isPlaying) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  update() {
    // Update items falling
    for (const item of this.items) {
      if (!item.isDragging) {
        if (item.y < item.targetY) {
          item.y += item.vy;
        } else {
          item.pulse += 0.04;
          item.y += Math.sin(item.pulse) * 0.35;
        }
      }
    }

    // Update floating score texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update burst particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Vibrant Playground Scene
    this.drawBackground();

    // 2. Draw 3D Stylized Bins (matching the attached image)
    this.draw3DBins();

    // 3. Draw Waste Items
    this.drawItems();

    // 4. Draw Particles
    this.drawParticles();

    // 5. Draw Floating Texts
    this.drawFloatingTexts();
  }

  drawBackground() {
    const { ctx, canvas } = this;

    // Clean white-to-light-cyan backdrop matching 3D studio render
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.65, '#f0f9ff');
    bgGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Soft ground plane contact shadow / floor pedestal
    const floorY = canvas.height - 96;
    const groundGrad = ctx.createLinearGradient(0, floorY, 0, canvas.height);
    groundGrad.addColorStop(0, '#f8fafc');
    groundGrad.addColorStop(0.25, '#f1f5f9');
    groundGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, floorY, canvas.width, 96);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, floorY, canvas.width, 1.5);
  }

  // ========================================================================
  // RENDER 3D-STYLED RECYCLING BINS (EXACTLY MATCHING ATTACHED IMAGE)
  // ========================================================================
  draw3DBins() {
    const { ctx } = this;

    for (const bin of this.bins) {
      ctx.save();
      const cx = bin.x + bin.w / 2;
      const cy = bin.y + bin.h / 2;

      ctx.translate(cx, cy);
      ctx.scale(bin.scale, bin.scale);
      ctx.translate(-cx, -cy);

      const x = bin.x;
      const y = bin.y;
      const w = bin.w;
      const h = bin.h;

      // 1. Ground Drop Shadow under each bin and wheels
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      ctx.ellipse(cx, y + h + 8, w * 0.48, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Black 3D Wheels (Left & Right)
      const wheelW = 14;
      const wheelH = 26;
      const wheelY = y + h - 16;

      // Left Wheel
      this.draw3DWheel(x - 2, wheelY, wheelW, wheelH);
      // Right Wheel
      this.draw3DWheel(x + w - wheelW + 2, wheelY, wheelW, wheelH);

      // 3. Tapered 3D Bin Body (slightly wider at top, narrower at bottom)
      const topW = w * 0.92;
      const botW = w * 0.80;
      const topX = cx - topW / 2;
      const botX = cx - botW / 2;
      const bodyTopY = y + 16;
      const bodyBotY = y + h;

      // Plastic body horizontal 3D curved gradient (highlight on left-center, shade on right)
      const bodyGrad = ctx.createLinearGradient(topX, bodyTopY, topX + topW, bodyTopY);
      bodyGrad.addColorStop(0, bin.darkColor);
      bodyGrad.addColorStop(0.18, bin.lightColor);
      bodyGrad.addColorStop(0.48, bin.mainColor);
      bodyGrad.addColorStop(0.85, bin.darkColor);
      bodyGrad.addColorStop(1, bin.deepColor);

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(topX, bodyTopY);
      ctx.lineTo(topX + topW, bodyTopY);
      ctx.lineTo(botX + botW - 10, bodyBotY - 4);
      ctx.quadraticCurveTo(botX + botW, bodyBotY, botX + botW - 10, bodyBotY);
      ctx.lineTo(botX + 10, bodyBotY);
      ctx.quadraticCurveTo(botX, bodyBotY, botX, bodyBotY - 4);
      ctx.closePath();
      ctx.fill();

      // Subtle bottom shadow on body
      const botShade = ctx.createLinearGradient(cx, bodyBotY - 24, cx, bodyBotY);
      botShade.addColorStop(0, 'rgba(0,0,0,0)');
      botShade.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = botShade;
      ctx.beginPath();
      ctx.moveTo(botX, bodyBotY - 24);
      ctx.lineTo(botX + botW, bodyBotY - 24);
      ctx.lineTo(botX + botW, bodyBotY);
      ctx.lineTo(botX, bodyBotY);
      ctx.closePath();
      ctx.fill();

      // 4. Embossed 3D White Recycling Logo (♻️) on front belly
      const logoY = bodyTopY + (bodyBotY - bodyTopY) * 0.36;
      this.draw3DRecycleLogo(cx, logoY, w * 0.16);

      // On-Bin Front Label Plaque (e.g. 🍌 ขยะเปียก)
      const plaqueW = Math.min(w * 0.78, 115);
      const plaqueH = 22;
      const plaqueY = logoY + w * 0.20;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      this.roundRectPath(ctx, cx - plaqueW / 2, plaqueY, plaqueW, plaqueH, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Inner subtle border on plaque
      ctx.strokeStyle = bin.rimColor;
      ctx.lineWidth = 1;
      this.roundRectPath(ctx, cx - plaqueW / 2, plaqueY, plaqueW, plaqueH, 6);
      ctx.stroke();

      // Plaque Text
      ctx.fillStyle = bin.deepColor;
      ctx.font = 'bold 11px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${bin.icon} ${bin.shortTitle}`, cx, plaqueY + plaqueH / 2 + 0.5);

      // 5. Peeking waste items inside the bin (like in the picture!)
      ctx.font = '22px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (bin.itemsPeeking && bin.itemsPeeking.length >= 2) {
        ctx.fillText(bin.itemsPeeking[0], cx - 18, bodyTopY + 2);
        ctx.fillText(bin.itemsPeeking[1], cx + 18, bodyTopY + 2);
      }

      // 6. Thick 3D Rounded Top Rim / Collar (Lip)
      const rimH = 24;
      const rimW = w;
      const rimX = cx - rimW / 2;
      const rimY = y + 4;

      // Rim cast shadow onto the body
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      this.roundRectPath(ctx, rimX + 3, rimY + rimH - 2, rimW - 6, 8, 4);
      ctx.fill();

      // Rim 3D glossy gradient
      const rimGrad = ctx.createLinearGradient(rimX, rimY, rimX + rimW, rimY);
      rimGrad.addColorStop(0, bin.darkColor);
      rimGrad.addColorStop(0.15, bin.lightColor);
      rimGrad.addColorStop(0.5, bin.rimColor);
      rimGrad.addColorStop(0.85, bin.darkColor);
      rimGrad.addColorStop(1, bin.deepColor);

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      this.roundRectPath(ctx, rimX, rimY, rimW, rimH, 10);
      ctx.fill();

      // Rim upper specular shine line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rimX + 12, rimY + 3);
      ctx.lineTo(rimX + rimW - 12, rimY + 3);
      ctx.stroke();

      // 7. Recessed Inner Hollow Cavity (Depth of open bin)
      const innerW = rimW - 20;
      const innerH = 10;
      const innerX = cx - innerW / 2;
      const innerY = rimY + 4;

      const cavityGrad = ctx.createLinearGradient(cx, innerY, cx, innerY + innerH);
      cavityGrad.addColorStop(0, '#000000');
      cavityGrad.addColorStop(0.4, bin.innerColor);
      cavityGrad.addColorStop(1, 'rgba(0,0,0,0.1)');

      ctx.fillStyle = cavityGrad;
      ctx.beginPath();
      ctx.ellipse(cx, innerY + innerH / 2, innerW / 2, innerH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 8. High-Contrast Informational Badge Cards Below Bin
      const cardW = Math.min(w + 12, (this.canvas.width - 24) / 4);
      const cardX = cx - cardW / 2;
      const cardTopY = y + h + 10;

      // Tier 1: Colored Header Pill (Color & Category Title)
      const pillH = 24;
      ctx.fillStyle = bin.badgeBg;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      this.roundRectPath(ctx, cardX, cardTopY, cardW, pillH, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Header Pill Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const headerTitle = (cardW < 120) ? `${bin.colorPill}` : `${bin.colorPill} ${bin.shortTitle}`;
      ctx.fillText(headerTitle, cx, cardTopY + pillH / 2 + 0.5);

      // Tier 2: "ใส่ขยะอะไร" Guidance Card
      const infoH = 46;
      const infoY = cardTopY + pillH + 4;

      // White card background with colored accent border
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2;
      this.roundRectPath(ctx, cardX, infoY, cardW, infoH, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = bin.lightColor;
      ctx.lineWidth = 1.5;
      this.roundRectPath(ctx, cardX, infoY, cardW, infoH, 8);
      ctx.stroke();

      // Line A: "ใส่: [ตัวอย่างขยะ]"
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const acceptsText = (cardW < 120) ? `ใส่: ${bin.shortAccepts}` : `ใส่: ${bin.accepts}`;
      ctx.fillText(acceptsText, cx, infoY + 5);

      // Line B: Subtitle / Characteristic
      ctx.fillStyle = '#64748b';
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText(bin.sub, cx, infoY + 18);

      // Line C: Emojis preview
      ctx.font = '12px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(bin.symbols.join(' '), cx, infoY + 30);

      ctx.restore();
    }
  }

  // Draw 3D black wheel with metallic hub
  draw3DWheel(wx, wy, ww, wh) {
    const { ctx } = this;
    ctx.save();

    // Wheel rubber cylinder
    const tireGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy);
    tireGrad.addColorStop(0, '#0f172a');
    tireGrad.addColorStop(0.35, '#475569');
    tireGrad.addColorStop(0.7, '#1e293b');
    tireGrad.addColorStop(1, '#020617');

    ctx.fillStyle = tireGrad;
    ctx.beginPath();
    this.roundRectPath(ctx, wx, wy, ww, wh, 6);
    ctx.fill();

    // Wheel hub center dot
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(wx + ww / 2, wy + wh / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Embossed White 3D Recycling Symbol (3 arrows forming a triangle)
  draw3DRecycleLogo(cx, cy, radius) {
    const { ctx } = this;
    ctx.save();

    ctx.translate(cx, cy);

    // Subtle drop shadow for 3D embossed look
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#ffffff';

    // 3 Arrows arranged in 120-degree symmetry
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * 120 * Math.PI) / 180);

      // Curved bent arrow
      ctx.beginPath();
      ctx.arc(0, -radius * 0.75, radius * 0.55, -0.4, 0.85);
      ctx.lineWidth = radius * 0.28;
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      const ax = radius * 0.45;
      const ay = -radius * 0.48;
      ctx.moveTo(ax - 5, ay - 6);
      ctx.lineTo(ax + 5, ay);
      ctx.lineTo(ax - 5, ay + 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  drawItems() {
    const { ctx } = this;

    for (const item of this.items) {
      ctx.save();

      // Drop Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = item.isDragging ? 22 : 10;
      ctx.shadowOffsetY = item.isDragging ? 12 : 5;

      // Item 3D Glossy White Bubble
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Colored rim border
      ctx.lineWidth = item.isDragging ? 3.5 : 2.5;
      ctx.strokeStyle = item.color;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Emoji Icon
      ctx.font = '30px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, item.x, item.y - 4);

      // Name Pill below
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      const textWidth = ctx.measureText(item.name).width;
      const pillW = Math.max(textWidth * 0.48 + 16, 64);
      this.roundRect(ctx, item.x - pillW / 2, item.y + item.radius - 8, pillW, 18, 9, true, false);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Prompt, sans-serif';
      ctx.fillText(item.name, item.x, item.y + item.radius + 1);

      ctx.restore();
    }
  }

  drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawFloatingTexts() {
    const { ctx } = this;
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 18px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    this.roundRectPath(ctx, x, y, width, height, radius);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  roundRectPath(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  updateUI() {
    const scoreEl = document.getElementById('game-score-display');
    const timerEl = document.getElementById('game-timer-display');
    const comboEl = document.getElementById('game-combo-display');
    const highEl = document.getElementById('game-high-display');

    if (scoreEl) scoreEl.innerText = this.score;
    if (timerEl) timerEl.innerText = this.timeLeft;
    if (comboEl) comboEl.innerText = this.combo > 1 ? `x${this.combo} 🔥` : '-';
    if (highEl) highEl.innerText = this.highScore;
  }
}

// Global mini game initializer
window.initMiniGame = function() {
  window.miniGame = new MiniWasteGame('mini-game-canvas');
};
