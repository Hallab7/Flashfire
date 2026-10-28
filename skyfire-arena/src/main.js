import Phaser from 'phaser';
import './style.css';


const WIDTH = 1280;
const HEIGHT = 720;
const SCORE_LIMIT = 12;
const MATCH_SECONDS = 180;

const WEAPONS = {
  rifle: {
    label: 'RIFLE', mode: 'AUTOMATIC', rate: 115, damage: 14, speed: 980,
    spread: 0.025, pellets: 1, mag: 30, reserve: 120, reload: 1050,
    color: 0xf3b94f, gun: 'rifle', recoil: 1.8,
  },
  shotgun: {
    label: 'SHOTGUN', mode: '7-PELLET BURST', rate: 660, damage: 9, speed: 830,
    spread: 0.22, pellets: 7, mag: 6, reserve: 30, reload: 1350,
    color: 0xf06c50, gun: 'shotgun', recoil: 4.8,
  },
  plasma: {
    label: 'PLASMA', mode: 'ENERGY CARBINE', rate: 235, damage: 22, speed: 720,
    spread: 0.012, pellets: 1, mag: 12, reserve: 48, reload: 1200,
    color: 0x4fe0c7, gun: 'plasma', recoil: 2.4,
  },
};

const SPAWNS = [
  { x: 145, y: 570 }, { x: 1135, y: 570 }, { x: 375, y: 305 },
  { x: 920, y: 295 }, { x: 640, y: 480 }, { x: 638, y: 170 },
];

const BOT_DATA = [
  { name: 'VEX', texture: 'raider-coral', weapon: 'rifle', accuracy: 0.12 },
  { name: 'ROOK', texture: 'raider-gold', weapon: 'shotgun', accuracy: 0.17 },
  { name: 'NYX', texture: 'raider-green', weapon: 'plasma', accuracy: 0.08 },
  { name: 'BRICK', texture: 'raider-violet', weapon: 'rifle', accuracy: 0.2 },
];

const ui = {
  hud: document.querySelector('#hud'),
  healthBar: document.querySelector('#health-bar'),
  healthValue: document.querySelector('#health-value'),
  fuelBar: document.querySelector('#fuel-bar'),
  fuelValue: document.querySelector('#fuel-value'),
  playerScore: document.querySelector('#player-score'),
  enemyScore: document.querySelector('#enemy-score'),
  matchTime: document.querySelector('#match-time'),
  weaponName: document.querySelector('#weapon-name'),
  reloadState: document.querySelector('#reload-state'),
  ammoValue: document.querySelector('#ammo-value'),
  feed: document.querySelector('#kill-feed'),
  flash: document.querySelector('#damage-flash'),
  start: document.querySelector('#start-screen'),
  play: document.querySelector('#play-button'),
  result: document.querySelector('#result-screen'),
  resultTitle: document.querySelector('#result-title'),
  resultScore: document.querySelector('#result-score'),
  restart: document.querySelector('#restart-button'),
  mobileControls: document.querySelector('#mobile-controls'),
};

const touch = {
  moveX: 0,
  moveY: 0,
  aimX: 1,
  aimY: 0,
  firing: false,
  grenade: false,
};

let activeScene = null;


class ArenaScene extends Phaser.Scene {
  constructor() {
    super('arena');
  }

  preload() {
    this.load.image('arena-background', '/assets/arena-background.jpg');
    this.load.image('ranger', '/assets/ranger.png');
    this.load.image('raider-coral', '/assets/raider-coral.png');
    this.load.image('raider-gold', '/assets/raider-gold.png');
    this.load.image('raider-green', '/assets/raider-green.png');
    this.load.image('raider-violet', '/assets/raider-violet.png');
    this.load.image('rifle', '/assets/rifle.png');
    this.load.image('shotgun', '/assets/shotgun.png');
    this.load.image('plasma', '/assets/plasma.png');
    this.load.image('platform', '/assets/platform.png');
    this.load.image('medkit', '/assets/medkit.png');
    this.load.image('fuel', '/assets/fuel.png');
    this.load.image('weapon-crate', '/assets/weapon-crate.png');
  }

