// ==================== ERROR HANDLER ====================
// NOTE: "Script error at 0:0" = browser blocked error details from cross-origin script
// All scripts are now local so this should not appear
window.onerror = function(msg, url, line, col, error) {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:15px;z-index:99999;font:14px monospace;white-space:pre-wrap;';
    div.textContent = 'ОШИБКА JS: ' + msg + '\nФайл: ' + url + '\nСтрока: ' + line + ':' + col;
    if (error && error.stack) div.textContent += '\n' + error.stack;
    document.body.appendChild(div);
};

// ==================== GLOBAL STATE ====================
var gameState = {
    chapter: 0,
    lightOn: false,
    watchedTV: false,
    hasKey: false,
    doorOpen: false,
    hasFlashlight: false,
    nightstandOpen: false,
    fridgeOpen: false,
    fridgeAnimating: false,
    mugExamined: false,
    finalTriggered: false,
    transitioning: false,
    computerUsed: false,
    stalkerSpawned: false,
    money: 5000,
    cart: [],
    cartTotal: 0,
    shopPaid: false,
    unpackedCount: 0,
    unpackQueue: [],
    apartmentFridgeGroup: null,
    apartmentFridgeDoor: null,
    fridgeShelfHitbox: null,
    groceryBagMesh: null,
    groceryBagGroup: null,
    groceryBagPeeks: [],
    fridgeUnpackedAll: false,
    foodOrdered8: false,
    newsWatched8: false,
    tvScreenMesh: null,
    apartmentPhoneMesh: null,
    apartmentBedMesh: null,
    sleptChapter8: false,
    apartmentTableGroup: null,
    curtainsClosed: false,
    doorLocked8: false,
    leftCurtainGroup: null,
    rightCurtainGroup: null,
    curtainsMesh: null,
    doorBoltMesh: null,
    apartmentDoorMesh: null,
    apartmentStoveGroup: null,
    apartmentStoveMesh: null,
    stoveGlow: null,
    stoveLight: null,
    stovePanGroup: null,
    isCooking: false,
    cookedFoodEaten: false,
    deliveryPackageGroup: null,
    deliveryPackageMesh: null,
    deliveryFoodEaten: false,
    foodEaten8: false,
    newsFinished8: false,
    tvTurnedOff8: false,
    apartmentTreeGroup: null
};

var ch6Phone = {
    bossMsgSent: false,
    sergeyMsgSent: false,
    playerReplied: false,
    sergeyReplied: false,
    moneyChecked: false,
    currentChat: null,
    lastToastChat: null,
    timers: [],
    chats: {
        boss: {
            name: 'Босс',
            status: 'был(а) недавно',
            messages: []
        },
        sergey: {
            name: 'Сергей',
            status: 'онлайн',
            messages: []
        }
    }
};

var camera, scene, renderer, controls;
var playerFlashlight, roomLight;
var moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var raycaster;
var center = new THREE.Vector2(0, 0);
var interactables = [];
var currentInteractable = null;
var snowParticles = null;
var stalkerFigure = null;
var flickerInterval = null;
var chapterUpdate = null;
var stalkerTimer = null;
var colliders = [];     // AABB collision boxes {minX, maxX, minZ, maxZ}
var isSitting = false;  // player is seated on sofa
var headBobTimer = 0;   // for camera walk bobbing
var stepTimer = 0;      // for footstep audio timing
var offStalkerPlane = null; // office stalker picture plane

// DOM elements
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var uiLayer = document.getElementById('ui-layer');
var interactionPrompt = document.getElementById('interaction-prompt');
var thoughtBox = document.getElementById('thought-box');
var objectiveText = document.getElementById('objective-text');
var chapterOverlay = document.getElementById('chapter-overlay');
var chapterTitle = document.getElementById('chapter-title');
var chapterSubtitle = document.getElementById('chapter-subtitle');
var thoughtTimeout = null;

// ==================== MUSIC ====================
var bgMusic = null;
var lobotomyMusic = null;
var lobotomyMusicActive = false;
var isSleeping = false;

function initMusic() {
    if (lobotomyMusicActive) return;
    if (bgMusic) return;
    var el = document.getElementById('bg-audio');
    if (el) {
        bgMusic = el;
    } else {
        bgMusic = new Audio('assets/new_year.mp3');
    }
    bgMusic.loop = true;
    bgMusic.volume = 0;
    var playPromise = bgMusic.play();
    if (playPromise && playPromise.catch) {
        playPromise.catch(function() {
            function retryBg() {
                if (bgMusic && !lobotomyMusicActive) {
                    bgMusic.play().catch(function() {});
                }
                window.removeEventListener('click', retryBg);
                window.removeEventListener('keydown', retryBg);
            }
            window.addEventListener('click', retryBg);
            window.addEventListener('keydown', retryBg);
        });
    }
    // Fade in
    var fadeIn = setInterval(function() {
        if (!bgMusic || lobotomyMusicActive) { clearInterval(fadeIn); return; }
        bgMusic.volume = Math.min(bgMusic.volume + 0.02, 0.35);
        if (bgMusic.volume >= 0.35) clearInterval(fadeIn);
    }, 100);
}

function setMusicVolume(target, duration) {
    if (lobotomyMusicActive) return;
    if (!bgMusic) return;
    var step = (target - bgMusic.volume) / (duration / 100);
    var iv = setInterval(function() {
        if (!bgMusic || lobotomyMusicActive) { clearInterval(iv); return; }
        bgMusic.volume = Math.max(0, Math.min(1, bgMusic.volume + step));
        if (Math.abs(bgMusic.volume - target) < 0.02) {
            bgMusic.volume = target;
            clearInterval(iv);
        }
    }, 100);
}

function startLobotomyMusic() {
    lobotomyMusicActive = true;

    // Stop ambient background music
    if (bgMusic) {
        try {
            bgMusic.pause();
        } catch (e) {}
    }

    try {
        if (!lobotomyMusic) {
            var el = document.getElementById('lobotomy-audio');
            if (el) {
                lobotomyMusic = el;
            } else {
                lobotomyMusic = new Audio(encodeURI('Maebi - The Lobotomy.mp3'));
            }
            lobotomyMusic.loop = true;
            lobotomyMusic.volume = 0.55;

            lobotomyMusic.addEventListener('ended', function() {
                if (lobotomyMusicActive && !isSleeping) {
                    lobotomyMusic.currentTime = 0;
                    lobotomyMusic.play().catch(function() {});
                }
            });
        }

        if (!isSleeping) {
            var playPromise = lobotomyMusic.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function() {
                    function retryLobotomy() {
                        if (lobotomyMusic && lobotomyMusicActive && !isSleeping) {
                            lobotomyMusic.play().catch(function() {});
                        }
                        window.removeEventListener('click', retryLobotomy);
                        window.removeEventListener('keydown', retryLobotomy);
                    }
                    window.addEventListener('click', retryLobotomy);
                    window.addEventListener('keydown', retryLobotomy);
                });
            }
        }
    } catch (e) {}
}

function pauseLobotomyForSleep() {
    if (lobotomyMusic) {
        try {
            lobotomyMusic.pause();
        } catch (e) {}
    }
}

function resumeLobotomyAfterSleep() {
    if (lobotomyMusicActive && lobotomyMusic && !isSleeping) {
        try {
            lobotomyMusic.play().catch(function() {});
        } catch (e) {}
    }
}

function startSleep(seconds, onWake) {
    if (isSleeping) return;
    isSleeping = true;
    var duration = (typeof seconds === 'number' && seconds > 0) ? seconds : 5;

    // Music is turned off strictly when sleeping
    pauseLobotomyForSleep();
    if (bgMusic) {
        try { bgMusic.pause(); } catch (e) {}
    }

    var overlay = document.getElementById('sleep-overlay');
    var subtext = document.getElementById('sleep-subtext');
    var sleepText = document.getElementById('sleep-text');

    if (overlay) {
        overlay.style.display = 'flex';
        void overlay.offsetWidth;
        overlay.style.opacity = '1';
    }

    var timeLeft = duration;
    if (subtext) subtext.textContent = timeLeft + ' сек.';
    if (sleepText) sleepText.textContent = 'Сон...';

    var countdownIv = setInterval(function() {
        timeLeft--;
        if (timeLeft > 0) {
            if (subtext) subtext.textContent = timeLeft + ' сек.';
        } else {
            if (subtext) subtext.textContent = 'Пробуждение...';
            clearInterval(countdownIv);
        }
    }, 1000);

    setTimeout(function() {
        clearInterval(countdownIv);
        isSleeping = false;

        // Music turns back on after sleep finishes
        resumeLobotomyAfterSleep();

        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(function() {
                overlay.style.display = 'none';
            }, 500);
        }

        if (typeof onWake === 'function') {
            onWake();
        }
    }, duration * 1000);
}

// ==================== AUDIO SYNTHESIZER ====================
var audioCtx = null;

function getAudioCtx() {
    if (!audioCtx) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playHeartbeat() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
}

function triggerHeartbeatPulse() {
    playHeartbeat();
    setTimeout(playHeartbeat, 300);
}

function playClickSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
}

function playFootstep() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
}

function playKnock() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    for (var i = 0; i < 3; i++) {
        setTimeout(function() {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(2.0, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        }, i * 250);
    }
}

function playJumpscare() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    
    var master = ctx.createGain();
    master.gain.setValueAtTime(5.0, ctx.currentTime); // Very loud
    master.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
    master.connect(ctx.destination);

    // Dissonant piercing high frequencies (screech)
    var freqs = [1850, 2100, 2450, 2900];
    for (var i = 0; i < freqs.length; i++) {
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freqs[i], ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqs[i] * 0.4, ctx.currentTime + 2.0);
        osc.connect(master);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2.0);
    }
    
    // Deep distorted roar
    var bass = ctx.createOscillator();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(60, ctx.currentTime);
    bass.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 2.0);
    var bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(3.0, ctx.currentTime);
    bass.connect(bassGain);
    bassGain.connect(master);
    bass.start(ctx.currentTime);
    bass.stop(ctx.currentTime + 2.0);
}

function playNotificationChime() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc1 = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var g = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.25, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc1.connect(g);
    osc2.connect(g);
    g.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.12);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
}

function playBarcodeBeep() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.3, now + 0.01);
    g.gain.setValueAtTime(0.3, now + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc.connect(g);
    g.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.18);
}

function playItemPickupSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.14);
    
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    
    osc.connect(g);
    g.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.22);
}

function playFridgeOpenSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.12);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
}

function playFridgeCloseSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);
    g.gain.setValueAtTime(0.35, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
}

function playPhoneDialSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(425, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.18, now + 0.05);
    g.gain.setValueAtTime(0.18, now + 0.35);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
}

function playCurtainSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var filter = ctx.createBiquadFilter();
    var g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.7);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.value = 1.6;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.25, now + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.75);
}

function playDoorLockSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    // Click 1: turn latch
    var osc1 = ctx.createOscillator();
    var g1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(550, now);
    osc1.frequency.exponentialRampToValueAtTime(110, now + 0.05);
    g1.gain.setValueAtTime(0.25, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.06);

    // Click 2: deadbolt engages with deep metallic thump
    var osc2 = ctx.createOscillator();
    var g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(45, now + 0.22);
    g2.gain.setValueAtTime(0.4, now + 0.07);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.26);
}

function playSizzleSound(duration) {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var dur = (typeof duration === 'number') ? duration : 2.6;
    var sampleRate = ctx.sampleRate || 44100;
    var bufferSize = Math.floor(sampleRate * dur);
    var buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        var white = Math.random() * 2 - 1;
        var crackle = (Math.random() > 0.95) ? (Math.random() * 2 - 1) * 1.6 : 0;
        data[i] = white * 0.35 + crackle;
    }
    var noise = ctx.createBufferSource();
    noise.buffer = buffer;

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, ctx.currentTime);
    filter.Q.value = 1.3;

    var g = ctx.createGain();
    var now = ctx.currentTime;
    g.gain.setValueAtTime(0.01, now);
    g.gain.linearRampToValueAtTime(0.25, now + 0.25);
    g.gain.setValueAtTime(0.25, now + dur - 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    noise.start(now);
}

function playEmergencyTone() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc1 = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var g = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(853, now);
    osc2.frequency.setValueAtTime(960, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.18, now + 0.05);
    g.gain.setValueAtTime(0.18, now + 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc1.connect(g);
    osc2.connect(g);
    g.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.1);
    osc2.stop(now + 1.1);
}

function updateShopHUD() {
    var totalEl = document.getElementById('shop-cart-total');
    var countEl = document.getElementById('shop-cart-count');
    var balEl = document.getElementById('shop-balance-val');
    if (totalEl) totalEl.textContent = gameState.cartTotal;
    if (countEl) countEl.textContent = gameState.cart.length;
    if (balEl) balEl.textContent = gameState.money.toLocaleString ? gameState.money.toLocaleString('ru-RU') : gameState.money;
}
// ==================== CREEPY WIND/RUMBLE ====================
var rumbleGain = null;
function initRumble() {
    if (rumbleGain) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    var bufferSize = 2 * ctx.sampleRate;
    var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    var whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150; // Deep rumble

    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // slow wind sweeping
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 100;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0; // Starts silent

    whiteNoise.connect(filter);
    filter.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    
    lfo.start();
    whiteNoise.start();
}

function setRumbleVolume(target, duration) {
    if (!rumbleGain) return;
    var step = (target - rumbleGain.gain.value) / (duration / 100);
    var iv = setInterval(function() {
        if (!rumbleGain) { clearInterval(iv); return; }
        rumbleGain.gain.value = Math.max(0, Math.min(1, rumbleGain.gain.value + step));
        if (Math.abs(rumbleGain.gain.value - target) < 0.02) {
            rumbleGain.gain.value = target;
            clearInterval(iv);
        }
    }, 100);
}
// ==================== POINTER LOCK ====================
function PointerLock(cam, dom) {
    this.camera = cam;
    this.domElement = dom;
    this.isLocked = false;
    this._euler = new THREE.Euler(0, 0, 0, 'YXZ');
    var self = this;

    this._onMouseMove = function(e) {
        if (!self.isLocked) return;
        self._euler.setFromQuaternion(self.camera.quaternion);
        self._euler.y -= (e.movementX || 0) * 0.002;
        self._euler.x -= (e.movementY || 0) * 0.002;
        self._euler.x = Math.max(-1.5, Math.min(1.5, self._euler.x));
        self.camera.quaternion.setFromEuler(self._euler);
    };

    this._onChange = function() {
        if (document.pointerLockElement === self.domElement) {
            self.isLocked = true;
            document.addEventListener('mousemove', self._onMouseMove);
            if (self.onLock) self.onLock();
        } else {
            self.isLocked = false;
            document.removeEventListener('mousemove', self._onMouseMove);
            if (self.onUnlock) self.onUnlock();
        }
    };
    document.addEventListener('pointerlockchange', this._onChange);
}
PointerLock.prototype.lock = function() { this.domElement.requestPointerLock(); };
PointerLock.prototype.unlock = function() { if (document.exitPointerLock) document.exitPointerLock(); };

// ==================== HELPERS ====================
function showThought(text) {
    thoughtBox.textContent = text;
    thoughtBox.style.opacity = 1;
    clearTimeout(thoughtTimeout);
    thoughtTimeout = setTimeout(function() { thoughtBox.style.opacity = 0; }, 5000);
}

function setObjective(text) {
    objectiveText.textContent = text ? ('► ' + text) : '';
    objectiveText.style.opacity = text ? 1 : 0;
}

function addMesh(geometry, material, x, y, z, parent) {
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    (parent || scene).add(mesh);
    return mesh;
}

function makeMat(color, extra) {
    var mat = new THREE.MeshLambertMaterial({ color: color });
    if (extra) { Object.keys(extra).forEach(function(k) { mat[k] = extra[k]; }); }
    return mat;
}

// ==================== STALKER ====================
function createStalker(x, z) {
    if (stalkerFigure) scene.remove(stalkerFigure);
    var g = new THREE.Group();
    var coatMat = makeMat(0x0a0a0d); // dark coat
    var faceMat = makeMat(0xe5e5e5); // pale creepy face
    var eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1111 }); // glowing red eyes
    var mouthMat = makeMat(0x111111);

    // Body / Coat
    addMesh(new THREE.CylinderGeometry(0.28, 0.22, 1.5, 8), coatMat, 0, 0.95, 0, g);
    // Shoulders
    addMesh(new THREE.BoxGeometry(0.65, 0.25, 0.35), coatMat, 0, 1.5, 0, g);
    // Pale Head
    addMesh(new THREE.SphereGeometry(0.18, 12, 12), faceMat, 0, 1.85, 0, g);
    // Sunken Glowing Eyes
    addMesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat, -0.06, 1.88, 0.15, g);
    addMesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat, 0.06, 1.88, 0.15, g);
    // Creepy mouth
    addMesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), mouthMat, 0, 1.78, 0.16, g);

    g.position.set(x, 0, z);
    scene.add(g);
    stalkerFigure = g;
    return g;
}

// ==================== SNOW ====================
var cachedSnowflakeTex = null;
function getSnowflakeTexture() {
    if (cachedSnowflakeTex) return cachedSnowflakeTex;
    try {
        var canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        var ctx = canvas.getContext('2d');
        var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.3, 'rgba(240, 248, 255, 0.85)');
        grad.addColorStop(0.65, 'rgba(220, 235, 255, 0.35)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        cachedSnowflakeTex = new THREE.CanvasTexture(canvas);
    } catch (e) {
        cachedSnowflakeTex = null;
    }
    return cachedSnowflakeTex;
}

function addSnow(zMin, zMax, xMin, xMax, yMin, yMax, count, flakeSize) {
    if (snowParticles) {
        scene.remove(snowParticles);
        snowParticles = null;
    }

    if (typeof yMin === 'undefined') {
        var zCenter = zMin;
        var zRange = zMax;
        var xRange = xMin;
        zMin = zCenter - zRange / 2;
        zMax = zCenter + zRange / 2;
        xMin = -xRange / 2;
        xMax = xRange / 2;
        yMin = 0;
        yMax = 6;
        count = 1500;
        flakeSize = 0.075;
    } else {
        count = count || 2500;
        flakeSize = flakeSize || 0.08;
    }

    var geo = new THREE.BufferGeometry();
    var verts = new Float32Array(count * 3);
    var speeds = new Float32Array(count);
    var sways = new Float32Array(count);
    var swayPhases = new Float32Array(count);

    for (var i = 0; i < count; i++) {
        var i3 = i * 3;
        verts[i3]     = xMin + Math.random() * (xMax - xMin);
        verts[i3 + 1] = yMin + Math.random() * (yMax - yMin);
        verts[i3 + 2] = zMin + Math.random() * (zMax - zMin);

        speeds[i] = 0.016 + Math.random() * 0.024;
        sways[i] = 0.004 + Math.random() * 0.008;
        swayPhases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));

    var sTex = getSnowflakeTexture();
    var snowMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: flakeSize,
        map: sTex || null,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    var pts = new THREE.Points(geo, snowMat);
    pts.userData = {
        count: count,
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
        zMin: zMin,
        zMax: zMax,
        speeds: speeds,
        sways: sways,
        swayPhases: swayPhases
    };

    scene.add(pts);
    snowParticles = pts;
}

// ==================== CHAPTER 6 PHONE SYSTEM ====================
function resetChapter6Phone() {
    if (ch6Phone && ch6Phone.timers) {
        for (var i = 0; i < ch6Phone.timers.length; i++) {
            clearTimeout(ch6Phone.timers[i]);
        }
    }
    ch6Phone = {
        bossMsgSent: false,
        sergeyMsgSent: false,
        playerReplied: false,
        sergeyReplied: false,
        moneyChecked: false,
        currentChat: null,
        lastToastChat: null,
        timers: [],
        chats: {
            boss: {
                name: 'Босс',
                status: 'был(а) недавно',
                messages: []
            },
            sergey: {
                name: 'Сергей',
                status: 'онлайн',
                messages: []
            }
        }
    };
    var toast = document.getElementById('phone-toast');
    if (toast) toast.classList.remove('show');
    var ui = document.getElementById('phone-ui');
    if (ui) ui.style.display = 'none';
    var bankView = document.getElementById('phone-bank-view');
    if (bankView) bankView.style.display = 'none';
    var itemBoss = document.getElementById('chat-item-boss');
    if (itemBoss) itemBoss.style.display = 'none';
    var itemSergey = document.getElementById('chat-item-sergey');
    if (itemSergey) itemSergey.style.display = 'none';
    var itemBank = document.getElementById('chat-item-bank');
    if (itemBank) itemBank.style.display = 'none';
    var navBankBadge = document.getElementById('nav-bank-badge');
    if (navBankBadge) navBankBadge.style.display = 'none';
    var bankUnread = document.getElementById('bank-unread');
    if (bankUnread) bankUnread.style.display = 'none';
    var btnChats = document.getElementById('nav-btn-chats');
    if (btnChats) btnChats.classList.add('active');
    var btnBank = document.getElementById('nav-btn-bank');
    if (btnBank) btnBank.classList.remove('active');
    var empty = document.getElementById('phone-empty-state');
    if (empty) empty.style.display = 'block';
    var prevBoss = document.getElementById('boss-preview');
    if (prevBoss) prevBoss.textContent = 'вы уволены,не спрашивайте почему.';
    var prevSergey = document.getElementById('sergey-preview');
    if (prevSergey) prevSergey.textContent = 'прикинь че,меня уволили и просили не спрашивать причину.';
    var list = document.getElementById('phone-messages-list');
    if (list) list.innerHTML = '';
    var inp = document.getElementById('phone-input');
    if (inp) {
        inp.value = '';
        inp.disabled = false;
    }
    var sendBtn = document.getElementById('phone-send-btn');
    if (sendBtn) sendBtn.style.opacity = '1';
    var statusEl = document.getElementById('phone-status');
    if (statusEl) {
        statusEl.textContent = 'онлайн';
        statusEl.style.color = '#4cd964';
    }
}

function showPhoneToast(sender, text, chatKey) {
    ch6Phone.lastToastChat = chatKey;
    var toast = document.getElementById('phone-toast');
    if (!toast) return;
    document.getElementById('toast-sender').textContent = sender;
    document.getElementById('toast-text').textContent = text;
    toast.classList.add('show');
    setTimeout(function() {
        if (toast) toast.classList.remove('show');
    }, 4500);
}

function renderCurrentChatMessages() {
    var list = document.getElementById('phone-messages-list');
    if (!list || !ch6Phone.currentChat) return;
    list.innerHTML = '';

    var chatKey = ch6Phone.currentChat;
    var msgs = ch6Phone.chats[chatKey].messages;
    for (var i = 0; i < msgs.length; i++) {
        var m = msgs[i];
        var group = document.createElement('div');
        group.className = 'phone-bubble-group ' + m.type + (m.type !== 'sent' ? (' ' + chatKey) : '');
        
        if (m.type !== 'sent') {
            var s = document.createElement('div');
            s.className = 'phone-bubble-sender';
            s.textContent = ch6Phone.chats[chatKey].name;
            group.appendChild(s);
        }
        
        var b = document.createElement('div');
        b.className = 'phone-bubble ' + (m.type === 'sent' ? 'sent' : 'received');
        b.textContent = m.text;
        group.appendChild(b);
        
        list.appendChild(group);
    }
    list.scrollTop = list.scrollHeight;
}

function deliverBossNotification() {
    ch6Phone.bossMsgSent = true;
    ch6Phone.chats.boss.messages.push({ type: 'received', text: 'вы уволены,не спрашивайте почему.' });
    
    var empty = document.getElementById('phone-empty-state');
    if (empty) empty.style.display = 'none';
    var itemBoss = document.getElementById('chat-item-boss');
    if (itemBoss) itemBoss.style.display = 'flex';
    var unreadBoss = document.getElementById('boss-unread');
    if (unreadBoss) unreadBoss.style.display = 'block';

    playNotificationChime();
    showPhoneToast('Босс', 'вы уволены,не спрашивайте почему.', 'boss');

    if (ch6Phone.currentChat === 'boss') {
        renderCurrentChatMessages();
    }

    showThought('На телефон пришло уведомление от Босса: "вы уволены"... Что?!');
    setObjective('Проверь телефон на тумбочке');

    // 3.5 seconds later: notification from Sergey
    ch6Phone.timers.push(setTimeout(function() {
        if (gameState.chapter !== 6) return;
        deliverSergeyNotification();
    }, 3500));
}

function deliverSergeyNotification() {
    ch6Phone.sergeyMsgSent = true;
    ch6Phone.chats.sergey.messages.push({ type: 'received', text: 'прикинь че,меня уволили и просили не спрашивать причину.' });

    var itemSergey = document.getElementById('chat-item-sergey');
    if (itemSergey) itemSergey.style.display = 'flex';
    var unreadSergey = document.getElementById('sergey-unread');
    if (unreadSergey) unreadSergey.style.display = 'block';

    playNotificationChime();
    showPhoneToast('Сергей', 'прикинь че,меня уволили и просили не спрашивать причину.', 'sergey');

    if (ch6Phone.currentChat === 'sergey') {
        renderCurrentChatMessages();
    }

    showThought('Сергею тоже пришло такое?! Надо ответить ему.');
    setObjective('Ответь Сергею в телефоне');
}

function startChapter6PhoneEvents() {
    resetChapter6Phone();
    // 10 seconds after waking up
    ch6Phone.timers.push(setTimeout(function() {
        if (gameState.chapter !== 6) return;
        deliverBossNotification();
    }, 10000));
}

// ==================== SCENE CLEANUP ====================
function clearScene() {
    if (flickerInterval) { clearInterval(flickerInterval); flickerInterval = null; }
    if (stalkerTimer) { clearTimeout(stalkerTimer); stalkerTimer = null; }
    resetChapter6Phone();
    var cartHud = document.getElementById('shop-cart-hud');
    if (cartHud) cartHud.style.display = 'none';
    chapterUpdate = null;
    stalkerFigure = null;
    offStalkerPlane = null;
    snowParticles = null;
    roomLight = null;
    interactables = [];
    colliders = [];
    isSitting = false;
    currentInteractable = null;
    interactionPrompt.style.opacity = 0;
    gameState.fridgeOpen = false;
    gameState.fridgeAnimating = false;
    gameState.apartmentFridgeGroup = null;
    gameState.apartmentFridgeDoor = null;
    gameState.fridgeShelfHitbox = null;
    gameState.groceryBagMesh = null;
    gameState.groceryBagGroup = null;
    gameState.groceryBagPeeks = [];
    gameState.fridgeUnpackedAll = false;
    gameState.foodOrdered8 = false;
    gameState.newsWatched8 = false;
    gameState.tvScreenMesh = null;
    gameState.apartmentPhoneMesh = null;
    gameState.apartmentBedMesh = null;
    gameState.sleptChapter8 = false;
    gameState.apartmentTableGroup = null;
    gameState.curtainsClosed = false;
    gameState.doorLocked8 = false;
    gameState.leftCurtainGroup = null;
    gameState.rightCurtainGroup = null;
    gameState.curtainsMesh = null;
    gameState.doorBoltMesh = null;
    gameState.apartmentDoorMesh = null;
    gameState.apartmentStoveGroup = null;
    gameState.apartmentStoveMesh = null;
    gameState.stoveGlow = null;
    gameState.stoveLight = null;
    gameState.stovePanGroup = null;
    gameState.isCooking = false;
    gameState.cookedFoodEaten = false;
    gameState.deliveryPackageGroup = null;
    gameState.deliveryPackageMesh = null;
    gameState.deliveryFoodEaten = false;
    gameState.foodEaten8 = false;
    gameState.newsFinished8 = false;
    gameState.tvTurnedOff8 = false;
    gameState.apartmentTreeGroup = null;

    var toRemove = [];
    for (var i = 0; i < scene.children.length; i++) {
        if (scene.children[i] !== camera) toRemove.push(scene.children[i]);
    }
    for (var j = 0; j < toRemove.length; j++) {
        scene.remove(toRemove[j]);
    }
}

// ==================== CHAPTER LOADER ====================
function showChapterCard(title, sub, callback) {
    gameState.transitioning = true;
    chapterTitle.textContent = title;
    chapterSubtitle.textContent = sub;
    chapterOverlay.style.opacity = 1;
    setTimeout(function() {
        chapterOverlay.style.opacity = 0;
        setTimeout(function() {
            gameState.transitioning = false;
            if (callback) callback();
        }, 1500);
    }, 3000);
}

