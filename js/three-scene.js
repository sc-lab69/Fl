// ==========================================================================
// Three.js Interactive 3D Hero Scene
// 3D Recycling Bins modeled to match the Scratch Cat reference image
// Green -> Blue -> Yellow -> Purple with open thick rim, recycle logo, & wheels
// ==========================================================================

class Waste3DScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.binsGroup = null;
    this.floatingItems = [];
    this.particles = null;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationY = 0;
    this.targetRotationX = 0;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();

    // 2. Camera Setup
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 450;
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    this.camera.position.set(0, 2.8, 9.8);
    this.camera.lookAt(0, 0.2, 0);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = 'threejs-hero-canvas';

    // 4. Studio Lighting matching the clean 3D render
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
    this.scene.add(ambientLight);

    // Main key light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(4, 10, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    // Fill light (cyan/sky ambient tone)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.45);
    fillLight.position.set(-6, 4, 3);
    this.scene.add(fillLight);

    // Warm bounce light
    const bounceLight = new THREE.PointLight(0xfef08a, 0.4, 15);
    bounceLight.position.set(0, -1, 5);
    this.scene.add(bounceLight);

    // 5. Floor Shadow receiver
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.45;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 6. Build the 4 School Bins (Green, Blue, Yellow, Purple)
    this.binsGroup = new THREE.Group();
    this.scene.add(this.binsGroup);
    this.createSchoolBins();

    // 7. Floating 3D Waste Objects
    this.createFloatingWaste();

    // 8. Particle Sparkles
    this.createParticles();

    // 9. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('click', (e) => this.onClick(e));

    // 10. Animation Loop
    this.animate();
  }

  // Helper to generate a 3D recycle logo texture on canvas
  createRecycleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 256);

    const cx = 128;
    const cy = 128;
    const radius = 64;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * 120 * Math.PI) / 180);

      // Curved arrow body
      ctx.beginPath();
      ctx.arc(0, -radius * 0.75, radius * 0.55, -0.4, 0.85);
      ctx.lineWidth = radius * 0.28;
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Arrow point
      ctx.beginPath();
      const ax = radius * 0.45;
      const ay = -radius * 0.48;
      ctx.moveTo(ax - 12, ay - 14);
      ctx.lineTo(ax + 12, ay);
      ctx.lineTo(ax - 12, ay + 14);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  // Create an open-top stylized 3D bin matching the reference image
  createBinMesh(colorHex, label, xPos, contentsType) {
    const binGroup = new THREE.Group();
    binGroup.position.set(xPos, -0.4, 0);
    binGroup.userData = { label: label, originalY: -0.4, isBouncing: false };

    // Common glossy plastic material
    const binMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.28,
      metalness: 0.12
    });

    // 1. Tapered Container Body (slightly wider at top, narrower at bottom)
    const bodyGeo = new THREE.CylinderGeometry(0.68, 0.52, 1.65, 32);
    const body = new THREE.Mesh(bodyGeo, binMat);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 0;
    binGroup.add(body);

    // 2. Thick Rounded Top Rim Collar (The prominent 3D lip in the image)
    const rimGeo = new THREE.CylinderGeometry(0.76, 0.74, 0.28, 32);
    const rim = new THREE.Mesh(rimGeo, binMat);
    rim.position.y = 0.85;
    rim.castShadow = true;
    rim.receiveShadow = true;
    binGroup.add(rim);

    // 3. Hollow Recessed Interior (Dark inside depth)
    const innerGeo = new THREE.CylinderGeometry(0.60, 0.48, 0.35, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.y = 0.86;
    binGroup.add(inner);

    // 4. Embossed 3D White Recycling Logo (♻️) on front belly
    const logoTex = this.createRecycleTexture();
    const logoMat = new THREE.MeshBasicMaterial({
      map: logoTex,
      transparent: true,
      depthWrite: false
    });
    const logoGeo = new THREE.PlaneGeometry(0.48, 0.48);
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.position.set(0, 0.15, 0.61);
    binGroup.add(logo);

    // 5. Black 3D Rubber Wheels on the sides (Left & Right)
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.65,
      metalness: 0.2
    });
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.3
    });

    // Left Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20);
    const wheelL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelL.rotation.z = Math.PI / 2;
    wheelL.position.set(-0.54, -0.78, 0.1);
    wheelL.castShadow = true;

    const hubL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.13, 16), hubMat);
    hubL.rotation.z = Math.PI / 2;
    hubL.position.set(-0.55, -0.78, 0.1);
    binGroup.add(wheelL, hubL);

    // Right Wheel
    const wheelR = new THREE.Mesh(wheelGeo, wheelMat);
    wheelR.rotation.z = Math.PI / 2;
    wheelR.position.set(0.54, -0.78, 0.1);
    wheelR.castShadow = true;

    const hubR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.13, 16), hubMat);
    hubR.rotation.z = Math.PI / 2;
    hubR.position.set(0.55, -0.78, 0.1);
    binGroup.add(wheelR, hubR);

    // 6. Peeking 3D items inside top (matching the photo!)
    if (contentsType === 'organic') {
      // Small Apple peeking
      const appGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const appMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const apple = new THREE.Mesh(appGeo, appMat);
      apple.position.set(-0.2, 0.98, 0.05);
      binGroup.add(apple);

      // Banana peeking
      const banGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.36, 12);
      const banMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
      const banana = new THREE.Mesh(banGeo, banMat);
      banana.position.set(0.2, 1.02, 0.05);
      banana.rotation.z = 0.45;
      binGroup.add(banana);
    } else if (contentsType === 'paper') {
      // Paper / Cardboard box peeking
      const boxGeo = new THREE.BoxGeometry(0.26, 0.32, 0.18);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0.14, 1.04, 0.05);
      box.rotation.set(0.2, 0.3, 0.2);
      binGroup.add(box);

      // White paper
      const pprGeo = new THREE.BoxGeometry(0.22, 0.26, 0.12);
      const pprMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
      const ppr = new THREE.Mesh(pprGeo, pprMat);
      ppr.position.set(-0.16, 1.02, 0.05);
      ppr.rotation.set(-0.15, -0.2, -0.1);
      binGroup.add(pppr);
    } else if (contentsType === 'plastic') {
      // Clear water bottle neck peeking
      const botGeo = new THREE.CylinderGeometry(0.10, 0.13, 0.38, 16);
      const botMat = new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1
      });
      const bot = new THREE.Mesh(botGeo, botMat);
      bot.position.set(-0.16, 1.05, 0.05);
      bot.rotation.z = -0.25;

      const capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(-0.21, 1.25, 0.05);
      binGroup.add(bot, cap);

      // White jug peeking
      const jugGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.32, 16);
      const jugMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
      const jug = new THREE.Mesh(jugGeo, jugMat);
      jug.position.set(0.18, 1.05, 0.05);
      binGroup.add(jug);
    } else if (contentsType === 'metal') {
      // Metallic soda can peeking
      const canGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.34, 18);
      const canMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.85,
        roughness: 0.2
      });
      const can = new THREE.Mesh(canGeo, canMat);
      can.position.set(0.12, 1.04, 0.05);
      can.rotation.set(0.3, 0.2, 0.2);
      binGroup.add(can);

      // Crushed can
      const crGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.24, 16);
      const crMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const crCan = new THREE.Mesh(crGeo, crMat);
      crCan.position.set(-0.16, 0.98, 0.05);
      crCan.rotation.set(-0.2, 0.3, -0.4);
      binGroup.add(crCan);
    }

    this.binsGroup.add(binGroup);
  }

  createSchoolBins() {
    // 4 stylized 3D Bins strictly in order of user reference image:
    // Green (Organic) -> Blue (Paper) -> Yellow (Plastic) -> Purple (Metal/Cans)
    const binsConfig = [
      { color: 0x22c55e, name: 'ขยะเปียก (สีเขียว)', x: -2.85, type: 'organic' },
      { color: 0x3b82f6, name: 'ขยะกระดาษ (สีน้ำเงิน)', x: -0.95, type: 'paper' },
      { color: 0xeab308, name: 'ขยะพลาสติก (สีเหลือง)', x: 0.95, type: 'plastic' },
      { color: 0xa855f7, name: 'ขยะโลหะ & กระป๋อง (สีม่วง)', x: 2.85, type: 'metal' }
    ];

    binsConfig.forEach(cfg => {
      this.createBinMesh(cfg.color, cfg.name, cfg.x, cfg.type);
    });
  }

  createFloatingWaste() {
    // 1. Floating 3D Scratch Puzzle Block (Yellow Hat Flag)
    const blockGroup = new THREE.Group();
    const bGeo = new THREE.BoxGeometry(0.75, 0.32, 0.15);
    const bMat = new THREE.MeshStandardMaterial({ color: 0xffbf00, roughness: 0.25 });
    const blockMesh = new THREE.Mesh(bGeo, bMat);
    blockGroup.add(blockMesh);
    blockGroup.position.set(0.8, 2.3, 0.6);
    blockGroup.userData = { speed: 1.8, offset: 0, rotSpeed: 0.012 };
    this.scene.add(blockGroup);
    this.floatingItems.push(blockGroup);

    // 2. Floating 3D Green Leaf
    const leafGeo = new THREE.SphereGeometry(0.18, 8, 8);
    leafGeo.scale(1.8, 0.6, 0.3);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const leaf1 = new THREE.Mesh(leafGeo, leafMat);
    leaf1.position.set(-2.2, 2.1, 0.7);
    leaf1.rotation.set(0.4, 0.5, 0.6);
    leaf1.userData = { speed: 2.2, offset: 1.2, rotSpeed: 0.02 };
    this.scene.add(leaf1);
    this.floatingItems.push(leaf1);

    const leaf2 = new THREE.Mesh(leafGeo, leafMat);
    leaf2.position.set(2.4, 2.2, 0.8);
    leaf2.rotation.set(-0.3, -0.4, 0.4);
    leaf2.userData = { speed: 1.9, offset: 2.8, rotSpeed: -0.018 };
    this.scene.add(leaf2);
    this.floatingItems.push(leaf2);
  }

  createParticles() {
    const particleCount = 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      [0.13, 0.77, 0.36], // Green
      [0.23, 0.51, 0.96], // Blue
      [0.91, 0.70, 0.03], // Yellow
      [0.65, 0.33, 0.96]  // Purple
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 6 - 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.targetRotationY = this.mouseX * 0.28;
    this.targetRotationX = -this.mouseY * 0.15;
  }

  onClick(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    if (!this.binsGroup) return;

    const intersects = this.raycaster.intersectObjects(this.binsGroup.children, true);
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && obj.parent !== this.binsGroup) {
        obj = obj.parent;
      }
      this.bounceBin(obj);
    }
  }

  bounceBin(bin) {
    if (bin.userData.isBouncing) return;
    bin.userData.isBouncing = true;

    if (window.soundManager) {
      window.soundManager.playPop();
    }

    const startY = bin.position.y;
    const startTime = performance.now();
    const duration = 500;

    const animateBounce = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const bounceHeight = Math.sin(progress * Math.PI) * 0.45;
      bin.position.y = startY + bounceHeight;
      bin.rotation.y += 0.05;

      if (progress < 1) {
        requestAnimationFrame(animateBounce);
      } else {
        bin.position.y = startY;
        bin.userData.isBouncing = false;
      }
    };
    requestAnimationFrame(animateBounce);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    if (this.binsGroup) {
      this.binsGroup.rotation.y += (this.targetRotationY - this.binsGroup.rotation.y) * 0.05;
      this.binsGroup.rotation.x += (this.targetRotationX - this.binsGroup.rotation.x) * 0.05;
    }

    this.floatingItems.forEach(item => {
      const data = item.userData;
      item.position.y += Math.sin(time * data.speed + data.offset) * 0.003;
      item.rotation.y += data.rotSpeed;
    });

    if (this.particles) {
      this.particles.rotation.y = time * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate when DOM is loaded
window.initThreeHero = function() {
  new Waste3DScene('threejs-hero-container');
};