  create() {
    activeScene = this;
    this.matchActive = false;
    this.matchEnded = false;
    this.timeLeft = MATCH_SECONDS;
    this.playerScore = 0;
    this.enemyScore = 0;
    this.lastSecond = MATCH_SECONDS;

    this.createTextures();
    this.createArena();
    this.createGroups();
    this.createActors();
    this.createPickups();
    this.createInput();
    this.createCrosshair();
    this.createEffects();
    this.bindPhysics();

    this.physics.pause();
    this.cameras.main.fadeIn(500, 5, 18, 24);
    ui.start.classList.remove('hidden');
    ui.result.classList.add('hidden');
    ui.hud.classList.add('hidden');
    ui.mobileControls.classList.add('hidden');
    this.updateHud(true);
  }

  createTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1).fillCircle(7, 7, 7);
    graphics.generateTexture('particle', 14, 14);
    graphics.clear().fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 22, 8, 4);
    graphics.generateTexture('bullet', 22, 8);
    graphics.clear().fillStyle(0x697b76, 1).fillCircle(11, 11, 11);
    graphics.lineStyle(3, 0x263631, 1).strokeCircle(11, 11, 10);
    graphics.generateTexture('grenade', 22, 22);
    graphics.clear().fillStyle(0x17343a, 1).fillRoundedRect(0, 0, 64, 36, 7);
    graphics.lineStyle(2, 0x5c9389, 1).strokeRoundedRect(0, 0, 64, 36, 7);
    graphics.generateTexture('spawn-pad', 64, 36);
    graphics.destroy();
  }

  createArena() {
    this.add.image(WIDTH / 2, HEIGHT / 2, 'arena-background').setDisplaySize(WIDTH, HEIGHT);

    const haze = this.add.graphics();
    haze.fillGradientStyle(0x07141b, 0x07141b, 0x173b3d, 0x173b3d, 0.05, 0.05, 0.2, 0.2);
    haze.fillRect(0, 0, WIDTH, HEIGHT);

    this.platforms = this.physics.add.staticGroup();
    this.addPlatform(640, 688, 1280);
    this.addPlatform(180, 535, 285);
    this.addPlatform(520, 570, 270);
    this.addPlatform(905, 535, 270);
    this.addPlatform(1160, 430, 215);
    this.addPlatform(725, 390, 250);
    this.addPlatform(335, 365, 235);
    this.addPlatform(620, 235, 255);
    this.addPlatform(1015, 225, 250);
    this.addPlatform(90, 245, 185);

    this.add.image(104, 651, 'spawn-pad').setAlpha(0.72);
    this.add.image(1170, 651, 'spawn-pad').setAlpha(0.72);

    this.zoneLabels = [
      this.add.text(43, 199, 'NORTH VENT', { fontFamily: 'Inter', fontSize: '11px', color: '#89a9a2' }),
      this.add.text(560, 186, 'WATCHTOWER', { fontFamily: 'Inter', fontSize: '11px', color: '#89a9a2' }),
      this.add.text(1045, 176, 'EAST RELAY', { fontFamily: 'Inter', fontSize: '11px', color: '#89a9a2' }),
    ];

    const foreground = this.add.graphics().setDepth(70);
    foreground.fillStyle(0x061216, 0.72);
    for (let x = 0; x < WIDTH; x += 37) {
      const height = 12 + ((x * 17) % 38);
      foreground.fillTriangle(x, HEIGHT, x + 13, HEIGHT - height, x + 25, HEIGHT);
    }
  }

  addPlatform(x, y, width) {
    const platform = this.platforms.create(x, y, 'platform');
    platform.setDisplaySize(width, 44).refreshBody();
    platform.setDepth(5);
    return platform;
  }

  createGroups() {
    this.actors = this.physics.add.group();
    this.bullets = this.physics.add.group({ maxSize: 240, allowGravity: false });
    this.grenades = this.physics.add.group();
    this.pickups = this.physics.add.staticGroup();
    this.bots = [];
  }

  createActors() {
    this.player = this.spawnActor({
      name: 'RANGER', texture: 'ranger', x: 145, y: 570, isPlayer: true, weapon: 'rifle',
    });

    BOT_DATA.forEach((data, index) => {
      const spawn = SPAWNS[index + 1];
      const bot = this.spawnActor({ ...data, x: spawn.x, y: spawn.y, isPlayer: false });
      bot.accuracy = data.accuracy;
      bot.nextDecision = 0;
      bot.moveDirection = index % 2 ? -1 : 1;
      bot.jumpBias = 0.34 + index * 0.08;
      this.bots.push(bot);
    });
  }

  spawnActor({ name, texture, x, y, isPlayer, weapon }) {
    const actor = this.actors.create(x, y, texture);
    actor.setScale(0.72);
    actor.setDepth(30);
    actor.setCollideWorldBounds(true);
    actor.body.setSize(45, 76).setOffset(25, 14);
    actor.setDragX(900);
    actor.setMaxVelocity(360, 520);
    actor.nameTag = this.add.text(x, y - 57, name, {
      fontFamily: 'Inter', fontSize: '11px', fontStyle: 'bold',
      color: isPlayer ? '#79ead5' : '#f3c467',
      stroke: '#061117', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(40);
    actor.gun = this.add.image(x, y, WEAPONS[weapon].gun).setScale(0.62).setDepth(35);
    actor.isPlayer = isPlayer;
    actor.actorName = name;
    actor.alive = true;
    actor.health = 100;
    actor.fuel = 100;
    actor.weapon = weapon;
    actor.ownedWeapons = new Set([weapon]);
    actor.ammo = {
      rifle: { mag: WEAPONS.rifle.mag, reserve: isPlayer ? WEAPONS.rifle.reserve : 999 },
      shotgun: { mag: WEAPONS.shotgun.mag, reserve: isPlayer ? WEAPONS.shotgun.reserve : 999 },
      plasma: { mag: WEAPONS.plasma.mag, reserve: isPlayer ? WEAPONS.plasma.reserve : 999 },
    };
    actor.lastShot = 0;
    actor.reloading = false;
    actor.grenadeReady = 0;
    actor.aimAngle = 0;
    actor.jetActive = false;
    return actor;
  }

  createPickups() {
    this.addPickup(225, 486, 'medkit', 'health');
    this.addPickup(1092, 381, 'fuel', 'fuel');
    this.addPickup(620, 188, 'weapon-crate', 'weapon', 'plasma');
    this.addPickup(720, 343, 'weapon-crate', 'weapon', 'shotgun');
  }

  addPickup(x, y, texture, type, value = null) {
    const item = this.pickups.create(x, y, texture).setScale(0.68).refreshBody();
    item.setData({ type, value });
    item.baseY = y;
    item.setDepth(20);
    this.tweens.add({ targets: item, y: y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return item;
  }

  createInput() {
    this.keys = this.input.keyboard.addKeys({
      left: 'A', right: 'D', up: 'W', down: 'S', jet: 'SPACE',
      reload: 'R', grenade: 'G', one: 'ONE', two: 'TWO', three: 'THREE', enter: 'ENTER',
    });
    this.keys.reload.on('down', () => this.startReload(this.player));
    this.keys.grenade.on('down', () => this.throwGrenade(this.player));
    this.keys.one.on('down', () => this.switchWeapon(this.player, 'rifle'));
    this.keys.two.on('down', () => this.switchWeapon(this.player, 'shotgun'));
    this.keys.three.on('down', () => this.switchWeapon(this.player, 'plasma'));
    this.keys.enter.on('down', () => {
      if (!this.matchActive && !this.matchEnded) this.startMatch();
    });
    this.input.mouse?.disableContextMenu();
  }

  createCrosshair() {
    this.crosshair = this.add.graphics().setDepth(100);
    this.crosshair.lineStyle(2, 0xf1c25a, 0.9);
    this.crosshair.strokeCircle(0, 0, 12);
    this.crosshair.lineBetween(-19, 0, -8, 0);
    this.crosshair.lineBetween(8, 0, 19, 0);
    this.crosshair.lineBetween(0, -19, 0, -8);
    this.crosshair.lineBetween(0, 8, 0, 19);
  }

  createEffects() {
    this.jetEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 115 },
      angle: { min: 72, max: 108 },
      lifespan: { min: 160, max: 280 },
      scale: { start: 0.45, end: 0 },
      tint: [0x4fe0c7, 0xf1c25a, 0xef6e55],
      frequency: 28,
      emitting: false,
    }).setDepth(25);
  }

  bindPhysics() {
    this.physics.add.collider(this.actors, this.platforms);
    this.physics.add.collider(this.actors, this.actors);
    this.physics.add.collider(this.grenades, this.platforms);
    this.physics.add.collider(this.bullets, this.platforms, (bullet) => this.impactBullet(bullet));
    this.physics.add.overlap(this.bullets, this.actors, (bullet, actor) => this.hitActor(bullet, actor));
    this.physics.add.overlap(this.player, this.pickups, (_, item) => this.collectPickup(item));
  }

  startMatch() {
    if (this.matchActive || this.matchEnded) return;
    this.matchActive = true;
    this.physics.resume();
    ui.start.classList.add('hidden');
    ui.result.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    ui.mobileControls.classList.remove('hidden');
    this.cameras.main.flash(230, 93, 226, 202, false);
    this.announce('MATCH LIVE', 0x74e4cf);
    this.updateHud(true);
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.04);
    this.updateCrosshair();
    this.animatePickups(time);
    if (!this.matchActive) return;

    this.timeLeft = Math.max(0, this.timeLeft - dt);
    if (Math.ceil(this.timeLeft) !== this.lastSecond) {
      this.lastSecond = Math.ceil(this.timeLeft);
      this.updateHud();
    }

    if (this.timeLeft <= 0) {
      this.endMatch(this.playerScore > this.enemyScore);
      return;
    }

    this.updatePlayer(time, dt);
    this.bots.forEach((bot) => this.updateBot(bot, time, dt));
    this.updateActorsVisuals();
    this.updateProjectiles(time);
    this.updateHud();
  }

  updatePlayer(time, dt) {
    const p = this.player;
    if (!p.alive) return;

    let direction = 0;
    if (this.keys.left.isDown) direction -= 1;
    if (this.keys.right.isDown) direction += 1;
    if (Math.abs(touch.moveX) > 0.12) direction = touch.moveX;

    p.setAccelerationX(direction * 1100);
    if (direction === 0) p.setAccelerationX(0);

    const wantsJet = this.keys.up.isDown || this.keys.jet.isDown || touch.moveY < -0.22;
    p.jetActive = wantsJet && p.fuel > 0;
    if (p.jetActive) {
      p.setAccelerationY(-1450);
      p.fuel = Math.max(0, p.fuel - 31 * dt);
    } else {
      p.setAccelerationY(0);
      const regen = p.body.blocked.down ? 25 : 11;
      p.fuel = Math.min(100, p.fuel + regen * dt);
    }

    if (touch.firing) {
      p.aimAngle = Math.atan2(touch.aimY, touch.aimX);
    } else {
      p.aimAngle = Phaser.Math.Angle.Between(p.x, p.y - 4, this.input.activePointer.worldX, this.input.activePointer.worldY);
    }

    const mouseFiring = this.input.activePointer.isDown && this.input.activePointer.button === 0;
    if (mouseFiring || touch.firing) this.fireWeapon(p, time);
    if (touch.grenade) {
      touch.grenade = false;
      this.throwGrenade(p);
    }
    this.jetEmitter.emitting = p.jetActive;
    this.jetEmitter.setPosition(p.x - Math.cos(p.aimAngle) * 7, p.y + 27);
  }

  updateBot(bot, time, dt) {
    if (!bot.alive || !this.player.alive) return;
    const target = this.player;
    const dx = target.x - bot.x;
    const dy = target.y - bot.y;
    const distance = Math.hypot(dx, dy);

    if (time > bot.nextDecision) {
      bot.nextDecision = time + Phaser.Math.Between(300, 680);
      if (Math.abs(dx) > 120) bot.moveDirection = Math.sign(dx);
      else if (Math.random() < 0.35) bot.moveDirection *= -1;
      if (Math.random() < 0.12) bot.moveDirection = 0;
    }

    bot.setAccelerationX(bot.moveDirection * 760);
    const shouldJet = dy < -60 || bot.body.blocked.left || bot.body.blocked.right || (Math.random() < bot.jumpBias * dt);
    bot.jetActive = shouldJet && bot.fuel > 8;
    if (bot.jetActive) {
      bot.setAccelerationY(-1230);
      bot.fuel = Math.max(0, bot.fuel - 24 * dt);
    } else {
      bot.setAccelerationY(0);
      bot.fuel = Math.min(100, bot.fuel + 17 * dt);
    }

    const wobble = Math.sin(time * 0.0018 + bot.x) * bot.accuracy;
    bot.aimAngle = Math.atan2(dy, dx) + wobble;
    if (distance < 690 && Math.abs(dy) < 350 && Math.random() < 0.72) {
      this.fireWeapon(bot, time);
    }
  }

  updateActorsVisuals() {
    this.actors.children.iterate((actor) => {
      if (!actor || !actor.alive) return;
      const cos = Math.cos(actor.aimAngle);
      actor.setFlipX(cos < 0);
      actor.gun.setPosition(actor.x + cos * 24, actor.y - 7 + Math.sin(actor.aimAngle) * 14);
      actor.gun.setRotation(actor.aimAngle);
      actor.gun.setFlipY(cos < 0);
      actor.nameTag.setPosition(actor.x, actor.y - 52);
    });
  }

  updateProjectiles(time) {
    this.bullets.children.iterate((bullet) => {
      if (!bullet?.active) return;
      if (time > bullet.expireAt || bullet.x < -40 || bullet.x > WIDTH + 40 || bullet.y < -40 || bullet.y > HEIGHT + 40) {
        bullet.destroy();
      }
    });
  }

  updateCrosshair() {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    this.crosshair.setVisible(!coarse && !ui.start.classList.contains('hidden') ? false : !coarse);
    if (!coarse) this.crosshair.setPosition(this.input.activePointer.worldX, this.input.activePointer.worldY);
  }

  animatePickups(time) {
    this.pickups.children.iterate((item) => {
      if (!item?.active) return;
      item.setRotation(Math.sin(time * 0.001 + item.x) * 0.05);
    });
  }

  fireWeapon(actor, time) {
    if (!actor.alive || actor.reloading || time < actor.lastShot + WEAPONS[actor.weapon].rate) return;
    const weapon = WEAPONS[actor.weapon];
    const ammo = actor.ammo[actor.weapon];
    if (ammo.mag <= 0) {
      this.startReload(actor);
      return;
    }
    ammo.mag -= 1;
    actor.lastShot = time;

    for (let i = 0; i < weapon.pellets; i += 1) {
      const angle = actor.aimAngle + Phaser.Math.FloatBetween(-weapon.spread, weapon.spread);
      const bullet = this.bullets.create(
        actor.x + Math.cos(angle) * 42,
        actor.y - 7 + Math.sin(angle) * 23,
        'bullet',
      );
      if (!bullet) continue;
      bullet.setTint(weapon.color);
      bullet.setScale(actor.weapon === 'plasma' ? 1.18 : 0.68);
      bullet.setRotation(angle);
      bullet.body.setAllowGravity(false);
      bullet.setVelocity(Math.cos(angle) * weapon.speed, Math.sin(angle) * weapon.speed);
      bullet.owner = actor;
      bullet.damage = weapon.damage;
      bullet.expireAt = time + 1300;
      bullet.setDepth(28);
    }

    actor.setVelocityX(actor.body.velocity.x - Math.cos(actor.aimAngle) * weapon.recoil * 9);
    this.muzzleFlash(actor, weapon.color);
    this.soundEffect(actor.weapon === 'shotgun' ? 88 : actor.weapon === 'plasma' ? 420 : 145, 0.045, actor.weapon === 'shotgun' ? 'sawtooth' : 'square');
    if (actor.isPlayer) this.updateHud(true);
  }

  startReload(actor) {
    if (!actor?.alive || actor.reloading) return;
    const weapon = WEAPONS[actor.weapon];
    const ammo = actor.ammo[actor.weapon];
    if (ammo.mag >= weapon.mag || ammo.reserve <= 0) return;
    actor.reloading = true;
    if (actor.isPlayer) {
      ui.reloadState.textContent = 'RELOADING';
      ui.reloadState.style.color = '#f2c15a';
    }
    this.time.delayedCall(weapon.reload, () => {
      if (!actor.active) return;
      const required = weapon.mag - ammo.mag;
      const loaded = Math.min(required, ammo.reserve);
      ammo.mag += loaded;
      ammo.reserve -= loaded;
      actor.reloading = false;
      if (actor.isPlayer) this.updateHud(true);
      this.soundEffect(520, 0.06, 'triangle');
    });
  }

  switchWeapon(actor, weaponName) {
    if (!actor.alive || !actor.ownedWeapons.has(weaponName)) return;
    actor.weapon = weaponName;
    actor.reloading = false;
    actor.gun.setTexture(WEAPONS[weaponName].gun);
    this.soundEffect(620, 0.035, 'triangle');
    if (actor.isPlayer) this.updateHud(true);
  }

  throwGrenade(actor) {
    const now = this.time.now;
    if (!actor.alive || now < actor.grenadeReady) return;
    actor.grenadeReady = now + 4200;
    const grenade = this.grenades.create(actor.x, actor.y - 10, 'grenade');
    grenade.setDepth(29).setBounce(0.58).setCircle(10);
    grenade.setVelocity(Math.cos(actor.aimAngle) * 470, Math.sin(actor.aimAngle) * 470 - 130);
    grenade.owner = actor;
    grenade.setAngularVelocity(420);
    this.time.delayedCall(920, () => {
      if (grenade.active) this.explodeGrenade(grenade);
    });
  }

  explodeGrenade(grenade) {
    const { x, y, owner } = grenade;
    grenade.destroy();
    const ring = this.add.circle(x, y, 18, 0xf2b84f, 0.76).setDepth(60);
    this.tweens.add({ targets: ring, radius: 145, alpha: 0, duration: 340, onComplete: () => ring.destroy() });
    this.burst(x, y, 0xf07852, 30, 240);
    this.cameras.main.shake(170, 0.008);
    this.soundEffect(48, 0.2, 'sawtooth');
    this.actors.children.iterate((actor) => {
      if (!actor?.alive || actor === owner || actor.isPlayer === owner.isPlayer) return;
      const distance = Phaser.Math.Distance.Between(x, y, actor.x, actor.y);
      if (distance < 150) this.applyDamage(actor, Math.round(75 * (1 - distance / 180)), owner);
    });
  }

  hitActor(bullet, actor) {
    if (!bullet.active || !actor.alive || actor === bullet.owner || actor.isPlayer === bullet.owner.isPlayer) return;
    const owner = bullet.owner;
    const damage = bullet.damage;
    this.burst(bullet.x, bullet.y, bullet.tintTopLeft || 0xf2bd55, 6, 95);
    bullet.destroy();
    this.applyDamage(actor, damage, owner);
  }

  impactBullet(bullet) {
    if (!bullet.active) return;
    this.burst(bullet.x, bullet.y, bullet.tintTopLeft || 0xd9c080, 4, 55);
    bullet.destroy();
  }

  applyDamage(actor, amount, source) {
    actor.health = Math.max(0, actor.health - amount);
    actor.setTintFill(0xff6a54);
    this.time.delayedCall(70, () => actor.active && actor.clearTint());

    if (actor.isPlayer) {
      ui.flash.classList.add('active');
      window.setTimeout(() => ui.flash.classList.remove('active'), 55);
      this.cameras.main.shake(80, 0.003);
      this.updateHud(true);
    }
    if (actor.health <= 0) this.killActor(actor, source);
  }

  killActor(actor, killer) {
    if (!actor.alive) return;
    actor.alive = false;
    actor.setActive(false).setVisible(false);
    actor.body.enable = false;
    actor.gun.setVisible(false);
    actor.nameTag.setVisible(false);
    this.burst(actor.x, actor.y, actor.isPlayer ? 0x4fe0c7 : 0xef6e55, 24, 205);
    this.cameras.main.shake(130, 0.005);

    if (killer?.isPlayer) {
      this.playerScore += 1;
      this.addFeed(`<b>RANGER</b> eliminated ${actor.actorName}`);
    } else if (actor.isPlayer) {
      this.enemyScore += 1;
      this.addFeed(`${killer?.actorName || 'RAIDER'} eliminated <b>RANGER</b>`);
    }
    this.updateHud(true);

    if (this.playerScore >= SCORE_LIMIT || this.enemyScore >= SCORE_LIMIT) {
      this.endMatch(this.playerScore >= SCORE_LIMIT);
      return;
    }
    this.time.delayedCall(1250, () => this.respawnActor(actor));
  }

  respawnActor(actor) {
    if (!this.matchActive) return;
    let spawn = Phaser.Utils.Array.GetRandom(SPAWNS);
    if (this.player.alive && actor !== this.player) {
      const alternatives = SPAWNS.filter((spot) => Phaser.Math.Distance.Between(spot.x, spot.y, this.player.x, this.player.y) > 330);
      if (alternatives.length) spawn = Phaser.Utils.Array.GetRandom(alternatives);
    }
    actor.setPosition(spawn.x, spawn.y);
    actor.setVelocity(0, 0).setAcceleration(0, 0);
    actor.health = 100;
    actor.fuel = 100;
    actor.alive = true;
    actor.setActive(true).setVisible(true).clearTint();
    actor.body.enable = true;
    actor.gun.setVisible(true);
    actor.nameTag.setVisible(true);
    actor.reloading = false;
    Object.entries(actor.ammo).forEach(([name, ammo]) => {
      ammo.mag = WEAPONS[name].mag;
    });
    this.spawnEffect(spawn.x, spawn.y);
    if (actor.isPlayer) this.updateHud(true);
  }

  collectPickup(item) {
    if (!item.active || !this.player.alive) return;
    const type = item.getData('type');
    const value = item.getData('value');
    if (type === 'health') {
      if (this.player.health >= 100) return;
      this.player.health = Math.min(100, this.player.health + 55);
      this.announce('+55 HEALTH', 0xef7057);
    } else if (type === 'fuel') {
      this.player.fuel = 100;
      this.announce('JET FUEL FULL', 0x55dfc8);
    } else if (type === 'weapon') {
      this.player.ownedWeapons.add(value);
      this.player.ammo[value].reserve = WEAPONS[value].reserve;
      this.player.ammo[value].mag = WEAPONS[value].mag;
      this.switchWeapon(this.player, value);
      this.announce(`${WEAPONS[value].label} ACQUIRED`, WEAPONS[value].color);
    }
    this.soundEffect(760, 0.09, 'sine');
    this.updateHud(true);
    item.disableBody(true, true);
    this.time.delayedCall(8000, () => {
      item.enableBody(false, item.x, item.baseY, true, true);
    });
  }

  muzzleFlash(actor, color) {
    const x = actor.x + Math.cos(actor.aimAngle) * 55;
    const y = actor.y - 7 + Math.sin(actor.aimAngle) * 32;
    const flash = this.add.circle(x, y, 8, color, 0.95).setDepth(61);
    this.tweens.add({ targets: flash, scale: 2.4, alpha: 0, duration: 75, onComplete: () => flash.destroy() });
    this.burst(x, y, color, 3, 70);
  }

  burst(x, y, color, count, speed) {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: speed * 0.35, max: speed },
      angle: { min: 0, max: 360 },
      lifespan: { min: 170, max: 430 },
      scale: { start: 0.45, end: 0 },
      tint: color,
      quantity: count,
      emitting: false,
    }).setDepth(62);
    particles.explode(count);
    this.time.delayedCall(500, () => particles.destroy());
  }

  spawnEffect(x, y) {
    const circle = this.add.circle(x, y, 12, 0x5de4cf, 0.15).setStrokeStyle(3, 0x75ecd8, 0.9).setDepth(64);
    this.tweens.add({ targets: circle, scale: 5, alpha: 0, duration: 520, onComplete: () => circle.destroy() });
  }

  announce(text, color) {
    const banner = this.add.text(WIDTH / 2, 132, text, {
      fontFamily: 'Barlow Condensed', fontSize: '24px', fontStyle: 'bold', color: '#f7f0dd',
      backgroundColor: '#06151de6', padding: { x: 24, y: 10 }, stroke: Phaser.Display.Color.IntegerToColor(color).rgba, strokeThickness: 1,
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: banner, y: 120, alpha: 0, delay: 850, duration: 260, onComplete: () => banner.destroy() });
  }

  addFeed(html) {
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = html;
    ui.feed.prepend(item);
    window.setTimeout(() => item.remove(), 3100);
  }

  endMatch(victory) {
    if (this.matchEnded) return;
    this.matchEnded = true;
    this.matchActive = false;
    this.physics.pause();
    this.jetEmitter.emitting = false;
    ui.resultTitle.textContent = victory ? 'VICTORY' : 'DEFEAT';
    ui.resultTitle.style.color = victory ? '#f2c15a' : '#ef705c';
    ui.resultScore.textContent = `${this.playerScore} — ${this.enemyScore}`;
    ui.result.classList.remove('hidden');
    ui.mobileControls.classList.add('hidden');
    this.cameras.main.shake(180, 0.004);
    this.soundEffect(victory ? 520 : 94, 0.35, victory ? 'triangle' : 'sawtooth');
  }

  updateHud(force = false) {
    if (!this.player || (!force && !this.matchActive)) return;
    const p = this.player;
    const ammo = p.ammo[p.weapon];
    const weapon = WEAPONS[p.weapon];
    ui.healthBar.style.width = `${p.health}%`;
    ui.healthValue.textContent = Math.ceil(p.health);
    ui.fuelBar.style.width = `${p.fuel}%`;
    ui.fuelValue.textContent = Math.ceil(p.fuel);
    ui.playerScore.textContent = this.playerScore;
    ui.enemyScore.textContent = this.enemyScore;
    const seconds = Math.ceil(this.timeLeft);
    ui.matchTime.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    ui.weaponName.textContent = weapon.label;
    if (!p.reloading) {
      ui.reloadState.textContent = weapon.mode;
      ui.reloadState.style.color = '';
    }
    ui.ammoValue.textContent = `${ammo.mag} / ${ammo.reserve}`;
  }

  soundEffect(frequency, duration, type = 'square') {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, frequency * 0.55), ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.055, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
}