function loadChapter(n) {
    if (gameState.transitioning) return;
    gameState.chapter = n;
    clearScene();
    moveForward = moveBackward = moveLeft = moveRight = false;
    velocity.set(0, 0, 0);

    blocker.style.display = 'none';
    uiLayer.style.display = 'block';

    // Start music on first chapter, adjust volume per chapter
    initMusic();
    initRumble();
    if (n === 1 || n === 5) { setMusicVolume(0.3, 2000); setRumbleVolume(0.05, 2000); } // apartment: quiet
    if (n === 2 || n === 4) { setMusicVolume(0.55, 1500); setRumbleVolume(0.6, 1500); } // street: loud wind/rumble
    if (n === 3)            { setMusicVolume(0.4, 2000); setRumbleVolume(0.1, 2000); }  // office: medium
    if (n === 6 || n === 7 || n === 8) { setMusicVolume(0.1, 2000); setRumbleVolume(0, 2000); }    // peaceful morning / shop / unpacking

    if (n === 1) {
        buildApartment(false);
        showChapterCard('ГЛАВА 1', 'Пробуждение', function() {
            controls.lock();
            camera.position.set(2.0, 0.8, -1.0);
            var t = setInterval(function() {
                camera.position.y += 0.04;
                if (camera.position.y >= 1.6) {
                    camera.position.y = 1.6;
                    clearInterval(t);
                    showThought('Голова раскалывается... Пятница, 13-е. Нужно идти на работу.');
                    setTimeout(function() { setObjective('Включи свет'); }, 3500);
                }
            }, 50);
        });
    } else if (n === 2) {
        buildStreet(true);
        showChapterCard('ГЛАВА 2', 'Дорога на работу', function() {
            controls.lock();
        });
    } else if (n === 3) {
        buildOffice();
        showChapterCard('ГЛАВА 3', 'Ночная смена', function() {
            controls.lock();
        });
    } else if (n === 4) {
        buildStreet(false);
        showChapterCard('ГЛАВА 4', 'Дорога домой', function() {
            controls.lock();
        });
    } else if (n === 5) {
        buildApartment(true);
        showChapterCard('ГЛАВА 5', 'Конец смены', function() {
            controls.lock();
        });
    } else if (n === 6) {
        buildMorning();
        showChapterCard('ГЛАВА 6', 'Доброе утро', function() {
            controls.lock();
            camera.position.set(2.0, 0.8, -1.0);
            var t = setInterval(function() {
                camera.position.y += 0.04;
                if (camera.position.y >= 1.6) {
                    camera.position.y = 1.6;
                    clearInterval(t);
                    showThought('Какое прекрасное утро! Кошмар наконец-то закончился.');
                    setTimeout(function() {
                        setObjective('Осмотрись или отдохни');
                    }, 2500);

                    // 10 seconds after waking up: notifications arrive
                    startChapter6PhoneEvents();
                }
            }, 50);
        });
    } else if (n === 7) {
        buildShop();
        showChapterCard('ГЛАВА 7', 'Поход в магазин', function() {
            controls.lock();
            camera.position.set(0, 1.6, 5.0);
            showThought('Магазин у дома «Продукты 24». Надо купить еды, цены тут невысокие.');
            setObjective('Выбери продукты на полках и оплати на кассе');
            var cartHud = document.getElementById('shop-cart-hud');
            if (cartHud) cartHud.style.display = 'flex';
            updateShopHUD();
        });
    } else if (n === 8) {
        buildUnpackApartment();
        showChapterCard('ГЛАВА 8', 'Домашний уют', function() {
            controls.lock();
            camera.position.set(-0.2, 1.6, 1.6);
            camera.lookAt(-2.45, 1.2, 1.6);
            showThought('Я вернулся домой с покупками. Нужно открыть холодильник и разложить продукты по полкам.');
            setObjective('Открой холодильник и разложи продукты по полкам');
            updateFridgePrompt();
        });
    }
}

// ==================== BUILD: APARTMENT ====================
function buildApartment(isReturn) {
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.Fog(0x020202, 0.5, 6);

    var tl = new THREE.TextureLoader();
    var wallTex = tl.load(WALLPAPER_B64);
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(3, 1.5);

    var wallMat = new THREE.MeshLambertMaterial({ color: 0x888888, map: wallTex });
    var floorMat = makeMat(0x3d352b);
    var ceilMat = makeMat(0x1a1a1a);
    var woodMat = makeMat(0x5c4033);
    var whiteMat = makeMat(0xa0a0a0);
    var darkMat = makeMat(0x111111);
    var pillowMat = makeMat(0xd4c8a0);

    // Floor / Ceiling
    addMesh(new THREE.PlaneGeometry(6, 6), floorMat, 0, 0, 0).rotation.x = -Math.PI / 2;
    var c = addMesh(new THREE.PlaneGeometry(6, 6), ceilMat, 0, 3, 0);
    c.rotation.x = Math.PI / 2;

    // Walls
    // Back wall parts (with window hole)
    addMesh(new THREE.PlaneGeometry(1.5, 3), wallMat, -2.25, 1.5, -3);
    addMesh(new THREE.PlaneGeometry(1.5, 3), wallMat, 2.25, 1.5, -3);
    addMesh(new THREE.PlaneGeometry(3, 0.75), wallMat, 0, 0.375, -3);
    addMesh(new THREE.PlaneGeometry(3, 0.75), wallMat, 0, 2.625, -3);
    // Front wall (with hole for door)
    // Left piece
    var fwLeft = addMesh(new THREE.PlaneGeometry(2.4, 3), wallMat, -1.8, 1.5, 3); fwLeft.rotation.y = Math.PI;
    // Right piece
    var fwRight = addMesh(new THREE.PlaneGeometry(2.4, 3), wallMat, 1.8, 1.5, 3); fwRight.rotation.y = Math.PI;
    // Top piece
    var fwTop = addMesh(new THREE.PlaneGeometry(1.2, 0.8), wallMat, 0, 2.6, 3); fwTop.rotation.y = Math.PI;
    
    // Corridor outside the door
    var corrWallMat = makeMat(0x556655); // dingy hallway paint
    var corrFloorMat = makeMat(0x444444); // concrete floor
    var corrCeilMat = makeMat(0x222222);
    // Corridor floor & ceiling
    var cf = addMesh(new THREE.PlaneGeometry(2, 4), corrFloorMat, 0, 0, 5); cf.rotation.x = -Math.PI/2;
    var cc = addMesh(new THREE.PlaneGeometry(2, 4), corrCeilMat, 0, 3, 5); cc.rotation.x = Math.PI/2;
    // Corridor left & right walls
    var cwLeft = addMesh(new THREE.PlaneGeometry(4, 3), corrWallMat, -1, 1.5, 5); cwLeft.rotation.y = Math.PI/2;
    var cwRight = addMesh(new THREE.PlaneGeometry(4, 3), corrWallMat, 1, 1.5, 5); cwRight.rotation.y = -Math.PI/2;
    // Corridor end wall
    var cwEnd = addMesh(new THREE.PlaneGeometry(2, 3), corrWallMat, 0, 1.5, 7); cwEnd.rotation.y = Math.PI;
    // Add a dim light in the corridor
    var corrLight = new THREE.PointLight(0xddddaa, 0.5, 5);
    corrLight.position.set(0, 2.8, 5);
    scene.add(corrLight);

    // Left wall
    var lw = addMesh(new THREE.PlaneGeometry(6, 3), wallMat, -3, 1.5, 0);
    lw.rotation.y = Math.PI / 2;
    // Right wall
    var rw = addMesh(new THREE.PlaneGeometry(6, 3), wallMat, 3, 1.5, 0);
    rw.rotation.y = -Math.PI / 2;

    // Window frame
    var fm = makeMat(0x3e2723);
    addMesh(new THREE.BoxGeometry(3, 0.1, 0.2), fm, 0, 2.2, -3);
    addMesh(new THREE.BoxGeometry(3, 0.1, 0.2), fm, 0, 0.8, -3);
    addMesh(new THREE.BoxGeometry(0.1, 1.5, 0.2), fm, -1.45, 1.5, -3);
    addMesh(new THREE.BoxGeometry(0.1, 1.5, 0.2), fm, 1.45, 1.5, -3);
    addMesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), fm, 0, 1.5, -3);
    addMesh(new THREE.BoxGeometry(3, 0.1, 0.1), fm, 0, 1.5, -3);
    // Window glass
    var glassMat = new THREE.MeshLambertMaterial({ color: 0x051020, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    var win = addMesh(new THREE.PlaneGeometry(3, 1.5), glassMat, 0, 1.5, -3.01);
    win.userData = { name: 'Окно', type: 'window' };
    interactables.push(win);

    // Curtain Rod (Карниз)
    var rodMat = makeMat(0x222222);
    var rod = addMesh(new THREE.CylinderGeometry(0.018, 0.018, 3.4, 8), rodMat, 0, 2.28, -2.85);
    rod.rotation.z = Math.PI / 2;
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), rodMat, -1.72, 2.28, -2.85);
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), rodMat,  1.72, 2.28, -2.85);

    // Curtains (Left and Right panels)
    var curtainMat = makeMat(0x331e18); // rich dark warm fabric
    var leftCurtainGroup = new THREE.Group();
    leftCurtainGroup.position.set(-1.15, 1.5, -2.86);
    scene.add(leftCurtainGroup);
    addMesh(new THREE.BoxGeometry(0.55, 1.55, 0.06), curtainMat, 0, 0, 0, leftCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat, -0.15, 0, 0.02, leftCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat,  0.15, 0, 0.02, leftCurtainGroup);

    var rightCurtainGroup = new THREE.Group();
    rightCurtainGroup.position.set(1.15, 1.5, -2.86);
    scene.add(rightCurtainGroup);
    addMesh(new THREE.BoxGeometry(0.55, 1.55, 0.06), curtainMat, 0, 0, 0, rightCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat, -0.15, 0, 0.02, rightCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat,  0.15, 0, 0.02, rightCurtainGroup);

    // Responsive curtain hitbox in front of window
    var curtainHitbox = addMesh(new THREE.BoxGeometry(3.1, 1.6, 0.25), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.5, -2.84);
    curtainHitbox.userData = { name: 'Шторы', type: 'curtains' };
    interactables.push(curtainHitbox);

    gameState.leftCurtainGroup = leftCurtainGroup;
    gameState.rightCurtainGroup = rightCurtainGroup;
    gameState.curtainsMesh = curtainHitbox;
    gameState.curtainsClosed = false;

    // Door (with hinge group)
    var doorGroup = new THREE.Group();
    doorGroup.position.set(0.6, 0, 2.99);
    scene.add(doorGroup);
    var doorMesh = addMesh(new THREE.BoxGeometry(1.2, 2.2, 0.08), makeMat(0x302010), -0.6, 1.1, 0, doorGroup);
    
    // Doorknobs (both sides)
    var knobMat = makeMat(0xaaaaaa);
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), knobMat, -1.05, 1.0, 0.06, doorGroup);
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), knobMat, -1.05, 1.0, -0.06, doorGroup);

    // Deadbolt / latch lock (on interior side)
    var lockMat = makeMat(0x222222);
    var boltMat = makeMat(0x999999);
    addMesh(new THREE.BoxGeometry(0.14, 0.09, 0.03), lockMat, -1.02, 1.18, -0.055, doorGroup);
    var boltMesh = addMesh(new THREE.BoxGeometry(0.12, 0.028, 0.025), boltMat, -1.04, 1.18, -0.068, doorGroup);
    addMesh(new THREE.BoxGeometry(0.05, 0.1, 0.03), lockMat, -1.22, 1.18, -0.055, doorGroup);
    gameState.doorBoltMesh = boltMesh;
    gameState.doorLocked8 = false;
    
    doorMesh.userData = { name: "Дверь '13'", type: 'door', hingeGroup: doorGroup };
    interactables.push(doorMesh);
    gameState.apartmentDoorMesh = doorMesh;

    // Bed + pillow
    var bedMesh = addMesh(new THREE.BoxGeometry(2, 0.5, 4), darkMat, 2.0, 0.25, -1.0);
    addMesh(new THREE.BoxGeometry(0.7, 0.15, 0.5), pillowMat, 2.0, 0.58, -2.6);
    bedMesh.userData = { name: 'Кровать (Спать)', type: 'bed' };
    interactables.push(bedMesh);
    gameState.apartmentBedMesh = bedMesh;

    // Table
    addMesh(new THREE.BoxGeometry(1.5, 0.8, 1), woodMat, -2.25, 0.4, -2.5);

    // TV body
    addMesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), darkMat, -2.25, 1.1, -2.5);
    // TV screen
    var tvTex = tl.load(NEWS_B64);
    var tvMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    var tvScreen = addMesh(new THREE.PlaneGeometry(0.65, 0.45), tvMat, -2.25, 1.1, -2.19);
    tvScreen.userData = { name: 'Старый телевизор', type: 'tv', mat: tvMat, tex: tvTex };
    interactables.push(tvScreen);
    gameState.tvScreenMesh = tvScreen;

    // Clean water glass
    var wg = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8),
        new THREE.MeshLambertMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 }),
        -1.8, 0.875, -2.5);
    wg.userData = { name: 'Стакан с водой', type: 'water' };
    interactables.push(wg);

    // Sofa OPPOSITE the TV — facing the TV (TV is at x=-2.25, z=-2.5, faces +z)
    // Sofa sits at z=-0.5, facing -z (toward TV), centered on x=-2.25
    var sofaMat = makeMat(0x666666);
    var sofaGroup = new THREE.Group();
    sofaGroup.position.set(-2.0, 0, -0.5);
    sofaGroup.rotation.y = Math.PI; // face toward the TV (-z direction)
    scene.add(sofaGroup);

    // Base / seat (clickable)
    var sofaSeat = addMesh(new THREE.BoxGeometry(2.0, 0.28, 0.85), sofaMat, 0, 0.32, 0, sofaGroup);
    sofaSeat.userData = { name: isSitting ? 'Встать [F]' : 'Диван', type: 'sofa' };
    interactables.push(sofaSeat);
    // Back cushion (tall)
    addMesh(new THREE.BoxGeometry(2.0, 0.6, 0.14), sofaMat, 0, 0.76, -0.38, sofaGroup);
    // Seat cushions (two separate to look more realistic)
    var cushionMat = makeMat(0x555555);
    addMesh(new THREE.BoxGeometry(0.92, 0.14, 0.78), cushionMat, -0.5, 0.48, 0, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.92, 0.14, 0.78), cushionMat,  0.5, 0.48, 0, sofaGroup);
    // Back pillows
    addMesh(new THREE.BoxGeometry(0.88, 0.46, 0.1), cushionMat, -0.5, 0.72, -0.32, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.88, 0.46, 0.1), cushionMat,  0.5, 0.72, -0.32, sofaGroup);
    // Left arm
    addMesh(new THREE.BoxGeometry(0.16, 0.42, 0.85), sofaMat, -0.92, 0.39, 0, sofaGroup);
    // Right arm
    addMesh(new THREE.BoxGeometry(0.16, 0.42, 0.85), sofaMat,  0.92, 0.39, 0, sofaGroup);
    // Legs
    var legMat = makeMat(0x2a1a0a);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat, -0.85, 0.1,  0.35, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat,  0.85, 0.1,  0.35, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat, -0.85, 0.1, -0.35, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat,  0.85, 0.1, -0.35, sofaGroup);

    // ---- APARTMENT COLLIDERS (AABB in world space) ----
    // Bed: world pos (2.0, 0.25, -1.0), size 2x4
    colliders.push({ minX: 1.0,  maxX: 3.0,  minZ: -3.0, maxZ:  1.0 });
    // Table: world pos (-2.25, 0.4, -2.5), size 1.5x1
    colliders.push({ minX: -3.0, maxX: -1.5, minZ: -3.0, maxZ: -2.0 });
    // Fridge group at (-2.45, 0, 2.45) rotated 90deg: width 1.2 swaps to z-axis
    colliders.push({ minX: -3.0, maxX: -1.8, minZ:  1.8, maxZ:  3.0 });
    // Nightstand: world pos (0.6, 0, -2.6), size 0.8x1.2
    colliders.push({ minX:  0.2, maxX:  1.0, minZ: -3.0, maxZ: -2.1 });
    // Sofa: group at (-2.0, 0, -0.5) rotated 180deg; seat width=2.0, depth=0.85
    // With PI rotation: local +x→world -x, local +z→world -z
    // World x: [-2.0-1.0, -2.0+1.0]=[-3.0,-1.0], world z: [-0.5-0.425,-0.5+0.425]=[-0.925,-0.075]
    colliders.push({ minX: -3.0, maxX: -0.8, minZ: -1.0, maxZ:  0.1 });

    // Kitchen table (stands in apartment throughout the whole game)
    var tableGroup = new THREE.Group();
    tableGroup.position.set(-2.5, 0, 0.70);
    scene.add(tableGroup);

    var tableBaseMat = makeMat(0x3d2817);
    var tableTopMat = makeMat(0xdedad2);
    var tableLegMat = makeMat(0x2d1a0e);

    // Tabletop
    addMesh(new THREE.BoxGeometry(0.85, 0.05, 0.75), tableTopMat, 0, 0.85, 0, tableGroup);
    // Table frame
    addMesh(new THREE.BoxGeometry(0.75, 0.06, 0.65), tableBaseMat, 0, 0.80, 0, tableGroup);
    // 4 legs
    var legGeo = new THREE.BoxGeometry(0.05, 0.82, 0.05);
    addMesh(legGeo, tableLegMat, -0.34, 0.41, -0.29, tableGroup);
    addMesh(legGeo, tableLegMat,  0.34, 0.41, -0.29, tableGroup);
    addMesh(legGeo, tableLegMat, -0.34, 0.41,  0.29, tableGroup);
    addMesh(legGeo, tableLegMat,  0.34, 0.41,  0.29, tableGroup);

    colliders.push({ minX: -2.9, maxX: -2.1, minZ: 0.32, maxZ: 1.08 });
    gameState.apartmentTableGroup = tableGroup;

    // Kitchen stove (stands in apartment throughout the whole game)
    var stoveGroup = new THREE.Group();
    stoveGroup.position.set(-2.6, 0, 1.42);
    scene.add(stoveGroup);

    var whiteEnamel = makeMat(0xf0ede6);
    var darkMetal = makeMat(0x1a1a1a);
    var ovenGlass = makeMat(0x111827);
    var knobMat = makeMat(0x334155);
    var chromeMat = makeMat(0xaaaaaa);

    // Stove body
    addMesh(new THREE.BoxGeometry(0.65, 0.84, 0.65), whiteEnamel, 0, 0.42, 0, stoveGroup);

    // Oven door with glass window
    addMesh(new THREE.BoxGeometry(0.55, 0.48, 0.03), darkMetal, 0, 0.32, 0.33, stoveGroup);
    addMesh(new THREE.BoxGeometry(0.42, 0.32, 0.04), ovenGlass, 0, 0.32, 0.33, stoveGroup);
    // Oven handle
    addMesh(new THREE.BoxGeometry(0.46, 0.03, 0.04), chromeMat, 0, 0.52, 0.36, stoveGroup);

    // Control panel (knobs)
    addMesh(new THREE.BoxGeometry(0.58, 0.12, 0.03), whiteEnamel, 0, 0.72, 0.33, stoveGroup);
    for (var k = 0; k < 4; k++) {
        var kx = -0.21 + k * 0.14;
        var knob = addMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 8), knobMat, kx, 0.72, 0.34, stoveGroup);
        knob.rotation.x = Math.PI / 2;
    }

    // Cooktop surface
    addMesh(new THREE.BoxGeometry(0.67, 0.04, 0.67), whiteEnamel, 0, 0.86, 0, stoveGroup);
    // Back splash lip
    addMesh(new THREE.BoxGeometry(0.67, 0.10, 0.03), whiteEnamel, 0, 0.91, -0.32, stoveGroup);

    // 4 Burners
    var burnerMat = makeMat(0x222222);
    var burnerCoords = [
        { x: -0.16, z: -0.14, r: 0.08 },
        { x:  0.16, z: -0.14, r: 0.065 },
        { x: -0.16, z:  0.14, r: 0.065 },
        { x:  0.16, z:  0.14, r: 0.085 }
    ];
    for (var b = 0; b < burnerCoords.length; b++) {
        var bc = burnerCoords[b];
        addMesh(new THREE.CylinderGeometry(bc.r, bc.r, 0.015, 12), burnerMat, bc.x, 0.885, bc.z, stoveGroup);
    }

    // Glowing burner ring (active when cooking)
    var glowMat = new THREE.MeshBasicMaterial({ color: 0xff3b10, visible: false });
    var burnerGlow = addMesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16), glowMat, 0.16, 0.895, 0.14, stoveGroup);
    burnerGlow.rotation.x = Math.PI / 2;

    var stoveLight = new THREE.PointLight(0xff4500, 0, 2.0);
    stoveLight.position.set(0.16, 1.0, 0.14);
    stoveGroup.add(stoveLight);

    // Frying Pan on front-right burner
    var panGroup = new THREE.Group();
    panGroup.position.set(0.16, 0.895, 0.14);
    stoveGroup.add(panGroup);

    var panMat = makeMat(0x2a2a2a);
    addMesh(new THREE.CylinderGeometry(0.10, 0.085, 0.035, 16), panMat, 0, 0.018, 0, panGroup);
    var panHandle = addMesh(new THREE.BoxGeometry(0.025, 0.018, 0.14), makeMat(0x111111), 0, 0.03, 0.14, panGroup);
    panHandle.rotation.x = -Math.PI / 18;

    // Food inside pan (sausages)
    var foodMat = makeMat(0xb91c1c);
    var sausage1 = addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.10, 8), foodMat, -0.03, 0.025, 0, panGroup);
    sausage1.rotation.z = Math.PI / 2;
    var sausage2 = addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.10, 8), foodMat, 0.03, 0.025, 0, panGroup);
    sausage2.rotation.z = Math.PI / 2;

    // Stove hitbox
    var stoveHitbox = addMesh(new THREE.BoxGeometry(0.75, 1.0, 0.75), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.5, 0, stoveGroup);
    stoveHitbox.userData = { name: 'Плита (Приготовить еду)', type: 'stove' };
    interactables.push(stoveHitbox);

    colliders.push({ minX: -2.95, maxX: -2.25, minZ: 1.09, maxZ: 1.75 });

    gameState.apartmentStoveGroup = stoveGroup;
    gameState.apartmentStoveMesh = stoveHitbox;
    gameState.stoveGlow = burnerGlow;
    gameState.stoveLight = stoveLight;
    gameState.stovePanGroup = panGroup;

    // Fridge (hollow, in corner against left wall)
    var fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(-2.45, 0, 2.45);
    fridgeGroup.rotation.y = Math.PI / 2;
    scene.add(fridgeGroup);

    var fi = makeMat(0xdddddd);
    addMesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), fi, 0, 1.1, -0.55, fridgeGroup);  // back
    addMesh(new THREE.BoxGeometry(0.1, 2.2, 1.0), fi, -0.55, 1.1, 0, fridgeGroup);  // left
    addMesh(new THREE.BoxGeometry(0.1, 2.2, 1.0), fi, 0.55, 1.1, 0, fridgeGroup);   // right
    addMesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), fi, 0, 2.15, 0, fridgeGroup);     // top
    addMesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), fi, 0, 0.05, 0, fridgeGroup);     // bottom
    // Shelves
    var shelfMat = new THREE.MeshLambertMaterial({ color: 0xaaaacc, transparent: true, opacity: 0.7 });
    addMesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), shelfMat, 0, 0.6, 0, fridgeGroup);
    addMesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), shelfMat, 0, 1.2, 0, fridgeGroup);
    addMesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), shelfMat, 0, 1.8, 0, fridgeGroup);
    // Apple
    addMesh(new THREE.SphereGeometry(0.07, 8, 8), makeMat(0xcc2222), 0.15, 1.3, 0.1, fridgeGroup);
    // Fridge door hinge
    var fDoorGroup = new THREE.Group();
    fDoorGroup.position.set(0.6, 0, 0.5);
    fridgeGroup.add(fDoorGroup);
    var fDoor = addMesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), whiteMat, -0.6, 1.1, 0.05, fDoorGroup);
    fDoor.userData = { name: 'Холодильник', type: 'fridge', hingeGroup: fDoorGroup, isOpen: false, animating: false };
    interactables.push(fDoor);
    gameState.apartmentFridgeGroup = fridgeGroup;
    gameState.apartmentFridgeDoor = fDoor;

    // Key on nightstand (only chapter 1)
    if (!isReturn) {
        var keyGroup = new THREE.Group();
        keyGroup.position.set(0.6, 0.61, -2.6);
        keyGroup.rotation.x = Math.PI / 2;
        keyGroup.rotation.z = Math.PI / 4;
        scene.add(keyGroup);

        var keyMat = makeMat(0x8a6a3a); // dark golden/rusty

        // Bow (ring handle)
        var bow = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 8, 16), keyMat);
        bow.position.set(0, 0.07, 0);
        keyGroup.add(bow);

        // Shaft
        var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8), keyMat);
        shaft.position.set(0, 0, 0);
        keyGroup.add(shaft);

        // Bits (teeth)
        var bit1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.01), keyMat);
        bit1.position.set(0.02, -0.04, 0);
        keyGroup.add(bit1);
        
        var bit2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.01), keyMat);
        bit2.position.set(0.015, -0.01, 0);
        keyGroup.add(bit2);

        // Invisible interaction box covering the whole key
        var keyHitbox = addMesh(new THREE.BoxGeometry(0.2, 0.1, 0.2), new THREE.MeshBasicMaterial({visible: false}), 0, 0, 0, keyGroup);
        keyHitbox.userData = { name: 'Ржавый ключ', type: 'key', group: keyGroup };
        interactables.push(keyHitbox);
    }

    // Nightstand
    var ns = new THREE.Group();
    ns.position.set(0.6, 0, -2.6);
    scene.add(ns);
    addMesh(new THREE.BoxGeometry(0.8, 0.6, 1.2), woodMat, 0, 0.3, 0, ns);

    var drawerGroup = new THREE.Group();
    drawerGroup.position.set(0, 0.45, 0.1);
    ns.add(drawerGroup);

    // Drawer walls (for visible volume)
    addMesh(new THREE.BoxGeometry(0.74, 0.04, 1.1), woodMat, 0, -0.11, 0, drawerGroup);  // bottom
    var dFront = addMesh(new THREE.BoxGeometry(0.76, 0.26, 0.04), woodMat, 0, 0, 0.55, drawerGroup);
    addMesh(new THREE.BoxGeometry(0.74, 0.22, 0.04), woodMat, 0, 0.02, -0.53, drawerGroup); // back
    addMesh(new THREE.BoxGeometry(0.04, 0.22, 1.06), woodMat, -0.36, 0.02, 0, drawerGroup); // left
    addMesh(new THREE.BoxGeometry(0.04, 0.22, 1.06), woodMat, 0.36, 0.02, 0, drawerGroup);  // right
    // Flashlight inside
    var flMesh = addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), makeMat(0x222222), 0, -0.05, 0.1, drawerGroup);
    flMesh.rotation.x = Math.PI / 2;

    dFront.userData = { name: 'Тумбочка (ящик)', type: 'nightstand', drawerGroup: drawerGroup, flashMesh: flMesh, isOpen: false, animating: false };
    interactables.push(dFront);

    // Light switch (placed right beside entrance door at x=0.80, safely away from tree)
    var switchPlateMat = makeMat(0xdedad2);
    var switchRockerMat = makeMat(0xf0ede6);
    addMesh(new THREE.BoxGeometry(0.12, 0.16, 0.025), switchPlateMat, 0.80, 1.35, 2.98);
    addMesh(new THREE.BoxGeometry(0.06, 0.08, 0.035), switchRockerMat, 0.80, 1.35, 2.965);
    var sw = addMesh(new THREE.BoxGeometry(0.26, 0.30, 0.12), new THREE.MeshBasicMaterial({ visible: false }), 0.80, 1.35, 2.95);
    sw.userData = { name: 'Выключатель', type: 'switch' };
    interactables.push(sw);

    // Lighting
    scene.add(new THREE.AmbientLight(0x1a1a1a, 1.0));
    var winLight = new THREE.PointLight(0x4488ff, 1.0, 15);
    winLight.position.set(0, 1.5, -2.5);
    scene.add(winLight);
    roomLight = new THREE.PointLight(0xffeedd, 0, 15);
    roomLight.position.set(0, 2.9, 0);
    scene.add(roomLight);

    // Snow outside window (wide panoramic snowfall across the entire courtyard)
    addSnow(-22, -3.05, -16, 16, 0, 9.5, 2600, 0.075);

    // Christmas tree in the corner near bed and exit
    buildChristmasTree();

    // Chapter-specific setup
    if (isReturn) {
        // Chapter 5: return home
        gameState.lightOn = true;
        roomLight.intensity = 1.0;
        camera.position.set(0, 1.6, 2.0);
        camera.lookAt(0, 1.5, 0);
        setObjective('Закажи пиццу');
        
        // Add phone to the nightstand
        var phone = addMesh(new THREE.BoxGeometry(0.15, 0.02, 0.3), makeMat(0x111111), 0.6, 0.61, -2.6);
        phone.userData = { name: 'Телефон (Заказать пиццу)', type: 'phone' };
        interactables.push(phone);
        gameState.apartmentPhoneMesh = phone;
        
        chapterUpdate = function() {
            // Wait for bed interaction, logic is in handleInteraction
        };
    } else {
        // Chapter 1: start in bed
        camera.position.set(2.0, 0.8, -1.0);
    }
}

