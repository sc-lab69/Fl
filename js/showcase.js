// ==========================================================================
// Showcase Hub & Upload System with Google Drive & Web Project Player
// Integrated with Teacher's Google Drive Folder & TurboWarp/Scratch Embed Player
// ==========================================================================

const TEACHER_GDRIVE_FOLDER = 'https://drive.google.com/drive/u/2/folders/1yQzPXOu4O1kGBWxZND57OU4ZUT6fqETj';

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    scratchId: '10128407',
    scratchUrl: 'https://scratch.mit.edu/projects/10128407/',
    gdriveUrl: TEACHER_GDRIVE_FOLDER,
    title: 'ซูเปอร์ฮีโร่แยกขยะโรงเรียนรักษ์โลก 3D',
    author: 'ด.ญ. มินตรา แก้วกัลยา (น้องมินท์)',
    school: 'รร.อนุบาลประจำจังหวัด (ป.5/2)',
    desc: 'เกมคัดแยกขยะ 4 สีตามมาตรฐาน มีระบบสุ่มขยะตกลงมาจากฟ้า และระบบคอมโบเมื่อทิ้งลงถังถูกต้องต่อเนื่อง!',
    category: 'ประถมศึกษา',
    coverImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    likes: 56,
    rating: 4.9,
    ratingCount: 22,
    badge: '🌟 แนะนำยอดเยี่ยม',
    hasGdrive: true,
    createdAt: '2026-09-01',
    comments: [
      { author: 'ครูประจำวิชา', text: 'ตรวจงานแล้ว โค้ดบล็อก Clone สุ่มตำแหน่งแกน X และ Y ทำได้ดีมากครับ!', time: '2 วันที่แล้ว' },
      { author: 'ด.ช. ภูมิ', text: 'เล่นเพลินมาก ได้คะแนน 250 แต้มแล้ว!', time: '1 วันที่แล้ว' }
    ]
  },
  {
    id: 'proj-2',
    scratchId: '104',
    scratchUrl: 'https://scratch.mit.edu/projects/104/',
    gdriveUrl: TEACHER_GDRIVE_FOLDER,
    title: 'หุ่นยนต์สายพานคัดแยกขยะอัจฉริยะ',
    author: 'ด.ช. ธนกร พัฒนาการ (กานต์)',
    school: 'รร.สาธิตนวัตกรรม (ม.2/1)',
    desc: 'ใช้บล็อก Sensing สีตรวจจับขยะบนสายพานอัตโนมัติ มีด่านขยะอันตรายที่ต้องระวังระเบิดด้วย!',
    category: 'มัธยมศึกษา',
    coverImage: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80',
    likes: 43,
    rating: 4.8,
    ratingCount: 16,
    badge: '⚡ ความคิดสร้างสรรค์',
    hasGdrive: true,
    createdAt: '2026-09-03',
    comments: [
      { author: 'ด.ญ. แพรวา', text: 'ด่านสายพานวิ่งเร็วมาก ท้าทายสุดๆ ค่ะ', time: 'เมื่อวาน' }
    ]
  },
  {
    id: 'proj-3',
    scratchId: '10128407',
    scratchUrl: 'https://scratch.mit.edu/projects/10128407/',
    gdriveUrl: TEACHER_GDRIVE_FOLDER,
    title: 'ภารกิจพิทักษ์ถังเขียว: กำจัดเศษอาหาร & ปุ๋ยหมัก',
    author: 'ด.ช. ภานุวัตร สุขสำราญ',
    school: 'รร.เทศบาล 1 (ป.6/3)',
    desc: 'เกมที่เน้นเรื่องขยะเปียกและขยะอินทรีย์ ให้ความรู้เรื่องการนำเปลือกผลไม้ไปทำน้ำหมักชีวภาพ',
    category: 'ประถมศึกษา',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    likes: 35,
    rating: 4.7,
    ratingCount: 12,
    badge: '🌱 เชิงนิเวศน์ยอดเยี่ยม',
    hasGdrive: true,
    createdAt: '2026-09-05',
    comments: [
      { author: 'ด.ช. อาร์ม', text: 'รูปอาหารวาดเองใน Scratch สวยมากครับ', time: '5 ชั่วโมงที่แล้ว' }
    ]
  }
];

