/**
 * Star Wars: Galactic Assault - Vector Graphics & Rendering Engine
 * High-detail procedural vector rendering for iconic Star Wars starfighters,
 * capital ships, laser bolts, shields, particle systems, and space environments.
 */

class GraphicsRenderer {
    constructor() {
        this.frame = 0;
    }

    updateFrame() {
        this.frame++;
    }

    // --- Starfield & Space Environment ---
    drawBackground(ctx, width, height, stars, nebulae, hyperspaceFactor = 0) {
        // Deep space void
        ctx.fillStyle = '#02030a';
        ctx.fillRect(0, 0, width, height);

        // Draw glowing space nebulae
        nebulae.forEach(nebula => {
            const grad = ctx.createRadialGradient(nebula.x, nebula.y, 10, nebula.x, nebula.y, nebula.radius);
            grad.addColorStop(0, nebula.color1);
            grad.addColorStop(0.6, nebula.color2);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw parallax stars (stretching during hyperspace)
        ctx.save();
        stars.forEach(star => {
            ctx.fillStyle = star.color || '#ffffff';
            ctx.shadowColor = star.color || '#ffffff';
            ctx.shadowBlur = star.size > 1.5 ? 4 : 0;

            if (hyperspaceFactor > 0.05) {
                // Warp streak
                const streakLen = (star.speed * 40 + 20) * hyperspaceFactor;
                ctx.strokeStyle = star.color || 'rgba(180, 220, 255, 0.9)';
                ctx.lineWidth = star.size * (1 + hyperspaceFactor * 1.5);
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x, star.y + streakLen);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
    }

    // --- Player Ships ---

    // T-65B X-Wing Fighter
    drawXWing(ctx, x, y, angle, sFoilsOpen = true, thruster = 1, isShielded = false, shieldAlpha = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Engine Thruster Plumes
        const flameLength = 15 + thruster * 18 + Math.sin(this.frame * 0.4) * 4;
        const flameSpread = sFoilsOpen ? 18 : 12;

        const engines = [
            { x: -flameSpread, y: 16 },
            { x: flameSpread, y: 16 },
            { x: -flameSpread * 0.7, y: 18 },
            { x: flameSpread * 0.7, y: 18 }
        ];

        engines.forEach(eng => {
            const grad = ctx.createLinearGradient(eng.x, eng.y, eng.x, eng.y + flameLength);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#ff5599');
            grad.addColorStop(0.8, '#ff1144');
            grad.addColorStop(1, 'rgba(255, 0, 50, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(eng.x - 3, eng.y);
            ctx.lineTo(eng.x + 3, eng.y);
            ctx.lineTo(eng.x, eng.y + flameLength);
            ctx.closePath();
            ctx.fill();
        });

        // Wings (S-Foils)
        const wingSpan = sFoilsOpen ? 32 : 24;
        const wingSweep = sFoilsOpen ? 10 : 16;

        ctx.fillStyle = '#b0b8c4';
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1.5;

        // Port & Starboard Upper Wings
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(-wingSpan, wingSweep);
        ctx.lineTo(-wingSpan, wingSweep - 12);
        ctx.lineTo(-6, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(wingSpan, wingSweep);
        ctx.lineTo(wingSpan, wingSweep - 12);
        ctx.lineTo(6, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rebel Red Squadron Stripe markings
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.rect(-wingSpan + 4, wingSweep - 10, 8, 4);
        ctx.rect(wingSpan - 12, wingSweep - 10, 8, 4);
        ctx.fill();

        // 4 Wing-tip Taim & Bak Laser Cannons
        const cannonOffset = wingSpan;
        const cannonY = wingSweep - 14;
        ctx.fillStyle = '#4a5568';
        [-cannonOffset, cannonOffset].forEach(cx => {
            ctx.fillRect(cx - 2, cannonY - 26, 4, 34);
            // Flash emitter tips
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(cx - 1.5, cannonY - 28, 3, 3);
            ctx.fillStyle = '#4a5568';
        });

        // Main Fuselage & Nosecone
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(0, -32); // Nose tip
        ctx.lineTo(7, 16);
        ctx.lineTo(-7, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Nose tip cone accent
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(4, -18);
        ctx.lineTo(-4, -18);
        ctx.closePath();
        ctx.fill();

        // Cockpit Canopy (Dark tinted glass with glint)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(4, -2);
        ctx.lineTo(-4, -2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Astromech Droid (R2-D2 in socket!)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 4, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // R2 Blue Dome stripes & Red Eye
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(0, 4, 2, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.fill();

        ctx.fillStyle = (this.frame % 30 < 15) ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(0.8, 3.5, 1, 0, Math.PI * 2);
        ctx.fill();

        // Deflector Shield Bubble
        if (isShielded || shieldAlpha > 0.05) {
            this.drawShield(ctx, 0, 0, 36, shieldAlpha || 0.4, '#38bdf8');
        }

        ctx.restore();
    }

    // Millennium Falcon (YT-1300 Light Freighter)
    drawMillenniumFalcon(ctx, x, y, angle, thruster = 1, turretAngle = 0, isShielded = false, shieldAlpha = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Rear Hyperdrive Blue Engine Strip Glow
        const engineGlow = 10 + thruster * 14 + Math.sin(this.frame * 0.5) * 3;
        const grad = ctx.createLinearGradient(0, 24, 0, 24 + engineGlow);
        grad.addColorStop(0, '#67e8f9');
        grad.addColorStop(0.4, '#06b6d4');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-22, 24, 44, engineGlow);

        // Main Saucer Hull
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 2, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Forward Cargo Mandibles / Prongs
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.rect(-16, -34, 11, 20);
        ctx.rect(5, -34, 11, 20);
        ctx.fill();
        ctx.stroke();

        // Center notch between mandibles
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-5, -14);
        ctx.lineTo(5, -14);
        ctx.lineTo(0, -22);
        ctx.closePath();
        ctx.fill();

        // Starboard Cockpit & Access Tube
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(20, -12, 14, 8); // Tube
        ctx.strokeRect(20, -12, 14, 8);

        // Cockpit Cone
        ctx.beginPath();
        ctx.moveTo(34, -14);
        ctx.lineTo(34, -4);
        ctx.lineTo(41, -7);
        ctx.lineTo(41, -11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit Canopy Glass
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(36, -11, 3, 4);

        // Sensor Rectenna Dish (Starboard dorsal)
        ctx.save();
        ctx.translate(-12, -8);
        ctx.rotate(Math.sin(this.frame * 0.05) * 0.3);
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Hull plating panels & vents (Circle exhaust grilles)
        ctx.fillStyle = '#475569';
        const vents = [
            { x: -12, y: 14 }, { x: -4, y: 16 }, { x: 4, y: 16 }, { x: 12, y: 14 },
            { x: -16, y: 8 }, { x: 16, y: 8 }
        ];
        vents.forEach(v => {
            ctx.beginPath();
            ctx.arc(v.x, v.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Top Rotating Quad Laser Turret
        ctx.save();
        ctx.rotate(turretAngle - angle); // Relative turret rotation
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();

        // 4 Laser Barrels
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-4, -16, 2, 12);
        ctx.fillRect(2, -16, 2, 12);
        ctx.fillRect(-6, -14, 2, 10);
        ctx.fillRect(4, -14, 2, 10);
        ctx.restore();

        // Deflector Shield
        if (isShielded || shieldAlpha > 0.05) {
            this.drawShield(ctx, 0, 0, 42, shieldAlpha || 0.4, '#38bdf8');
        }

        ctx.restore();
    }

    // RZ-1 A-Wing Interceptor
    drawAWing(ctx, x, y, angle, thruster = 1, isShielded = false, shieldAlpha = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Twin Large Engine Plumes
        const flameLength = 18 + thruster * 22 + Math.sin(this.frame * 0.6) * 5;
        [-9, 9].forEach(ex => {
            const grad = ctx.createLinearGradient(ex, 14, ex, 14 + flameLength);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#f59e0b');
            grad.addColorStop(0.8, '#ef4444');
            grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(ex - 3.5, 14);
            ctx.lineTo(ex + 3.5, 14);
            ctx.lineTo(ex, 14 + flameLength);
            ctx.closePath();
            ctx.fill();
        });

        // Arrowhead Wedge Hull
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(0, -26); // Nose
        ctx.lineTo(16, 14);
        ctx.lineTo(8, 18);
        ctx.lineTo(0, 15);
        ctx.lineTo(-8, 18);
        ctx.lineTo(-16, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Red Markings
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(8, 6);
        ctx.lineTo(4, 8);
        ctx.lineTo(0, -10);
        ctx.lineTo(-4, 8);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.fill();

        // Twin Outboard Wingtip Laser Barrels
        ctx.fillStyle = '#475569';
        [-17, 17].forEach(bx => {
            ctx.fillRect(bx - 1.5, -12, 3, 24);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(bx - 1, -14, 2, 2);
            ctx.fillStyle = '#475569';
        });

        // Large Bubble Cockpit Canopy
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(0, -2, 5, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        // Deflector Shield
        if (isShielded || shieldAlpha > 0.05) {
            this.drawShield(ctx, 0, 0, 30, shieldAlpha || 0.4, '#38bdf8');
        }

        ctx.restore();
    }

    // --- Imperial Starships ---

    // Standard TIE Fighter (Twin Ion Engine)
    drawTieFighter(ctx, x, y, angle, thruster = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Twin solar collector wings (Hexagonal vertical panels)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;

        [-22, 22].forEach(wx => {
            ctx.beginPath();
            ctx.moveTo(wx - 2, -24);
            ctx.lineTo(wx + 2, -24);
            ctx.lineTo(wx + 4, 0);
            ctx.lineTo(wx + 2, 24);
            ctx.lineTo(wx - 2, 24);
            ctx.lineTo(wx - 4, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Solar panel crossbar struts
            ctx.strokeStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(wx, -24);
            ctx.lineTo(wx, 24);
            ctx.moveTo(wx - 3, 0);
            ctx.lineTo(wx + 3, 0);
            ctx.stroke();
        });

        // Wing Connection Pylons
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-22, -3, 44, 6);

        // Central Spherical Cockpit Pod
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Iconic 8-Spoke Glass Cockpit Viewport
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -4, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Chin Green Laser Emitters
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-3, -11, 1.8, 0, Math.PI * 2);
        ctx.arc(3, -11, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Rear Twin Ion Engine Glow Dots
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-2.5, 9, 1.5, 0, Math.PI * 2);
        ctx.arc(2.5, 9, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // TIE Interceptor (Dagger Solar Wings)
    drawTieInterceptor(ctx, x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;

        // Dagger pointed notched solar wings extending forward
        [-24, 24].forEach(wx => {
            const side = wx > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(wx, -30); // Front point
            ctx.lineTo(wx + side * 4, -10);
            ctx.lineTo(wx + side * 1, 0);
            ctx.lineTo(wx + side * 4, 10);
            ctx.lineTo(wx, 26); // Rear point
            ctx.lineTo(wx - side * 3, 16);
            ctx.lineTo(wx - side * 1, -16);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Wingtip Laser Emitter
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(wx - 1, -32, 2, 4);
            ctx.fillStyle = '#1e293b';
        });

        // Wing Struts & Cockpit Pod
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-24, -2.5, 48, 5);

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Viewport
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -3, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // TIE Bomber (Double Cylindrical Hull)
    drawTieBomber(ctx, x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Bent Solar Wings
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;

        [-26, 26].forEach(wx => {
            const side = wx > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(wx - side * 4, -22);
            ctx.lineTo(wx, -10);
            ctx.lineTo(wx, 10);
            ctx.lineTo(wx - side * 4, 22);
            ctx.lineTo(wx - side * 6, 18);
            ctx.lineTo(wx - side * 2, 0);
            ctx.lineTo(wx - side * 6, -18);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        // Double Hull: Left Pod (Cockpit), Right Pod (Ordnance Bay)
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#334155';

        // Cockpit Pod (Left)
        ctx.beginPath();
        ctx.ellipse(-7, 0, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cockpit Window
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-7, -5, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Ordnance Pod (Right)
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(7, 0, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bomb Chute / Missile Tube
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(7, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Boss: Imperial Star Destroyer (ISD)
    drawStarDestroyer(ctx, x, y, angle, hpRatio, shieldDomes, turrets) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Stern Triple Main Ion Engines Glow
        [-28, 0, 28].forEach(ex => {
            const grad = ctx.createLinearGradient(ex, 120, ex, 160);
            grad.addColorStop(0, '#60a5fa');
            grad.addColorStop(0.5, '#2563eb');
            grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ex, 120, 16, 0, Math.PI);
            ctx.fill();
        });

        // Massive Arrowhead Dagger Hull
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, -170); // Sharp bow tip
        ctx.lineTo(95, 120); // Starboard aft corner
        ctx.lineTo(-95, 120); // Port aft corner
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Surface Deck Superstructure Terraces
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(0, -80);
        ctx.lineTo(55, 105);
        ctx.lineTo(-55, 105);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Secondary Terrace
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(35, 95);
        ctx.lineTo(-35, 95);
        ctx.closePath();
        ctx.fill();

        // Command Bridge Tower
        ctx.fillStyle = '#334155';
        ctx.fillRect(-22, 50, 44, 25);
        ctx.strokeRect(-22, 50, 44, 25);

        // Twin Deflector Shield Generator Domes (Crucial Boss Target!)
        shieldDomes.forEach(dome => {
            ctx.save();
            ctx.translate(dome.x, dome.y);
            if (dome.alive) {
                ctx.fillStyle = '#38bdf8';
                ctx.shadowColor = '#0284c7';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
            } else {
                // Destroyed ruined dome
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f97316';
                ctx.fillRect(-3, -3, 6, 6);
            }
            ctx.restore();
        });

        // Rotating Heavy Turbo-Laser Batteries
        turrets.forEach(turret => {
            ctx.save();
            ctx.translate(turret.x, turret.y);
            ctx.rotate(turret.angle - angle);

            ctx.fillStyle = turret.alive ? '#1e293b' : '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.stroke();

            if (turret.alive) {
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(-1.5, -10, 3, 8); // Double barrel
            }
            ctx.restore();
        });

        // Ventral Hangar Bay Opening
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, 0, 28, 16);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-14, 0, 28, 16);

        ctx.restore();
    }

    // Boss 2: Darth Vader's TIE Advanced x1
    drawTieAdvanced(ctx, x, y, angle, isShielded = false, shieldAlpha = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Curved Bent Solar Wings
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 2;

        [-28, 28].forEach(wx => {
            const side = wx > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(wx - side * 6, -24);
            ctx.lineTo(wx + side * 4, -14);
            ctx.lineTo(wx + side * 6, 0);
            ctx.lineTo(wx + side * 4, 14);
            ctx.lineTo(wx - side * 6, 24);
            ctx.lineTo(wx - side * 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        // Elongated Aft Fuselage
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.ellipse(0, 4, 10, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cockpit Sphere
        ctx.fillStyle = '#52525b';
        ctx.beginPath();
        ctx.arc(0, -2, 12, 0, Math.PI * 2);
        ctx.fill();

        // Red Sith Viewport & Dual Heavy Blasters
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -6, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-4, -15, 2.5, 6);
        ctx.fillRect(1.5, -15, 2.5, 6);

        if (isShielded || shieldAlpha > 0.05) {
            this.drawShield(ctx, 0, 0, 36, shieldAlpha || 0.5, '#ef4444');
        }

        ctx.restore();
    }

    // --- Weapons, Shields & FX ---

    // Glowing Laser Bolt
    drawLaser(ctx, laser) {
        ctx.save();
        ctx.translate(laser.x, laser.y);
        ctx.rotate(laser.angle);

        const length = laser.length || 24;
        const color = laser.color || '#ef4444'; // Red or Green

        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        // Outer glow
        ctx.strokeStyle = color;
        ctx.lineWidth = laser.width || 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -length * 0.5);
        ctx.lineTo(0, length * 0.5);
        ctx.stroke();

        // Inner white-hot core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5, (laser.width || 4) * 0.4);
        ctx.beginPath();
        ctx.moveTo(0, -length * 0.4);
        ctx.lineTo(0, length * 0.4);
        ctx.stroke();

        ctx.restore();
    }

    // Homing Proton Torpedo
    drawProtonTorpedo(ctx, torpedo) {
        ctx.save();
        ctx.translate(torpedo.x, torpedo.y);
        ctx.rotate(torpedo.angle);

        // Glowing Blue Energy Corona
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Brilliant White Warhead Center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Trailing Energy Spurt
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 14 + Math.sin(this.frame * 0.8) * 4);
        ctx.stroke();

        ctx.restore();
    }

    // Pulsating Deflector Shield Bubble
    drawShield(ctx, x, y, radius, alpha, color = '#38bdf8') {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(x, y, radius + Math.sin(this.frame * 0.3) * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // Energy Arcs / Hexagonal ripples
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.9, 0, Math.PI * 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.9, Math.PI, Math.PI * 1.6);
        ctx.stroke();

        ctx.restore();
    }

    // Asteroids
    drawAsteroid(ctx, ast) {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.angle);

        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ast.vertices.forEach((v, idx) => {
            if (idx === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Craters
        ctx.fillStyle = '#334155';
        ast.craters.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // Pickups / Powerups
    drawPowerup(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        const floatY = Math.sin(this.frame * 0.1) * 3;
        ctx.translate(0, floatY);

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;

        // Rotating diamond container
        ctx.rotate(this.frame * 0.04);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-12, -12, 24, 24);

        // Icon inside
        ctx.fillStyle = p.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, 0, 0);

        ctx.restore();
    }
}

// Global graphics renderer
window.graphicsRenderer = new GraphicsRenderer();

