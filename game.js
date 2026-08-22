/**
 * Star Wars: Galactic Assault - Main Game Engine
 * 60FPS physics, AI behaviors, weapons systems, particle engine,
 * wave/boss progression, HUD, and multi-input controller.
 */

class StarWarsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Game States: INTRO, SELECT, PLAYING, HYPERSPACE, GAMEOVER, VICTORY
        this.state = 'INTRO';

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('sw_high_score') || '0', 10);
        this.sector = 1;
        this.multiplier = 1;
        this.multiplierTimer = 0;

        // Player Ship Profiles
        this.shipProfiles = {
            xwing: {
                name: 'T-65B X-Wing',
                type: 'xwing',
                maxSpeed: 7.5,
                accel: 0.35,
                rotSpeed: 0.07,
                maxHull: 100,
                maxShield: 100,
                shieldRegen: 0.12,
                laserCooldown: 120, // ms
                laserDamage: 25,
                torpedoCapacity: 4,
                special: 'S-Foils (Toggle Attack/Speed mode)'
            },
            falcon: {
                name: 'Millennium Falcon',
                type: 'falcon',
                maxSpeed: 6.2,
                accel: 0.28,
                rotSpeed: 0.05,
                maxHull: 220,
                maxShield: 160,
                shieldRegen: 0.18,
                laserCooldown: 140,
                laserDamage: 38,
                torpedoCapacity: 6,
                special: '360° Heavy Quad Turret'
            },
            awing: {
                name: 'RZ-1 A-Wing',
                type: 'awing',
                maxSpeed: 10.5,
                accel: 0.55,
                rotSpeed: 0.09,
                maxHull: 70,
                maxShield: 70,
                shieldRegen: 0.15,
                laserCooldown: 85,
                laserDamage: 20,
                torpedoCapacity: 3,
                special: 'Hyper-Agility & Rapid Fire'
            }
        };

        this.selectedShipType = 'xwing';

        // Entities
        this.player = null;
        this.lasers = [];
        this.torpedoes = [];
        this.enemies = [];
        this.asteroids = [];
        this.particles = [];
        this.powerups = [];
        this.boss = null;

        // Environment
        this.stars = [];
        this.nebulae = [];
        this.hyperspaceFactor = 0;
        this.hyperspaceTimer = 0;

        // Screen Shake
        this.shakeIntensity = 0;

        // Input
        this.keys = {};
        this.mouse = { x: this.width / 2, y: this.height / 2, down: false, rightDown: false };
        this.touch = { active: false, joyX: 0, joyY: 0, firing: false, boosting: false };

        this.lastTime = performance.now();

        this.initEnvironment();
        this.bindEvents();
        this.resize();

        // Start Loop
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initEnvironment() {
        this.stars = [];
        for (let i = 0; i < 180; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 2 + 0.4,
                color: Math.random() > 0.8 ? '#93c5fd' : (Math.random() > 0.9 ? '#fde047' : '#ffffff')
            });
        }

        this.nebulae = [
            { x: this.width * 0.25, y: this.height * 0.3, radius: 280, color1: 'rgba(37, 99, 235, 0.12)', color2: 'rgba(99, 102, 241, 0.04)' },
            { x: this.width * 0.8, y: this.height * 0.7, radius: 340, color1: 'rgba(168, 85, 247, 0.10)', color2: 'rgba(236, 72, 153, 0.03)' }
        ];
    }

    initPlayer(shipType = 'xwing') {
        const p = this.shipProfiles[shipType] || this.shipProfiles.xwing;
        this.player = {
            type: p.type,
            name: p.name,
            x: this.width / 2,
            y: this.height * 0.75,
            vx: 0,
            vy: 0,
            angle: -Math.PI / 2, // Facing up
            turretAngle: -Math.PI / 2,
            maxSpeed: p.maxSpeed,
            accel: p.accel,
            rotSpeed: p.rotSpeed,
            hull: p.maxHull,
            maxHull: p.maxHull,
            shield: p.maxShield,
            maxShield: p.maxShield,
            shieldRegen: p.shieldRegen,
            shieldHitAlpha: 0,
            laserCooldown: p.laserCooldown,
            laserDamage: p.laserDamage,
            lastLaserTime: 0,
            laserAltIndex: 0,
            torpedoes: p.torpedoCapacity,
            maxTorpedoes: p.torpedoCapacity,
            lastTorpedoTime: 0,
            sFoilsOpen: true,
            boostActive: false,
            repairCooldown: 0,
            invulnerableTime: 120, // Spawn shield frames
            alive: true
        };
    }

    startSector(sectorNum) {
        this.sector = sectorNum;
        this.enemies = [];
        this.asteroids = [];
        this.lasers = [];
        this.torpedoes = [];
        this.powerups = [];
        this.boss = null;

        // Spawn Asteroid Belt
        const astCount = 4 + Math.min(this.sector * 2, 10);
        for (let i = 0; i < astCount; i++) {
            this.spawnAsteroid();
        }

        // Check if Boss Sector (Every 3rd sector is Star Destroyer or Vader)
        if (this.sector % 3 === 0) {
            this.spawnStarDestroyer();
        } else if (this.sector % 4 === 0) {
            this.spawnVader();
        } else {
            // Spawn TIE squadrons
            const tieCount = 4 + this.sector * 2;
            for (let i = 0; i < tieCount; i++) {
                setTimeout(() => {
                    if (this.state === 'PLAYING') this.spawnEnemy();
                }, i * 1200);
            }
        }

        if (window.soundEngine) {
            window.soundEngine.startBattleMusic();
        }
    }

    spawnAsteroid(x, y, radius = null) {
        const rad = radius || (25 + Math.random() * 35);
        const vertices = [];
        const numPoints = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const dist = rad * (0.75 + Math.random() * 0.5);
            vertices.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
        }

        const craters = [];
        const cCount = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < cCount; i++) {
            craters.push({
                x: (Math.random() * 2 - 1) * (rad * 0.45),
                y: (Math.random() * 2 - 1) * (rad * 0.45),
                r: 3 + Math.random() * (rad * 0.2)
            });
        }

        this.asteroids.push({
            x: x !== undefined ? x : Math.random() * this.width,
            y: y !== undefined ? y : -50 - Math.random() * 100,
            vx: (Math.random() * 2 - 1) * 1.2,
            vy: 0.8 + Math.random() * 1.5,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() * 2 - 1) * 0.02,
            radius: rad,
            hull: Math.floor(rad * 1.5),
            vertices: vertices,
            craters: craters
        });
    }

    spawnEnemy() {
        if (!this.player || !this.player.alive) return;
        const types = ['tie'];
        if (this.sector >= 2) types.push('interceptor');
        if (this.sector >= 3) types.push('bomber');

        const chosenType = types[Math.floor(Math.random() * types.length)];
        const side = Math.random() > 0.5 ? 1 : -1;

        let hp = 45;
        let speed = 4.2;
        let scoreVal = 200;

        if (chosenType === 'interceptor') {
            hp = 35;
            speed = 5.8;
            scoreVal = 350;
        } else if (chosenType === 'bomber') {
            hp = 90;
            speed = 3.0;
            scoreVal = 400;
        }

        const enemy = {
            type: chosenType,
            x: side === 1 ? -40 : this.width + 40,
            y: Math.random() * (this.height * 0.4),
            vx: side * (1.5 + Math.random() * 2),
            vy: 1.2 + Math.random() * 1.8,
            angle: Math.PI / 2,
            speed: speed,
            hull: hp,
            maxHull: hp,
            scoreVal: scoreVal,
            lastFireTime: performance.now() + Math.random() * 1000,
            fireRate: chosenType === 'interceptor' ? 1200 : (chosenType === 'bomber' ? 2200 : 1600),
            aiState: 'attack',
            strafeTimer: 0
        };

        if (window.soundEngine && Math.random() > 0.5) {
            window.soundEngine.playTieScream();
        }

        this.enemies.push(enemy);
    }

    spawnStarDestroyer() {
        const isd = {
            type: 'stardestroyer',
            x: this.width / 2,
            y: -180,
            targetY: 160,
            angle: Math.PI, // Pointing down
            vx: 0,
            vy: 0.6,
            hull: 800 + this.sector * 200,
            maxHull: 800 + this.sector * 200,
            scoreVal: 5000,
            shieldDomes: [
                { x: -16, y: 40, alive: true, hull: 150 },
                { x: 16, y: 40, alive: true, hull: 150 }
            ],
            turrets: [
                { x: -35, y: 20, angle: Math.PI / 2, alive: true, hull: 80, lastFire: 0 },
                { x: 35, y: 20, angle: Math.PI / 2, alive: true, hull: 80, lastFire: 0 },
                { x: -20, y: -40, angle: Math.PI / 2, alive: true, hull: 80, lastFire: 0 },
                { x: 20, y: -40, angle: Math.PI / 2, alive: true, hull: 80, lastFire: 0 }
            ],
            lastSpawnTie: 0,
            phase: 1
        };

        this.boss = isd;
    }

    spawnVader() {
        const vader = {
            type: 'vader',
            x: this.width / 2,
            y: -80,
            targetY: 140,
            angle: Math.PI / 2,
            vx: 0,
            vy: 2.0,
            speed: 6.5,
            hull: 600 + this.sector * 150,
            maxHull: 600 + this.sector * 150,
            shield: 300,
            maxShield: 300,
            shieldAlpha: 0,
            scoreVal: 7500,
            lastFireTime: 0,
            fireRate: 450,
            specialCooldown: 0,
            aiState: 'strafe'
        };
        this.boss = vader;
    }

    // --- Actions ---

    firePlayerLaser() {
        if (!this.player || !this.player.alive) return;
        const now = performance.now();
        if (now - this.player.lastLaserTime < this.player.laserCooldown) return;
        this.player.lastLaserTime = now;

        const p = this.player;
        const soundType = p.type;
        if (window.soundEngine) window.soundEngine.playLaser(soundType);

        if (p.type === 'xwing') {
            // Alternating 4 wingtip cannons
            const wingOffsets = p.sFoilsOpen ?
                [[-32, -14], [32, -14], [-24, 10], [24, 10]] :
                [[-18, -10], [18, -10]];

            const offset = wingOffsets[p.laserAltIndex % wingOffsets.length];
            p.laserAltIndex++;

            // Rotate offset by ship angle
            const cos = Math.cos(p.angle);
            const sin = Math.sin(p.angle);
            const rx = offset[0] * cos - offset[1] * sin;
            const ry = offset[0] * sin + offset[1] * cos;

            this.lasers.push({
                x: p.x + rx,
                y: p.y + ry,
                vx: Math.cos(p.angle) * 16 + p.vx * 0.3,
                vy: Math.sin(p.angle) * 16 + p.vy * 0.3,
                angle: p.angle + Math.PI / 2,
                damage: p.laserDamage,
                color: '#ef4444',
                isPlayer: true,
                length: 26,
                width: 4
            });
        } else if (p.type === 'falcon') {
            // Heavy quad lasers from rotating turret
            const turretAngle = p.turretAngle;
            [-4, 4].forEach(off => {
                const perp = turretAngle + Math.PI / 2;
                const lx = p.x + Math.cos(perp) * off;
                const ly = p.y + Math.sin(perp) * off;
                this.lasers.push({
                    x: lx,
                    y: ly,
                    vx: Math.cos(turretAngle) * 18,
                    vy: Math.sin(turretAngle) * 18,
                    angle: turretAngle + Math.PI / 2,
                    damage: p.laserDamage,
                    color: '#ef4444',
                    isPlayer: true,
                    length: 30,
                    width: 5
                });
            });
        } else if (p.type === 'awing') {
            // Rapid twin lasers
            [-16, 16].forEach(ox => {
                const cos = Math.cos(p.angle);
                const sin = Math.sin(p.angle);
                const rx = ox * cos - (-10) * sin;
                const ry = ox * sin + (-10) * cos;
                this.lasers.push({
                    x: p.x + rx,
                    y: p.y + ry,
                    vx: Math.cos(p.angle) * 20,
                    vy: Math.sin(p.angle) * 20,
                    angle: p.angle + Math.PI / 2,
                    damage: p.laserDamage,
                    color: '#ef4444',
                    isPlayer: true,
                    length: 22,
                    width: 3.5
                });
            });
        }
    }

    fireProtonTorpedo() {
        if (!this.player || !this.player.alive || this.player.torpedoes <= 0) return;
        const now = performance.now();
        if (now - this.player.lastTorpedoTime < 800) return;

        this.player.lastTorpedoTime = now;
        this.player.torpedoes--;

        if (window.soundEngine) window.soundEngine.playProtonTorpedo();

        // Launch torpedo with initial forward impulse
        this.torpedoes.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(this.player.angle) * 6,
            vy: Math.sin(this.player.angle) * 6,
            angle: this.player.angle,
            speed: 12,
            damage: 180,
            turnRate: 0.08,
            target: this.findClosestEnemy(this.player.x, this.player.y),
            life: 240
        });

        this.updateHUD();
    }

    repairAstromech() {
        if (!this.player || !this.player.alive || this.player.repairCooldown > 0) return;

        this.player.repairCooldown = 600; // 10 seconds cooldown
        this.player.shield = Math.min(this.player.maxShield, this.player.shield + this.player.maxShield * 0.5);
        this.player.hull = Math.min(this.player.maxHull, this.player.hull + this.player.maxHull * 0.25);

        if (window.soundEngine) window.soundEngine.playR2D2('happy');

        // Spark repair particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y,
                vx: (Math.random() * 2 - 1) * 3,
                vy: (Math.random() * 2 - 1) * 3,
                color: '#38bdf8',
                size: 3,
                life: 30,
                maxLife: 30
            });
        }
    }

    toggleSFoils() {
        if (!this.player || this.player.type !== 'xwing') return;
        this.player.sFoilsOpen = !this.player.sFoilsOpen;
        if (this.player.sFoilsOpen) {
            this.player.maxSpeed = this.shipProfiles.xwing.maxSpeed;
            this.player.laserCooldown = this.shipProfiles.xwing.laserCooldown;
        } else {
            // Closed S-Foils: High speed cruise mode!
            this.player.maxSpeed = this.shipProfiles.xwing.maxSpeed * 1.45;
            this.player.laserCooldown = this.shipProfiles.xwing.laserCooldown * 1.8;
        }
        if (window.soundEngine) window.soundEngine.playR2D2('alert');
    }

    findClosestEnemy(x, y) {
        if (this.boss && (this.boss.hull > 0 || (this.boss.shieldDomes && this.boss.shieldDomes.some(d => d.alive)))) {
            return this.boss;
        }
        let closest = null;
        let minDist = 99999;
        this.enemies.forEach(e => {
            const d = Math.hypot(e.x - x, e.y - y);
            if (d < minDist) {
                minDist = d;
                closest = e;
            }
        });
        return closest;
    }

    triggerExplosion(x, y, size = 'medium', color = '#f97316') {
        const count = size === 'boss' ? 80 : (size === 'large' ? 40 : 20);
        const speedMult = size === 'boss' ? 8 : 4;

        if (window.soundEngine) window.soundEngine.playExplosion(size);
        this.shakeIntensity = size === 'boss' ? 25 : (size === 'large' ? 12 : 5);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speedMult + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: Math.random() > 0.4 ? color : (Math.random() > 0.5 ? '#fde047' : '#ffffff'),
                size: Math.random() * (size === 'boss' ? 8 : 4) + 2,
                life: 30 + Math.random() * 30,
                maxLife: 60
            });
        }
    }

    triggerHyperspace() {
        this.state = 'HYPERSPACE';
        this.hyperspaceTimer = 120; // 2 seconds
        if (window.soundEngine) window.soundEngine.playHyperspace();
    }

    // --- Main Game Update Loop ---

    update(dt) {
        window.graphicsRenderer.updateFrame();

        // Shake decay
        if (this.shakeIntensity > 0) this.shakeIntensity *= 0.9;

        // Hyperspace State
        if (this.state === 'HYPERSPACE') {
            this.hyperspaceFactor = Math.min(1, (120 - this.hyperspaceTimer) / 30);
            this.hyperspaceTimer--;

            // Move stars rapidly
            this.stars.forEach(s => {
                s.y += s.speed * 25 * this.hyperspaceFactor;
                if (s.y > this.height) s.y = 0;
            });

            if (this.hyperspaceTimer <= 0) {
                this.hyperspaceFactor = 0;
                this.state = 'PLAYING';
                this.startSector(this.sector + 1);
            }
            return;
        }

        if (this.state !== 'PLAYING') return;

        // Background Star Drift
        this.stars.forEach(s => {
            s.y += s.speed * 0.8;
            if (s.y > this.height) {
                s.y = 0;
                s.x = Math.random() * this.width;
            }
        });

        // Multiplier decay
        if (this.multiplierTimer > 0) {
            this.multiplierTimer -= dt;
            if (this.multiplierTimer <= 0) this.multiplier = 1;
        }

        // Update Player
        if (this.player && this.player.alive) {
            const p = this.player;

            // Shield regeneration
            if (p.shield < p.maxShield) {
                p.shield = Math.min(p.maxShield, p.shield + p.shieldRegen);
            }
            if (p.shieldHitAlpha > 0) p.shieldHitAlpha -= 0.04;
            if (p.repairCooldown > 0) p.repairCooldown--;
            if (p.invulnerableTime > 0) p.invulnerableTime--;

            // Flight Controls (Mouse or Keyboard or Touch)
            let moveX = 0;
            let moveY = 0;
            const isBoost = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touch.boosting;
            const currentMaxSpeed = p.maxSpeed * (isBoost ? 1.4 : 1.0);
            const currentAccel = p.accel * (isBoost ? 1.5 : 1.0);

            if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
            if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

            if (this.touch.active) {
                moveX = this.touch.joyX;
                moveY = this.touch.joyY;
            }

            // Apply acceleration
            p.vx += moveX * currentAccel;
            p.vy += moveY * currentAccel;

            // Dampening / Friction
            p.vx *= 0.95;
            p.vy *= 0.95;

            // Speed Clamp
            const currentSpeed = Math.hypot(p.vx, p.vy);
            if (currentSpeed > currentMaxSpeed) {
                p.vx = (p.vx / currentSpeed) * currentMaxSpeed;
                p.vy = (p.vy / currentSpeed) * currentMaxSpeed;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Boundary clamping
            p.x = Math.max(30, Math.min(this.width - 30, p.x));
            p.y = Math.max(40, Math.min(this.height - 40, p.y));

            // Aiming angle
            const targetAngle = Math.atan2(this.mouse.y - p.y, this.mouse.x - p.x);
            p.turretAngle = targetAngle;

            // Smooth ship banking towards movement or mouse
            if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
                const moveAngle = Math.atan2(moveY, moveX);
                p.angle = moveAngle;
            } else {
                p.angle = -Math.PI / 2; // Return to facing up
            }

            // Thruster flame particles
            if (Math.random() > 0.3) {
                this.particles.push({
                    x: p.x + (Math.random() * 2 - 1) * 8,
                    y: p.y + 16,
                    vx: (Math.random() * 2 - 1) * 0.8,
                    vy: 2 + Math.random() * 3,
                    color: '#ff4444',
                    size: 2.5,
                    life: 15,
                    maxLife: 15
                });
            }

            // Auto-fire if mouse down or space held or touch firing
            if (this.mouse.down || this.keys['Space'] || this.touch.firing) {
                this.firePlayerLaser();
            }
        }

        // Update Lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const l = this.lasers[i];
            l.x += l.vx;
            l.y += l.vy;

            // Laser out of bounds
            if (l.x < -50 || l.x > this.width + 50 || l.y < -50 || l.y > this.height + 50) {
                this.lasers.splice(i, 1);
                continue;
            }

            // Laser Collisions
            if (l.isPlayer) {
                // Check enemy hits
                let hit = false;
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const e = this.enemies[j];
                    if (Math.hypot(e.x - l.x, e.y - l.y) < 28) {
                        e.hull -= l.damage;
                        this.particles.push({
                            x: l.x, y: l.y,
                            vx: (Math.random() * 2 - 1) * 2, vy: (Math.random() * 2 - 1) * 2,
                            color: '#22c55e', size: 3, life: 15, maxLife: 15
                        });

                        if (e.hull <= 0) {
                            this.addScore(e.scoreVal);
                            this.triggerExplosion(e.x, e.y, 'medium');
                            this.enemies.splice(j, 1);
                        }
                        hit = true;
                        break;
                    }
                }

                // Check Asteroid hits
                if (!hit) {
                    for (let a = this.asteroids.length - 1; a >= 0; a--) {
                        const ast = this.asteroids[a];
                        if (Math.hypot(ast.x - l.x, ast.y - l.y) < ast.radius) {
                            ast.hull -= l.damage;
                            this.particles.push({
                                x: l.x, y: l.y,
                                vx: (Math.random() * 2 - 1) * 2, vy: (Math.random() * 2 - 1) * 2,
                                color: '#94a3b8', size: 3, life: 12, maxLife: 12
                            });
                            if (ast.hull <= 0) {
                                this.triggerExplosion(ast.x, ast.y, 'small', '#94a3b8');
                                this.addScore(50);
                                if (ast.radius > 30) {
                                    // Break into 2 smaller asteroids
                                    this.spawnAsteroid(ast.x - 15, ast.y, ast.radius * 0.55);
                                    this.spawnAsteroid(ast.x + 15, ast.y, ast.radius * 0.55);
                                }
                                this.asteroids.splice(a, 1);
                            }
                            hit = true;
                            break;
                        }
                    }
                }

                // Check Boss hits
                if (!hit && this.boss) {
                    const b = this.boss;
                    if (b.type === 'stardestroyer') {
                        // Check shield domes first
                        let domeHit = false;
                        b.shieldDomes.forEach(dome => {
                            if (dome.alive && Math.hypot(b.x + dome.x - l.x, b.y + dome.y - l.y) < 14) {
                                dome.hull -= l.damage;
                                domeHit = true;
                                if (dome.hull <= 0) {
                                    dome.alive = false;
                                    this.triggerExplosion(b.x + dome.x, b.y + dome.y, 'large');
                                    this.addScore(1000);
                                }
                            }
                        });

                        if (!domeHit && Math.hypot(b.x - l.x, b.y - l.y) < 120) {
                            const shieldsUp = b.shieldDomes.some(d => d.alive);
                            if (!shieldsUp) {
                                b.hull -= l.damage;
                                if (b.hull <= 0) {
                                    this.triggerExplosion(b.x, b.y, 'boss');
                                    this.addScore(b.scoreVal);
                                    this.boss = null;
                                    setTimeout(() => this.triggerHyperspace(), 1500);
                                }
                            } else {
                                // Deflector shield active
                                if (window.soundEngine) window.soundEngine.playShieldHit();
                            }
                            hit = true;
                        }
                    } else if (b.type === 'vader') {
                        if (Math.hypot(b.x - l.x, b.y - l.y) < 32) {
                            if (b.shield > 0) {
                                b.shield -= l.damage;
                                b.shieldAlpha = 0.8;
                                if (window.soundEngine) window.soundEngine.playShieldHit();
                            } else {
                                b.hull -= l.damage;
                            }
                            if (b.hull <= 0) {
                                this.triggerExplosion(b.x, b.y, 'boss');
                                this.addScore(b.scoreVal);
                                this.boss = null;
                                setTimeout(() => this.triggerHyperspace(), 1500);
                            }
                            hit = true;
                        }
                    }
                }

                if (hit) {
                    this.lasers.splice(i, 1);
                }
            } else {
                // Imperial laser hitting player
                if (this.player && this.player.alive && this.player.invulnerableTime <= 0) {
                    const p = this.player;
                    if (Math.hypot(p.x - l.x, p.y - l.y) < 24) {
                        this.damagePlayer(l.damage);
                        this.lasers.splice(i, 1);
                    }
                }
            }
        }

        // Update Torpedoes
        for (let i = this.torpedoes.length - 1; i >= 0; i--) {
            const t = this.torpedoes[i];
            t.life--;

            if (!t.target || (t.target.hull !== undefined && t.target.hull <= 0)) {
                t.target = this.findClosestEnemy(t.x, t.y);
            }

            // Homing steering
            if (t.target) {
                const desiredAngle = Math.atan2(t.target.y - t.y, t.target.x - t.x);
                let diff = desiredAngle - t.angle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                t.angle += Math.sign(diff) * Math.min(Math.abs(diff), t.turnRate);
            }

            t.vx = Math.cos(t.angle) * t.speed;
            t.vy = Math.sin(t.angle) * t.speed;
            t.x += t.vx;
            t.y += t.vy;

            // Smoke trail
            this.particles.push({
                x: t.x, y: t.y,
                vx: (Math.random() * 2 - 1) * 0.5, vy: (Math.random() * 2 - 1) * 0.5,
                color: '#60a5fa', size: 2.5, life: 18, maxLife: 18
            });

            // Torpedo Detonation on collision
            let exploded = false;
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const e = this.enemies[j];
                if (Math.hypot(e.x - t.x, e.y - t.y) < 36) {
                    e.hull -= t.damage;
                    exploded = true;
                    if (e.hull <= 0) {
                        this.addScore(e.scoreVal);
                        this.triggerExplosion(e.x, e.y, 'large');
                        this.enemies.splice(j, 1);
                    }
                    break;
                }
            }

            if (!exploded && this.boss) {
                const b = this.boss;
                if (Math.hypot(b.x - t.x, b.y - t.y) < 90) {
                    b.hull -= t.damage;
                    exploded = true;
                    if (b.hull <= 0) {
                        this.triggerExplosion(b.x, b.y, 'boss');
                        this.addScore(b.scoreVal);
                        this.boss = null;
                        setTimeout(() => this.triggerHyperspace(), 1500);
                    }
                }
            }

            if (exploded || t.life <= 0) {
                this.triggerExplosion(t.x, t.y, 'large', '#38bdf8');
                this.torpedoes.splice(i, 1);
            }
        }

        // Update Asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const ast = this.asteroids[i];
            ast.x += ast.vx;
            ast.y += ast.vy;
            ast.angle += ast.rotSpeed;

            if (ast.y > this.height + 60) {
                this.asteroids.splice(i, 1);
                this.spawnAsteroid();
                continue;
            }

            // Asteroid vs Player collision
            if (this.player && this.player.alive && this.player.invulnerableTime <= 0) {
                if (Math.hypot(this.player.x - ast.x, this.player.y - ast.y) < ast.radius + 20) {
                    this.damagePlayer(40);
                    this.triggerExplosion(ast.x, ast.y, 'medium', '#94a3b8');
                    this.asteroids.splice(i, 1);
                }
            }
        }

        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.x += e.vx;
            e.y += e.vy;

            // AI Dogfight behaviors
            if (this.player && this.player.alive) {
                const targetAngle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                let diff = targetAngle - e.angle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                e.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.04);

                // Strafe behavior
                e.strafeTimer += dt;
                if (e.type === 'interceptor') {
                    e.vx = Math.cos(e.angle) * e.speed + Math.sin(e.strafeTimer * 3) * 3;
                }

                // Firing AI
                const now = performance.now();
                if (now - e.lastFireTime > e.fireRate && Math.abs(diff) < 0.6) {
                    e.lastFireTime = now;
                    if (window.soundEngine) window.soundEngine.playLaser('tie');

                    this.lasers.push({
                        x: e.x,
                        y: e.y,
                        vx: Math.cos(e.angle) * 11,
                        vy: Math.sin(e.angle) * 11,
                        angle: e.angle + Math.PI / 2,
                        damage: 15,
                        color: '#22c55e',
                        isPlayer: false,
                        length: 22,
                        width: 3.5
                    });
                }
            }

            // Boundary wrapping / descent
            if (e.y > this.height + 50) {
                e.y = -40;
                e.x = Math.random() * this.width;
            }
        }

        // Update Boss
        if (this.boss) {
            const b = this.boss;
            if (b.y < b.targetY) {
                b.y += b.vy;
            } else {
                b.x += Math.sin(performance.now() * 0.001) * 1.5;
            }

            if (b.type === 'stardestroyer') {
                // Turrets firing
                const now = performance.now();
                b.turrets.forEach(t => {
                    if (t.alive && this.player && this.player.alive) {
                        t.angle = Math.atan2(this.player.y - (b.y + t.y), this.player.x - (b.x + t.x));
                        if (now - t.lastFire > 2200 + Math.random() * 800) {
                            t.lastFire = now;
                            if (window.soundEngine) window.soundEngine.playLaser('turbolaser');
                            this.lasers.push({
                                x: b.x + t.x,
                                y: b.y + t.y,
                                vx: Math.cos(t.angle) * 9,
                                vy: Math.sin(t.angle) * 9,
                                angle: t.angle + Math.PI / 2,
                                damage: 25,
                                color: '#22c55e',
                                isPlayer: false,
                                length: 28,
                                width: 5
                            });
                        }
                    }
                });

                // Periodic TIE Fighter deploy from hangar
                if (now - b.lastSpawnTie > 5000 && this.enemies.length < 4) {
                    b.lastSpawnTie = now;
                    this.spawnEnemy();
                }
            } else if (b.type === 'vader') {
                if (b.shieldAlpha > 0) b.shieldAlpha -= 0.03;
                // High speed strafe & rapid blaster barrage
                const now = performance.now();
                if (now - b.lastFireTime > b.fireRate && this.player && this.player.alive) {
                    b.lastFireTime = now;
                    if (window.soundEngine) window.soundEngine.playLaser('tie');
                    [-10, 10].forEach(ox => {
                        this.lasers.push({
                            x: b.x + ox,
                            y: b.y + 15,
                            vx: Math.cos(b.angle) * 14,
                            vy: Math.sin(b.angle) * 14,
                            angle: b.angle + Math.PI / 2,
                            damage: 20,
                            color: '#22c55e',
                            isPlayer: false,
                            length: 26,
                            width: 4
                        });
                    });
                }
            }
        } else {
            // If all enemies destroyed and no boss, jump sector!
            if (this.enemies.length === 0 && this.state === 'PLAYING') {
                setTimeout(() => {
                    if (this.enemies.length === 0 && !this.boss && this.state === 'PLAYING') {
                        this.triggerHyperspace();
                    }
                }, 1000);
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.updateHUD();
    }

    damagePlayer(amount) {
        if (!this.player || !this.player.alive) return;
        const p = this.player;

        if (p.shield > 0) {
            p.shield -= amount;
            p.shieldHitAlpha = 0.9;
            if (window.soundEngine) window.soundEngine.playShieldHit();
            if (p.shield < 0) {
                p.hull += p.shield; // Overflow to hull
                p.shield = 0;
            }
        } else {
            p.hull -= amount;
            if (window.soundEngine) window.soundEngine.playExplosion('small');
        }

        this.shakeIntensity = 8;

        if (p.hull <= 0) {
            p.alive = false;
            this.triggerExplosion(p.x, p.y, 'large');
            this.state = 'GAMEOVER';
            document.getElementById('gameOverScreen').classList.remove('hidden');
            document.getElementById('finalScore').innerText = this.score;
        }
    }

    addScore(points) {
        this.score += points * this.multiplier;
        this.multiplierTimer = 4.0; // 4s to chain kills
        this.multiplier = Math.min(8, this.multiplier + 1);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('sw_high_score', this.highScore);
        }
    }

    // --- Rendering ---

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        ctx.save();
        // Apply Camera Screen Shake
        if (this.shakeIntensity > 0.5) {
            const sx = (Math.random() * 2 - 1) * this.shakeIntensity;
            const sy = (Math.random() * 2 - 1) * this.shakeIntensity;
            ctx.translate(sx, sy);
        }

        // 1. Draw Starfield & Nebulae
        window.graphicsRenderer.drawBackground(ctx, this.width, this.height, this.stars, this.nebulae, this.hyperspaceFactor);

        // 2. Draw Asteroids
        this.asteroids.forEach(ast => window.graphicsRenderer.drawAsteroid(ctx, ast));

        // 3. Draw Boss
        if (this.boss) {
            const b = this.boss;
            if (b.type === 'stardestroyer') {
                const hpRatio = b.hull / b.maxHull;
                window.graphicsRenderer.drawStarDestroyer(ctx, b.x, b.y, b.angle, hpRatio, b.shieldDomes, b.turrets);
            } else if (b.type === 'vader') {
                window.graphicsRenderer.drawTieAdvanced(ctx, b.x, b.y, b.angle, b.shield > 0, b.shieldAlpha);
            }
        }

        // 4. Draw Enemies
        this.enemies.forEach(e => {
            if (e.type === 'tie') {
                window.graphicsRenderer.drawTieFighter(ctx, e.x, e.y, e.angle);
            } else if (e.type === 'interceptor') {
                window.graphicsRenderer.drawTieInterceptor(ctx, e.x, e.y, e.angle);
            } else if (e.type === 'bomber') {
                window.graphicsRenderer.drawTieBomber(ctx, e.x, e.y, e.angle);
            }
        });

        // 5. Draw Player
        if (this.player && this.player.alive && (this.player.invulnerableTime % 6 < 3)) {
            const p = this.player;
            const isBoost = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touch.boosting;
            const thruster = isBoost ? 1.8 : 1.0;

            if (p.type === 'xwing') {
                window.graphicsRenderer.drawXWing(ctx, p.x, p.y, p.angle, p.sFoilsOpen, thruster, p.shield > 0, p.shieldHitAlpha);
            } else if (p.type === 'falcon') {
                window.graphicsRenderer.drawMillenniumFalcon(ctx, p.x, p.y, p.angle, thruster, p.turretAngle, p.shield > 0, p.shieldHitAlpha);
            } else if (p.type === 'awing') {
                window.graphicsRenderer.drawAWing(ctx, p.x, p.y, p.angle, thruster, p.shield > 0, p.shieldHitAlpha);
            }
        }

        // 6. Draw Lasers & Torpedoes
        this.lasers.forEach(l => window.graphicsRenderer.drawLaser(ctx, l));
        this.torpedoes.forEach(t => window.graphicsRenderer.drawProtonTorpedo(ctx, t));

        // 7. Draw Particles
        this.particles.forEach(pt => {
            ctx.save();
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = pt.life / pt.maxLife;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 8. Draw Targeting Reticle (Green Wireframe Lock-on)
        this.drawTargetingReticle(ctx);

        ctx.restore();
    }

    drawTargetingReticle(ctx) {
        if (!this.player || !this.player.alive) return;
        const target = this.findClosestEnemy(this.player.x, this.player.y);

        ctx.save();
        // Mouse Crosshair
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.mouse.x, this.mouse.y, 14, 0, Math.PI * 2);
        ctx.moveTo(this.mouse.x - 18, this.mouse.y);
        ctx.lineTo(this.mouse.x - 6, this.mouse.y);
        ctx.moveTo(this.mouse.x + 6, this.mouse.y);
        ctx.lineTo(this.mouse.x + 18, this.mouse.y);
        ctx.moveTo(this.mouse.x, this.mouse.y - 18);
        ctx.lineTo(this.mouse.x, this.mouse.y - 6);
        ctx.moveTo(this.mouse.x, this.mouse.y + 6);
        ctx.lineTo(this.mouse.x, this.mouse.y + 18);
        ctx.stroke();

        // Target Lock-on Brackets on Enemy
        if (target) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            const size = 26;
            ctx.strokeRect(target.x - size / 2, target.y - size / 2, size, size);

            ctx.fillStyle = '#ef4444';
            ctx.font = '10px monospace';
            ctx.fillText(`LOCK [${Math.floor(Math.hypot(target.x - this.player.x, target.y - this.player.y))}]`, target.x - 20, target.y - 18);
        }
        ctx.restore();
    }

    updateHUD() {
        if (!this.player) return;
        const p = this.player;

        // Shields & Hull bars
        const shieldPercent = Math.max(0, (p.shield / p.maxShield) * 100);
        const hullPercent = Math.max(0, (p.hull / p.maxHull) * 100);

        const shieldBar = document.getElementById('shieldBar');
        const hullBar = document.getElementById('hullBar');
        const scoreVal = document.getElementById('hudScore');
        const sectorVal = document.getElementById('hudSector');
        const torpCount = document.getElementById('hudTorpedoes');
        const multiplierVal = document.getElementById('hudMultiplier');

        if (shieldBar) shieldBar.style.width = `${shieldPercent}%`;
        if (hullBar) hullBar.style.width = `${hullPercent}%`;
        if (scoreVal) scoreVal.innerText = this.score;
        if (sectorVal) sectorVal.innerText = `SECTOR ${this.sector}`;
        if (torpCount) torpCount.innerText = p.torpedoes;
        if (multiplierVal) {
            multiplierVal.innerText = `x${this.multiplier}`;
            multiplierVal.style.color = this.multiplier > 1 ? '#facc15' : '#94a3b8';
        }
    }

    // --- Loop & Event Listeners ---

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyF') this.fireProtonTorpedo();
            if (e.code === 'KeyR') this.toggleSFoils();
            if (e.code === 'KeyE') this.repairAstromech();
            if (e.code === 'KeyM') {
                if (window.soundEngine) {
                    const muted = window.soundEngine.toggleMute();
                    document.getElementById('muteBtn').innerText = muted ? '🔇 UNMUTE' : '🔊 AUDIO';
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            if (window.soundEngine) window.soundEngine.resume();
            if (e.button === 0) this.mouse.down = true;
            if (e.button === 2) {
                e.preventDefault();
                this.fireProtonTorpedo();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.down = false;
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());

        // Mobile Touch Virtual Joystick
        const joyZone = document.getElementById('touchJoystickZone');
        if (joyZone) {
            joyZone.addEventListener('touchstart', (e) => {
                this.touch.active = true;
                const t = e.touches[0];
                this.touchOrigin = { x: t.clientX, y: t.clientY };
            });

            joyZone.addEventListener('touchmove', (e) => {
                if (!this.touch.active) return;
                const t = e.touches[0];
                const dx = t.clientX - this.touchOrigin.x;
                const dy = t.clientY - this.touchOrigin.y;
                const dist = Math.hypot(dx, dy);
                const maxD = 45;
                this.touch.joyX = Math.max(-1, Math.min(1, dx / maxD));
                this.touch.joyY = Math.max(-1, Math.min(1, dy / maxD));
            });

            joyZone.addEventListener('touchend', () => {
                this.touch.active = false;
                this.touch.joyX = 0;
                this.touch.joyY = 0;
            });
        }
    }
}

// Global Game instance launcher
window.addEventListener('load', () => {
    window.game = new StarWarsGame();
});