class ShowcaseManager {
  constructor() {
    this.teacherGdriveFolder = TEACHER_GDRIVE_FOLDER;
    this.projects = this.loadProjects();
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.currentPlayingProject = null;

    this.init();
  }

  loadProjects() {
    try {
      const saved = localStorage.getItem('scratch_showcase_projects_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading projects from localStorage', e);
    }
    this.saveProjects(DEFAULT_PROJECTS);
    return DEFAULT_PROJECTS;
  }

  saveProjects(projects) {
    try {
      localStorage.setItem('scratch_showcase_projects_v2', JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects', e);
    }
  }

  init() {
    this.renderGallery();
    this.bindEvents();
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('showcase-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderGallery();
      });
    }

    // Filter tabs
    const filterButtons = document.querySelectorAll('.showcase-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active', 'bg-blue-600', 'text-white'));
        btn.classList.add('active', 'bg-blue-600', 'text-white');
        this.currentFilter = btn.getAttribute('data-filter') || 'all';
        if (window.soundManager) window.soundManager.playClick();
        this.renderGallery();
      });
    });

    // Upload Form Submit
    const uploadForm = document.getElementById('project-upload-form');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => this.handleProjectUpload(e));
    }

    // Modal Close buttons
    const closePlayerBtn = document.getElementById('close-player-modal');
    if (closePlayerBtn) {
      closePlayerBtn.addEventListener('click', () => this.closePlayerModal());
    }

    const closeUploadBtn = document.getElementById('close-upload-modal');
    if (closeUploadBtn) {
      closeUploadBtn.addEventListener('click', () => this.closeUploadModal());
    }

    const openUploadBtn = document.getElementById('open-upload-modal-btn');
    if (openUploadBtn) {
      openUploadBtn.addEventListener('click', () => this.openUploadModal());
    }
  }

  // Parse Project Link (Google Drive file/folder, Scratch URL, TurboWarp, or ID)
  parseProjectLink(urlOrId) {
    if (!urlOrId) return { type: 'scratch', id: '10128407', url: '' };
    const trimmed = urlOrId.trim();

    // Google Drive File: drive.google.com/file/d/([a-zA-Z0-9_-]+)
    const gdriveFile = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (gdriveFile && gdriveFile[1]) {
      return {
        type: 'gdrive_file',
        fileId: gdriveFile[1],
        url: trimmed,
        previewUrl: `https://drive.google.com/file/d/${gdriveFile[1]}/preview`
      };
    }

    // Google Drive Folder
    if (trimmed.includes('drive.google.com/drive/')) {
      return {
        type: 'gdrive_folder',
        url: trimmed
      };
    }

    // Scratch Project URL
    const scratchMatch = trimmed.match(/scratch\.mit\.edu\/projects\/(\d+)/i);
    if (scratchMatch && scratchMatch[1]) {
      return {
        type: 'scratch',
        id: scratchMatch[1],
        url: trimmed
      };
    }

    // TurboWarp Project URL
    const twMatch = trimmed.match(/turbowarp\.org\/(\d+)/i);
    if (twMatch && twMatch[1]) {
      return {
        type: 'scratch',
        id: twMatch[1],
        url: trimmed
      };
    }

    // Numbers only (Scratch ID)
    if (/^\d+$/.test(trimmed)) {
      return {
        type: 'scratch',
        id: trimmed,
        url: `https://scratch.mit.edu/projects/${trimmed}/`
      };
    }

    return {
      type: 'custom',
      url: trimmed
    };
  }

  handleProjectUpload(e) {
    e.preventDefault();

    const titleInput = document.getElementById('upload-title');
    const authorInput = document.getElementById('upload-author');
    const schoolInput = document.getElementById('upload-school');
    const scratchLinkInput = document.getElementById('upload-scratch-link');
    const gdriveLinkInput = document.getElementById('upload-gdrive-link');
    const descInput = document.getElementById('upload-desc');
    const categoryInput = document.getElementById('upload-category');
    const coverInput = document.getElementById('upload-cover-url');

    const primaryLink = (scratchLinkInput && scratchLinkInput.value.trim()) || '';
    const parsedSource = this.parseProjectLink(primaryLink);

    const gdriveUrl = (gdriveLinkInput && gdriveLinkInput.value.trim()) 
      ? gdriveLinkInput.value.trim() 
      : (parsedSource.type === 'gdrive_file' || parsedSource.type === 'gdrive_folder' ? parsedSource.url : TEACHER_GDRIVE_FOLDER);

    const fallbackImages = [
      'assets/scratch_cat_3d_bins.png',
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
    ];

    const newProject = {
      id: 'proj-' + Date.now(),
      scratchId: parsedSource.id || '10128407',
      scratchUrl: parsedSource.url || (parsedSource.id ? `https://scratch.mit.edu/projects/${parsedSource.id}/` : ''),
      gdriveUrl: gdriveUrl,
      gdriveFileId: parsedSource.fileId || '',
      sourceType: parsedSource.type,
      title: titleInput.value.trim(),
      author: authorInput.value.trim(),
      school: schoolInput.value.trim() || 'นักเรียนผู้รักการเขียนโค้ด',
      desc: descInput.value.trim() || 'เกมคัดแยกขยะในโรงเรียน สร้างด้วย Scratch 3.0',
      category: categoryInput ? categoryInput.value : 'ทั่วไป',
      coverImage: (coverInput && coverInput.value.trim()) ? coverInput.value.trim() : fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
      likes: 1,
      rating: 5.0,
      ratingCount: 1,
      badge: '🎉 ส่งเข้าตรวจใน Drive แล้ว',
      hasGdrive: true,
      createdAt: new Date().toISOString().split('T')[0],
      comments: [
        { author: 'ระบบตรวจงาน', text: 'บันทึกข้อมูลและเชื่อมโยงเข้าสู่ Google Drive ของคุณครูเรียบร้อยแล้ว!', time: 'เมื่อสักครู่' }
      ]
    };

    this.projects.unshift(newProject);
    this.saveProjects(this.projects);

    if (window.soundManager) window.soundManager.playVictory();

    uploadForm.reset();
    this.closeUploadModal();
    this.renderGallery();

    this.showToast('ส่งผลงานสำเร็จแล้ว! ไฟล์ถูกบันทึกลงในระบบและเชื่อมกับ Google Drive ของคุณครู 🎉');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce-soft';
    toast.innerHTML = `
      <span class="text-2xl">✨</span>
      <div class="font-medium text-xs sm:text-sm">${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 4500);
  }

  toggleLike(projId) {
    const proj = this.projects.find(p => p.id === projId);
    if (!proj) return;

    proj.likes++;
    this.saveProjects(this.projects);
    if (window.soundManager) window.soundManager.playPop();

    const likeCountEl = document.getElementById(`like-count-${projId}`);
    if (likeCountEl) {
      likeCountEl.innerText = proj.likes;
    }
  }

  openPlayerModal(projId) {
    const proj = this.projects.find(p => p.id === projId);
    if (!proj) return;

    this.currentPlayingProject = proj;
    const modal = document.getElementById('scratch-player-modal');
    const titleEl = document.getElementById('player-modal-title');
    const authorEl = document.getElementById('player-modal-author');
    const iframeContainer = document.getElementById('scratch-iframe-container');
    const openExternalBtn = document.getElementById('player-external-link');
    const openGdriveBtn = document.getElementById('player-gdrive-link');

    if (titleEl) titleEl.innerText = proj.title;
    if (authorEl) authorEl.innerText = `สร้างโดย ${proj.author} • ${proj.school}`;
    
    if (openExternalBtn) {
      openExternalBtn.href = proj.scratchUrl || `https://scratch.mit.edu/projects/${proj.scratchId || '10128407'}/`;
    }

    if (openGdriveBtn) {
      openGdriveBtn.href = proj.gdriveUrl || TEACHER_GDRIVE_FOLDER;
    }

    // Embed Scratch / TurboWarp Web Player
    if (iframeContainer) {
      const idToEmbed = proj.scratchId || '10128407';

      iframeContainer.innerHTML = `
        <div class="space-y-3">
          <!-- Web Player Frame -->
          <div class="relative w-full aspect-[4/3] max-w-[680px] mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
            <iframe 
              id="active-web-player-iframe"
              src="https://turbowarp.org/${idToEmbed}/embed?fps=60&hqpen=true" 
              allowtransparency="true" 
              width="100%" 
              height="100%" 
              frameborder="0" 
              scrolling="no" 
              allowfullscreen
              class="w-full h-full"
            ></iframe>
          </div>

          <!-- Controls & Switching Engine Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-xl text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-700">โหมดเครื่องเล่น:</span>
              <button 
                onclick="document.getElementById('active-web-player-iframe').src='https://turbowarp.org/${idToEmbed}/embed?fps=60';"
                class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-sm"
              >
                ⚡ TurboWarp (60 FPS ลื่นไหล)
              </button>
              <button 
                onclick="document.getElementById('active-web-player-iframe').src='https://scratch.mit.edu/projects/${idToEmbed}/embed';"
                class="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition shadow-sm"
              >
                🐱 Scratch MIT แท้
              </button>
            </div>

            <!-- Google Drive Action -->
            <a 
              href="${proj.gdriveUrl || TEACHER_GDRIVE_FOLDER}" 
              target="_blank" 
              class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <span>📁 ดูไฟล์งานใน Google Drive</span>
              <span>↗</span>
            </a>
          </div>

          <!-- Quick Tip -->
          <div class="p-3 bg-blue-50/90 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-center justify-between">
            <span>💡 หากต้องการตรวจโค้ดบล็อกทั้งหมด หรือเปิดไฟล์ .sb3 จาก Drive:</span>
            <button 
              onclick="window.showcaseManager.openSb3RunnerModal()" 
              class="font-bold text-blue-700 underline hover:text-blue-900"
            >
              เปิดเครื่องตรวจโค้ด Scratch .sb3 ทันที ➔
            </button>
          </div>
        </div>
      `;
    }

    this.renderCommentsForModal(proj);

    if (modal) modal.classList.remove('hidden');
    if (window.soundManager) window.soundManager.playPop();
  }

  // Open Full-Featured .sb3 File Runner & Code Inspector
  openSb3RunnerModal() {
    const modal = document.getElementById('sb3-runner-modal');
    const iframe = document.getElementById('sb3-runner-iframe');

    if (iframe && !iframe.src) {
      iframe.src = 'https://turbowarp.org/editor';
    }

    if (modal) modal.classList.remove('hidden');
    if (window.soundManager) window.soundManager.playPop();
  }

  closeSb3RunnerModal() {
    const modal = document.getElementById('sb3-runner-modal');
    if (modal) modal.classList.add('hidden');
  }

  renderCommentsForModal(proj) {
    const commentsList = document.getElementById('modal-comments-list');
    if (!commentsList) return;

    commentsList.innerHTML = proj.comments.map(c => `
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-xs text-blue-600">${this.escapeHtml(c.author)}</span>
          <span class="text-[10px] text-slate-400">${c.time}</span>
        </div>
        <p class="text-xs text-slate-700">${this.escapeHtml(c.text)}</p>
      </div>
    `).join('');
  }

  closePlayerModal() {
    const modal = document.getElementById('scratch-player-modal');
    const iframeContainer = document.getElementById('scratch-iframe-container');
    if (iframeContainer) iframeContainer.innerHTML = '';
    if (modal) modal.classList.add('hidden');
  }

  openUploadModal() {
    const modal = document.getElementById('project-upload-modal');
    if (modal) modal.classList.remove('hidden');
    if (window.soundManager) window.soundManager.playClick();
  }

  closeUploadModal() {
    const modal = document.getElementById('project-upload-modal');
    if (modal) modal.classList.add('hidden');
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  renderGallery() {
    const container = document.getElementById('showcase-gallery-container');
    if (!container) return;

    let filtered = this.projects;

    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(p => p.category.includes(this.currentFilter));
    }

    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(this.searchQuery) ||
        p.author.toLowerCase().includes(this.searchQuery) ||
        p.school.toLowerCase().includes(this.searchQuery) ||
        p.desc.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16 bg-white/80 rounded-3xl border border-dashed border-slate-300">
          <div class="text-5xl mb-3">🔍</div>
          <h3 class="text-lg font-bold text-slate-700">ไม่พบผลงานที่ค้นหา</h3>
          <p class="text-sm text-slate-500 mt-1">ลองค้นหาด้วยคำอื่น หรือส่งผลงานใหม่เข้า Google Drive เลย!</p>
          <button onclick="window.showcaseManager.openUploadModal()" class="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition">
            + อัปโหลดผลงานใหม่
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(proj => `
      <div class="glass-card rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col group transition-all duration-300">
        <!-- Thumbnail Header -->
        <div class="relative aspect-video overflow-hidden bg-slate-100">
          <img 
            src="${proj.coverImage}" 
            alt="${this.escapeHtml(proj.title)}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
          
          <!-- Category Badge -->
          <span class="absolute top-3 left-3 bg-white/95 backdrop-blur text-blue-600 font-bold text-xs px-3 py-1 rounded-full shadow">
            ${proj.category}
          </span>

          <!-- Google Drive Linked Indicator -->
          <a 
            href="${proj.gdriveUrl || TEACHER_GDRIVE_FOLDER}" 
            target="_blank" 
            title="เปิดดูไฟล์ใน Google Drive ของคุณครู"
            class="absolute top-3 right-3 bg-emerald-600/95 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow flex items-center gap-1 transition"
          >
            <span>📁 ใน Google Drive</span>
          </a>

          <!-- Play Button Overlay -->
          <button 
            onclick="window.showcaseManager.openPlayerModal('${proj.id}')"
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs"
          >
            <div class="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-green-400 text-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
              <span class="text-2xl ml-1">▶️</span>
            </div>
          </button>
        </div>

        <!-- Body Content -->
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              ${this.escapeHtml(proj.title)}
            </h3>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>👤 ${this.escapeHtml(proj.author)}</span>
              <span>•</span>
              <span>🏫 ${this.escapeHtml(proj.school)}</span>
            </p>
            <p class="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
              ${this.escapeHtml(proj.desc)}
            </p>
          </div>

          <!-- Card Actions Footer -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <!-- Like Button -->
              <button 
                onclick="window.showcaseManager.toggleLike('${proj.id}')"
                class="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition"
              >
                <span>❤️</span>
                <span id="like-count-${proj.id}">${proj.likes}</span>
              </button>

              <!-- Star Rating -->
              <div class="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <span>⭐</span>
                <span>${proj.rating}</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <!-- Open Drive -->
              <a 
                href="${proj.gdriveUrl || TEACHER_GDRIVE_FOLDER}" 
                target="_blank" 
                title="เปิดไฟล์ใน Google Drive"
                class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center"
              >
                📁
              </a>

              <!-- Play Button -->
              <button 
                onclick="window.showcaseManager.openPlayerModal('${proj.id}')"
                class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1"
              >
                <span>เปิดเล่นบนเว็บ</span>
                <span>🎮</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Global showcase manager initializer
window.initShowcase = function() {
  window.showcaseManager = new ShowcaseManager();
};