// ==================== CHRISTMAS TREE ====================
var cachedSpruceTex = null;
function getSpruceNeedleTexture() {
    if (cachedSpruceTex) return cachedSpruceTex;
    try {
        var canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        var ctx = canvas.getContext('2d');

        // Deep shaded forest background
        var grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#0f3818');
        grad.addColorStop(0.5, '#092810');
        grad.addColorStop(1, '#05180a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Shadow needles
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        for (var i = 0; i < 900; i++) {
            var x1 = Math.random() * 512;
            var y1 = Math.random() * 512;
            var a1 = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
            var len1 = 18 + Math.random() * 22;
            ctx.strokeStyle = (i % 2 === 0) ? '#07240e' : '#0b3215';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + Math.cos(a1) * len1, y1 + Math.sin(a1) * len1);
            ctx.stroke();
        }

        // Vibrant pine needles
        ctx.lineWidth = 2.0;
        for (var j = 0; j < 1300; j++) {
            var x2 = Math.random() * 512;
            var y2 = Math.random() * 512;
            var a2 = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
            var len2 = 14 + Math.random() * 18;
            var cIdx = j % 4;
            if (cIdx === 0) ctx.strokeStyle = '#1b5e20';
            else if (cIdx === 1) ctx.strokeStyle = '#2e7d32';
            else if (cIdx === 2) ctx.strokeStyle = '#388e3c';
            else ctx.strokeStyle = '#43a047';
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 + Math.cos(a2) * len2, y2 + Math.sin(a2) * len2);
            ctx.stroke();
        }

        // Bright fresh tips
        ctx.lineWidth = 1.3;
        for (var k = 0; k < 600; k++) {
            var x3 = Math.random() * 512;
            var y3 = Math.random() * 512;
            var a3 = -Math.PI / 2 + (Math.random() - 0.5) * 1.1;
            var len3 = 10 + Math.random() * 14;
            ctx.strokeStyle = (k % 2 === 0) ? '#66bb6a' : '#81c784';
            ctx.beginPath();
            ctx.moveTo(x3, y3);
            ctx.lineTo(x3 + Math.cos(a3) * len3, y3 + Math.sin(a3) * len3);
            ctx.stroke();
        }

        // Frosted snow speckles on outer tips
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (var s = 0; s < 300; s++) {
            var sx = Math.random() * 512;
            var sy = Math.random() * 512;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.0 + Math.random() * 1.6, 0, Math.PI * 2);
            ctx.fill();
        }

        cachedSpruceTex = new THREE.CanvasTexture(canvas);
        cachedSpruceTex.wrapS = THREE.RepeatWrapping;
        cachedSpruceTex.wrapT = THREE.RepeatWrapping;
        cachedSpruceTex.repeat.set(4, 2);
    } catch (e) {
        cachedSpruceTex = null;
    }
    return cachedSpruceTex;
}

function buildChristmasTree() {
    var treeGroup = new THREE.Group();
    treeGroup.position.set(2.22, 0, 2.18);
    scene.add(treeGroup);

    var spruceTex = getSpruceNeedleTexture();

    // 1. Holiday Velvet Tree Skirt
    var skirtMat = makeMat(0x6b0f1a);
    var goldTrimMat = makeMat(0xd4af37);
    var skirtGeom = new THREE.CircleGeometry(0.78, 24);
    var skirt = addMesh(skirtGeom, skirtMat, 0, 0.006, 0, treeGroup);
    skirt.rotation.x = -Math.PI / 2;

    var outerGoldTrim = addMesh(new THREE.RingGeometry(0.72, 0.78, 24), goldTrimMat, 0, 0.008, 0, treeGroup);
    outerGoldTrim.rotation.x = -Math.PI / 2;
    var innerGoldTrim = addMesh(new THREE.RingGeometry(0.48, 0.51, 24), goldTrimMat, 0, 0.008, 0, treeGroup);
    innerGoldTrim.rotation.x = -Math.PI / 2;

    // 2. Heavy Cast-Iron Tree Stand
    var standIronMat = makeMat(0x1a2e1d);
    var boltMat = makeMat(0xcaa337);
    addMesh(new THREE.CylinderGeometry(0.12, 0.16, 0.22, 14), standIronMat, 0, 0.11, 0, treeGroup);
    for (var sl = 0; sl < 4; sl++) {
        var sAngle = sl * Math.PI / 2 + Math.PI / 4;
        var legX = Math.cos(sAngle) * 0.26;
        var legZ = Math.sin(sAngle) * 0.26;
        var standLeg = addMesh(new THREE.BoxGeometry(0.28, 0.06, 0.08), standIronMat, legX, 0.04, legZ, treeGroup);
        standLeg.rotation.y = -sAngle;
        var boltX = Math.cos(sAngle) * 0.13;
        var boltZ = Math.sin(sAngle) * 0.13;
        addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 8), boltMat, boltX, 0.16, boltZ, treeGroup);
    }

    // 3. Central Wood Trunk
    var trunkMat = makeMat(0x382212);
    addMesh(new THREE.CylinderGeometry(0.06, 0.10, 2.50, 10), trunkMat, 0, 1.25, 0, treeGroup);

    // 4. 7 Graduated Tier Cones with Procedural Foliage Texture
    var tierProps = [
        { r: 0.85, h: 0.72, y: 0.60, col: 0x0c3315 },
        { r: 0.74, h: 0.66, y: 0.95, col: 0x103d1a },
        { r: 0.63, h: 0.60, y: 1.30, col: 0x144720 },
        { r: 0.51, h: 0.55, y: 1.62, col: 0x185427 },
        { r: 0.39, h: 0.50, y: 1.90, col: 0x1d612e },
        { r: 0.27, h: 0.45, y: 2.15, col: 0x226e35 },
        { r: 0.16, h: 0.42, y: 2.40, col: 0x277a3c }
    ];

    for (var tp = 0; tp < tierProps.length; tp++) {
        var tData = tierProps[tp];
        var tierMat = new THREE.MeshLambertMaterial({
            color: tData.col,
            map: spruceTex || null
        });
        addMesh(new THREE.ConeGeometry(tData.r, tData.h, 16), tierMat, 0, tData.y, 0, treeGroup);
    }

    // 5. 3D Radial Foliage Boughs (еловые лапы)
    var branchTwigMat = makeMat(0x2d1b0f);
    var boughConfigs = [
        { count: 10, y: 0.42, rInner: 0.45, rOuter: 0.92, bLen: 0.48, bW: 0.24, tilt: 0.24, col: 0x0e3617 },
        { count: 9,  y: 0.76, rInner: 0.38, rOuter: 0.80, bLen: 0.42, bW: 0.21, tilt: 0.22, col: 0x12421c },
        { count: 8,  y: 1.10, rInner: 0.32, rOuter: 0.68, bLen: 0.36, bW: 0.18, tilt: 0.20, col: 0x164d23 },
        { count: 7,  y: 1.44, rInner: 0.25, rOuter: 0.55, bLen: 0.30, bW: 0.15, tilt: 0.18, col: 0x1a5929 },
        { count: 6,  y: 1.76, rInner: 0.18, rOuter: 0.42, bLen: 0.24, bW: 0.12, tilt: 0.16, col: 0x206631 },
        { count: 5,  y: 2.05, rInner: 0.12, rOuter: 0.30, bLen: 0.18, bW: 0.10, tilt: 0.14, col: 0x257338 }
    ];

    for (var bc = 0; bc < boughConfigs.length; bc++) {
        var cfg = boughConfigs[bc];
        var bFanMat = new THREE.MeshLambertMaterial({ color: cfg.col, map: spruceTex || null });
        for (var bIdx = 0; bIdx < cfg.count; bIdx++) {
            var bAng = (bIdx / cfg.count) * Math.PI * 2 + (bc * 0.35);
            var midR = (cfg.rInner + cfg.rOuter) * 0.5;
            var bx = Math.cos(bAng) * midR;
            var bz = Math.sin(bAng) * midR;

            var boughGroup = new THREE.Group();
            boughGroup.position.set(bx, cfg.y, bz);
            boughGroup.rotation.y = -bAng + Math.PI / 2;
            boughGroup.rotation.x = cfg.tilt;
            treeGroup.add(boughGroup);

            addMesh(new THREE.BoxGeometry(0.024, 0.02, cfg.bLen), branchTwigMat, 0, 0, 0, boughGroup);
            var fan1 = addMesh(new THREE.BoxGeometry(cfg.bW, 0.035, cfg.bLen * 0.6), bFanMat, 0, 0.012, cfg.bLen * 0.15, boughGroup);
            fan1.rotation.y = 0.05;
            var fan2 = addMesh(new THREE.BoxGeometry(cfg.bW * 0.75, 0.03, cfg.bLen * 0.5), bFanMat, 0, 0.016, cfg.bLen * 0.35, boughGroup);
            fan2.rotation.y = -0.05;
        }
    }

    // 6. Magnificent 3D Kremlin Star Topper
    var brassSpireMat = makeMat(0xd4af37);
    var starCoreMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    var starRayMat = makeMat(0xd50000);

    addMesh(new THREE.CylinderGeometry(0.015, 0.035, 0.18, 10), brassSpireMat, 0, 2.54, 0, treeGroup);
    addMesh(new THREE.SphereGeometry(0.035, 8, 8), brassSpireMat, 0, 2.62, 0, treeGroup);

    var starCenter = addMesh(new THREE.SphereGeometry(0.055, 10, 10), starCoreMat, 0, 2.70, 0, treeGroup);
    for (var st = 0; st < 5; st++) {
        var stAng = st * (Math.PI * 2 / 5) - Math.PI / 2;
        var sRay = addMesh(new THREE.ConeGeometry(0.045, 0.16, 4), starRayMat, 0, 0, 0, starCenter);
        sRay.position.set(Math.cos(stAng) * 0.08, Math.sin(stAng) * 0.08, 0);
        sRay.rotation.z = stAng - Math.PI / 2;
    }
    var starGlow = new THREE.PointLight(0xff2233, 0.55, 1.4);
    starGlow.position.set(0, 2.70, 0);
    treeGroup.add(starGlow);

    // 7. Rich Handcrafted Glass Ornaments
    var ballColors = [
        0xd90429, // Ruby Red
        0xffb703, // Mirror Gold
        0x0077b6, // Royal Sapphire
        0x2d6a4f, // Emerald Green
        0x7209b7, // Amethyst Purple
        0xf72585, // Rose Magenta
        0xedf2f4  // Pearl Silver
    ];
    var ornamentCapMat = makeMat(0xd4af37);
    var wireMat = makeMat(0x64748b);

    var ornamentData = [
        { count: 8, yBase: 0.38, r: 0.84, ballR: 0.052, cShift: 0 },
        { count: 7, yBase: 0.72, r: 0.73, ballR: 0.046, cShift: 2 },
        { count: 6, yBase: 1.08, r: 0.62, ballR: 0.042, cShift: 4 },
        { count: 5, yBase: 1.42, r: 0.50, ballR: 0.038, cShift: 1 },
        { count: 4, yBase: 1.74, r: 0.38, ballR: 0.034, cShift: 3 },
        { count: 3, yBase: 2.04, r: 0.26, ballR: 0.030, cShift: 5 }
    ];

    for (var od = 0; od < ornamentData.length; od++) {
        var oTier = ornamentData[od];
        for (var oi = 0; oi < oTier.count; oi++) {
            var oAngle = (oi / oTier.count) * Math.PI * 2 + (od * 0.45);
            var ox = Math.cos(oAngle) * oTier.r;
            var oz = Math.sin(oAngle) * oTier.r;
            var oy = oTier.yBase + (oi % 2) * 0.06;

            var colHex = ballColors[(oi + oTier.cShift) % ballColors.length];
            var bMat = new THREE.MeshPhongMaterial({
                color: colHex,
                shininess: 95,
                specular: 0xffffff
            });

            addMesh(new THREE.SphereGeometry(oTier.ballR, 10, 10), bMat, ox, oy, oz, treeGroup);
            addMesh(new THREE.CylinderGeometry(oTier.ballR * 0.32, oTier.ballR * 0.32, 0.024, 8), ornamentCapMat, ox, oy + oTier.ballR + 0.012, oz, treeGroup);
            addMesh(new THREE.TorusGeometry(oTier.ballR * 0.20, 0.005, 6, 10), wireMat, ox, oy + oTier.ballR + 0.026, oz, treeGroup);

            if (oi % 3 === 0) {
                var band = addMesh(new THREE.TorusGeometry(oTier.ballR * 1.01, 0.005, 6, 14), ornamentCapMat, ox, oy, oz, treeGroup);
                band.rotation.x = Math.PI / 2;
            }
        }
    }

    // 8. Hanging Crystal Glass Icicles
    var icicleMat = new THREE.MeshPhongMaterial({
        color: 0xcfe2ff,
        transparent: true,
        opacity: 0.85,
        shininess: 100
    });
    var icicleAngles = [0.3, 1.1, 1.9, 2.7, 3.6, 4.4, 5.2, 5.9];
    for (var ic = 0; ic < icicleAngles.length; ic++) {
        var iAng = icicleAngles[ic];
        var iTierR = (ic % 2 === 0) ? 0.78 : 0.60;
        var iY = (ic % 2 === 0) ? 0.52 : 0.88;
        var ix = Math.cos(iAng) * iTierR;
        var iz = Math.sin(iAng) * iTierR;

        var icicle = addMesh(new THREE.ConeGeometry(0.018, 0.16, 6), icicleMat, ix, iY, iz, treeGroup);
        icicle.rotation.x = Math.PI;
        addMesh(new THREE.SphereGeometry(0.008, 6, 6), ornamentCapMat, ix, iY + 0.085, iz, treeGroup);
    }

    // 9. Gilded Pinecone Ornaments
    var coneGoldMat = makeMat(0xc69214);
    var pineconeAngles = [0.7, 1.8, 2.9, 4.0, 5.0, 6.1];
    for (var pc = 0; pc < pineconeAngles.length; pc++) {
        var pAng = pineconeAngles[pc];
        var pRad = 0.68;
        var py = 0.65 + (pc % 2) * 0.35;
        var px = Math.cos(pAng) * pRad;
        var pz = Math.sin(pAng) * pRad;

        var pGroup = new THREE.Group();
        pGroup.position.set(px, py, pz);
        treeGroup.add(pGroup);

        addMesh(new THREE.CylinderGeometry(0.022, 0.035, 0.04, 8), coneGoldMat, 0, 0, 0, pGroup);
        addMesh(new THREE.CylinderGeometry(0.028, 0.022, 0.04, 8), coneGoldMat, 0, -0.035, 0, pGroup);
        addMesh(new THREE.ConeGeometry(0.024, 0.04, 8), coneGoldMat, 0, -0.07, 0, pGroup);
        addMesh(new THREE.SphereGeometry(0.008, 6, 6), ornamentCapMat, 0, 0.028, 0, pGroup);
    }

    // 10. Luxurious Double-Helix Fluffy Tinsel Garland
    var goldTinselMat = makeMat(0xfbbf24);
    var silverTinselMat = makeMat(0xe2e8f0);

    for (var gt = 0; gt < 46; gt++) {
        var tProg = gt / 45;
        var tHelixAng = tProg * Math.PI * 8.5;
        var tRadius = 0.18 + tProg * 0.64;
        var tY = 2.32 - tProg * 1.82;

        var gx = Math.cos(tHelixAng) * tRadius;
        var gz = Math.sin(tHelixAng) * tRadius;
        addMesh(new THREE.SphereGeometry(0.028, 6, 6), goldTinselMat, gx, tY, gz, treeGroup);

        var sx = Math.cos(tHelixAng + Math.PI) * tRadius;
        var sz = Math.sin(tHelixAng + Math.PI) * tRadius;
        addMesh(new THREE.SphereGeometry(0.026, 6, 6), silverTinselMat, sx, tY - 0.02, sz, treeGroup);
    }

    // 11. 48 Twinkling Holiday LED Fairy Lights
    var ledColors = [0xffd166, 0xff1654, 0x06d6a0, 0x118ab2];
    for (var ld = 0; ld < 48; ld++) {
        var lProg = ld / 47;
        var lAng = lProg * Math.PI * 11.5 + 0.8;
        var lRad = 0.16 + lProg * 0.66;
        var ly = 2.34 - lProg * 1.85;

        var lx = Math.cos(lAng) * lRad;
        var lz = Math.sin(lAng) * lRad;
        var ledMat = new THREE.MeshBasicMaterial({ color: ledColors[ld % ledColors.length] });
        addMesh(new THREE.SphereGeometry(0.022, 6, 6), ledMat, lx, ly, lz, treeGroup);
    }

    // 12. Warm Ambient Holiday Lighting from Tree
    var mainTreeLight = new THREE.PointLight(0xffecd1, 1.15, 4.4);
    mainTreeLight.position.set(0, 1.25, 0);
    treeGroup.add(mainTreeLight);

    var upperTreeLight = new THREE.PointLight(0xffe4b5, 0.65, 2.6);
    upperTreeLight.position.set(0, 2.10, 0);
    treeGroup.add(upperTreeLight);

    // 13. 5 Realistic Wrapped Gift Boxes
    var boxMat1 = makeMat(0xb91c1c);
    var goldRibbonMat = makeMat(0xfbbf24);
    var b1Group = new THREE.Group();
    b1Group.position.set(-0.36, 0.12, 0.28);
    b1Group.rotation.y = 0.32;
    treeGroup.add(b1Group);
    addMesh(new THREE.BoxGeometry(0.32, 0.24, 0.28), boxMat1, 0, 0, 0, b1Group);
    addMesh(new THREE.BoxGeometry(0.324, 0.244, 0.045), goldRibbonMat, 0, 0, 0, b1Group);
    addMesh(new THREE.BoxGeometry(0.045, 0.244, 0.284), goldRibbonMat, 0, 0, 0, b1Group);
    addMesh(new THREE.TorusGeometry(0.05, 0.015, 6, 12), goldRibbonMat, -0.035, 0.14, 0, b1Group).rotation.y = Math.PI / 4;
    addMesh(new THREE.TorusGeometry(0.05, 0.015, 6, 12), goldRibbonMat, 0.035, 0.14, 0, b1Group).rotation.y = -Math.PI / 4;

    var boxMat2 = makeMat(0x1e40af);
    var silverRibbonMat = makeMat(0xf1f5f9);
    var b2Group = new THREE.Group();
    b2Group.position.set(0.34, 0.10, -0.25);
    b2Group.rotation.y = -0.45;
    treeGroup.add(b2Group);
    addMesh(new THREE.BoxGeometry(0.28, 0.20, 0.24), boxMat2, 0, 0, 0, b2Group);
    addMesh(new THREE.BoxGeometry(0.284, 0.204, 0.04), silverRibbonMat, 0, 0, 0, b2Group);
    addMesh(new THREE.BoxGeometry(0.04, 0.204, 0.244), silverRibbonMat, 0, 0, 0, b2Group);
    addMesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12), silverRibbonMat, 0, 0.12, 0, b2Group);

    var boxMat3 = makeMat(0x15803d);
    var redRibbonMat = makeMat(0xdc2626);
    var b3Group = new THREE.Group();
    b3Group.position.set(0.30, 0.08, 0.32);
    b3Group.rotation.y = 0.58;
    treeGroup.add(b3Group);
    addMesh(new THREE.BoxGeometry(0.34, 0.16, 0.22), boxMat3, 0, 0, 0, b3Group);
    addMesh(new THREE.BoxGeometry(0.344, 0.164, 0.035), redRibbonMat, 0, 0, 0, b3Group);
    addMesh(new THREE.BoxGeometry(0.035, 0.164, 0.224), redRibbonMat, 0, 0, 0, b3Group);

    var hatboxMat = makeMat(0xfef3c7);
    var hatboxLidMat = makeMat(0xd97706);
    var b4Group = new THREE.Group();
    b4Group.position.set(-0.25, 0.11, -0.32);
    treeGroup.add(b4Group);
    addMesh(new THREE.CylinderGeometry(0.13, 0.13, 0.20, 16), hatboxMat, 0, 0, 0, b4Group);
    addMesh(new THREE.CylinderGeometry(0.14, 0.14, 0.035, 16), hatboxLidMat, 0, 0.11, 0, b4Group);
    addMesh(new THREE.SphereGeometry(0.02, 8, 8), goldRibbonMat, 0, 0.14, 0, b4Group);

    var boxMat5 = makeMat(0xffffff);
    var b5Group = new THREE.Group();
    b5Group.position.set(0.02, 0.07, 0.44);
    b5Group.rotation.y = -0.22;
    treeGroup.add(b5Group);
    addMesh(new THREE.BoxGeometry(0.18, 0.14, 0.18), boxMat5, 0, 0, 0, b5Group);
    addMesh(new THREE.BoxGeometry(0.184, 0.144, 0.03), goldRibbonMat, 0, 0, 0, b5Group);
    addMesh(new THREE.BoxGeometry(0.03, 0.144, 0.184), goldRibbonMat, 0, 0, 0, b5Group);

    // 14. Solid Collider around Tree, Skirt and Gifts
    colliders.push({ minX: 1.55, maxX: 2.85, minZ: 1.50, maxZ: 2.80 });

    // 15. Interactive Hitbox
    var treeHitbox = addMesh(new THREE.BoxGeometry(1.6, 2.7, 1.6), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.35, 0, treeGroup);
    treeHitbox.userData = { name: 'Пышная новогодняя ёлка', type: 'tree' };
    interactables.push(treeHitbox);

    gameState.apartmentTreeGroup = treeGroup;
}

// ==================== BUILD: MORNING ====================
function buildMorning() {
    buildApartment(false); // build standard apartment
    
    // Add phone on nightstand for morning messages
    var phone = addMesh(new THREE.BoxGeometry(0.15, 0.02, 0.3), makeMat(0x111111), 0.6, 0.61, -2.6);
    phone.userData = { name: 'Телефон', type: 'phone' };
    interactables.push(phone);

    // Change to morning atmosphere
    scene.background = new THREE.Color(0xddeeff);
    scene.fog = new THREE.Fog(0xddeeff, 2, 14);
    
    // Bright sunlight
    var sun = new THREE.DirectionalLight(0xfffaed, 1.6);
    sun.position.set(0, 5, -10);
    sun.target.position.set(0, 0, 0);
    scene.add(sun);
    scene.add(sun.target);
    
    // Add bright ambient light
    scene.add(new THREE.AmbientLight(0xfffaea, 0.9));
    
    // Stop horror audio smoothly
    if (typeof setMusicVolume !== 'undefined') setMusicVolume(0, 1500);
    if (typeof setRumbleVolume !== 'undefined') setRumbleVolume(0, 1500);
    
    // Play happy morning chord
    var ctx = getAudioCtx();
    if (ctx) {
        var mGain = ctx.createGain();
        mGain.gain.setValueAtTime(0, ctx.currentTime);
        mGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 3.0);
        mGain.connect(ctx.destination);
        var freqs = [261.63, 329.63, 392.00, 523.25]; // C Major chord
        for (var i = 0; i < freqs.length; i++) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freqs[i];
            osc.connect(mGain);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 30);
        }
    }
    
    // Play morning birds (simulated)
    if (ctx) {
        var osc2 = ctx.createOscillator();
        var gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(4000, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(6000, ctx.currentTime + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 2.0);
        osc2.stop(ctx.currentTime + 2.3);
    }
}

function createProceduralTexture(w, h, renderFn) {
    var cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    var cx = cv.getContext('2d');
    renderFn(cx, w, h);
    var t = new THREE.CanvasTexture(cv);
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
}

// ==================== CHAPTER 8: UNPACKING GROCERIES ====================
var FRIDGE_SLOTS = [
    // Top shelf (y base = 1.82)
    { x: -0.32, yBase: 1.82, z: -0.15, name: 'верхнюю полку (слева)' },
    { x: -0.11, yBase: 1.82, z: -0.15, name: 'верхнюю полку' },
    { x:  0.10, yBase: 1.82, z: -0.15, name: 'верхнюю полку' },
    { x:  0.31, yBase: 1.82, z: -0.15, name: 'верхнюю полку (справа)' },

    // Middle shelf (y base = 1.22)
    { x: -0.32, yBase: 1.22, z: -0.12, name: 'среднюю полку (слева)' },
    { x: -0.10, yBase: 1.22, z: -0.12, name: 'среднюю полку' },
    { x:  0.11, yBase: 1.22, z: -0.12, name: 'среднюю полку' },
    { x:  0.32, yBase: 1.22, z: -0.12, name: 'среднюю полку (справа)' },

    // Lower shelf (y base = 0.62)
    { x: -0.28, yBase: 0.62, z: -0.10, name: 'нижнюю полку (слева)' },
    { x:  0.02, yBase: 0.62, z: -0.10, name: 'нижнюю полку' },
    { x:  0.28, yBase: 0.62, z: -0.10, name: 'нижнюю полку (справа)' },

    // Bottom floor (y base = 0.10)
    { x: -0.18, yBase: 0.10, z:  0.05, name: 'нижний отсек' },
    { x:  0.18, yBase: 0.10, z:  0.05, name: 'нижний отсек' }
];