const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#07161d',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 860 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH,
    height: HEIGHT,
  },
  render: { antialias: true, roundPixels: false },
  scene: [ArenaScene],
};

new Phaser.Game(config);

ui.play.addEventListener('click', () => activeScene?.startMatch());
ui.restart.addEventListener('click', () => {
  ui.result.classList.add('hidden');
  ui.feed.replaceChildren();
  activeScene?.scene.restart();
  window.setTimeout(() => activeScene?.startMatch(), 100);
});


function attachStick(element, onMove, onEnd) {
  const knob = element.querySelector('i');
  const update = (event) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const radius = rect.width * 0.34;
    const length = Math.max(1, Math.hypot(dx, dy));
    const scale = Math.min(1, radius / length);
    const x = dx * scale;
    const y = dy * scale;
    knob.style.transform = `translate(${x}px, ${y}px)`;
    onMove(x / radius, y / radius);
  };
  element.addEventListener('pointerdown', (event) => {
    element.setPointerCapture(event.pointerId);
    update(event);
  });
  element.addEventListener('pointermove', (event) => {
    if (element.hasPointerCapture(event.pointerId)) update(event);
  });
  const finish = (event) => {
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    knob.style.transform = '';
    onEnd();
  };
  element.addEventListener('pointerup', finish);
  element.addEventListener('pointercancel', finish);
}

attachStick(
  document.querySelector('#move-pad'),
  (x, y) => { touch.moveX = x; touch.moveY = y; },
  () => { touch.moveX = 0; touch.moveY = 0; },
);
attachStick(
  document.querySelector('#aim-pad'),
  (x, y) => {
    const length = Math.hypot(x, y);
    if (length > 0.18) {
      touch.aimX = x / length;
      touch.aimY = y / length;
      touch.firing = true;
    }
  },
  () => { touch.firing = false; },
);
document.querySelector('#grenade-button').addEventListener('pointerdown', () => { touch.grenade = true; });