function getFallbackItemInfo(name) {
    if (!name) return { texKey: 'milk', itemKind: 'carton' };
    var n = name.toLowerCase();
    if (n.indexOf('молок') !== -1) return { texKey: 'milk', itemKind: 'carton' };
    if (n.indexOf('кефир') !== -1) return { texKey: 'kefir', itemKind: 'carton' };
    if (n.indexOf('сметан') !== -1) return { texKey: 'sourCream', itemKind: 'box' };
    if (n.indexOf('масло сливочн') !== -1 || n.indexOf('масло 82') !== -1) return { texKey: 'butter', itemKind: 'box' };
    if (n.indexOf('творог') !== -1) return { texKey: 'tvorog', itemKind: 'box' };
    if (n.indexOf('сыр') !== -1) return { texKey: 'cheese', itemKind: 'box' };
    if (n.indexOf('яйц') !== -1) return { texKey: 'eggs', itemKind: 'box' };
    if (n.indexOf('сосиск') !== -1) return { texKey: 'sausage', itemKind: 'sausage' };
    if (n.indexOf('колбас') !== -1 || n.indexOf('докторск') !== -1) return { texKey: 'doctorSausage', itemKind: 'bread' };
    if (n.indexOf('сервелат') !== -1 || n.indexOf('салями') !== -1) return { texKey: 'salami', itemKind: 'bread' };
    if (n.indexOf('сок') !== -1) return { texKey: 'juiceApple', itemKind: 'carton' };
    if (n.indexOf('cola') !== -1) return { texKey: 'cola', itemKind: 'soda' };
    if (n.indexOf('sprite') !== -1) return { texKey: 'sprite', itemKind: 'soda' };
    if (n.indexOf('пельмен') !== -1) return { texKey: 'pelmeni', itemKind: 'box' };
    if (n.indexOf('яблок') !== -1) return { texKey: 'apple', itemKind: 'fruit' };
    if (n.indexOf('апельсин') !== -1) return { texKey: 'orange', itemKind: 'fruit' };
    if (n.indexOf('горошек') !== -1) return { texKey: 'peas', itemKind: 'can' };
    if (n.indexOf('кукуруз') !== -1) return { texKey: 'corn', itemKind: 'can' };
    if (n.indexOf('сгущен') !== -1 || n.indexOf('сгущён') !== -1) return { texKey: 'condensed', itemKind: 'can' };
    if (n.indexOf('шпрот') !== -1) return { texKey: 'sprats', itemKind: 'can' };
    if (n.indexOf('тушен') !== -1 || n.indexOf('тушён') !== -1) return { texKey: 'stew', itemKind: 'can' };
    if (n.indexOf('батон') !== -1 || n.indexOf('хлеб') !== -1) return { texKey: 'bread', itemKind: 'bread' };
    if (n.indexOf('макарон') !== -1 || n.indexOf('паста') !== -1) return { texKey: 'pasta', itemKind: 'box' };
    if (n.indexOf('доширак') !== -1) return { texKey: 'doshirak', itemKind: 'box' };
    if (n.indexOf('роллтон') !== -1) return { texKey: 'rollton', itemKind: 'box' };
    if (n.indexOf('майонез') !== -1) return { texKey: 'mayo', itemKind: 'box' };
    return { texKey: 'milk', itemKind: 'carton' };
}

function createFridgeProductMesh(item, shopTexs) {
    var grp = new THREE.Group();
    var texKey = item.texKey;
    var kind = item.itemKind;
    if (!texKey || !kind) {
        var info = getFallbackItemInfo(item.name);
        texKey = texKey || info.texKey;
        kind = kind || info.itemKind;
    }
    var tex = shopTexs[texKey];
    var mat = tex ? new THREE.MeshLambertMaterial({ map: tex }) : makeMat(0xfafafa);
    var metalCapMat = makeMat(0xd1d5db);

    if (kind === 'carton') {
        var w = 0.11, h = 0.22, d = 0.11;
        addMesh(new THREE.BoxGeometry(w, h * 0.86, d), mat, 0, (h * 0.86) * 0.5, 0, grp);
        addMesh(new THREE.BoxGeometry(w * 0.96, h * 0.14, d * 0.88), mat, 0, h * 0.86 + (h * 0.14) * 0.5, 0, grp);
        addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8), makeMat(0xffffff), 0, h + 0.01, 0, grp);
    } else if (kind === 'soda') {
        var r = 0.042, h = 0.13;
        addMesh(new THREE.CylinderGeometry(r, r, h, 14), mat, 0, h * 0.5, 0, grp);
        addMesh(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.008, 14), metalCapMat, 0, h, 0, grp);
        addMesh(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.008, 14), metalCapMat, 0, 0, 0, grp);
    } else if (kind === 'can') {
        var r = 0.048, h = 0.11;
        addMesh(new THREE.CylinderGeometry(r, r, h, 14), mat, 0, h * 0.5, 0, grp);
        addMesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.008, 14), metalCapMat, 0, h, 0, grp);
        addMesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.008, 14), metalCapMat, 0, 0, 0, grp);
    } else if (kind === 'sausage') {
        addMesh(new THREE.BoxGeometry(0.20, 0.05, 0.14), mat, 0, 0.025, 0, grp);
    } else if (kind === 'bread') {
        var loaf = addMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 10), mat, 0, 0.045, 0, grp);
        loaf.rotation.z = Math.PI / 2;
    } else if (kind === 'fruit') {
        var fr = 0.048;
        addMesh(new THREE.SphereGeometry(fr, 8, 8), mat, 0, fr, 0, grp);
        addMesh(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 5), makeMat(0x451a03), 0, fr * 2 + 0.008, 0, grp);
    } else {
        var bw = 0.16, bh = 0.08, bd = 0.12;
        if (texKey === 'pelmeni') { bw = 0.20; bh = 0.12; bd = 0.14; }
        else if (texKey === 'butter') { bw = 0.12; bh = 0.05; bd = 0.08; }
        else if (texKey === 'cheese' || texKey === 'cheeseGouda') { bw = 0.15; bh = 0.06; bd = 0.10; }
        else if (texKey === 'eggs') { bw = 0.22; bh = 0.07; bd = 0.12; }
        addMesh(new THREE.BoxGeometry(bw, bh, bd), mat, 0, bh * 0.5, 0, grp);
    }

    // Attach fridge_shelf type to all child meshes so clicking them unpacks more
    grp.traverse(function(child) {
        if (child.isMesh) {
            child.userData = { name: 'Полка холодильника', type: 'fridge_shelf' };
        }
    });

    return grp;
}

function updateFridgePrompt() {
    var nextItem = gameState.unpackQueue[gameState.unpackedCount];
    if (gameState.apartmentFridgeDoor && gameState.apartmentFridgeDoor.userData) {
        if (!gameState.fridgeOpen) {
            gameState.apartmentFridgeDoor.userData.name = 'Открыть холодильник';
        } else if (gameState.unpackedCount < gameState.unpackQueue.length) {
            gameState.apartmentFridgeDoor.userData.name = 'Положить: ' + (nextItem ? nextItem.name : 'продукт');
        } else {
            gameState.apartmentFridgeDoor.userData.name = 'Закрыть холодильник';
        }
    }
    if (gameState.fridgeShelfHitbox && gameState.fridgeShelfHitbox.userData) {
        if (gameState.unpackedCount < gameState.unpackQueue.length) {
            gameState.fridgeShelfHitbox.userData.name = 'Полка [Положить: ' + (nextItem ? nextItem.name : 'продукт') + ']';
        } else {
            gameState.fridgeShelfHitbox.userData.name = 'Полка холодильника (заполнена)';
        }
    }
    if (gameState.groceryBagMesh && gameState.groceryBagMesh.userData) {
        if (gameState.unpackedCount < gameState.unpackQueue.length) {
            gameState.groceryBagMesh.userData.name = 'Пакет [Достать: ' + (nextItem ? nextItem.name : 'продукт') + ']';
        } else {
            gameState.groceryBagMesh.userData.name = 'Пакет из магазина (пуст)';
        }
    }
    if (currentInteractable && currentInteractable.userData && currentInteractable.userData.name) {
        interactionPrompt.textContent = '[ЛКМ] ' + currentInteractable.userData.name;
    }
}

function unpackNextFridgeItem() {
    if (gameState.unpackedCount >= gameState.unpackQueue.length) {
        showThought('Все купленные продукты уже разложены! Теперь нужно закрыть холодильник.');
        setObjective('Закрой холодильник');
        return;
    }

    var idx = gameState.unpackedCount;
    var item = gameState.unpackQueue[idx];
    var slot = FRIDGE_SLOTS[idx % FRIDGE_SLOTS.length];
    var shopTexs = getShopTextures();
    var productMesh = createFridgeProductMesh(item, shopTexs);
    productMesh.position.set(slot.x, slot.yBase, slot.z);
    productMesh.scale.set(0.1, 0.1, 0.1);

    if (gameState.apartmentFridgeGroup) {
        gameState.apartmentFridgeGroup.add(productMesh);
    }

    // Smooth pop scale animation
    var startT = Date.now();
    var sIv = setInterval(function() {
        var el = Date.now() - startT;
        var p = Math.min(1, el / 160);
        var s = 0.1 + p * 0.9;
        productMesh.scale.set(s, s, s);
        if (p >= 1) clearInterval(sIv);
    }, 20);

    gameState.unpackedCount++;
    playItemPickupSound();

    var remaining = gameState.unpackQueue.length - gameState.unpackedCount;
    if (remaining > 0) {
        showThought('Положил: ' + item.name + ' на ' + slot.name + '. (Осталось: ' + remaining + ' шт.)');
        setObjective('Разложи продукты по полкам (' + gameState.unpackedCount + ' / ' + gameState.unpackQueue.length + ')');
    } else {
        showThought('Отлично! Все продукты аккуратно разложены по полкам, пустой пакет убран. Теперь закрой холодильник.');
        setObjective('Закрой холодильник');
        if (gameState.groceryBagGroup) {
            scene.remove(gameState.groceryBagGroup);
            gameState.groceryBagGroup = null;
        }
        if (gameState.groceryBagMesh) {
            var bIdx = interactables.indexOf(gameState.groceryBagMesh);
            if (bIdx !== -1) interactables.splice(bIdx, 1);
            gameState.groceryBagMesh = null;
        }
        if (currentInteractable && currentInteractable.userData && currentInteractable.userData.type === 'grocery_bag') {
            currentInteractable = null;
            interactionPrompt.style.opacity = 0;
        }
    }
    updateFridgePrompt();
}

function handleChapter8Fridge(d) {
    if (d.animating) return;
    if (!d.isOpen) {
        d.isOpen = true;
        d.animating = true;
        gameState.fridgeOpen = true;
        playFridgeOpenSound();
        showThought('Холодильник открыт. Самое время разложить продукты по полкам!');
        setObjective('Разложи продукты по полкам (' + gameState.unpackedCount + ' / ' + gameState.unpackQueue.length + ')');
        var rot = 0;
        var fiv = setInterval(function() {
            d.hingeGroup.rotation.y += 0.03;
            rot += 0.03;
            if (rot >= Math.PI / 2) {
                clearInterval(fiv);
                d.animating = false;
                updateFridgePrompt();
            }
        }, 30);
    } else {
        if (gameState.unpackedCount < gameState.unpackQueue.length) {
            unpackNextFridgeItem();
        } else {
            d.isOpen = false;
            d.animating = true;
            gameState.fridgeOpen = false;
            playFridgeCloseSound();
            showThought('Закрываю холодильник. Все продукты аккуратно убраны.');
            var rot2 = 0;
            var fiv2 = setInterval(function() {
                d.hingeGroup.rotation.y -= 0.03;
                rot2 += 0.03;
                if (rot2 >= Math.PI / 2) {
                    clearInterval(fiv2);
                    d.animating = false;
                    gameState.fridgeUnpackedAll = true;
                    showThought('Холодильник забит едой! Можно приготовить обед на плите или заказать доставку по телефону.');
                    setObjective('Приготовь еду на плите или закажи доставку');
                    if (gameState.apartmentPhoneMesh && gameState.apartmentPhoneMesh.userData) {
                        gameState.apartmentPhoneMesh.userData.name = 'Телефон [Заказать доставку]';
                    }
                    if (gameState.apartmentStoveMesh && gameState.apartmentStoveMesh.userData) {
                        gameState.apartmentStoveMesh.userData.name = 'Плита [Приготовить еду]';
                    }
                    if (gameState.tvScreenMesh && gameState.tvScreenMesh.userData) {
                        gameState.tvScreenMesh.userData.name = 'Телевизор (Новости)';
                    }
                }
            }, 30);
        }
    }
}

var zombieNewsTexCache = null;
function getZombieNewsTexture() {
    if (zombieNewsTexCache) return zombieNewsTexCache;
    zombieNewsTexCache = createProceduralTexture(512, 340, function(cx, w, h) {
        // Deep emergency studio background
        var bgGrad = cx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#0a0f1d');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#05050a');
        cx.fillStyle = bgGrad;
        cx.fillRect(0, 0, w, h);

        // Top urgent banner (Red with alert text)
        cx.fillStyle = '#b91c1c';
        cx.fillRect(0, 0, w, 52);
        cx.fillStyle = '#fef08a';
        cx.font = 'bold 22px sans-serif';
        cx.textAlign = 'left';
        cx.fillText('🔴 ЭКСТРЕННЫЙ ВЫПУСК', 18, 34);

        cx.fillStyle = '#ffffff';
        cx.font = 'bold 15px sans-serif';
        cx.textAlign = 'right';
        cx.fillText('НОВОСТИ 24 • ПРЯМОЙ ЭФИР', w - 18, 33);

        // Main Alert Box
        cx.fillStyle = 'rgba(220, 38, 38, 0.28)';
        cx.fillRect(16, 64, w - 32, 192);
        cx.strokeStyle = '#ef4444';
        cx.lineWidth = 3;
        cx.strokeRect(16, 64, w - 32, 192);

        // Warning Triangle
        cx.fillStyle = '#eab308';
        cx.beginPath();
        cx.moveTo(60, 82);
        cx.lineTo(85, 126);
        cx.lineTo(35, 126);
        cx.closePath();
        cx.fill();
        cx.fillStyle = '#000000';
        cx.font = 'bold 24px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('!', 60, 122);

        // Headline
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 28px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ЗОМБИ-АПОКАЛИПСИС', w * 0.5 + 20, 104);

        cx.fillStyle = '#f87171';
        cx.font = 'bold 23px sans-serif';
        cx.fillText('ДЕНЬ 2 • РЕЖИМ ЧС', w * 0.5 + 20, 136);

        // Warning messages inside box
        cx.fillStyle = '#fef3c7';
        cx.font = 'bold 15px sans-serif';
        cx.fillText('В ГОРОДЕ ОБЪЯВЛЕН ВЫСШИЙ УРОВЕНЬ ОПАСНОСТИ', w * 0.5, 172);

        cx.fillStyle = '#ffffff';
        cx.font = 'bold 14px sans-serif';
        cx.fillText('НЕ ВЫХОДИТЕ ИЗ ДОМА И БУДЬТЕ ОСТОРОЖНЫ!', w * 0.5, 200);
        cx.fillStyle = '#fca5a5';
        cx.fillText('НЕ ВПУСКАЙТЕ В ДОМ СТРАННЫХ ЛЮДЕЙ!', w * 0.5, 226);

        // Bottom yellow running ticker
        cx.fillStyle = '#eab308';
        cx.fillRect(0, 268, w, 44);
        cx.fillStyle = '#000000';
        cx.font = 'bold 15px sans-serif';
        cx.textAlign = 'left';
        cx.fillText('СРОЧНО: ЗОМБИ АПОКАЛИПСИС (ДЕНЬ 2) • НЕ ВЫХОДИТЕ ИЗ ДОМА • НЕ ВПУСКАЙТЕ В ДОМ СТРАННЫХ ЛЮДЕЙ •', 10, 296);

        // Subtle CRT Scanlines
        cx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        for (var y = 0; y < h; y += 4) {
            cx.fillRect(0, y, w, 1.5);
        }
    });
    return zombieNewsTexCache;
}

function handleChapter8News(d) {
    if (gameState.newsWatched8) return;
    gameState.newsWatched8 = true;
    gameState.tvOn = true;
    d.mat.color.setHex(0xffffff);
    d.mat.map = getZombieNewsTexture();
    d.mat.needsUpdate = true;
    playEmergencyTone();
    setObjective('Слушай экстренный выпуск новостей');

    // Mute ambient rumble and play user song "Maebi - The Lobotomy.mp3" nonstop
    if (typeof setRumbleVolume !== 'undefined') setRumbleVolume(0, 1000);
    startLobotomyMusic();

    showThought('Диктор: «Экстренный выпуск новостей! Внимание всем жителям города!»');

    setTimeout(function() {
        if (gameState.chapter !== 8) return;
        playEmergencyTone();
        showThought('Диктор: «Сегодня второй день как зомби апокалипсис! Не выходите из дома и будьте осторожны!»');
    }, 4500);

    setTimeout(function() {
        if (gameState.chapter !== 8) return;
        showThought('Диктор: «А также ни в коем случае не впускайте в дом странных людей! Заприте все двери!»');
    }, 9500);

    setTimeout(function() {
        if (gameState.chapter !== 8) return;
        showThought('Так вот почему босс нас всех уволил, а город был пустым... Хорошо, что я успел забить холодильник едой и запереться дома.');
        setObjective('Оставайся дома и выживай');
    }, 14500);

    setTimeout(function() {
        if (gameState.chapter !== 8) return;
        gameState.newsFinished8 = true;
        showThought('Диктор предупредил об опасности! Нужно запереться, выключить телевизор, чтобы не привлекать внимание, и лечь спать.');
        updateChapter8SecurityObjectives();
    }, 19500);
}

function updateChapter8SecurityObjectives() {
    if (gameState.curtainsMesh && gameState.curtainsMesh.userData) {
        gameState.curtainsMesh.userData.name = gameState.curtainsClosed ? 'Шторы (занавешены)' : 'Занавесить шторы';
    }
    if (gameState.apartmentDoorMesh && gameState.apartmentDoorMesh.userData) {
        gameState.apartmentDoorMesh.userData.name = gameState.doorLocked8 ? "Дверь '13' (Заперта на замок)" : 'Запереть дверь на замок';
    }
    if (gameState.tvScreenMesh && gameState.tvScreenMesh.userData) {
        gameState.tvScreenMesh.userData.name = gameState.tvOn ? 'Выключить телевизор' : 'Телевизор (выключен)';
    }
    if (gameState.apartmentBedMesh && gameState.apartmentBedMesh.userData) {
        if (gameState.curtainsClosed && gameState.doorLocked8 && !gameState.tvOn) {
            gameState.apartmentBedMesh.userData.name = 'Кровать (Спать)';
        } else {
            gameState.apartmentBedMesh.userData.name = 'Кровать (Сначала обезопась квартиру)';
        }
    }

    var pending = [];
    if (!gameState.doorLocked8) pending.push('запри дверь');
    if (!gameState.curtainsClosed) pending.push('занавесь шторы');
    if (gameState.tvOn) pending.push('выключи телевизор');

    if (pending.length > 0) {
        var objStr = pending[0].charAt(0).toUpperCase() + pending[0].slice(1);
        if (pending.length === 2) {
            objStr += ' и ' + pending[1];
        } else if (pending.length === 3) {
            objStr = 'Запри дверь, занавесь шторы и выключи телевизор';
        }
        setObjective(objStr);
    } else {
        showThought('Дверь заперта, шторы занавешены, телевизор выключен. Теперь в квартире безопасно. Пора лечь спать.');
        setObjective('Ложись спать на кровать');
    }
}

function cookOnStove() {
    if (gameState.isCooking) return;
    gameState.isCooking = true;
    playSizzleSound(2.8);

    if (gameState.stoveGlow) gameState.stoveGlow.material.visible = true;
    if (gameState.stoveLight) gameState.stoveLight.intensity = 0.9;

    showThought('Сковорода нагрелась, масло зашипело... Готовлю сосиски на плите!');

    var startT = Date.now();
    var fiv = setInterval(function() {
        var elapsed = Date.now() - startT;
        if (gameState.stovePanGroup) {
            gameState.stovePanGroup.position.x = 0.16 + (Math.random() - 0.5) * 0.006;
            gameState.stovePanGroup.position.z = 0.14 + (Math.random() - 0.5) * 0.006;
        }
        if (elapsed >= 2800) {
            clearInterval(fiv);
            if (gameState.stovePanGroup) {
                gameState.stovePanGroup.position.set(0.16, 0.895, 0.14);
            }
            if (gameState.stoveGlow) gameState.stoveGlow.material.visible = false;
            if (gameState.stoveLight) gameState.stoveLight.intensity = 0;
            gameState.isCooking = false;
            gameState.cookedFoodEaten = true;
            gameState.foodEaten8 = true;

            showThought('Готово! Ароматная горячая еда прямо со сковороды — сам приготовил! Теперь я сыт.');

            if (gameState.chapter === 8 && !gameState.tvOn && !gameState.newsWatched8) {
                setObjective('Включи телевизор и посмотри новости');
                if (gameState.tvScreenMesh && gameState.tvScreenMesh.userData) {
                    gameState.tvScreenMesh.userData.name = 'Телевизор (Новости)';
                }
            }
        }
    }, 40);
}

function spawnDeliveryPackage() {
    if (gameState.deliveryPackageGroup) return;
    playKnock();

    var pkgGroup = new THREE.Group();
    pkgGroup.position.set(-2.5, 0.875, 0.70);
    scene.add(pkgGroup);

    var craftMat = makeMat(0xc29b68);
    var redMat = makeMat(0xdc2626);
    var boxMat = makeMat(0xf8fafc);

    var bag = addMesh(new THREE.BoxGeometry(0.32, 0.35, 0.22), craftMat, 0, 0.175, 0, pkgGroup);
    addMesh(new THREE.BoxGeometry(0.33, 0.08, 0.23), redMat, 0, 0.20, 0, pkgGroup);
    addMesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), boxMat, 0.22, 0.07, 0, pkgGroup);

    bag.userData = { name: 'Заказ из доставки (Поесть)', type: 'delivery_food' };
    interactables.push(bag);

    gameState.deliveryPackageGroup = pkgGroup;
    gameState.deliveryPackageMesh = bag;
}

function closeCurtainsAnimation(onDone) {
    if (gameState.curtainsClosed) {
        if (onDone) onDone();
        return;
    }
    playCurtainSound();
    var leftG = gameState.leftCurtainGroup;
    var rightG = gameState.rightCurtainGroup;
    var startT = Date.now();
    var duration = 750;

    var civ = setInterval(function() {
        var elapsed = Date.now() - startT;
        var p = Math.min(1, elapsed / duration);
        var ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

        if (leftG) {
            leftG.position.x = -1.15 + ease * (-0.75 - (-1.15));
            leftG.scale.x = 1.0 + ease * 1.7;
        }
        if (rightG) {
            rightG.position.x = 1.15 + ease * (0.75 - 1.15);
            rightG.scale.x = 1.0 + ease * 1.7;
        }

        if (p >= 1) {
            clearInterval(civ);
            gameState.curtainsClosed = true;
            if (gameState.curtainsMesh && gameState.curtainsMesh.userData) {
                gameState.curtainsMesh.userData.name = 'Шторы (занавешены)';
            }
            if (typeof winLight !== 'undefined' && winLight) {
                winLight.intensity = 0.2;
            }
            if (onDone) onDone();
        }
    }, 25);
}

function lockDoorAnimation(onDone) {
    if (gameState.doorLocked8) {
        if (onDone) onDone();
        return;
    }
    playDoorLockSound();
    var bolt = gameState.doorBoltMesh;
    var startT = Date.now();
    var duration = 220;

    var liv = setInterval(function() {
        var elapsed = Date.now() - startT;
        var p = Math.min(1, elapsed / duration);
        if (bolt) {
            bolt.position.x = -1.04 - p * 0.10;
        }
        if (p >= 1) {
            clearInterval(liv);
            gameState.doorLocked8 = true;
            if (onDone) onDone();
        }
    }, 25);
}

function triggerZombieApocalypseEnding() {
    controls.unlock();
    blocker.style.display = 'flex';
    blocker.style.backgroundColor = 'rgba(10, 15, 25, 0.96)';

    var itemsSummary = gameState.cart.map(function(item) {
        return item.name + ' (' + item.price + ' ₽)';
    }).join(', ');
    if (!itemsSummary) {
        itemsSummary = 'Молоко «Домик в деревне», Сыр «Российский», Сосиски «Вязанка», Масло 82.5%, Пельмени «Сибирские», Сок «Добрый»';
    }

    instructions.innerHTML =
        '<span style="font-size:30px;color:#ef4444;letter-spacing:4px;font-weight:bold;">ЗОМБИ-АПОКАЛИПСИС: ДЕНЬ 2</span>' +
        '<br><span style="font-size:17px;color:#f59e0b;font-weight:bold;letter-spacing:2px;">КОНЦОВКА ВЫЖИВАНИЯ</span>' +
        '<br><br><div style="font-size:15px;color:#e2e8f0;line-height:1.7;max-width:660px;margin:0 auto;text-align:center;">' +
        'Теперь всё встало на свои места...<br>' +
        'Жуткие ночные тени за окном, вымершие улицы города, внезапное увольнение шефом («не спрашивайте почему»)...<br>' +
        'Это была не просто пятница 13-го — <b>это начало настоящего зомби-апокалипсиса!</b><br><br>' +
        '<div style="background:rgba(220, 38, 38, 0.18);border:1px solid #ef4444;border-radius:8px;padding:14px;margin:10px auto;max-width:580px;text-align:left;">' +
        '<b style="color:#f87171;">Экстренное сообщение Гражданской Обороны:</b><br>' +
        '<span style="color:#fef08a;font-size:14px;display:block;margin-top:4px;">' +
        '«Сегодня второй день как зомби апокалипсис. Не выходите из дома и будьте осторожны. А также не впускайте в дом странных людей!»' +
        '</span><br>' +
        '<div style="margin-top:6px;font-size:13px;color:#cbd5e1;border-top:1px solid rgba(255,255,255,0.15);padding-top:6px;">' +
        'В вашем холодильнике запас еды: <b>' + itemsSummary + '</b><br>' +
        'Дверь квартиры 13 заперта на замок, шторы занавешены, а на карте ещё: <b style="color:#4ade80;">' + gameState.money + ' ₽</b>.' +
        '</div>' +
        '</div><br>' +
        'За окном раздаётся вой сирен, но ваша квартира готова к долгой осаде.<br>' +
        '<b>Вы выжили в первые дни катастрофы!</b>' +
        '</div>' +
        '<br><div style="margin-top:12px;">' +
        '<button id="btn-continue-survival" style="padding:12px 26px;background:#16a34a;color:#ffffff;border:none;border-radius:6px;font-family:inherit;font-size:15px;font-weight:bold;cursor:pointer;letter-spacing:1px;box-shadow:0 0 15px rgba(22,163,74,0.4);transition:background 0.2s;">▶ ВЕРНУТЬСЯ В КВАРТИРУ (ПРОДОЛЖИТЬ)</button>' +
        '</div>' +
        '<br><span class="small-text" style="color:#94a3b8;">или нажмите F5 для перезапуска игры</span>';

    var btn = document.getElementById('btn-continue-survival');
    if (btn) {
        btn.onclick = function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            blocker.style.display = 'none';
            uiLayer.style.display = 'block';
            gameState.chapter = 8;
            controls.lock();
            thoughtBubble.style.opacity = 0;
            setObjective('Оставайся дома и выживай (Кровать: спать 5 сек)');
        };
    }
}

function buildUnpackApartment() {
    buildApartment(true);

    // Morning / daytime atmosphere
    scene.background = new THREE.Color(0xddeeff);
    scene.fog = new THREE.Fog(0xddeeff, 2, 14);

    var sun = new THREE.DirectionalLight(0xfffaed, 1.6);
    sun.position.set(0, 5, -10);
    sun.target.position.set(0, 0, 0);
    scene.add(sun);
    scene.add(sun.target);

    scene.add(new THREE.AmbientLight(0xfffaea, 0.9));
    if (roomLight) roomLight.intensity = 0.5;

    // Queue of items to unpack
    var items = [];
    if (gameState.cart && gameState.cart.length > 0) {
        for (var ci = 0; ci < gameState.cart.length; ci++) {
            items.push(gameState.cart[ci]);
        }
    }
    var defaultHaul = [
        { name: 'Молоко «Домик в деревне»', price: 69, texKey: 'milk', itemKind: 'carton' },
        { name: 'Сыр «Российский»', price: 149, texKey: 'cheese', itemKind: 'box' },
        { name: 'Сосиски «Вязанка»', price: 145, texKey: 'sausage', itemKind: 'sausage' },
        { name: 'Сливочное масло 82.5%', price: 119, texKey: 'butter', itemKind: 'box' },
        { name: 'Пельмени «Сибирские»', price: 175, texKey: 'pelmeni', itemKind: 'box' },
        { name: 'Сок «Добрый» Яблоко', price: 74, texKey: 'juiceApple', itemKind: 'carton' },
        { name: 'Свежие яблоки', price: 50, texKey: 'apple', itemKind: 'fruit' },
        { name: 'Баночка Cola', price: 49, texKey: 'cola', itemKind: 'soda' }
    ];
    while (items.length < 6) {
        items.push(defaultHaul[items.length % defaultHaul.length]);
    }
    gameState.unpackQueue = items.slice(0, 10);
    gameState.unpackedCount = 0;
    gameState.fridgeOpen = false;

    // Supermarket grocery bag on the kitchen table
    var bagGroup = new THREE.Group();
    bagGroup.position.set(-2.5, 0.875, 0.70);
    scene.add(bagGroup);

    var bagTex = createProceduralTexture(256, 256, function(cx, w, h) {
        cx.fillStyle = '#f8fafc';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#059669';
        cx.fillRect(w * 0.08, h * 0.32, w * 0.84, h * 0.36);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 22px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ПРОДУКТЫ 24', w * 0.5, h * 0.48);
        cx.font = 'bold 12px sans-serif';
        cx.fillText('СПАСИБО ЗА ПОКУПКУ!', w * 0.5, h * 0.58);
        cx.strokeStyle = '#cbd5e1';
        cx.lineWidth = 2.5;
        for (var i = 0; i < 5; i++) {
            var lx = w * 0.15 + i * 36;
            cx.beginPath();
            cx.moveTo(lx, 10);
            cx.lineTo(lx + 8, h - 10);
            cx.stroke();
        }
    });

    var bagMat = new THREE.MeshLambertMaterial({ map: bagTex });
    var bagMesh = addMesh(new THREE.BoxGeometry(0.44, 0.46, 0.3), bagMat, 0, 0.23, 0, bagGroup);

    var handleMat = makeMat(0xffffff);
    var h1 = addMesh(new THREE.TorusGeometry(0.09, 0.015, 6, 12, Math.PI), handleMat, 0, 0.46, 0.1, bagGroup);
    h1.rotation.x = -Math.PI;
    var h2 = addMesh(new THREE.TorusGeometry(0.09, 0.015, 6, 12, Math.PI), handleMat, 0, 0.46, -0.1, bagGroup);
    h2.rotation.x = -Math.PI;

    var loafMesh = addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 8), makeMat(0xd97706), -0.1, 0.38, 0.05, bagGroup);
    loafMesh.rotation.z = Math.PI / 5;
    loafMesh.rotation.x = Math.PI / 8;

    var greenBottle = addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8), makeMat(0x16a34a), 0.1, 0.32, -0.05, bagGroup);
    greenBottle.rotation.z = -Math.PI / 10;

    var applePeek = addMesh(new THREE.SphereGeometry(0.045, 8, 8), makeMat(0xdc2626), 0.04, 0.26, 0.08, bagGroup);

    bagMesh.userData = {
        name: 'Пакет с покупками [ЛКМ: достать ' + gameState.unpackQueue[0].name + ']',
        type: 'grocery_bag',
        bagGroup: bagGroup
    };
    interactables.push(bagMesh);
    gameState.groceryBagMesh = bagMesh;
    gameState.groceryBagGroup = bagGroup;
    gameState.groceryBagPeeks = [loafMesh, greenBottle, applePeek];

    // Fridge setup for Chapter 8
    if (gameState.apartmentFridgeGroup) {
        var fLight = new THREE.PointLight(0xfffaea, 1.2, 2.8);
        fLight.position.set(0, 1.2, 0);
        gameState.apartmentFridgeGroup.add(fLight);

        var shelfHitbox = addMesh(new THREE.BoxGeometry(0.85, 1.8, 0.7), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.1, 0, gameState.apartmentFridgeGroup);
        shelfHitbox.userData = {
            name: 'Полка холодильника [ЛКМ: положить ' + gameState.unpackQueue[0].name + ']',
            type: 'fridge_shelf'
        };
        interactables.push(shelfHitbox);
        gameState.fridgeShelfHitbox = shelfHitbox;
    }
    if (gameState.apartmentFridgeDoor) {
        gameState.apartmentFridgeDoor.userData.name = 'Открыть холодильник';
    }
    if (gameState.apartmentPhoneMesh) {
        gameState.apartmentPhoneMesh.userData.name = 'Телефон';
    }
    if (gameState.tvScreenMesh) {
        gameState.tvScreenMesh.userData.name = 'Телевизор';
    }
}

// ==================== PROCEDURAL SHOP TEXTURES ====================
var shopTexturesCache = null;

function getShopTextures() {
    if (shopTexturesCache) return shopTexturesCache;

    function createTex(w, h, renderFn) {
        return createProceduralTexture(w, h, renderFn);
    }

    var texs = {};

    // 1. Bread / Bakery
    texs.bread = createTex(256, 128, function(cx, w, h) {
        var grad = cx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#78350f');
        grad.addColorStop(0.3, '#d97706');
        grad.addColorStop(0.7, '#f59e0b');
        grad.addColorStop(1, '#b45309');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = 'rgba(255, 248, 220, 0.45)';
        cx.fillRect(0, h * 0.1, w, h * 0.35);
        cx.strokeStyle = '#451a03';
        cx.lineWidth = 6;
        for (var i = 0; i < 4; i++) {
            var sx = w * 0.2 + i * (w * 0.18);
            cx.beginPath();
            cx.moveTo(sx - 15, h * 0.2);
            cx.lineTo(sx + 15, h * 0.75);
            cx.stroke();
        }
        cx.fillStyle = '#ffffff';
        cx.fillRect(w * 0.35, h * 0.72, w * 0.3, h * 0.22);
        cx.fillStyle = '#b91c1c';
        cx.font = 'bold 12px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('БАТОН 32 ₽', w * 0.5, h * 0.88);
    });

    texs.breadRye = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#3e2723';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#6d4c41';
        for (var i = 0; i < 40; i++) {
            cx.beginPath();
            cx.arc((i * 19) % w, (i * 29) % (h * 0.6), 2, 0, Math.PI * 2);
            cx.fill();
        }
        cx.fillStyle = '#fff8e1';
        cx.fillRect(w * 0.15, h * 0.3, w * 0.7, h * 0.4);
        cx.fillStyle = '#272727';
        cx.font = 'bold 13px serif';
        cx.textAlign = 'center';
        cx.fillText('БОРОДИНСКИЙ', w * 0.5, h * 0.55);
    });

    texs.baguette = createTex(256, 64, function(cx, w, h) {
        var grad = cx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#92400e');
        grad.addColorStop(0.5, '#f59e0b');
        grad.addColorStop(1, '#78350f');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, w, h);
        cx.strokeStyle = '#451a03';
        cx.lineWidth = 4;
        for (var i = 0; i < 7; i++) {
            cx.beginPath();
            cx.moveTo(15 + i * 35, 5);
            cx.lineTo(35 + i * 35, h - 5);
            cx.stroke();
        }
    });

    // 2. Dairy & Milk
    texs.milk = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#ffffff';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#0284c7';
        cx.fillRect(0, 0, w, h * 0.35);
        cx.fillRect(0, h * 0.82, w, h * 0.18);
        cx.fillStyle = '#ffffff';
        for (var i = 0; i < 5; i++) {
            cx.fillRect(i * 55, h * 0.85, 25, h * 0.15);
        }
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 26px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('МОЛОКО', w * 0.5, h * 0.22);
        cx.fillStyle = '#e11d48';
        cx.font = 'bold 36px sans-serif';
        cx.fillText('3.2%', w * 0.5, h * 0.56);
        cx.fillStyle = '#334155';
        cx.font = 'bold 14px sans-serif';
        cx.fillText('ГОСТ 31449', w * 0.5, h * 0.7);
    });

    texs.kefir = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#ffffff';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#16a34a';
        cx.fillRect(0, 0, w, h * 0.35);
        cx.fillRect(0, h * 0.82, w, h * 0.18);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 28px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('КЕФИР', w * 0.5, h * 0.22);
        cx.fillStyle = '#15803d';
        cx.font = 'bold 36px sans-serif';
        cx.fillText('2.5%', w * 0.5, h * 0.56);
        cx.fillStyle = '#334155';
        cx.font = 'bold 13px sans-serif';
        cx.fillText('БИО-ЗАКВАСКА', w * 0.5, h * 0.7);
    });

    texs.ryazhenka = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#fffbeb';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#d97706';
        cx.fillRect(0, 0, w, h * 0.35);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 24px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('РЯЖЕНКА', w * 0.5, h * 0.22);
        cx.fillStyle = '#b45309';
        cx.font = 'bold 34px sans-serif';
        cx.fillText('4.0%', w * 0.5, h * 0.58);
    });

    texs.butter = createTex(256, 128, function(cx, w, h) {
        var grad = cx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#fde047');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(1, '#ca8a04');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#dc2626';
        cx.fillRect(w * 0.1, h * 0.18, w * 0.8, h * 0.64);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 16px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('МАСЛО СЛИВОЧНОЕ', w * 0.5, h * 0.45);
        cx.fillStyle = '#fef08a';
        cx.font = 'bold 22px sans-serif';
        cx.fillText('82.5% ГОСТ', w * 0.5, h * 0.72);
    });

    texs.sourCream = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#ffffff';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#2563eb';
        cx.fillRect(0, 0, w, h * 0.3);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 18px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('СМЕТАНА', w * 0.5, h * 0.22);
        cx.fillStyle = '#1d4ed8';
        cx.font = 'bold 28px sans-serif';
        cx.fillText('15%', w * 0.5, h * 0.7);
    });

    texs.curd = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#3e2723';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#eab308';
        cx.strokeRect(5, 5, w - 10, h - 10);
        cx.fillStyle = '#fde047';
        cx.font = 'bold 15px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('СЫРОК В ШОКОЛАДЕ', w * 0.5, h * 0.55);
    });

    texs.cheese = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#facc15';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#dc2626';
        cx.fillRect(w * 0.85, 0, w * 0.15, h);
        cx.fillStyle = '#ca8a04';
        var holes = [[40, 50, 18], [110, 80, 24], [60, 150, 22], [140, 180, 20], [80, 210, 15]];
        for (var i = 0; i < holes.length; i++) {
            cx.beginPath();
            cx.arc(holes[i][0], holes[i][1], holes[i][2], 0, Math.PI * 2);
            cx.fill();
        }
        cx.fillStyle = '#78350f';
        cx.font = 'bold 18px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('РОССИЙСКИЙ', w * 0.45, h * 0.5);
    });

    texs.eggs = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#d6d3d1';
        cx.fillRect(0, 0, w, h);
        cx.strokeStyle = '#a8a29e';
        cx.strokeRect(4, 4, w - 8, h - 8);
        cx.fillStyle = '#dc2626';
        cx.font = 'bold 22px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ЯЙЦО С0 • 10 ШТ', w * 0.5, h * 0.45);
        cx.fillStyle = '#1c1917';
        cx.font = 'bold 12px sans-serif';
        cx.fillText('ОТБОРНАЯ КАТЕГОРИЯ', w * 0.5, h * 0.75);
    });

    // 3. Meats & Sausages
    texs.sausage = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#e2e8f0';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#f87171';
        for (var i = 0; i < 5; i++) {
            cx.fillRect(15 + i * 46, 20, 38, h - 40);
        }
        cx.fillStyle = '#ffffff';
        cx.fillRect(w * 0.1, h * 0.35, w * 0.8, h * 0.3);
        cx.fillStyle = '#b91c1c';
        cx.font = 'bold 18px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('СОСИСКИ', w * 0.5, h * 0.48);
        cx.fillStyle = '#1e293b';
        cx.font = 'bold 14px sans-serif';
        cx.fillText('МОЛОЧНЫЕ ГОСТ', w * 0.5, h * 0.6);
    });

    texs.doctorSausage = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#fca5a5';
        cx.fillRect(0, 0, w, h);
        cx.strokeStyle = '#dc2626';
        cx.lineWidth = 3;
        for (var i = 0; i < 6; i++) {
            cx.beginPath();
            cx.moveTo(i * 45, 0);
            cx.lineTo(i * 45 + 30, h);
            cx.stroke();
        }
        cx.fillStyle = '#ffffff';
        cx.fillRect(w * 0.15, h * 0.25, w * 0.7, h * 0.5);
        cx.fillStyle = '#b91c1c';
        cx.font = 'bold 15px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ДОКТОРСКАЯ ГОСТ', w * 0.5, h * 0.58);
    });

    texs.salami = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#881337';
        cx.fillRect(0, 0, w, h);
        cx.strokeStyle = '#fde047';
        cx.lineWidth = 2;
        for (var i = 0; i < 8; i++) {
            cx.beginPath(); cx.moveTo(i * 35, 0); cx.lineTo(i * 35 + 40, h); cx.stroke();
            cx.beginPath(); cx.moveTo(i * 35 + 40, 0); cx.lineTo(i * 35, h); cx.stroke();
        }
        cx.fillStyle = '#fef08a';
        cx.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.4);
        cx.fillStyle = '#4c0519';
        cx.font = 'bold 14px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('СЕРВЕЛАТ', w * 0.5, h * 0.56);
    });

    texs.pelmeni = createTex(256, 256, function(cx, w, h) {
        var grad = cx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, '#0369a1');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        cx.font = '24px sans-serif';
        cx.fillText('❄ ❅ ❄', w * 0.5, h * 0.2);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 22px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ПЕЛЬМЕНИ', w * 0.5, h * 0.45);
        cx.fillStyle = '#fde047';
        cx.font = 'bold 20px sans-serif';
        cx.fillText('СИБИРСКИЕ', w * 0.5, h * 0.6);
        cx.fillStyle = '#e0f2fe';
        cx.font = '13px sans-serif';
        cx.fillText('ОТБОРНАЯ ГОВЯДИНА', w * 0.5, h * 0.76);
    });

    // 4. Canned goods
    texs.peas = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#15803d';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#86efac';
        for (var i = 0; i < 8; i++) {
            cx.beginPath();
            cx.arc(25 + i * 30, h * 0.75, 10, 0, Math.PI * 2);
            cx.fill();
        }
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 17px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ЗЕЛЕНЫЙ ГОРОШЕК', w * 0.5, h * 0.38);
    });

    texs.corn = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#eab308';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fef08a';
        for (var i = 0; i < 8; i++) {
            cx.beginPath();
            cx.arc(25 + i * 30, h * 0.75, 10, 0, Math.PI * 2);
            cx.fill();
        }
        cx.fillStyle = '#1c1917';
        cx.font = 'bold 18px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('КУКУРУЗА СЛАДКАЯ', w * 0.5, h * 0.38);
    });

    texs.stew = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#991b1b';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#f59e0b';
        cx.fillRect(0, h * 0.25, w, h * 0.5);
        cx.fillStyle = '#7f1d1d';
        cx.font = 'bold 18px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ТУШЕНКА ГОВЯДИНА', w * 0.5, h * 0.55);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 12px sans-serif';
        cx.fillText('ГОСТ ВЫСШИЙ СОРТ', w * 0.5, h * 0.88);
    });

    texs.condensed = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#1d4ed8';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#38bdf8';
        for (var i = 0; i < 6; i++) {
            cx.beginPath();
            cx.moveTo(i * 45, 0);
            cx.lineTo(i * 45 + 22, h * 0.5);
            cx.lineTo(i * 45, h);
            cx.fill();
        }
        cx.fillStyle = '#ffffff';
        cx.fillRect(w * 0.15, h * 0.3, w * 0.7, h * 0.4);
        cx.fillStyle = '#1e3a8a';
        cx.font = 'bold 17px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('СГУЩЕНКА ГОСТ', w * 0.5, h * 0.58);
    });

    texs.sprats = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#171717';
        cx.fillRect(0, 0, w, h);
        cx.strokeStyle = '#eab308';
        cx.strokeRect(6, 6, w - 12, h - 12);
        cx.fillStyle = '#fde047';
        cx.font = 'bold 16px serif';
        cx.textAlign = 'center';
        cx.fillText('ШПРОТЫ В МАСЛЕ', w * 0.5, h * 0.55);
    });

    // 5. Instant noodles, Pasta & Grains
    texs.doshirak = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#ea580c';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fde047';
        cx.fillRect(w * 0.05, h * 0.25, w * 0.9, h * 0.4);
        cx.fillStyle = '#b91c1c';
        cx.font = 'bold 36px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ДОШИРАК', w * 0.5, h * 0.52);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 20px sans-serif';
        cx.fillText('КУРИЦА ПИКАНТНАЯ', w * 0.5, h * 0.78);
    });

    texs.rollton = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#facc15';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#dc2626';
        cx.beginPath();
        cx.ellipse(w * 0.5, h * 0.45, w * 0.38, h * 0.3, 0, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 20px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('РОЛЛТОН', w * 0.5, h * 0.52);
    });

    texs.pasta = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#1e3a8a';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#dc2626';
        cx.fillRect(0, 0, w, h * 0.25);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 24px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('МАКФА', w * 0.5, h * 0.17);
        cx.fillStyle = '#fde047';
        cx.fillRect(w * 0.15, h * 0.35, w * 0.7, h * 0.4);
        cx.strokeStyle = '#ca8a04';
        cx.lineWidth = 3;
        for (var i = 0; i < 7; i++) {
            cx.beginPath();
            cx.moveTo(w * 0.2 + i * 24, h * 0.4);
            cx.lineTo(w * 0.2 + i * 24, h * 0.7);
            cx.stroke();
        }
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 16px sans-serif';
        cx.fillText('МАКАРОНЫ 450г', w * 0.5, h * 0.88);
    });

    texs.buckwheat = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#78350f';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fde047';
        cx.fillRect(w * 0.1, h * 0.4, w * 0.8, h * 0.4);
        cx.fillStyle = '#451a03';
        for (var i = 0; i < 40; i++) {
            cx.fillRect(w * 0.15 + (i * 17) % (w * 0.7), h * 0.42 + (i * 23) % (h * 0.35), 4, 4);
        }
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 24px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ГРЕЧКА 800г', w * 0.5, h * 0.25);
    });

    texs.sugar = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#f8fafc';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#0284c7';
        cx.fillRect(0, h * 0.2, w, h * 0.6);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 28px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('САХАР', w * 0.5, h * 0.48);
        cx.font = 'bold 18px sans-serif';
        cx.fillText('1 КИЛОГРАММ', w * 0.5, h * 0.65);
    });

    texs.flour = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#ede0d4';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#b45309';
        cx.fillRect(0, h * 0.25, w, h * 0.5);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 26px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('МУКА', w * 0.5, h * 0.52);
        cx.font = 'bold 16px sans-serif';
        cx.fillText('ВЫСШИЙ СОРТ 2КГ', w * 0.5, h * 0.68);
    });

    // 6. Sweets, Snacks, Chips
    texs.alenka = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#78350f';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fef3c7';
        cx.beginPath();
        cx.arc(w * 0.35, h * 0.5, 36, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#d97706';
        cx.beginPath();
        cx.arc(w * 0.35, h * 0.5, 25, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#1d4ed8';
        cx.font = 'italic bold 22px cursive, serif';
        cx.textAlign = 'center';
        cx.fillText('Алёнка', w * 0.72, h * 0.55);
    });

    texs.babaevsky = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#271712';
        cx.fillRect(0, 0, w, h);
        cx.strokeStyle = '#eab308';
        cx.strokeRect(6, 6, w - 12, h - 12);
        cx.fillStyle = '#fde047';
        cx.font = 'bold 15px serif';
        cx.textAlign = 'center';
        cx.fillText('БАБАЕВСКИЙ 75%', w * 0.5, h * 0.55);
    });

    texs.pringles = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#dc2626';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fde047';
        cx.beginPath();
        cx.arc(w * 0.5, h * 0.28, 30, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#451a03';
        cx.fillRect(w * 0.35, h * 0.32, w * 0.3, 10);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 26px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('PRINGLES', w * 0.5, h * 0.6);
        cx.font = 'bold 16px sans-serif';
        cx.fillText('ORIGINAL', w * 0.5, h * 0.75);
    });

    texs.chipsLays = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#eab308';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#dc2626';
        cx.beginPath();
        cx.arc(w * 0.5, h * 0.42, 45, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 28px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('Lay\'s', w * 0.5, h * 0.48);
        cx.fillStyle = '#15803d';
        cx.font = 'bold 18px sans-serif';
        cx.fillText('С ЗЕЛЕНЬЮ', w * 0.5, h * 0.75);
    });

    texs.tea = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#14532d';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fde047';
        cx.font = 'bold 17px serif';
        cx.textAlign = 'center';
        cx.fillText('GREENFIELD', w * 0.5, h * 0.45);
        cx.fillStyle = '#ffffff';
        cx.font = '12px sans-serif';
        cx.fillText('ЧАЙ ЧЁРНЫЙ 25 ПАК.', w * 0.5, h * 0.75);
    });

    texs.coffee = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#451a03';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#dc2626';
        cx.fillRect(0, h * 0.25, w, h * 0.5);
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 18px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('NESCAFE', w * 0.5, h * 0.55);
    });

    // 7. Juices & Sodas
    texs.juiceApple = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#16a34a';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#dc2626';
        cx.beginPath();
        cx.arc(w * 0.5, h * 0.65, 38, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 28px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ДОБРЫЙ', w * 0.5, h * 0.28);
        cx.font = 'bold 20px sans-serif';
        cx.fillText('ЯБЛОКО 1Л', w * 0.5, h * 0.42);
    });

    texs.juiceOrange = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#ea580c';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fde047';
        cx.beginPath();
        cx.arc(w * 0.5, h * 0.65, 38, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#ffffff';
        cx.font = 'bold 28px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ДОБРЫЙ', w * 0.5, h * 0.28);
        cx.font = 'bold 20px sans-serif';
        cx.fillText('АПЕЛЬСИН 1Л', w * 0.5, h * 0.42);
    });

    texs.cola = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#b91c1c';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#ffffff';
        cx.beginPath();
        cx.ellipse(w * 0.5, h * 0.7, w * 0.45, 12, 0, 0, Math.PI * 2);
        cx.fill();
        cx.font = 'bold 28px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('COLA', w * 0.5, h * 0.48);
    });

    texs.sprite = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#15803d';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fde047';
        cx.font = 'bold 26px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('SPRITE', w * 0.5, h * 0.55);
    });

    texs.mayo = createTex(256, 256, function(cx, w, h) {
        cx.fillStyle = '#1d4ed8';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fde047';
        cx.fillRect(0, h * 0.2, w, h * 0.6);
        cx.fillStyle = '#1e3a8a';
        cx.font = 'bold 20px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ПРОВАНСАЛЬ', w * 0.5, h * 0.45);
        cx.fillStyle = '#b91c1c';
        cx.font = 'bold 26px sans-serif';
        cx.fillText('67%', w * 0.5, h * 0.65);
    });

    texs.oil = createTex(256, 128, function(cx, w, h) {
        cx.fillStyle = '#ca8a04';
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#fef08a';
        cx.beginPath();
        cx.arc(w * 0.5, h * 0.5, 25, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = '#713f12';
        cx.font = 'bold 16px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('МАСЛО ОЛЕЙНА', w * 0.5, h * 0.55);
    });

    // 8. Fresh Fruits & Produce
    texs.apple = createTex(128, 128, function(cx, w, h) {
        var grad = cx.createRadialGradient(w * 0.35, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.5);
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(0.6, '#dc2626');
        grad.addColorStop(1, '#991b1b');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#facc15';
        for (var i = 0; i < 25; i++) {
            cx.fillRect((i * 23) % w, (i * 37) % h, 2, 2);
        }
    });

    texs.orange = createTex(128, 128, function(cx, w, h) {
        var grad = cx.createRadialGradient(w * 0.35, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.5);
        grad.addColorStop(0, '#fdba74');
        grad.addColorStop(0.7, '#ea580c');
        grad.addColorStop(1, '#c2410c');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, w, h);
        cx.fillStyle = '#9a3412';
        for (var i = 0; i < 40; i++) {
            cx.fillRect((i * 17) % w, (i * 29) % h, 2, 2);
        }
    });

    shopTexturesCache = texs;
    return texs;
}

// ==================== BUILD: SHOP ====================
function buildShop() {
    scene.background = new THREE.Color(0xf2f5f8);
    scene.fog = new THREE.Fog(0xf2f5f8, 6, 26);

    // Warm, bright store lighting
    var ambLight = new THREE.AmbientLight(0xfffaee, 0.95);
    scene.add(ambLight);

    var mainSun = new THREE.DirectionalLight(0xfffaea, 0.55);
    mainSun.position.set(0, 8, 2);
    scene.add(mainSun);

    // Ceiling fluorescent lights
    var lightPositions = [
        [-2.4, 3.2, -3.0], [2.4, 3.2, -3.0],
        [-2.4, 3.2, 0.5],  [2.4, 3.2, 0.5],
        [-2.4, 3.2, 4.0],  [2.4, 3.2, 4.0]
    ];
    var fixtureMat = makeMat(0xcccccc);
    var tubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (var li = 0; li < lightPositions.length; li++) {
        var lp = lightPositions[li];
        addMesh(new THREE.BoxGeometry(0.8, 0.08, 2.2), fixtureMat, lp[0], lp[1], lp[2]);
        addMesh(new THREE.BoxGeometry(0.6, 0.04, 2.0), tubeMat, lp[0], lp[1] - 0.04, lp[2]);
        var pl = new THREE.PointLight(0xfffbee, 0.4, 8);
        pl.position.set(lp[0], lp[1] - 0.2, lp[2]);
        scene.add(pl);
    }

    // Floor and Ceiling
    var floorMat = makeMat(0xdddfdf, { roughness: 0.3 });
    var floorGeo = new THREE.PlaneGeometry(10.2, 12.2);
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, 0);
    scene.add(floorMesh);

    // Entrance rubber mat
    addMesh(new THREE.BoxGeometry(2.6, 0.02, 1.6), makeMat(0x2c3e50), 0, 0.01, 5.0);

    // Ceiling
    var ceilMat = makeMat(0xfafafa);
    var ceilGeo = new THREE.PlaneGeometry(10.2, 12.2);
    var ceilMesh = new THREE.Mesh(ceilGeo, ceilMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(0, 3.3, 0);
    scene.add(ceilMesh);

    // Walls
    var wallMat = makeMat(0xeeeae2);
    var stripeMat = makeMat(0x27ae60);

    // North wall (back)
    addMesh(new THREE.BoxGeometry(10.2, 3.3, 0.2), wallMat, 0, 1.65, -6.1);
    addMesh(new THREE.BoxGeometry(10.2, 0.25, 0.22), stripeMat, 0, 2.5, -6.08);

    // Supermarket banner sign on back wall
    addMesh(new THREE.BoxGeometry(5.2, 0.65, 0.06), stripeMat, 0, 2.85, -5.98);
    addMesh(new THREE.BoxGeometry(5.0, 0.5, 0.08), makeMat(0xffffff), 0, 2.85, -5.97);

    // South wall (entrance/exit wall)
    addMesh(new THREE.BoxGeometry(3.9, 3.3, 0.2), wallMat, -3.15, 1.65, 6.1);
    addMesh(new THREE.BoxGeometry(3.9, 3.3, 0.2), wallMat, 3.15, 1.65, 6.1);
    addMesh(new THREE.BoxGeometry(2.4, 0.8, 0.2), wallMat, 0, 2.9, 6.1);
    addMesh(new THREE.BoxGeometry(10.2, 0.25, 0.22), stripeMat, 0, 2.5, 6.08);

    // West wall (left)
    addMesh(new THREE.BoxGeometry(0.2, 3.3, 12.2), wallMat, -5.1, 1.65, 0);
    addMesh(new THREE.BoxGeometry(0.22, 0.25, 12.2), stripeMat, -5.08, 2.5, 0);

    // East wall (right)
    addMesh(new THREE.BoxGeometry(0.2, 3.3, 12.2), wallMat, 5.1, 1.65, 0);
    addMesh(new THREE.BoxGeometry(0.22, 0.25, 12.2), stripeMat, 5.08, 2.5, 0);

    // Shelf helper function
    var shelfMat = makeMat(0xd8dcd6);
    var shelfPostMat = makeMat(0xaeb6bf);

    function createAisleGondola(gx, gzStart, gzEnd) {
        var gLen = gzEnd - gzStart;
        var gCenterZ = (gzStart + gzEnd) / 2;
        addMesh(new THREE.BoxGeometry(0.08, 1.7, gLen), shelfPostMat, gx, 0.85, gCenterZ);
        addMesh(new THREE.BoxGeometry(0.9, 0.16, gLen), shelfMat, gx, 0.08, gCenterZ);
        var shelfHeights = [0.52, 0.98, 1.45];
        for (var sh = 0; sh < shelfHeights.length; sh++) {
            var sy = shelfHeights[sh];
            addMesh(new THREE.BoxGeometry(0.42, 0.03, gLen), shelfMat, gx - 0.24, sy, gCenterZ);
            addMesh(new THREE.BoxGeometry(0.42, 0.03, gLen), shelfMat, gx + 0.24, sy, gCenterZ);
        }
        addMesh(new THREE.BoxGeometry(0.92, 1.7, 0.06), shelfPostMat, gx, 0.85, gzStart);
        addMesh(new THREE.BoxGeometry(0.92, 1.7, 0.06), shelfPostMat, gx, 0.85, gzEnd);

        colliders.push({
            minX: gx - 0.55,
            maxX: gx + 0.55,
            minZ: gzStart - 0.1,
            maxZ: gzEnd + 0.1
        });
    }

    // Two center aisles
    createAisleGondola(-1.6, -3.2, 1.2);
    createAisleGondola(1.6, -3.2, 1.2);

    // East wall shelf unit
    (function() {
        var ewLen = 5.2;
        var ewCenterZ = -1.0;
        addMesh(new THREE.BoxGeometry(0.06, 1.8, ewLen), shelfPostMat, 4.85, 0.9, ewCenterZ);
        var ewHeights = [0.52, 0.98, 1.45];
        for (var i = 0; i < ewHeights.length; i++) {
            addMesh(new THREE.BoxGeometry(0.45, 0.03, ewLen), shelfMat, 4.65, ewHeights[i], ewCenterZ);
        }
        colliders.push({ minX: 4.3, maxX: 5.0, minZ: -3.7, maxZ: 1.7 });
    })();

    // Back wall refrigerated cooler bank
    (function() {
        var refMat = makeMat(0x2c3e50);
        var glassDoorMat = new THREE.MeshLambertMaterial({ color: 0x90caf9, transparent: true, opacity: 0.35 });
        addMesh(new THREE.BoxGeometry(8.2, 2.2, 0.85), refMat, 0, 1.1, -5.55);
        addMesh(new THREE.BoxGeometry(8.0, 1.9, 0.65), makeMat(0xf0f3f4), 0, 1.1, -5.5);
        var coolLight = new THREE.PointLight(0xaed8f2, 0.6, 6);
        coolLight.position.set(0, 1.8, -5.2);
        scene.add(coolLight);
        addMesh(new THREE.BoxGeometry(7.9, 0.03, 0.5), makeMat(0xbdc3c7), 0, 0.65, -5.35);
        addMesh(new THREE.BoxGeometry(7.9, 0.03, 0.5), makeMat(0xbdc3c7), 0, 1.05, -5.35);
        addMesh(new THREE.BoxGeometry(7.9, 0.03, 0.5), makeMat(0xbdc3c7), 0, 1.45, -5.35);
        for (var d = 0; d < 4; d++) {
            var dx = -3.0 + d * 2.0;
            addMesh(new THREE.BoxGeometry(1.9, 1.9, 0.04), glassDoorMat, dx, 1.1, -5.1);
            addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), makeMat(0xd5dbdb), dx + 0.8, 1.1, -5.06);
        }
        colliders.push({ minX: -4.3, maxX: 4.3, minZ: -6.0, maxZ: -4.9 });
    })();

    // Produce table with fruit crates at entrance center (x: 0, z: 2.4)
    (function() {
        var woodMat = makeMat(0x8d5b4c);
        addMesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), woodMat, 0, 0.75, 2.4);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, -0.72, 0.375, 2.05);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, 0.72, 0.375, 2.05);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, -0.72, 0.375, 2.75);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, 0.72, 0.375, 2.75);
        addMesh(new THREE.BoxGeometry(0.74, 0.16, 0.74), makeMat(0xa16207), -0.4, 0.85, 2.4);
        addMesh(new THREE.BoxGeometry(0.74, 0.16, 0.74), makeMat(0xa16207), 0.4, 0.85, 2.4);
        colliders.push({ minX: -0.85, maxX: 0.85, minZ: 2.0, maxZ: 2.8 });
    })();

    // Cash Register and Checkout Area
    (function() {
        var deskMat = makeMat(0x34495e);
        var deskTopMat = makeMat(0xecf0f1);
        addMesh(new THREE.BoxGeometry(2.0, 0.9, 0.85), deskMat, -3.2, 0.45, 3.6);
        addMesh(new THREE.BoxGeometry(2.1, 0.05, 0.95), deskTopMat, -3.2, 0.925, 3.6);

        addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), makeMat(0xbdc3c7), -2.0, 0.45, 3.6);
        addMesh(new THREE.BoxGeometry(0.03, 0.03, 1.2), makeMat(0xbdc3c7), -2.0, 0.8, 4.2);

        var regMat = makeMat(0x222222);
        var screenMat = makeMat(0x27ae60);
        addMesh(new THREE.BoxGeometry(0.35, 0.08, 0.35), regMat, -3.4, 0.99, 3.55);
        var sc = addMesh(new THREE.BoxGeometry(0.3, 0.22, 0.03), screenMat, -3.4, 1.12, 3.66);
        sc.rotation.x = -0.2;
        addMesh(new THREE.CylinderGeometry(0.03, 0.02, 0.16, 6), regMat, -3.15, 1.02, 3.45);
        var pinpad = addMesh(new THREE.BoxGeometry(0.14, 0.06, 0.2), makeMat(0x333333), -2.8, 0.98, 3.35);
        pinpad.rotation.y = 0.2;

        var cashInteract = addMesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), makeMat(0x27ae60, { transparent: true, opacity: 0.0 }), -3.2, 1.15, 3.5);
        cashInteract.userData = { name: 'Касса (Оплатить покупки)', type: 'cash_register' };
        interactables.push(cashInteract);

        // Cashier NPC
        var apronMat = makeMat(0x27ae60);
        var skinMat = makeMat(0xf8c291);
        var cashierG = new THREE.Group();
        cashierG.position.set(-3.2, 0, 4.3);
        addMesh(new THREE.CylinderGeometry(0.24, 0.2, 1.1, 8), apronMat, 0, 0.85, 0, cashierG);
        addMesh(new THREE.SphereGeometry(0.15, 12, 12), skinMat, 0, 1.5, 0, cashierG);
        addMesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 12), apronMat, 0, 1.62, 0, cashierG);
        addMesh(new THREE.BoxGeometry(0.18, 0.02, 0.12), apronMat, 0, 1.6, -0.12, cashierG);
        addMesh(new THREE.BoxGeometry(0.08, 0.04, 0.01), makeMat(0xffffff), 0, 1.1, -0.21, cashierG);
        scene.add(cashierG);

        colliders.push({ minX: -4.3, maxX: -2.0, minZ: 3.1, maxZ: 4.8 });
    })();

    // Stack of Shopping Baskets near entrance
    (function() {
        var basketMat = makeMat(0xe74c3c);
        for (var b = 0; b < 4; b++) {
            addMesh(new THREE.BoxGeometry(0.42, 0.16, 0.32), basketMat, 1.8, 0.1 + b * 0.12, 4.8);
        }
        colliders.push({ minX: 1.5, maxX: 2.1, minZ: 4.5, maxZ: 5.1 });
    })();

    // Glass Entrance / Exit sliding doors
    var exitDoor = addMesh(new THREE.BoxGeometry(2.4, 2.5, 0.15), new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4 }), 0, 1.25, 5.9);
    exitDoor.userData = { name: 'Выход на улицу', type: 'shop_exit' };
    interactables.push(exitDoor);
    addMesh(new THREE.BoxGeometry(0.08, 2.5, 0.18), makeMat(0xd5dbdb), -1.16, 1.25, 5.9);
    addMesh(new THREE.BoxGeometry(0.08, 2.5, 0.18), makeMat(0xd5dbdb), 1.16, 1.25, 5.9);
    addMesh(new THREE.BoxGeometry(0.08, 2.5, 0.18), makeMat(0xd5dbdb), 0, 1.25, 5.9);

    // Snow falling outside the supermarket glass doors
    addSnow(5.95, 20, -12, 12, 0, 8.5, 1800, 0.075);

    // ==================== PROCEDURAL FOOD ITEM STOCKING ====================
    var tex = getShopTextures();
    var matCache = {};
    function getMat(key) {
        if (!matCache[key]) {
            matCache[key] = new THREE.MeshLambertMaterial({ map: tex[key] });
        }
        return matCache[key];
    }
    var metalCapMat = makeMat(0xd1d5db);

    function makeInteractive(targetMesh, name, price, group, texKey, itemKind) {
        targetMesh.userData = {
            name: name + ' (' + price + ' ₽)',
            type: 'shop_item',
            price: price,
            itemName: name,
            texKey: texKey || null,
            itemKind: itemKind || null,
            group: group || null
        };
        interactables.push(targetMesh);
    }

    function addBoxItem(name, price, texKey, w, h, d, x, y, z, canInteract) {
        var m = addMesh(new THREE.BoxGeometry(w, h, d), getMat(texKey), x, y + h * 0.5, z);
        if (canInteract) makeInteractive(m, name, price, null, texKey, 'box');
        return m;
    }

    function addCanItem(name, price, texKey, r, h, x, y, z, canInteract) {
        var grp = new THREE.Group();
        grp.position.set(x, y + h * 0.5, z);
        var body = addMesh(new THREE.CylinderGeometry(r, r, h, 14), getMat(texKey), 0, 0, 0, grp);
        addMesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.008, 14), metalCapMat, 0, h * 0.5, 0, grp);
        addMesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.008, 14), metalCapMat, 0, -h * 0.5, 0, grp);
        scene.add(grp);
        if (canInteract) makeInteractive(body, name, price, grp, texKey, 'can');
        return grp;
    }

    function addCartonItem(name, price, texKey, w, h, d, capHex, x, y, z, canInteract) {
        var grp = new THREE.Group();
        grp.position.set(x, y, z);
        var body = addMesh(new THREE.BoxGeometry(w, h * 0.86, d), getMat(texKey), 0, h * 0.43, 0, grp);
        addMesh(new THREE.BoxGeometry(w * 0.98, h * 0.14, d * 0.88), getMat(texKey), 0, h * 0.93, 0, grp);
        addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 8), makeMat(capHex), 0, h + 0.01, 0, grp);
        scene.add(grp);
        if (canInteract) makeInteractive(body, name, price, grp, texKey, 'carton');
        return grp;
    }

    function addBreadItem(name, price, texKey, r, len, x, y, z, rotZ, canInteract) {
        var m = addMesh(new THREE.CylinderGeometry(r, r, len, 10), getMat(texKey), x, y + r, z);
        m.rotation.z = rotZ || Math.PI / 2;
        if (canInteract) makeInteractive(m, name, price, null, texKey, 'bread');
        return m;
    }

    function addSodaItem(name, price, texKey, x, y, z, canInteract) {
        var grp = new THREE.Group();
        grp.position.set(x, y + 0.065, z);
        var body = addMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.13, 14), getMat(texKey), 0, 0, 0, grp);
        addMesh(new THREE.CylinderGeometry(0.044, 0.044, 0.008, 14), metalCapMat, 0, 0.065, 0, grp);
        addMesh(new THREE.CylinderGeometry(0.044, 0.044, 0.008, 14), metalCapMat, 0, -0.065, 0, grp);
        scene.add(grp);
        if (canInteract) makeInteractive(body, name, price, grp, texKey, 'soda');
        return grp;
    }

    function addFruitItem(name, price, texKey, r, x, y, z, canInteract) {
        var grp = new THREE.Group();
        grp.position.set(x, y + r, z);
        var fruit = addMesh(new THREE.SphereGeometry(r, 8, 8), getMat(texKey), 0, 0, 0, grp);
        addMesh(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 5), makeMat(0x451a03), 0, r + 0.008, 0, grp);
        scene.add(grp);
        if (canInteract) makeInteractive(fruit, name, price, grp, texKey, 'fruit');
        return grp;
    }

    function addSausageItem(name, price, texKey, x, y, z, canInteract) {
        var m = addMesh(new THREE.BoxGeometry(0.22, 0.06, 0.16), getMat(texKey), x, y + 0.03, z);
        if (canInteract) makeInteractive(m, name, price, null, texKey, 'sausage');
        return m;
    }

    // -------------------------------------------------------------
    // POPULATE: 1. FRESH PRODUCE TABLE (x: 0, z: 2.4, y: 0.85)
    // -------------------------------------------------------------
    for (var ax = 0; ax < 3; ax++) {
        for (var az = 0; az < 3; az++) {
            var isFront = (ax === 1 && az === 2);
            addFruitItem('Свежее яблоко', 25, 'apple', 0.046, -0.55 + ax * 0.12, 0.88, 2.25 + az * 0.12, isFront);
        }
    }
    for (var tax = 0; tax < 2; tax++) {
        for (var taz = 0; taz < 2; taz++) {
            addFruitItem('Свежее яблоко', 25, 'apple', 0.046, -0.49 + tax * 0.12, 0.94, 2.31 + taz * 0.12, false);
        }
    }
    for (var ox = 0; ox < 3; ox++) {
        for (var oz = 0; oz < 3; oz++) {
            var isOFront = (ox === 1 && oz === 2);
            addFruitItem('Сочный апельсин', 35, 'orange', 0.05, 0.25 + ox * 0.13, 0.88, 2.25 + oz * 0.12, isOFront);
        }
    }
    for (var tox = 0; tox < 2; tox++) {
        for (var toz = 0; toz < 2; toz++) {
            addFruitItem('Сочный апельсин', 35, 'orange', 0.05, 0.31 + tox * 0.13, 0.95, 2.31 + toz * 0.12, false);
        }
    }

    // -------------------------------------------------------------
    // POPULATE: 2. GONDOLA 1 - LEFT SIDE (x: -1.84, facing Cashier/West)
    // -------------------------------------------------------------
    var g1L_z = -2.8;
    for (var i = 0; i < 4; i++) {
        addBreadItem('Свежий батон', 32, 'bread', 0.07, 0.28, -1.84, 1.45, g1L_z + i * 0.16, Math.PI / 2, i === 1);
        addBreadItem('Свежий батон', 32, 'bread', 0.07, 0.28, -1.98, 1.45, g1L_z + i * 0.16, Math.PI / 2, false);
    }
    for (var i = 0; i < 4; i++) {
        addBreadItem('Французский багет', 38, 'baguette', 0.042, 0.42, -1.84, 1.45, g1L_z + 0.75 + i * 0.12, Math.PI / 2, i === 0);
    }
    for (var i = 0; i < 4; i++) {
        addBoxItem('Хлеб «Бородинский»', 36, 'breadRye', 0.14, 0.11, 0.18, -1.84, 1.45, g1L_z + 1.35 + i * 0.18, i === 1);
        addBoxItem('Хлеб «Бородинский»', 36, 'breadRye', 0.14, 0.11, 0.18, -1.98, 1.45, g1L_z + 1.35 + i * 0.18, false);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Печенье «Юбилейное»', 44, 'alenka', 0.16, 0.06, 0.12, -1.84, 1.45, g1L_z + 2.2 + i * 0.15, i === 0);
    }

    for (var i = 0; i < 5; i++) {
        addBoxItem('Чай «Greenfield» 25 пак.', 65, 'tea', 0.16, 0.1, 0.11, -1.84, 0.98, g1L_z + i * 0.18, i === 1);
        addBoxItem('Чай «Greenfield» 25 пак.', 65, 'tea', 0.16, 0.1, 0.11, -1.98, 0.98, g1L_z + i * 0.18, false);
    }
    for (var i = 0; i < 4; i++) {
        addCanItem('Банка кофе Nescafe', 159, 'coffee', 0.055, 0.14, -1.84, 0.98, g1L_z + 1.0 + i * 0.14, i === 1);
        addCanItem('Банка кофе Nescafe', 159, 'coffee', 0.055, 0.14, -1.98, 0.98, g1L_z + 1.0 + i * 0.14, false);
    }
    for (var i = 0; i < 8; i++) {
        addBoxItem('Шоколадка «Алёнка»', 48, 'alenka', 0.16, 0.025, 0.09, -1.84, 0.98, g1L_z + 1.75 + i * 0.11, i === 2);
    }
    for (var i = 0; i < 6; i++) {
        addBoxItem('Шоколад «Бабаевский»', 68, 'babaevsky', 0.16, 0.025, 0.09, -1.84, 0.98, g1L_z + 2.7 + i * 0.11, i === 1);
    }

    for (var i = 0; i < 5; i++) {
        addBoxItem('Мука пшеничная 2кг', 82, 'flour', 0.15, 0.26, 0.12, -1.84, 0.52, g1L_z + i * 0.18, i === 1);
        addBoxItem('Мука пшеничная 2кг', 82, 'flour', 0.15, 0.26, 0.12, -1.98, 0.52, g1L_z + i * 0.18, false);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Сахар-песок 1кг', 65, 'sugar', 0.13, 0.22, 0.11, -1.84, 0.52, g1L_z + 1.05 + i * 0.16, i === 1);
        addBoxItem('Сахар-песок 1кг', 65, 'sugar', 0.13, 0.22, 0.11, -1.98, 0.52, g1L_z + 1.05 + i * 0.16, false);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Подсолнечное масло 1л', 89, 'oil', 0.05, 0.24, -1.84, 0.52, g1L_z + 2.0 + i * 0.13, i === 1);
        addCanItem('Подсолнечное масло 1л', 89, 'oil', 0.05, 0.24, -1.98, 0.52, g1L_z + 2.0 + i * 0.13, false);
    }

    // -------------------------------------------------------------
    // POPULATE: 3. GONDOLA 1 - RIGHT SIDE (x: -1.36, facing Center Aisle)
    // -------------------------------------------------------------
    var g1R_z = -2.8;
    for (var i = 0; i < 6; i++) {
        addBoxItem('Пачка макарон «Макфа»', 46, 'pasta', 0.13, 0.22, 0.08, -1.36, 1.45, g1R_z + i * 0.16, i === 2);
        addBoxItem('Пачка макарон «Макфа»', 46, 'pasta', 0.13, 0.22, 0.08, -1.22, 1.45, g1R_z + i * 0.16, false);
    }
    for (var i = 0; i < 6; i++) {
        addBoxItem('Гречневая крупа', 52, 'buckwheat', 0.14, 0.21, 0.09, -1.36, 1.45, g1R_z + 1.1 + i * 0.16, i === 1);
        addBoxItem('Гречневая крупа', 52, 'buckwheat', 0.14, 0.21, 0.09, -1.22, 1.45, g1R_z + 1.1 + i * 0.16, false);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Рис круглый 800г', 56, 'buckwheat', 0.14, 0.21, 0.09, -1.36, 1.45, g1R_z + 2.2 + i * 0.16, i === 1);
    }

    for (var i = 0; i < 6; i++) {
        addBoxItem('Лапша «Доширак»', 39, 'doshirak', 0.16, 0.09, 0.16, -1.36, 0.98, g1R_z + i * 0.18, i === 2);
        addBoxItem('Лапша «Доширак»', 39, 'doshirak', 0.16, 0.09, 0.16, -1.22, 0.98, g1R_z + i * 0.18, false);
    }
    for (var i = 0; i < 6; i++) {
        addBoxItem('Лапша «Роллтон»', 29, 'rollton', 0.14, 0.07, 0.14, -1.36, 0.98, g1R_z + 1.2 + i * 0.16, i === 1);
        addBoxItem('Лапша «Роллтон»', 29, 'rollton', 0.14, 0.07, 0.14, -1.22, 0.98, g1R_z + 1.2 + i * 0.16, false);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Майонез «Провансаль»', 55, 'mayo', 0.13, 0.18, 0.06, -1.36, 0.98, g1R_z + 2.3 + i * 0.15, i === 1);
    }

    for (var i = 0; i < 6; i++) {
        addBoxItem('Сахар-песок 1кг', 65, 'sugar', 0.13, 0.22, 0.11, -1.36, 0.52, g1R_z + i * 0.18, false);
        addBoxItem('Сахар-песок 1кг', 65, 'sugar', 0.13, 0.22, 0.11, -1.22, 0.52, g1R_z + i * 0.18, false);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Подсолнечное масло 1л', 89, 'oil', 0.05, 0.24, -1.36, 0.52, g1R_z + 1.2 + i * 0.14, false);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Мука пшеничная 2кг', 82, 'flour', 0.15, 0.26, 0.12, -1.36, 0.52, g1R_z + 2.2 + i * 0.18, false);
    }

    // -------------------------------------------------------------
    // POPULATE: 4. GONDOLA 2 - LEFT SIDE (x: 1.36, facing Center Aisle)
    // -------------------------------------------------------------
    var g2L_z = -2.8;
    for (var i = 0; i < 6; i++) {
        addCanItem('Зелёный горошек', 59, 'peas', 0.05, 0.12, 1.36, 1.45, g2L_z + i * 0.13, i === 2);
        addCanItem('Зелёный горошек', 59, 'peas', 0.05, 0.12, 1.22, 1.45, g2L_z + i * 0.13, false);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Кукуруза сладкая', 64, 'corn', 0.05, 0.12, 1.36, 1.45, g2L_z + 0.9 + i * 0.13, i === 2);
        addCanItem('Кукуруза сладкая', 64, 'corn', 0.05, 0.12, 1.22, 1.45, g2L_z + 0.9 + i * 0.13, false);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Сгущённое молоко ГОСТ', 79, 'condensed', 0.05, 0.11, 1.36, 1.45, g2L_z + 1.8 + i * 0.13, i === 1);
        addCanItem('Сгущённое молоко ГОСТ', 79, 'condensed', 0.05, 0.11, 1.22, 1.45, g2L_z + 1.8 + i * 0.13, false);
    }
    for (var i = 0; i < 5; i++) {
        addCanItem('Шпроты в масле', 98, 'sprats', 0.065, 0.05, 1.36, 1.45, g2L_z + 2.7 + i * 0.15, i === 1);
    }

    for (var i = 0; i < 6; i++) {
        addCanItem('Тушёнка говяжья ГОСТ', 149, 'stew', 0.054, 0.12, 1.36, 0.98, g2L_z + i * 0.14, i === 2);
        addCanItem('Тушёнка говяжья ГОСТ', 149, 'stew', 0.054, 0.12, 1.22, 0.98, g2L_z + i * 0.14, false);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Сгущённое молоко ГОСТ', 79, 'condensed', 0.05, 0.11, 1.36, 0.98, g2L_z + 1.0 + i * 0.13, false);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Шпроты в масле', 98, 'sprats', 0.065, 0.05, 1.36, 0.98, g2L_z + 1.9 + i * 0.15, false);
    }

    for (var i = 0; i < 6; i++) {
        addCanItem('Зелёный горошек', 59, 'peas', 0.05, 0.12, 1.36, 0.52, g2L_z + i * 0.13, false);
        addCanItem('Кукуруза сладкая', 64, 'corn', 0.05, 0.12, 1.36, 0.52, g2L_z + 0.9 + i * 0.13, false);
        addCanItem('Тушёнка говяжья ГОСТ', 149, 'stew', 0.054, 0.12, 1.36, 0.52, g2L_z + 1.8 + i * 0.14, false);
    }

    // -------------------------------------------------------------
    // POPULATE: 5. GONDOLA 2 - RIGHT SIDE (x: 1.84, facing East Wall)
    // -------------------------------------------------------------
    var g2R_z = -2.8;
    for (var i = 0; i < 6; i++) {
        addCanItem('Чипсы Pringles', 135, 'pringles', 0.048, 0.22, 1.84, 1.45, g2R_z + i * 0.14, i === 1);
        addCanItem('Чипсы Pringles', 135, 'pringles', 0.048, 0.22, 1.98, 1.45, g2R_z + i * 0.14, false);
    }
    for (var i = 0; i < 6; i++) {
        addBoxItem('Чипсы Lay\'s', 85, 'chipsLays', 0.15, 0.22, 0.08, 1.84, 1.45, g2R_z + 1.0 + i * 0.16, i === 2);
        addBoxItem('Чипсы Lay\'s', 85, 'chipsLays', 0.15, 0.22, 0.08, 1.98, 1.45, g2R_z + 1.0 + i * 0.16, false);
    }
    for (var i = 0; i < 8; i++) {
        addBoxItem('Шоколадка «Алёнка»', 48, 'alenka', 0.16, 0.025, 0.09, 1.84, 1.45, g2R_z + 2.1 + i * 0.11, false);
    }

    for (var i = 0; i < 8; i++) {
        addBoxItem('Шоколад «Бабаевский»', 68, 'babaevsky', 0.16, 0.025, 0.09, 1.84, 0.98, g2R_z + i * 0.11, false);
    }
    for (var i = 0; i < 6; i++) {
        addBoxItem('Чипсы Lay\'s', 85, 'chipsLays', 0.15, 0.22, 0.08, 1.84, 0.98, g2R_z + 1.1 + i * 0.16, false);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Чипсы Pringles', 135, 'pringles', 0.048, 0.22, 1.84, 0.98, g2R_z + 2.2 + i * 0.14, false);
    }

    for (var i = 0; i < 5; i++) {
        addBoxItem('Чипсы Lay\'s', 85, 'chipsLays', 0.16, 0.24, 0.1, 1.84, 0.52, g2R_z + i * 0.2, false);
        addBoxItem('Чипсы Lay\'s', 85, 'chipsLays', 0.16, 0.24, 0.1, 1.84, 0.52, g2R_z + 1.2 + i * 0.2, false);
    }

    // -------------------------------------------------------------
    // POPULATE: 6. EAST WALL SHELF (x: 4.65, facing West)
    // -------------------------------------------------------------
    var ew_z = -3.2;
    for (var i = 0; i < 8; i++) {
        addBoxItem('Чай «Greenfield» 25 пак.', 65, 'tea', 0.16, 0.1, 0.11, 4.65, 1.45, ew_z + i * 0.17, i === 2);
    }
    for (var i = 0; i < 6; i++) {
        addCanItem('Банка кофе Nescafe', 159, 'coffee', 0.055, 0.14, 4.65, 1.45, ew_z + 1.5 + i * 0.15, i === 2);
    }
    for (var i = 0; i < 8; i++) {
        addBoxItem('Шоколадка «Алёнка»', 48, 'alenka', 0.16, 0.025, 0.09, 4.65, 1.45, ew_z + 2.5 + i * 0.12, false);
    }

    for (var i = 0; i < 8; i++) {
        addBoxItem('Шоколад «Бабаевский»', 68, 'babaevsky', 0.16, 0.025, 0.09, 4.65, 0.98, ew_z + i * 0.12, false);
    }
    for (var i = 0; i < 8; i++) {
        addSodaItem('Баночка Cola', 49, 'cola', 4.65, 0.98, ew_z + 1.2 + i * 0.11, i === 2);
    }
    for (var i = 0; i < 8; i++) {
        addSodaItem('Баночка Sprite', 49, 'sprite', 4.65, 0.98, ew_z + 2.2 + i * 0.11, i === 2);
    }

    for (var i = 0; i < 6; i++) {
        addCartonItem('Сок «Добрый» Яблоко', 74, 'juiceApple', 0.12, 0.26, 0.11, 0xffffff, 4.65, 0.52, ew_z + i * 0.16, false);
    }
    for (var i = 0; i < 6; i++) {
        addCartonItem('Сок «Добрый» Апельсин', 78, 'juiceOrange', 0.12, 0.26, 0.11, 0xffffff, 4.65, 0.52, ew_z + 1.1 + i * 0.16, false);
    }
    for (var i = 0; i < 8; i++) {
        addSodaItem('Баночка Cola', 49, 'cola', 4.65, 0.52, ew_z + 2.3 + i * 0.11, false);
    }

    // -------------------------------------------------------------
    // POPULATE: 7. NORTH REFRIGERATOR BANK (z: -5.35, 4 doors)
    // -------------------------------------------------------------
    // Section 1 (Dairy, x: -3.0):
    for (var i = 0; i < 5; i++) {
        addCartonItem('Молоко 3.2%', 58, 'milk', 0.12, 0.26, 0.12, 0x0284c7, -3.6 + i * 0.15, 1.45, -5.35, i === 2);
        addCartonItem('Молоко 3.2%', 58, 'milk', 0.12, 0.26, 0.12, 0x0284c7, -3.6 + i * 0.15, 1.45, -5.48, false);
    }
    for (var i = 0; i < 4; i++) {
        addCartonItem('Кефир 2.5%', 54, 'kefir', 0.12, 0.26, 0.12, 0x16a34a, -2.7 + i * 0.15, 1.45, -5.35, i === 1);
    }
    for (var i = 0; i < 6; i++) {
        addBoxItem('Сливочное масло 82.5%', 86, 'butter', 0.15, 0.065, 0.09, -3.6 + i * 0.16, 1.05, -5.35, i === 2);
        addBoxItem('Сливочное масло 82.5%', 86, 'butter', 0.15, 0.065, 0.09, -3.6 + i * 0.16, 1.05, -5.46, false);
    }
    for (var i = 0; i < 4; i++) {
        addCanItem('Сметана 15%', 62, 'sourCream', 0.065, 0.09, -2.5 + i * 0.16, 1.05, -5.35, i === 1);
    }
    for (var i = 0; i < 8; i++) {
        addBoxItem('Глазированный сырок', 35, 'curd', 0.11, 0.035, 0.06, -3.6 + i * 0.12, 0.65, -5.35, i === 2);
    }
    for (var i = 0; i < 4; i++) {
        addCartonItem('Ряженка 4.0%', 52, 'ryazhenka', 0.12, 0.24, 0.12, 0xd97706, -2.5 + i * 0.15, 0.65, -5.35, i === 1);
    }

    // Section 2 (Meats & Sausages, x: -1.0):
    for (var i = 0; i < 5; i++) {
        addSausageItem('Сосиски молочные', 145, 'sausage', -1.7 + i * 0.24, 1.45, -5.35, i === 1);
        addSausageItem('Сосиски молочные', 145, 'sausage', -1.7 + i * 0.24, 1.45, -5.48, false);
    }
    for (var i = 0; i < 4; i++) {
        addBreadItem('Колбаса «Докторская»', 165, 'doctorSausage', 0.065, 0.32, -1.6 + i * 0.34, 1.05, -5.35, Math.PI / 2, i === 1);
    }
    for (var i = 0; i < 5; i++) {
        addBreadItem('Сервелат варёно-копчёный', 179, 'salami', 0.045, 0.28, -1.6 + i * 0.26, 0.65, -5.35, Math.PI / 2, i === 2);
    }

    // Section 3 (Cheese & Eggs, x: 1.0):
    for (var i = 0; i < 5; i++) {
        addBoxItem('Десяток яиц С0', 89, 'eggs', 0.26, 0.08, 0.14, 0.3 + i * 0.28, 1.45, -5.35, i === 2);
        addBoxItem('Десяток яиц С0', 89, 'eggs', 0.26, 0.08, 0.14, 0.3 + i * 0.28, 1.45, -5.48, false);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Сыр «Российский»', 119, 'cheese', 0.18, 0.09, 0.14, 0.3 + i * 0.24, 1.05, -5.35, i === 2);
        addBoxItem('Сыр «Российский»', 119, 'cheese', 0.18, 0.09, 0.14, 0.3 + i * 0.24, 1.05, -5.46, false);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Сыр «Российский»', 119, 'cheese', 0.18, 0.09, 0.14, 0.3 + i * 0.24, 0.65, -5.35, false);
    }

    // Section 4 (Juices, Sodas & Pelmeni, x: 3.0):
    for (var i = 0; i < 4; i++) {
        addCartonItem('Сок «Добрый» Яблоко', 74, 'juiceApple', 0.12, 0.26, 0.12, 0xffffff, 2.3 + i * 0.16, 1.45, -5.35, i === 1);
        addCartonItem('Сок «Добрый» Яблоко', 74, 'juiceApple', 0.12, 0.26, 0.12, 0xffffff, 2.3 + i * 0.16, 1.45, -5.48, false);
    }
    for (var i = 0; i < 4; i++) {
        addCartonItem('Сок «Добрый» Апельсин', 78, 'juiceOrange', 0.12, 0.26, 0.12, 0xffffff, 3.1 + i * 0.16, 1.45, -5.35, i === 1);
    }
    for (var i = 0; i < 6; i++) {
        addSodaItem('Баночка Cola', 49, 'cola', 2.3 + i * 0.12, 1.05, -5.35, i === 1);
        addSodaItem('Баночка Cola', 49, 'cola', 2.3 + i * 0.12, 1.05, -5.46, false);
    }
    for (var i = 0; i < 6; i++) {
        addSodaItem('Баночка Sprite', 49, 'sprite', 3.1 + i * 0.12, 1.05, -5.35, i === 1);
    }
    for (var i = 0; i < 5; i++) {
        addBoxItem('Пельмени «Сибирские»', 175, 'pelmeni', 0.22, 0.14, 0.16, 2.3 + i * 0.26, 0.65, -5.35, i === 1);
        addBoxItem('Пельмени «Сибирские»', 175, 'pelmeni', 0.22, 0.14, 0.16, 2.3 + i * 0.26, 0.65, -5.48, false);
    }
}

// ==================== BUILD: STREET ====================
function buildStreet(toWork) {
    var len = 50;
    scene.background = new THREE.Color(0x010105);
    scene.fog = new THREE.Fog(0x010105, 2, 18);

    // Load textures
    var tlStreet = new THREE.TextureLoader();
    var streetTex = tlStreet.load(STREET_B64);
    var streetMat = new THREE.MeshBasicMaterial({ map: streetTex });

    var stalkerTex = tlStreet.load(STALKER_FAR_B64);
    var stalkerMat = new THREE.MeshBasicMaterial({ map: stalkerTex });

    var snowGroundTex = tlStreet.load(SNOW_GROUND_B64);
    snowGroundTex.wrapS = THREE.RepeatWrapping;
    snowGroundTex.wrapT = THREE.RepeatWrapping;
    snowGroundTex.repeat.set(1, 16);
    var snowGroundMat = new THREE.MeshBasicMaterial({ map: snowGroundTex });

    // Ground with snow texture under night lighting
    var ground = addMesh(new THREE.PlaneGeometry(8, len), snowGroundMat, 0, 0, -len / 2);
    ground.rotation.x = -Math.PI / 2;

    // Night sky ceiling plane textured with NIGHT_SKY_B64 stars
    var skyTex = tlStreet.load(NIGHT_SKY_B64);
    skyTex.wrapS = THREE.RepeatWrapping;
    skyTex.wrapT = THREE.RepeatWrapping;
    skyTex.repeat.set(2, 6);
    var skyMat = new THREE.MeshBasicMaterial({ map: skyTex });

    var skyCeiling = addMesh(new THREE.PlaneGeometry(24, len), skyMat, 0, 11, -len / 2);
    skyCeiling.rotation.x = Math.PI / 2;

    // Side building walls with STREET_B64 picture texture
    var lwall = addMesh(new THREE.PlaneGeometry(len, 12), streetMat, -4, 5, -len / 2);
    lwall.rotation.y = Math.PI / 2;
    var rwall = addMesh(new THREE.PlaneGeometry(len, 12), streetMat, 4, 5, -len / 2);
    rwall.rotation.y = -Math.PI / 2;

    // End of street backdrop (normal street looking forward)
    var endBackdrop = addMesh(new THREE.PlaneGeometry(20, 12), streetMat, 0, 5, -len);

    // Rear backdrop (STALKER_FAR_B64 horror picture showing creepy stalker when turning around)
    var rearBackdrop = addMesh(new THREE.PlaneGeometry(22, 12), stalkerMat, 0, 5, 1.5);
    rearBackdrop.rotation.y = Math.PI; // faces toward player walking forward (-z)

    // Lamp posts with warm orange night glow onto the snow
    var poleMat = makeMat(0x2a2a2a);
    for (var zi = -4; zi > -len; zi -= 10) {
        addMesh(new THREE.CylinderGeometry(0.05, 0.05, 4.5, 6), poleMat, -1.8, 2.25, zi);
        var lamp = new THREE.PointLight(0xffaa44, toWork ? 1.4 : 0.8, 14);
        lamp.position.set(-1.8, 3.2, zi);
        scene.add(lamp);
    }

    // Cold dark blue night ambient light
    scene.add(new THREE.AmbientLight(0x111c2e, 1.2));
    // Heavy blizzard falling everywhere across the entire street from sky to ground
    addSnow(-54, 4, -7, 7, 0, 11.5, 3800, 0.08);

    camera.position.set(0, 1.6, 0);
    camera.lookAt(0, 1.6, -5);

    // 3D Stalker figure as well
    var stalkerZ = toWork ? 20 : 12;
    createStalker(2.4, stalkerZ);

    if (toWork) {
        setObjective('Иди на работу');
        var noticed = false;
        chapterUpdate = function() {
            if (!noticed && camera.position.z < -8) {
                var camDir = new THREE.Vector3();
                camera.getWorldDirection(camDir);
                if (camDir.z > 0.4) {
                    noticed = true;
                    triggerHeartbeatPulse();
                    showThought('Кто-то стоит позади... Наверное показалось.');
                }
            }
            if (camera.position.z < -len + 4) {
                chapterUpdate = null;
                loadChapter(3);
            }
            camera.position.x = Math.max(-2.3, Math.min(2.3, camera.position.x));
            camera.position.z = Math.max(-len + 1, Math.min(1.0, camera.position.z));
        };
    } else {
        setObjective('Иди домой');
        var noticed2 = false;
        chapterUpdate = function() {
            if (!noticed2 && camera.position.z < -8) {
                var cd = new THREE.Vector3();
                camera.getWorldDirection(cd);
                if (cd.z > 0.4) {
                    noticed2 = true;
                    triggerHeartbeatPulse();
                    showThought('Он снова здесь. Намного ближе. Надо бежать!');
                }
            }
            if (camera.position.z < -len + 4) {
                chapterUpdate = null;
                loadChapter(5);
            }
            camera.position.x = Math.max(-2.3, Math.min(2.3, camera.position.x));
            camera.position.z = Math.max(-len + 1, Math.min(1.0, camera.position.z));
        };
    }
}

// ==================== BUILD: OFFICE ====================
function buildOffice() {
    scene.background = new THREE.Color(0x030303);
    scene.fog = new THREE.Fog(0x030303, 1, 10);

    var om = makeMat(0xefefef);
    var fm2 = makeMat(0x181818);

    // Floor + ceiling
    var of = addMesh(new THREE.PlaneGeometry(8, 10), fm2, 0, 0, -2); of.rotation.x = -Math.PI / 2;
    var oc = addMesh(new THREE.PlaneGeometry(8, 10), makeMat(0xefefef), 0, 3, -2); oc.rotation.x = Math.PI / 2;

    // Walls
    addMesh(new THREE.PlaneGeometry(8, 3), om, 0, 1.5, -7);              // back
    var lw2 = addMesh(new THREE.PlaneGeometry(10, 3), om, -4, 1.5, -2); lw2.rotation.y = Math.PI / 2;
    var rw2 = addMesh(new THREE.PlaneGeometry(10, 3), om, 4, 1.5, -2);  rw2.rotation.y = -Math.PI / 2;
    // Front wall (solid)
    addMesh(new THREE.PlaneGeometry(8, 3), om, 0, 1.5, 3);
    var fw2 = addMesh(new THREE.PlaneGeometry(8, 3), om, 0, 1.5, 3); fw2.rotation.y = Math.PI; // inside face

    // Office light switch
    var osw = addMesh(new THREE.BoxGeometry(0.1, 0.15, 0.05), makeMat(0x888888), -1.2, 1.3, 2.97);
    osw.userData = { name: 'Выключатель', type: 'office_switch' };
    interactables.push(osw);

    // Exit door
    var exitDoor = addMesh(new THREE.PlaneGeometry(1.2, 2.2), makeMat(0x302010), 0, 1.1, 2.98);
    exitDoor.rotation.y = Math.PI;
    exitDoor.userData = { name: 'Выход (домой)', type: 'office_exit' };
    interactables.push(exitDoor);

    // Multiple office desks & computers (night shift office room)
    var deskLocations = [
        { x: -1.2, z: -5.0, isPlayer: true },
        { x:  1.5, z: -5.0, isPlayer: false },
        { x: -1.2, z: -2.2, isPlayer: false },
        { x:  1.5, z: -2.2, isPlayer: false }
    ];

    var deskMat = makeMat(0x3e2c1e);
    var chairMat = makeMat(0x1a1a1a);
    var monMat = makeMat(0x111111);
    var greenScreenMat = new THREE.MeshBasicMaterial({ color: 0x113311 });
    var offScreenMat = new THREE.MeshBasicMaterial({ color: 0x050c05 });

    for (var di = 0; di < deskLocations.length; di++) {
        var dk = deskLocations[di];
        // Desk
        addMesh(new THREE.BoxGeometry(1.8, 0.8, 0.9), deskMat, dk.x, 0.4, dk.z);
        colliders.push({ minX: dk.x - 0.9, maxX: dk.x + 0.9, minZ: dk.z - 0.45, maxZ: dk.z + 0.45 });
        // Chair
        var chair = addMesh(new THREE.BoxGeometry(0.55, 0.1, 0.55), chairMat, dk.x, 0.55, dk.z + 0.7);
        chair.userData = { name: 'Стул', type: 'office_chair', sitX: dk.x, sitZ: dk.z + 0.5, lookX: dk.x, lookZ: dk.z - 1.0 };
        interactables.push(chair);
        // Monitor stand + body
        addMesh(new THREE.BoxGeometry(0.75, 0.55, 0.1), monMat, dk.x, 1.1, dk.z - 0.3);

        if (dk.isPlayer) {
            // Player's computer
            var compScreen = addMesh(new THREE.PlaneGeometry(0.68, 0.48), greenScreenMat, dk.x, 1.1, dk.z - 0.24);
            compScreen.userData = { name: 'Твой компьютер', type: 'computer' };
            interactables.push(compScreen);
        } else {
            // Other office computers
            var oScreen = addMesh(new THREE.PlaneGeometry(0.68, 0.48), offScreenMat, dk.x, 1.1, dk.z - 0.24);
            oScreen.userData = { name: 'Чужой компьютер', type: 'other_computer' };
            interactables.push(oScreen);
        }
    }

    // Yellow physical folder for work
    var folderMat = makeMat(0xddaa00);
    var yellowFolder = addMesh(new THREE.BoxGeometry(0.3, 0.02, 0.4), folderMat, -1.0, 0.81, -4.8);
    yellowFolder.rotation.y = 0.2;
    yellowFolder.userData = { name: 'Желтая папка (документы)', type: 'yellow_folder' };
    interactables.push(yellowFolder);

    // Lighting
    scene.add(new THREE.AmbientLight(0x0d0d0d, 1.0));
    roomLight = new THREE.PointLight(0xeeeedd, 0.7, 14);
    roomLight.position.set(-1, 2.8, -4); scene.add(roomLight);
    gameState.lightOn = true;

    camera.position.set(-1, 1.6, -3.5);
    camera.lookAt(-1, 1.5, -5.5);
    setObjective('Перепечатай отчет из желтой папки');

    chapterUpdate = function() {
        // Boundaries (simple box for main room)
        camera.position.x = Math.max(-3.5, Math.min(3.5, camera.position.x));
        camera.position.z = Math.max(-6.5, Math.min(2.5, camera.position.z));
    };
}

// ==================== INTERACTIONS ====================
function checkChapter1Goals() {
    if (gameState.watchedTV && gameState.hasKey) {
        setObjective('Открой дверь и выйди на работу');
    } else if (gameState.lightOn) {
        var missing = [];
        if (!gameState.watchedTV) missing.push('посмотри ТВ');
        if (!gameState.hasKey) missing.push('найди ключ');
        if (missing.length) setObjective(missing.join(', '));
    }
}

function showEmptyPeephole(callback) {
    showThought('Смотрю в глазок...');
    controls.unlock();
    gameState.inUI = true;
    
    var sc = document.createElement('div');
    sc.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:black;z-index:9999;display:flex;align-items:center;justify-content:center;';
    var peephole = document.createElement('div');
    peephole.style.cssText = 'width:60vh;height:60vh;border-radius:50%;background:radial-gradient(circle, #3a2a18, #050505);box-shadow:inset 0 0 50px rgba(0,0,0,1), 0 0 0 9999px black;';
    sc.appendChild(peephole);
    
    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Отойти от двери [X]';
    closeBtn.style.cssText = 'position:absolute;top:20px;right:20px;padding:15px 25px;font-size:18px;background:#222;color:#fff;border:2px solid #555;cursor:pointer;font-family:monospace;z-index:10000;';
    closeBtn.onmouseover = function() { closeBtn.style.background = '#444'; };
    closeBtn.onmouseout = function() { closeBtn.style.background = '#222'; };
    closeBtn.onclick = function() {
        sc.remove();
        gameState.inUI = false;
        controls.lock();
        if (callback) callback();
    };
    sc.appendChild(closeBtn);
    
    document.body.appendChild(sc);
}

function handleInteraction(obj) {
    playClickSound();
    var d = obj.userData;
    var ch = gameState.chapter;

    if (d.type === 'tv') {
        if (ch === 8) {
            if (!gameState.fridgeUnpackedAll) {
                showThought('Сначала нужно разложить купленные продукты в холодильник.');
                return;
            }
            if (!gameState.foodEaten8 && !gameState.foodOrdered8 && !gameState.cookedFoodEaten) {
                showThought('Сначала нужно подкрепиться — приготовить еду на плите или заказать доставку!');
                return;
            }
            if (!gameState.newsWatched8) {
                handleChapter8News(d);
                return;
            }
            if (gameState.newsWatched8 && !gameState.newsFinished8) {
                showThought('Идут экстренные новости гражданской обороны! Нужно дослушать до конца.');
                return;
            }
            if (gameState.tvOn) {
                gameState.tvOn = false;
                gameState.tvTurnedOff8 = true;
                d.mat.color.setHex(0x111111);
                d.mat.map = null;
                d.mat.needsUpdate = true;
                playClickSound();
                showThought('Щёлк. Выключил телевизор. Экран больше не светится и не привлечёт зомби с улицы.');
                updateChapter8SecurityObjectives();
                return;
            } else {
                showThought('Телевизор выключен, чтобы не привлекать зомби экраном.');
                return;
            }
        }
        if (!gameState.tvOn) {
            gameState.tvOn = true;
            d.mat.color.setHex(0xffffff);
            d.mat.map = d.tex;
            d.mat.needsUpdate = true;
            if (ch === 1) {
                showThought('"...рекордное похолодание ожидается сегодня ночью. Сегодня пятница, 13-е. Жителям рекомендуется воздержаться от..."');
                gameState.watchedTV = true;
                checkChapter1Goals();
            } else if (ch === 6) {
                showThought('"...сегодня ясный и теплый день, прекрасная погода в городе..."');
            } else {
                showThought('Помехи... Не разобрать.');
            }
        } else {
            gameState.tvOn = false;
            d.mat.color.setHex(0x111111);
            d.mat.map = null;
            d.mat.needsUpdate = true;
            showThought('Выключил.');
        }
    }
    else if (d.type === 'switch') {
        gameState.lightOn = !gameState.lightOn;
        if (roomLight) roomLight.intensity = gameState.lightOn ? 1.0 : 0.0;
        showThought(gameState.lightOn ? 'Щелк. Тусклая лампа немного разогнала тьму.' : 'Щелк. Снова темнота.');
        if (ch === 1 && gameState.lightOn) {
            setObjective('Осмотри квартиру и посмотри ТВ');
        }
    }
    else if (d.type === 'window' || d.type === 'curtains') {
        if (ch === 8) {
            if (!gameState.newsWatched8) {
                showThought('Сначала нужно разобрать продукты и посмотреть новости.');
                return;
            }
            if (gameState.curtainsClosed) {
                showThought('Шторы уже плотно занавешены. Лучше их не открывать — снаружи бродят заражённые.');
                return;
            }
            closeCurtainsAnimation(function() {
                if (gameState.doorLocked8) {
                    showThought('Шторы занавешены! Дверь тоже заперта. Теперь я в безопасности, можно лечь спать.');
                    updateChapter8SecurityObjectives();
                } else {
                    showThought('Шторы занавешены! Теперь с улицы не видно свет в окне. Осталось запереть входную дверь!');
                    updateChapter8SecurityObjectives();
                }
            });
        } else if (ch === 6) {
            showThought('За окном светит солнце, на улице гуляют люди. Город ожил.');
        } else {
            showThought('9 этаж. Снег падает в беспросветную тьму. Весь город вымер.');
        }
    }
    else if (d.type === 'water') {
        showThought('Чистая прохладная вода. Очень освежает.');
    }
    else if (d.type === 'fridge') {
        if (d.animating) return;
        if (gameState.chapter === 8) {
            handleChapter8Fridge(d);
            return;
        }
        if (!d.isOpen) {
            d.isOpen = true; d.animating = true;
            showThought('На полке одинокое яблоко. Холодильник почти пустой.');
            var rot = 0;
            var fiv = setInterval(function() {
                d.hingeGroup.rotation.y += 0.03; rot += 0.03;
                if (rot >= Math.PI / 2) { clearInterval(fiv); d.animating = false; }
            }, 30);
        } else {
            d.isOpen = false; d.animating = true;
            showThought('Закрываю холодильник.');
            var rot2 = 0;
            var fiv2 = setInterval(function() {
                d.hingeGroup.rotation.y -= 0.03; rot2 += 0.03;
                if (rot2 >= Math.PI / 2) { clearInterval(fiv2); d.animating = false; }
            }, 30);
        }
    }
    else if (d.type === 'fridge_shelf') {
        if (gameState.chapter === 8) {
            if (!gameState.fridgeOpen) {
                showThought('Сначала нужно открыть дверцу холодильника!');
            } else {
                unpackNextFridgeItem();
            }
        }
    }
    else if (d.type === 'grocery_bag') {
        if (gameState.chapter === 8) {
            if (!gameState.fridgeOpen) {
                showThought('Сначала нужно открыть дверцу холодильника!');
            } else {
                unpackNextFridgeItem();
            }
        } else {
            showThought('Пакет с покупками.');
        }
    }
    else if (d.type === 'phone') {
        if (ch === 5) {
            if (!gameState.pizzaOrdered) {
                gameState.pizzaOrdered = true;
                showThought('Алло, доставка? Одну пиццу, пожалуйста... Жду.');
                setObjective('Жди доставку пиццы');
                setTimeout(function() {
                    showThought('Дзинь-дзинь! Пицца приехала!');
                    var pizzaBox = addMesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), makeMat(0xeeaa55), -2.25, 0.825, -2.2);
                    pizzaBox.userData = { name: 'Коробка пиццы', type: 'pizza' };
                    interactables.push(pizzaBox);
                    setObjective('Съешь пиццу');
                }, 4000);
            } else {
                showThought('Я уже заказал пиццу.');
            }
        } else if (ch === 6) {
            window.openPhoneUI();
        } else if (ch === 8) {
            if (!gameState.fridgeUnpackedAll) {
                showThought('Сначала нужно разложить купленные продукты в холодильник.');
                return;
            }
            if (!gameState.foodOrdered8) {
                gameState.foodOrdered8 = true;
                playPhoneDialSound();
                showThought('Набираю доставку... «Алло, доставка? Заказ в квартиру 13: фирменный горячий обед!» Оператор дрожащим голосом: «Заказ принят... если курьер сможет доехать...»');
                setTimeout(function() {
                    if (gameState.chapter === 8) {
                        spawnDeliveryPackage();
                        showThought('Стук в дверь! Курьер быстро оставил заказ на кухонном столике и убежал.');
                        setObjective('Съешь еду из доставки или включи телевизор');
                    }
                }, 2500);
            } else if (gameState.deliveryPackageGroup) {
                showThought('Заказ из доставки уже на столе. Пора поесть!');
            } else {
                showThought('Еда уже заказана и съедена.');
            }
        }
    }
    else if (d.type === 'delivery_food') {
        playItemPickupSound();
        gameState.deliveryFoodEaten = true;
        gameState.foodEaten8 = true;
        showThought('М-м-м, горячая еда из доставки! Сочный бургер, картошка и напиток. Очень вкусно и сытно!');
        if (gameState.deliveryPackageGroup) {
            scene.remove(gameState.deliveryPackageGroup);
            gameState.deliveryPackageGroup = null;
        }
        if (gameState.deliveryPackageMesh) {
            var pIdx = interactables.indexOf(gameState.deliveryPackageMesh);
            if (pIdx !== -1) interactables.splice(pIdx, 1);
            gameState.deliveryPackageMesh = null;
        }
        currentInteractable = null;
        interactionPrompt.style.opacity = 0;
        if (!gameState.tvOn && !gameState.newsWatched8) {
            setObjective('Включи телевизор и посмотри новости');
            if (gameState.tvScreenMesh && gameState.tvScreenMesh.userData) {
                gameState.tvScreenMesh.userData.name = 'Телевизор (Новости)';
            }
        }
    }
    else if (d.type === 'stove') {
        if (ch === 1) {
            showThought('Утром некогда готовить, нужно собираться на работу!');
            return;
        }
        if (ch === 6) {
            showThought('Сначала нужно проверить телефон и ответить коллегам.');
            return;
        }
        if (ch === 8) {
            if (!gameState.fridgeUnpackedAll) {
                showThought('Сначала нужно разложить купленные продукты в холодильник!');
                return;
            }
            if (gameState.isCooking) {
                showThought('Еда уже готовится на плите, подождите минутку...');
                return;
            }
            cookOnStove();
            return;
        }
        cookOnStove();
    }
    else if (d.type === 'pizza') {
        gameState.pizzaEaten = true;
        scene.remove(obj);
        interactables.splice(interactables.indexOf(obj), 1);
        currentInteractable = null;
        interactionPrompt.style.opacity = 0;
        showThought('Очень вкусно. Теперь я сыт и хочу спать.');
        setObjective('Ложись спать');
    }
    else if (d.type === 'bed') {
        if (ch === 5) {
            if (gameState.pizzaEaten) {
                showThought('Спокойной ночи...');
                startSleep(5, function() {
                    loadChapter(6);
                });
            } else {
                showThought('Я слишком голоден, чтобы спать. Надо заказать пиццу.');
            }
        } else if (ch === 8) {
            if (!gameState.newsWatched8) {
                showThought('Не могу уснуть, пока не разложу продукты и не включу новости.');
                return;
            }
            if (!gameState.newsFinished8) {
                showThought('Нужно дослушать экстренные новости до конца!');
                return;
            }
            if (!gameState.curtainsClosed || !gameState.doorLocked8 || gameState.tvOn) {
                if (!gameState.doorLocked8) {
                    showThought('Дверь не заперта! Нужно сначала запереть входную дверь на замок.');
                } else if (!gameState.curtainsClosed) {
                    showThought('Шторы открыты, в окно могут заглянуть зомби! Нужно сначала занавесить шторы.');
                } else if (gameState.tvOn) {
                    showThought('Телевизор светится и шумит! Нужно выключить телевизор перед сном, чтобы не привлекать внимание.');
                }
                return;
            }
            if (!gameState.sleptChapter8) {
                gameState.sleptChapter8 = true;
                showThought('Ложусь поспать на 5 секунд... Главное — не открывать дверь.');
                camera.position.set(2.0, 0.8, -1.0);
                startSleep(5, function() {
                    var t = setInterval(function() {
                        camera.position.y += 0.04;
                        if (camera.position.y >= 1.6) {
                            camera.position.y = 1.6;
                            clearInterval(t);
                            thoughtBubble.style.opacity = 0;
                            setObjective('Выживай в квартире 13');
                            triggerZombieApocalypseEnding();
                        }
                    }, 50);
                });
            } else {
                showThought('Ложусь вздремнуть на 5 секунд...');
                camera.position.set(2.0, 0.8, -1.0);
                startSleep(5, function() {
                    var t2 = setInterval(function() {
                        camera.position.y += 0.04;
                        if (camera.position.y >= 1.6) {
                            camera.position.y = 1.6;
                            clearInterval(t2);
                            thoughtBubble.style.opacity = 0;
                        }
                    }, 50);
                });
            }
        } else if (ch === 6) {
            showThought('Я только что проснулся, спать не хочется.');
        } else {
            showThought('Мне нужно собираться на работу, некогда спать!');
        }
    }
    else if (d.type === 'nightstand') {
        if (d.animating) return;
        if (!d.isOpen) {
            d.isOpen = true; d.animating = true;
            var slide = 0;
            var niv = setInterval(function() {
                d.drawerGroup.position.z += 0.02; slide += 0.02;
                if (slide >= 0.5) {
                    clearInterval(niv); d.animating = false;
                    if (!gameState.hasFlashlight) {
                        gameState.hasFlashlight = true;
                        playerFlashlight.visible = true;
                        d.drawerGroup.remove(d.flashMesh);
                        showThought('Фонарик! Теперь темнота не так страшна.');
                    } else {
                        showThought('Ящик открыт. Внутри пусто.');
                    }
                }
            }, 30);
            if (!gameState.hasFlashlight) showThought('В ящике что-то есть...');
        } else {
            d.isOpen = false; d.animating = true;
            showThought('Закрываю ящик.');
            var slide2 = 0;
            var niv2 = setInterval(function() {
                d.drawerGroup.position.z -= 0.02; slide2 += 0.02;
                if (slide2 >= 0.5) { clearInterval(niv2); d.animating = false; }
            }, 30);
        }
    }
    else if (d.type === 'key') {
        gameState.hasKey = true;
        if (d.group) {
            scene.remove(d.group);
        } else {
            scene.remove(obj);
        }
        interactables.splice(interactables.indexOf(obj), 1);
        currentInteractable = null;
        interactionPrompt.style.opacity = 0;
        showThought('Ржавый ключ. Возможно, от входной двери.');
        checkChapter1Goals();
    }
    else if (d.type === 'door') {
        if (ch === 1) {
            if (gameState.doorOpen) {
                showThought('Выхожу...');
                setTimeout(function() { loadChapter(2); }, 1500);
            } else if (gameState.hasKey && gameState.watchedTV) {
                gameState.doorOpen = true;
                showThought('Ключ подошёл! Пора на работу.');
                var dr = 0;
                var div2 = setInterval(function() {
                    d.hingeGroup.rotation.y -= 0.02; dr += 0.02;
                    if (dr >= Math.PI / 2) { clearInterval(div2); setObjective('Выйди из квартиры'); }
                }, 30);
            } else if (!gameState.hasKey) {
                showThought('Дверь заперта. Нужен ключ.');
            } else {
                showThought('Может, сначала проверить новости?');
            }
        } else if (ch === 5) {
            showThought('Замок не поворачивается. Дверь заклинило!');
        } else if (ch === 6) {
            if (!ch6Phone.sergeyReplied) {
                showThought('Сначала нужно ответить Сергею в телефоне.');
                setObjective('Ответь Сергею в телефоне');
                return;
            }
            if (!ch6Phone.moneyChecked) {
                showThought('На работу идти не надо, меня уволили... Надо сначала проверить в телефоне, сколько осталось денег.');
                setObjective('Посмотри в телефоне сколько у тебя денег');
                return;
            }
            if (gameState.doorOpen) {
                showThought('Иду в продуктовый магазин за едой...');
                setTimeout(function() { loadChapter(7); }, 1000);
                return;
            }
            gameState.doorOpen = true;
            showThought('На работу больше не надо. Пойду в магазин за едой...');
            var dr = 0;
            var div6 = setInterval(function() {
                d.hingeGroup.rotation.y -= 0.02; dr += 0.02;
                if (dr >= Math.PI / 2) {
                    clearInterval(div6);
                    setObjective('Иди в продуктовый магазин');
                    setTimeout(function() {
                        loadChapter(7);
                    }, 1200);
                }
            }, 30);
        } else if (ch === 8) {
            if (!gameState.newsWatched8) {
                showThought('Дверь закрыта. Сначала нужно разобрать продукты и посмотреть новости.');
                return;
            }
            if (gameState.doorLocked8) {
                showThought('Дверь уже надёжно заперта на замок и засов. На улице зомби, открывать нельзя!');
                return;
            }
            lockDoorAnimation(function() {
                if (gameState.curtainsClosed) {
                    showThought('Щёлк! Дверь заперта на все замки и засов! Шторы тоже занавешены. Теперь я в безопасности.');
                    updateChapter8SecurityObjectives();
                } else {
                    showThought('Щёлк! Дверь надёжно заперта на замок и засов. Снаружи никто не войдёт! Теперь нужно занавесить шторы.');
                    updateChapter8SecurityObjectives();
                }
            });
        }
    }
    else if (d.type === 'other_computer') {
        showThought('Коллега уже ушёл домой. На экране заставка...');
    }
    else if (d.type === 'office_switch') {
        gameState.lightOn = !gameState.lightOn;
        if (roomLight) roomLight.intensity = gameState.lightOn ? 0.7 : 0.0;
        showThought(gameState.lightOn ? 'Свет включен.' : 'Свет выключен.');
    }
    else if (d.type === 'computer') {
        if (!gameState.computerUsed) {
            gameState.inUI = true;
            controls.unlock();
            document.getElementById('computer-ui').style.display = 'block';
            document.getElementById('comp-window').style.display = 'none'; // reset window
            document.getElementById('comp-input').value = '';
            document.getElementById('comp-error').textContent = '';
            showThought('Нужно перепечатать отчет из желтой папки.');
        } else {
            showThought('Работа закончена. Пора домой.');
        }
    }
    else if (d.type === 'yellow_folder') {
        gameState.inUI = true;
        controls.unlock();
        document.getElementById('folder-ui').style.display = 'flex';
        showThought('Отчет за сегодня...');
    }
    else if (d.type === 'office_exit') {
        if (gameState.computerUsed) {
            showThought('Смена окончена. Выхожу на улицу. Скорее домой.');
            setTimeout(function() { loadChapter(4); }, 1500);
        } else {
            showThought('Я не могу уйти, пока не отправлю отчет на компьютере!');
        }
    }
    else if (d.type === 'sofa') {
        if (!isSitting) {
            isSitting = true;
            d.name = 'Встать [F]';
            gameState.preSitPos = camera.position.clone();
            // Sit: camera moves onto sofa seat, looks at TV
            camera.position.set(-2.0, 1.1, -0.55);
            // Look toward TV at (-2.25, 1.1, -2.5)
            var tvDir = new THREE.Vector3(-2.25, 1.1, -2.5);
            camera.lookAt(tvDir);
            velocity.set(0, 0, 0);
            showThought('Садишься на диван... Может, включить телевизор?');
        } else {
            standUp();
        }
    }
    else if (d.type === 'office_chair') {
        if (!isSitting) {
            isSitting = true;
            d.name = 'Встать [F]';
            gameState.preSitPos = camera.position.clone();
            camera.position.set(d.sitX, 1.1, d.sitZ);
            camera.lookAt(new THREE.Vector3(d.lookX, 1.1, d.lookZ));
            velocity.set(0, 0, 0);
            showThought('Сел за стол работать.');
        } else {
            standUp();
        }
    }
    else if (d.type === 'shop_item') {
        if (gameState.shopPaid) {
            showThought('Я уже оплатил покупки на кассе. Пора идти домой.');
            return;
        }
        if (gameState.cartTotal + d.price > gameState.money) {
            showThought('Не хватает денег на карте!');
            return;
        }
        gameState.cart.push({
            name: d.itemName,
            price: d.price,
            texKey: d.texKey,
            itemKind: d.itemKind
        });
        gameState.cartTotal += d.price;
        playItemPickupSound();
        if (d.group) {
            scene.remove(d.group);
        } else {
            scene.remove(obj);
        }
        var sIdx = interactables.indexOf(obj);
        if (sIdx !== -1) interactables.splice(sIdx, 1);
        currentInteractable = null;
        interactionPrompt.style.opacity = 0;
        updateShopHUD();
        showThought('Взял: ' + d.itemName + ' за ' + d.price + ' ₽. Итого в корзине: ' + gameState.cartTotal + ' ₽.');
        setObjective('Оплати покупки на кассе (в корзине: ' + gameState.cart.length + ' шт.)');
    }
    else if (d.type === 'cash_register') {
        if (gameState.shopPaid) {
            showThought('Кассир: «Вы уже всё оплатили! Чек в пакете. Приходите ещё!»');
            return;
        }
        if (gameState.cart.length === 0) {
            showThought('Кассир: «Сначала выберите продукты на полках, затем подойдите на кассу.»');
            return;
        }
        playBarcodeBeep();
        gameState.shopPaid = true;
        gameState.money -= gameState.cartTotal;
        updateShopHUD();

        var txList = document.querySelector('.bank-history-list');
        if (txList) {
            var tx = document.createElement('div');
            tx.className = 'bank-tx-item expense';
            tx.innerHTML = '<div class="tx-info"><div class="tx-title">Супермаркет «Продукты 24»</div><div class="tx-time">Сегодня, 08:35</div></div><div class="tx-amount">-' + gameState.cartTotal + ' ₽</div>';
            txList.insertBefore(tx, txList.firstChild);
        }
        var cardBal = document.querySelector('.card-balance');
        if (cardBal) cardBal.textContent = gameState.money + ' ₽';
        var bankPrev = document.getElementById('bank-preview');
        if (bankPrev) bankPrev.textContent = 'Баланс: ' + gameState.money + ' ₽. Оплата в магазине.';

        showPhoneToast('Мой Банк', 'Оплата: -' + gameState.cartTotal + ' ₽. Баланс: ' + gameState.money + ' ₽', 'bank');
        showThought('Пик! Оплата картой прошла успешно (-' + gameState.cartTotal + ' ₽). Кассир: «Спасибо за покупку! Чек в пакете. Хорошего дня!»');
        setObjective('Выйди из магазина с покупками');
    }
    else if (d.type === 'shop_exit') {
        if (gameState.cart.length === 0) {
            showThought('Надо купить хоть немного еды, дома шаром покати.');
            return;
        }
        if (!gameState.shopPaid) {
            showThought('Нельзя уйти не заплатив! Сначала нужно оплатить покупки на кассе.');
            return;
        }
        var cartHud = document.getElementById('shop-cart-hud');
        if (cartHud) cartHud.style.display = 'none';

        showThought('Выхожу из магазина с полными пакетами продуктов и направляюсь домой...');
        setTimeout(function() {
            loadChapter(8);
        }, 1200);
    }
    else if (d.type === 'tree') {
        if (ch === 1) {
            showThought('Огромная новогодняя ель почти под самый потолок... Пахнет свежей хвоей, стеклянные шары переливаются в полумраке.');
        } else if (ch === 6) {
            showThought('Пышная елка вся сияет огоньками и гирляндами. В комнате царит настоящее новогоднее чудо.');
        } else if (ch === 8) {
            showThought('Какое счастье, что дома стоит эта огромная ель... Её теплый свет, шары и звезда согревают душу в этом кошмаре.');
        } else {
            showThought('Величественная новогодняя елка с подарками под ветками. По-настоящему сказочно.');
        }
    }
}

function standUp() {
    if (!isSitting) return;
    isSitting = false;
    if (gameState.preSitPos) {
        camera.position.copy(gameState.preSitPos);
    } else {
        camera.position.set(-2.0, 1.6, 0.2);
    }
    showThought('Встаёшь.');
    // Update sofa/chair label back
    for (var i = 0; i < interactables.length; i++) {
        if (interactables[i].userData) {
            if (interactables[i].userData.type === 'sofa') interactables[i].userData.name = 'Диван';
            if (interactables[i].userData.type === 'office_chair') interactables[i].userData.name = 'Стул';
        }
    }
}

// ==================== COLLISION DETECTION ====================
function checkCollisions() {
    var r = 0.28; // player radius
    var px = camera.position.x;
    var pz = camera.position.z;
    for (var i = 0; i < colliders.length; i++) {
        var c = colliders[i];
        var ex = px > c.minX - r && px < c.maxX + r;
        var ez = pz > c.minZ - r && pz < c.maxZ + r;
        if (ex && ez) {
            // Push out through the nearest face
            var dLeft   = px - (c.minX - r);
            var dRight  = (c.maxX + r) - px;
            var dFront  = pz - (c.minZ - r);
            var dBack   = (c.maxZ + r) - pz;
            var minD = Math.min(dLeft, dRight, dFront, dBack);
            if      (minD === dLeft)  camera.position.x = c.minX - r;
            else if (minD === dRight) camera.position.x = c.maxX + r;
            else if (minD === dFront) camera.position.z = c.minZ - r;
            else                      camera.position.z = c.maxZ + r;
        }
    }
}

// ==================== INIT ====================
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 1.6, 0);

    playerFlashlight = new THREE.SpotLight(0xffffff, 1.5, 20, Math.PI / 5, 0.5, 1);
    playerFlashlight.position.set(0, 0, 0);
    playerFlashlight.target.position.set(0, 0, -1);
    playerFlashlight.visible = false;
    camera.add(playerFlashlight);
    camera.add(playerFlashlight.target);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new PointerLock(camera, document.body);
    controls.onUnlock = function() {
        if (gameState.chapter > 0 && !gameState.transitioning && gameState.chapter !== -1 && !gameState.inUI) {
            blocker.style.display = 'flex';
            uiLayer.style.display = 'none';
        }
    };

    // UI Functions
    window.openCompFolder = function() { document.getElementById('comp-window').style.display = 'block'; };
    window.closeCompFolder = function() { document.getElementById('comp-window').style.display = 'none'; };
    window.closeComputerUI = function() { 
        document.getElementById('computer-ui').style.display = 'none'; 
        gameState.inUI = false; 
        controls.lock(); 
    };
    window.closeFolderUI = function() { 
        document.getElementById('folder-ui').style.display = 'none'; 
        gameState.inUI = false; 
        controls.lock(); 
    };
    window.submitWork = function() {
        var input = document.getElementById('comp-input').value.trim();
        var expected = document.getElementById('folder-text').textContent.trim();
        if (input === expected) {
            gameState.computerUsed = true;
            window.closeComputerUI();
            showThought('Отлично, отчет отправлен. Теперь можно идти домой.');
            setObjective('Выйди из офиса');
        } else {
            document.getElementById('comp-error').textContent = 'ОШИБКА: Текст не совпадает с оригиналом.';
        }
    };

    window.switchPhoneTab = function(tabName) {
        if (gameState.chapter !== 6) return;
        var btnChats = document.getElementById('nav-btn-chats');
        var btnBank = document.getElementById('nav-btn-bank');
        var listView = document.getElementById('phone-chat-list-view');
        var convView = document.getElementById('phone-conversation-view');
        var bankView = document.getElementById('phone-bank-view');

        if (tabName === 'messages') {
            if (btnChats) btnChats.classList.add('active');
            if (btnBank) btnBank.classList.remove('active');
            if (bankView) bankView.style.display = 'none';
            if (ch6Phone.currentChat) {
                if (convView) convView.style.display = 'flex';
                if (listView) listView.style.display = 'none';
            } else {
                if (convView) convView.style.display = 'none';
                if (listView) listView.style.display = 'flex';
            }
        } else if (tabName === 'bank') {
            if (btnChats) btnChats.classList.remove('active');
            if (btnBank) btnBank.classList.add('active');
            if (listView) listView.style.display = 'none';
            if (convView) convView.style.display = 'none';
            if (bankView) bankView.style.display = 'flex';

            var navBadge = document.getElementById('nav-bank-badge');
            if (navBadge) navBadge.style.display = 'none';
            var bankUnread = document.getElementById('bank-unread');
            if (bankUnread) bankUnread.style.display = 'none';

            if (!ch6Phone.moneyChecked) {
                ch6Phone.moneyChecked = true;
                showThought('5 000 рублей на карте... На работу идти не надо, меня уволили. Надо сходить в магазин за едой.');
                setObjective('Выйди из квартиры и иди в магазин');
            }
        }
    };

    window.openChatList = function() {
        ch6Phone.currentChat = null;
        window.switchPhoneTab('messages');
        var listView = document.getElementById('phone-chat-list-view');
        var convView = document.getElementById('phone-conversation-view');
        if (listView) listView.style.display = 'flex';
        if (convView) convView.style.display = 'none';
    };

    window.openChat = function(chatKey) {
        if (gameState.chapter !== 6) return;
        gameState.inUI = true;
        controls.unlock();
        
        var toast = document.getElementById('phone-toast');
        if (toast) toast.classList.remove('show');
        var ui = document.getElementById('phone-ui');
        if (ui) ui.style.display = 'flex';

        window.switchPhoneTab('messages');

        ch6Phone.currentChat = chatKey;
        var listView = document.getElementById('phone-chat-list-view');
        var convView = document.getElementById('phone-conversation-view');
        if (listView) listView.style.display = 'none';
        if (convView) convView.style.display = 'flex';

        var badge = document.getElementById(chatKey + '-unread');
        if (badge) badge.style.display = 'none';

        var chatData = ch6Phone.chats[chatKey];
        var nameEl = document.getElementById('phone-contact-name');
        var statusEl = document.getElementById('phone-status');
        if (nameEl) nameEl.textContent = chatData.name;
        if (statusEl) {
            statusEl.textContent = chatData.status;
            statusEl.style.color = (chatKey === 'sergey') ? '#4cd964' : '#8892a0';
        }

        var inp = document.getElementById('phone-input');
        var sendBtn = document.getElementById('phone-send-btn');
        if (chatKey === 'boss') {
            if (inp) {
                inp.placeholder = 'Отправка сообщений заблокирована';
                inp.disabled = true;
                inp.value = '';
            }
            if (sendBtn) sendBtn.style.opacity = '0.3';
        } else {
            if (inp) {
                inp.placeholder = 'Написать Сергею...';
                inp.disabled = ch6Phone.playerReplied;
                if (!ch6Phone.playerReplied) {
                    setTimeout(function() { inp.focus(); }, 100);
                }
            }
            if (sendBtn) sendBtn.style.opacity = ch6Phone.playerReplied ? '0.5' : '1';
        }

        renderCurrentChatMessages();
    };

    window.openPhoneUI = function() {
        if (gameState.chapter !== 6) return;
        gameState.inUI = true;
        controls.unlock();
        var toast = document.getElementById('phone-toast');
        if (toast) toast.classList.remove('show');
        var ui = document.getElementById('phone-ui');
        if (ui) ui.style.display = 'flex';

        if (ch6Phone.sergeyReplied && !ch6Phone.moneyChecked) {
            window.switchPhoneTab('bank');
        } else if (ch6Phone.sergeyMsgSent && !ch6Phone.sergeyReplied) {
            window.openChat('sergey');
        } else if (ch6Phone.bossMsgSent && !ch6Phone.sergeyMsgSent) {
            window.openChat('boss');
        } else {
            window.openChatList();
        }
    };

    window.onToastClick = function() {
        if (ch6Phone.lastToastChat === 'bank') {
            window.openPhoneUI();
            window.switchPhoneTab('bank');
        } else if (ch6Phone.lastToastChat) {
            window.openChat(ch6Phone.lastToastChat);
        } else {
            window.openPhoneUI();
        }
    };

    window.closePhoneUI = function() {
        var ui = document.getElementById('phone-ui');
        if (ui) ui.style.display = 'none';
        gameState.inUI = false;
        controls.lock();
    };

    window.sendPhoneReply = function() {
        if (gameState.chapter !== 6 || ch6Phone.currentChat !== 'sergey') return;
        var inp = document.getElementById('phone-input');
        if (!inp) return;
        var val = inp.value.trim();
        if (!val || ch6Phone.playerReplied) return;

        ch6Phone.playerReplied = true;
        inp.value = '';
        inp.disabled = true;
        var sendBtn = document.getElementById('phone-send-btn');
        if (sendBtn) sendBtn.style.opacity = '0.5';

        ch6Phone.chats.sergey.messages.push({ type: 'sent', text: val });
        renderCurrentChatMessages();

        var statusEl = document.getElementById('phone-status');
        if (statusEl) {
            statusEl.textContent = 'Сергей печатает...';
            statusEl.style.color = '#f59e0b';
        }

        ch6Phone.timers.push(setTimeout(function() {
            if (gameState.chapter !== 6) return;
            playNotificationChime();
            if (statusEl) {
                statusEl.textContent = 'онлайн';
                statusEl.style.color = '#4cd964';
            }
            ch6Phone.chats.sergey.messages.push({ type: 'received', text: 'странно...' });
            renderCurrentChatMessages();
            
            var prev = document.getElementById('sergey-preview');
            if (prev) prev.textContent = 'странно...';

            ch6Phone.sergeyReplied = true;
            showThought('Сергей: "странно..." На работу идти не надо, меня уволили. Надо проверить сколько у меня денег.');
            setObjective('Посмотри в телефоне сколько у тебя денег');

            ch6Phone.timers.push(setTimeout(function() {
                if (gameState.chapter !== 6) return;
                playNotificationChime();
                showPhoneToast('Мой Банк', 'Начисление: +5 000 ₽. Баланс: 5 000 ₽', 'bank');
                var itemBank = document.getElementById('chat-item-bank');
                if (itemBank) itemBank.style.display = 'flex';
                var navBadge = document.getElementById('nav-bank-badge');
                if (navBadge) navBadge.style.display = 'block';
                var bankUnread = document.getElementById('bank-unread');
                if (bankUnread) bankUnread.style.display = 'block';
            }, 1200));
        }, 1800));
    };

    // Start button
    instructions.addEventListener('click', function() {
        if (gameState.chapter === -1) return; // game over
        if (gameState.chapter === 0) {
            loadChapter(1);
        } else {
            blocker.style.display = 'none';
            uiLayer.style.display = 'block';
            controls.lock();
        }
    });

    raycaster = new THREE.Raycaster();
    raycaster.far = 4;

    // Keys
    document.addEventListener('keydown', function(e) {
        if (gameState.inUI) {
            if (e.code === 'Escape') {
                if (document.getElementById('computer-ui').style.display === 'block') window.closeComputerUI();
                if (document.getElementById('folder-ui').style.display === 'flex') window.closeFolderUI();
                if (document.getElementById('phone-ui').style.display === 'flex') window.closePhoneUI();
            }
            return;
        }
        
        switch (e.code) {
            case 'KeyW': case 'ArrowUp':    moveForward  = true; break;
            case 'KeyS': case 'ArrowDown':  moveBackward = true; break;
            case 'KeyA': case 'ArrowLeft':  moveLeft     = true; break;
            case 'KeyD': case 'ArrowRight': moveRight    = true; break;
            case 'KeyF': standUp(); break;
        }
        if (e.ctrlKey && e.code === 'KeyP') {
            e.preventDefault();
            if (controls.isLocked) controls.unlock();
        }
    });
    document.addEventListener('keyup', function(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp':    moveForward  = false; break;
            case 'KeyS': case 'ArrowDown':  moveBackward = false; break;
            case 'KeyA': case 'ArrowLeft':  moveLeft     = false; break;
            case 'KeyD': case 'ArrowRight': moveRight    = false; break;
        }
    });

    document.addEventListener('mousedown', function(e) {
        if (e.button === 0 && controls.isLocked && currentInteractable) {
            handleInteraction(currentInteractable);
        }
    });

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ==================== ANIMATE ====================
function animate() {
    requestAnimationFrame(animate);
    if (gameState.chapter <= 0) {
        renderer.render(scene, camera);
        return;
    }

    var time = performance.now();

    if (controls.isLocked) {
        // Raycasting for interactions
        raycaster.setFromCamera(center, camera);
        var hits = raycaster.intersectObjects(interactables, true);
        var crosshairEl = document.getElementById('crosshair');
        if (hits.length > 0 && hits[0].object.userData && hits[0].object.userData.type) {
            var hit = hits[0].object;
            if (currentInteractable !== hit) {
                currentInteractable = hit;
                interactionPrompt.textContent = '[ЛКМ] ' + hit.userData.name;
                interactionPrompt.style.opacity = 1;
                if (crosshairEl) crosshairEl.classList.add('active');
            }
        } else {
            if (currentInteractable) {
                currentInteractable = null;
                interactionPrompt.style.opacity = 0;
                if (crosshairEl) crosshairEl.classList.remove('active');
            }
        }

        // Movement (blocked while sitting)
        if (!isSitting) {
            // Flashlight steady
            if (playerFlashlight && playerFlashlight.visible) {
                playerFlashlight.target.position.x = 0;
                playerFlashlight.target.position.y = 0;
                playerFlashlight.intensity = 1.5;
            }

            var delta = Math.min((time - prevTime) / 1000, 0.1);
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            if (direction.lengthSq() > 0) direction.normalize();

            var spd = 40.0;
            if (moveForward || moveBackward) velocity.z -= direction.z * spd * delta;
            if (moveLeft || moveRight)       velocity.x -= direction.x * spd * delta;

            var fwd = new THREE.Vector3();
            camera.getWorldDirection(fwd);
            fwd.y = 0;
            if (fwd.lengthSq() > 0) fwd.normalize();
            var right = new THREE.Vector3();
            right.crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();

            camera.position.addScaledVector(right, velocity.x * delta);
            camera.position.addScaledVector(fwd, -velocity.z * delta);

            // Head bobbing & footsteps for horror immersion
            var speedSq = velocity.x * velocity.x + velocity.z * velocity.z;
            if (speedSq > 0.1) {
                headBobTimer += delta * 10;
                camera.position.y = 1.6 + Math.sin(headBobTimer) * 0.035;
                stepTimer += delta * 10;
                if (stepTimer > Math.PI) {
                    stepTimer -= Math.PI;
                    playFootstep();
                }
            } else {
                headBobTimer += delta * 2;
                camera.position.y = 1.6 + Math.sin(headBobTimer) * 0.008; // subtle breathing sway
                stepTimer = 0;
            }

            // Collision detection against furniture
            if (colliders.length > 0) checkCollisions();
        }

        // Per-chapter update (handles boundaries + events)
        if (chapterUpdate) chapterUpdate();

        // Apartment boundary (chapters 1, 5, 6, and 8)
        if (gameState.chapter === 1 || gameState.chapter === 5 || gameState.chapter === 6 || gameState.chapter === 8) {
            var p = camera.position;
            p.x = Math.max(-2.5, Math.min(2.5, p.x));
            p.z = Math.max(-2.5, Math.min(gameState.doorOpen && gameState.chapter !== 8 ? 8 : 2.5, p.z));
            if (gameState.doorOpen && p.z > 4) {
                if (gameState.chapter === 1) {
                    loadChapter(2);
                } else if (gameState.chapter === 6) {
                    loadChapter(7);
                }
            }
        }

        // Shop boundary (chapter 7)
        if (gameState.chapter === 7) {
            var sp = camera.position;
            sp.x = Math.max(-4.6, Math.min(4.6, sp.x));
            sp.z = Math.max(-5.5, Math.min(5.5, sp.z));
        }
    }

    // Snow animation: realistic snowfall across the entire volume with wind sway
    if (snowParticles && snowParticles.geometry && snowParticles.geometry.attributes.position && snowParticles.userData && snowParticles.userData.speeds) {
        var pos = snowParticles.geometry.attributes.position.array;
        var u = snowParticles.userData;
        var sps = u.speeds;
        var sws = u.sways;
        var phs = u.swayPhases;
        var pTime = time * 0.001;

        for (var si = 0; si < u.count; si++) {
            var sIdx = si * 3;
            // Downward fall with individual speed
            pos[sIdx + 1] -= sps[si];
            // Gentle natural wind sway on X and Z
            pos[sIdx]     += Math.sin(pTime * 2.2 + phs[si]) * sws[si];
            pos[sIdx + 2] += Math.cos(pTime * 1.6 + phs[si]) * (sws[si] * 0.6);

            // Wrap around Y
            if (pos[sIdx + 1] < u.yMin) {
                pos[sIdx + 1] = u.yMax - (Math.random() * 0.3);
                pos[sIdx]     = u.xMin + Math.random() * (u.xMax - u.xMin);
                pos[sIdx + 2] = u.zMin + Math.random() * (u.zMax - u.zMin);
            }

            // Wrap around X and Z
            if (pos[sIdx] < u.xMin) pos[sIdx] = u.xMax;
            else if (pos[sIdx] > u.xMax) pos[sIdx] = u.xMin;

            if (pos[sIdx + 2] < u.zMin) pos[sIdx + 2] = u.zMax;
            else if (pos[sIdx + 2] > u.zMax) pos[sIdx + 2] = u.zMin;
        }
        snowParticles.geometry.attributes.position.needsUpdate = true;
    }

    prevTime = time;
    renderer.render(scene, camera);
}

// ==================== START ====================
try {
    init();
    animate();
} catch(err) {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:darkred;color:white;padding:15px;z-index:99999;font:14px monospace;white-space:pre-wrap;';
    div.textContent = 'ОШИБКА: ' + err.message + '\n' + (err.stack || '');
    document.body.appendChild(div);
}
