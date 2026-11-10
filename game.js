
function playWaterStreamSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
        var bufferSize = ctx.sampleRate * 1.5;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        var noise = ctx.createBufferSource();
        noise.buffer = buffer;
        var filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.45);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 1.5);
    } catch (e) {}
}

function playToiletFlushSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gClick = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.05);
        gClick.gain.setValueAtTime(0.3, now);
        gClick.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gClick);
        gClick.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);

        var bufferSize = ctx.sampleRate * 2.2;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.2;
        }
        var noise = ctx.createBufferSource();
        noise.buffer = buffer;
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.linearRampToValueAtTime(850, now + 0.6);
        filter.frequency.exponentialRampToValueAtTime(250, now + 2.1);
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now + 0.05);
        noise.stop(now + 2.2);
    } catch (e) {}
}

function playDoorOpenSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.35);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
}

﻿// ==================== ERROR HANDLER ====================
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
    bathroomDoorOpen: false,
    bathroomDoorGroup: null,
    bathroomDoorMesh: null,
    bathroomDoorCollider: null,
    bathroomLight: null,
    tubWaterRunning: false,
    tubStreamGroup: null,
    tubSplashRing: null,
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

    if (sleepText) sleepText.textContent = 'Сон...';
    if (subtext) subtext.textContent = 'Глубокий сон...';

    setTimeout(function() {
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
    gameState.doorOpen = false;
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
    gameState.bathroomDoorOpen = false;
    gameState.bathroomDoorGroup = null;
    gameState.bathroomDoorMesh = null;
    gameState.bathroomDoorCollider = null;
    gameState.bathroomLight = null;
    gameState.tubWaterRunning = false;
    gameState.tubStreamGroup = null;
    gameState.tubSplashRing = null;
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
            camera.position.set(2.6, 0.8, -1.4);
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
            camera.position.set(2.6, 0.8, -1.4);
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
            camera.position.set(0.0, 1.6, 1.2);
            camera.lookAt(-2.4, 1.2, 1.2);
            showThought('Я вернулся домой с покупками. Нужно открыть холодильник и разложить продукты по полкам.');
            setObjective('Открой холодильник и разложи продукты по полкам');
            updateFridgePrompt();
        });
    }
}


var cachedBathFloorTex = null;
function getBathroomFloorTexture() {
    if (cachedBathFloorTex) return cachedBathFloorTex;
    cachedBathFloorTex = createProceduralTexture(512, 512, function(ctx, w, h) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 0, w, h);
        var tileSize = 64;
        for (var y = 0; y < h; y += tileSize) {
            for (var x = 0; x < w; x += tileSize) {
                var isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                ctx.fillStyle = isAlt ? '#cbd5e1' : '#f1f5f9';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                // Subtle ceramic gloss sheen
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(x + 4, y + 4, tileSize - 8, 8);
            }
        }
    });
    cachedBathFloorTex.wrapS = THREE.RepeatWrapping;
    cachedBathFloorTex.wrapT = THREE.RepeatWrapping;
    cachedBathFloorTex.repeat.set(4, 4);
    return cachedBathFloorTex;
}

var cachedBathWallTex = null;
function getBathroomWallTexture() {
    if (cachedBathWallTex) return cachedBathWallTex;
    cachedBathWallTex = createProceduralTexture(512, 512, function(ctx, w, h) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 0, w, h);
        var tileW = 64;
        var tileH = 32;
        var row = 0;
        for (var y = 0; y < h; y += tileH) {
            var xOffset = (row % 2 === 0) ? 0 : tileW / 2;
            for (var x = -tileW; x < w + tileW; x += tileW) {
                var rx = x + xOffset;
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(rx + 2, y + 2, tileW - 4, tileH - 4);
                // Gentle cyan glaze accent
                ctx.fillStyle = 'rgba(207, 250, 254, 0.45)';
                ctx.fillRect(rx + 2, y + 2, tileW - 4, tileH - 4);
                // Highlight bevel
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                ctx.fillRect(rx + 3, y + 3, tileW - 6, 4);
            }
            row++;
        }
    });
    cachedBathWallTex.wrapS = THREE.RepeatWrapping;
    cachedBathWallTex.wrapT = THREE.RepeatWrapping;
    cachedBathWallTex.repeat.set(4, 3);
    return cachedBathWallTex;
}

var cachedMirrorTex = null;
function getBathroomMirrorTexture() {
    if (cachedMirrorTex) return cachedMirrorTex;
    cachedMirrorTex = createProceduralTexture(512, 512, function(ctx, w, h) {
        var grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#94a3b8');
        grad.addColorStop(0.3, '#cbd5e1');
        grad.addColorStop(0.6, '#e2e8f0');
        grad.addColorStop(1, '#64748b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Reflection light sheen diagonal
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(w * 0.2, 0);
        ctx.lineTo(w * 0.4, 0);
        ctx.lineTo(w * 0.1, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 0);
        ctx.lineTo(w * 0.75, 0);
        ctx.lineTo(w * 0.35, h);
        ctx.lineTo(w * 0.1, h);
        ctx.closePath();
        ctx.fill();

        // Subtle misted frame edge
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, w - 8, h - 8);
    });
    return cachedMirrorTex;
}

// ==================== BUILD: APARTMENT ====================
function buildApartment(isReturn) {
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.Fog(0x020202, 0.5, 8);

    var tl = new THREE.TextureLoader();
    var wallTex = tl.load(WALLPAPER_B64);
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(4, 1.5);

    var wallMat = new THREE.MeshLambertMaterial({ color: 0x888888, map: wallTex });
    var floorMat = makeMat(0x3d352b);
    var ceilMat = makeMat(0x1a1a1a);
    var woodMat = makeMat(0x5c4033);
    var whiteMat = makeMat(0xa0a0a0);
    var darkMat = makeMat(0x111111);
    var pillowMat = makeMat(0xd4c8a0);

    // ==================== MAIN ROOM: EXPANDED FLOOR & CEILING ====================
    // Main room: x from -3.0 to +3.8 (width 6.8, center x=0.4), z from -3.4 to +3.0 (depth 6.4, center z=-0.2)
    addMesh(new THREE.PlaneGeometry(6.8, 6.4), floorMat, 0.4, 0, -0.2).rotation.x = -Math.PI / 2;
    var c = addMesh(new THREE.PlaneGeometry(6.8, 6.4), ceilMat, 0.4, 3, -0.2);
    c.rotation.x = Math.PI / 2;

    // ==================== MAIN ROOM: WALLS ====================
    // Back wall at z = -3.4 (with window at x = 0.4)
    addMesh(new THREE.PlaneGeometry(1.9, 3), wallMat, -2.05, 1.5, -3.4);
    addMesh(new THREE.PlaneGeometry(1.9, 3), wallMat, 2.85, 1.5, -3.4);
    addMesh(new THREE.PlaneGeometry(3.0, 0.75), wallMat, 0.4, 0.375, -3.4);
    addMesh(new THREE.PlaneGeometry(3.0, 0.75), wallMat, 0.4, 2.625, -3.4);

    // Front wall at z = 3.0 (with entrance door at x = 0)
    var fwLeft = addMesh(new THREE.PlaneGeometry(2.4, 3), wallMat, -1.8, 1.5, 3.0); fwLeft.rotation.y = Math.PI;
    var fwRight = addMesh(new THREE.PlaneGeometry(3.2, 3), wallMat, 2.2, 1.5, 3.0); fwRight.rotation.y = Math.PI;
    var fwTop = addMesh(new THREE.PlaneGeometry(1.2, 0.8), wallMat, 0, 2.6, 3.0); fwTop.rotation.y = Math.PI;

    // Right wall at x = 3.8
    var rw = addMesh(new THREE.PlaneGeometry(6.4, 3), wallMat, 3.8, 1.5, -0.2);
    rw.rotation.y = -Math.PI / 2;

    // Left dividing wall at x = -3.0 (between main room and bathroom)
    // Bathroom doorway is located at z = -0.05, width 1.0 (z from -0.55 to +0.45)
    // Back segment of left wall (living room side, z: -3.4 to -0.55)
    var lwBack = addMesh(new THREE.PlaneGeometry(2.85, 3), wallMat, -3.0, 1.5, -1.975);
    lwBack.rotation.y = Math.PI / 2;
    // Front segment of left wall (kitchen side, z: +0.45 to +3.0)
    var lwFront = addMesh(new THREE.PlaneGeometry(2.55, 3), wallMat, -3.0, 1.5, 1.725);
    lwFront.rotation.y = Math.PI / 2;
    // Wall header above the bathroom doorway (z: -0.55 to +0.45, y: 2.2 to 3.0)
    var lwTop = addMesh(new THREE.PlaneGeometry(1.0, 0.8), wallMat, -3.0, 2.6, -0.05);
    lwTop.rotation.y = Math.PI / 2;

    // Doorway Frame Trim on main room side
    var trimMat = makeMat(0x4a3222);
    addMesh(new THREE.BoxGeometry(0.04, 2.25, 0.08), trimMat, -2.98, 1.1, -0.55);
    addMesh(new THREE.BoxGeometry(0.04, 2.25, 0.08), trimMat, -2.98, 1.1,  0.45);
    addMesh(new THREE.BoxGeometry(0.04, 0.08, 1.08), trimMat, -2.98, 2.22, -0.05);

    // Solid Colliders for the dividing wall
    colliders.push({ minX: -3.15, maxX: -2.85, minZ: -3.4, maxZ: -0.55 });
    colliders.push({ minX: -3.15, maxX: -2.85, minZ:  0.45, maxZ:  3.0 });

    // ==================== CORRIDOR OUTSIDE ENTRANCE ====================
    var corrWallMat = makeMat(0x556655);
    var corrFloorMat = makeMat(0x444444);
    var corrCeilMat = makeMat(0x222222);
    var cf = addMesh(new THREE.PlaneGeometry(2, 4), corrFloorMat, 0, 0, 5); cf.rotation.x = -Math.PI/2;
    var cc = addMesh(new THREE.PlaneGeometry(2, 4), corrCeilMat, 0, 3, 5); cc.rotation.x = Math.PI/2;
    var cwLeft = addMesh(new THREE.PlaneGeometry(4, 3), corrWallMat, -1, 1.5, 5); cwLeft.rotation.y = Math.PI/2;
    var cwRight = addMesh(new THREE.PlaneGeometry(4, 3), corrWallMat, 1, 1.5, 5); cwRight.rotation.y = -Math.PI/2;
    var cwEnd = addMesh(new THREE.PlaneGeometry(2, 3), corrWallMat, 0, 1.5, 7); cwEnd.rotation.y = Math.PI;
    var corrLight = new THREE.PointLight(0xddddaa, 0.5, 5);
    corrLight.position.set(0, 2.8, 5);
    scene.add(corrLight);

    // ==================== WINDOW & CURTAINS ====================
    var fm = makeMat(0x3e2723);
    addMesh(new THREE.BoxGeometry(3, 0.1, 0.2), fm, 0.4, 2.2, -3.4);
    addMesh(new THREE.BoxGeometry(3, 0.1, 0.2), fm, 0.4, 0.8, -3.4);
    addMesh(new THREE.BoxGeometry(0.1, 1.5, 0.2), fm, -1.05, 1.5, -3.4);
    addMesh(new THREE.BoxGeometry(0.1, 1.5, 0.2), fm, 1.85, 1.5, -3.4);
    addMesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), fm, 0.4, 1.5, -3.4);
    addMesh(new THREE.BoxGeometry(3, 0.1, 0.1), fm, 0.4, 1.5, -3.4);

    var glassMat = new THREE.MeshLambertMaterial({ color: 0x051020, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    var win = addMesh(new THREE.PlaneGeometry(3, 1.5), glassMat, 0.4, 1.5, -3.41);
    win.userData = { name: 'Окно', type: 'window' };
    interactables.push(win);

    // Curtain Rod
    var rodMat = makeMat(0x222222);
    var rod = addMesh(new THREE.CylinderGeometry(0.018, 0.018, 3.4, 8), rodMat, 0.4, 2.28, -3.25);
    rod.rotation.z = Math.PI / 2;
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), rodMat, -1.32, 2.28, -3.25);
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), rodMat,  2.12, 2.28, -3.25);

    var curtainMat = makeMat(0x331e18);
    var leftCurtainGroup = new THREE.Group();
    leftCurtainGroup.position.set(-0.75, 1.5, -3.26);
    scene.add(leftCurtainGroup);
    addMesh(new THREE.BoxGeometry(0.55, 1.55, 0.06), curtainMat, 0, 0, 0, leftCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat, -0.15, 0, 0.02, leftCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat,  0.15, 0, 0.02, leftCurtainGroup);

    var rightCurtainGroup = new THREE.Group();
    rightCurtainGroup.position.set(1.55, 1.5, -3.26);
    scene.add(rightCurtainGroup);
    addMesh(new THREE.BoxGeometry(0.55, 1.55, 0.06), curtainMat, 0, 0, 0, rightCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat, -0.15, 0, 0.02, rightCurtainGroup);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), curtainMat,  0.15, 0, 0.02, rightCurtainGroup);

    var curtainHitbox = addMesh(new THREE.BoxGeometry(3.1, 1.6, 0.25), new THREE.MeshBasicMaterial({ visible: false }), 0.4, 1.5, -3.24);
    curtainHitbox.userData = { name: 'Шторы', type: 'curtains' };
    interactables.push(curtainHitbox);

    gameState.leftCurtainGroup = leftCurtainGroup;
    gameState.rightCurtainGroup = rightCurtainGroup;
    gameState.curtainsMesh = curtainHitbox;
    gameState.curtainsClosed = false;

    // ==================== ENTRANCE DOOR ====================
    var doorGroup = new THREE.Group();
    doorGroup.position.set(0.6, 0, 2.99);
    scene.add(doorGroup);
    var doorMesh = addMesh(new THREE.BoxGeometry(1.2, 2.2, 0.08), makeMat(0x302010), -0.6, 1.1, 0, doorGroup);

    var knobMat = makeMat(0xaaaaaa);
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), knobMat, -1.05, 1.0, 0.06, doorGroup);
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), knobMat, -1.05, 1.0, -0.06, doorGroup);

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

    // ==================== BED & NIGHTSTAND ====================
    var bedMesh = addMesh(new THREE.BoxGeometry(2, 0.5, 4), darkMat, 2.6, 0.25, -1.4);
    addMesh(new THREE.BoxGeometry(0.7, 0.15, 0.5), pillowMat, 2.6, 0.58, -3.0);
    bedMesh.userData = { name: 'Кровать (Спать)', type: 'bed' };
    interactables.push(bedMesh);
    gameState.apartmentBedMesh = bedMesh;
    colliders.push({ minX: 1.6, maxX: 3.6, minZ: -3.4, maxZ: 0.6 });

    // Nightstand beside bed
    var ns = new THREE.Group();
    ns.position.set(1.2, 0, -3.0);
    scene.add(ns);
    addMesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), woodMat, 0, 0.3, 0, ns);

    var drawerGroup = new THREE.Group();
    drawerGroup.position.set(0, 0.45, 0.1);
    ns.add(drawerGroup);
    addMesh(new THREE.BoxGeometry(0.74, 0.04, 0.7), woodMat, 0, -0.11, 0, drawerGroup);
    var dFront = addMesh(new THREE.BoxGeometry(0.76, 0.26, 0.04), woodMat, 0, 0, 0.35, drawerGroup);
    var flMesh = addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), makeMat(0x222222), 0, -0.05, 0.05, drawerGroup);
    flMesh.rotation.x = Math.PI / 2;
    dFront.userData = { name: 'Тумбочка (ящик)', type: 'nightstand', drawerGroup: drawerGroup, flashMesh: flMesh, isOpen: false, animating: false };
    interactables.push(dFront);
    colliders.push({ minX: 0.8, maxX: 1.6, minZ: -3.4, maxZ: -2.5 });

    // Key on nightstand (chapter 1)
    if (!isReturn) {
        var keyGroup = new THREE.Group();
        keyGroup.position.set(1.2, 0.61, -3.0);
        keyGroup.rotation.x = Math.PI / 2;
        keyGroup.rotation.z = Math.PI / 4;
        scene.add(keyGroup);
        var keyMat = makeMat(0x8a6a3a);
        var bow = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 8, 16), keyMat);
        bow.position.set(0, 0.07, 0); keyGroup.add(bow);
        var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8), keyMat);
        shaft.position.set(0, 0, 0); keyGroup.add(shaft);
        var bit1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.01), keyMat);
        bit1.position.set(0.02, -0.04, 0); keyGroup.add(bit1);
        var bit2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.01), keyMat);
        bit2.position.set(0.015, -0.01, 0); keyGroup.add(bit2);
        var keyHitbox = addMesh(new THREE.BoxGeometry(0.2, 0.1, 0.2), new THREE.MeshBasicMaterial({visible: false}), 0, 0, 0, keyGroup);
        keyHitbox.userData = { name: 'Ржавый ключ', type: 'key', group: keyGroup };
        interactables.push(keyHitbox);
    }

    // ==================== TV & TV STAND ====================
    addMesh(new THREE.BoxGeometry(1.5, 0.8, 0.8), woodMat, -2.25, 0.4, -2.7);
    addMesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), darkMat, -2.25, 1.1, -2.7);
    var tvTex = tl.load(NEWS_B64);
    var tvMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    var tvScreen = addMesh(new THREE.PlaneGeometry(0.65, 0.45), tvMat, -2.25, 1.1, -2.39);
    tvScreen.userData = { name: 'Старый телевизор', type: 'tv', mat: tvMat, tex: tvTex };
    interactables.push(tvScreen);
    gameState.tvScreenMesh = tvScreen;

    var wg = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8),
        new THREE.MeshLambertMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 }),
        -1.8, 0.875, -2.7);
    wg.userData = { name: 'Стакан с водой', type: 'water' };
    interactables.push(wg);
    colliders.push({ minX: -3.0, maxX: -1.5, minZ: -3.3, maxZ: -2.2 });

    // ==================== COFFEE TABLE (ЖУРНАЛЬНЫЙ СТОЛИК) ====================
    var coffeeMat = makeMat(0x4a3222);
    var coffeeTopMat = makeMat(0x6b4a33);
    var ctGroup = new THREE.Group();
    ctGroup.position.set(-2.0, 0, -2.05);
    scene.add(ctGroup);
    addMesh(new THREE.BoxGeometry(0.9, 0.04, 0.5), coffeeTopMat, 0, 0.42, 0, ctGroup);
    var ctLeg = new THREE.BoxGeometry(0.04, 0.40, 0.04);
    addMesh(ctLeg, coffeeMat, -0.38, 0.20, -0.20, ctGroup);
    addMesh(ctLeg, coffeeMat,  0.38, 0.20, -0.20, ctGroup);
    addMesh(ctLeg, coffeeMat, -0.38, 0.20,  0.20, ctGroup);
    addMesh(ctLeg, coffeeMat,  0.38, 0.20,  0.20, ctGroup);
    // Magazine on coffee table
    addMesh(new THREE.BoxGeometry(0.24, 0.015, 0.32), makeMat(0xd97706), 0.05, 0.45, 0, ctGroup);
    colliders.push({ minX: -2.5, maxX: -1.5, minZ: -2.32, maxZ: -1.78 });

    // ==================== SOFA ====================
    var sofaMat = makeMat(0x666666);
    var sofaGroup = new THREE.Group();
    sofaGroup.position.set(-2.0, 0, -1.4);
    sofaGroup.rotation.y = Math.PI; // faces TV (-z)
    scene.add(sofaGroup);

    var sofaSeat = addMesh(new THREE.BoxGeometry(2.0, 0.28, 0.85), sofaMat, 0, 0.32, 0, sofaGroup);
    sofaSeat.userData = { name: isSitting ? 'Встать [F]' : 'Диван', type: 'sofa' };
    interactables.push(sofaSeat);
    addMesh(new THREE.BoxGeometry(2.0, 0.6, 0.14), sofaMat, 0, 0.76, -0.38, sofaGroup);
    var cushionMat = makeMat(0x555555);
    addMesh(new THREE.BoxGeometry(0.92, 0.14, 0.78), cushionMat, -0.5, 0.48, 0, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.92, 0.14, 0.78), cushionMat,  0.5, 0.48, 0, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.88, 0.46, 0.1), cushionMat, -0.5, 0.72, -0.32, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.88, 0.46, 0.1), cushionMat,  0.5, 0.72, -0.32, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.16, 0.42, 0.85), sofaMat, -0.92, 0.39, 0, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.16, 0.42, 0.85), sofaMat,  0.92, 0.39, 0, sofaGroup);
    var legMat = makeMat(0x2a1a0a);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat, -0.85, 0.1,  0.35, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat,  0.85, 0.1,  0.35, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat, -0.85, 0.1, -0.35, sofaGroup);
    addMesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), legMat,  0.85, 0.1, -0.35, sofaGroup);
    colliders.push({ minX: -3.0, maxX: -1.0, minZ: -1.85, maxZ: -0.95 });

    // ==================== DOOR TO BATHROOM (BETWEEN SOFA & KITCHEN TABLE) ====================
    var bDoorGroup = new THREE.Group();
    bDoorGroup.position.set(-3.0, 0, 0.45); // hinge at x=-3.0, z=0.45
    scene.add(bDoorGroup);

    var bDoorMesh = addMesh(new THREE.BoxGeometry(0.05, 2.15, 0.96), makeMat(0xe8e2d8), -0.025, 1.08, -0.48, bDoorGroup);
    // Door handles on both sides
    var bKnobMat = makeMat(0xcccccc);
    addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8), bKnobMat, -0.025, 1.02, -0.88, bDoorGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.025, 0.10), bKnobMat, 0.03, 1.02, -0.85, bDoorGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.025, 0.10), bKnobMat, -0.08, 1.02, -0.85, bDoorGroup);

    // Hitbox for bathroom door
    var bDoorHitbox = addMesh(new THREE.BoxGeometry(0.3, 2.2, 1.05), new THREE.MeshBasicMaterial({ visible: false }), -0.025, 1.08, -0.48, bDoorGroup);
    bDoorHitbox.userData = { name: 'Дверь в ванную [F]', type: 'bathroom_door', hingeGroup: bDoorGroup, isOpen: false, animating: false };
    interactables.push(bDoorHitbox);

    gameState.bathroomDoorOpen = false;
    gameState.bathroomDoorGroup = bDoorGroup;
    gameState.bathroomDoorMesh = bDoorMesh;
    // Initial closed door collider
    var bDoorCol = { minX: -3.15, maxX: -2.85, minZ: -0.55, maxZ: 0.45 };
    colliders.push(bDoorCol);
    gameState.bathroomDoorCollider = bDoorCol;

    // ==================== KITCHEN TABLE (СТОЛИК) ====================
    var tableGroup = new THREE.Group();
    tableGroup.position.set(-2.4, 0, 1.2);
    scene.add(tableGroup);
    var tableBaseMat = makeMat(0x3d2817);
    var tableTopMat = makeMat(0xdedad2);
    var tableLegMat = makeMat(0x2d1a0e);
    addMesh(new THREE.BoxGeometry(0.85, 0.05, 0.75), tableTopMat, 0, 0.85, 0, tableGroup);
    addMesh(new THREE.BoxGeometry(0.75, 0.06, 0.65), tableBaseMat, 0, 0.80, 0, tableGroup);
    var legGeo = new THREE.BoxGeometry(0.05, 0.82, 0.05);
    addMesh(legGeo, tableLegMat, -0.34, 0.41, -0.29, tableGroup);
    addMesh(legGeo, tableLegMat,  0.34, 0.41, -0.29, tableGroup);
    addMesh(legGeo, tableLegMat, -0.34, 0.41,  0.29, tableGroup);
    addMesh(legGeo, tableLegMat,  0.34, 0.41,  0.29, tableGroup);
    colliders.push({ minX: -2.85, maxX: -1.95, minZ: 0.80, maxZ: 1.60 });
    gameState.apartmentTableGroup = tableGroup;

    // ==================== KITCHEN STOVE ====================
    var stoveGroup = new THREE.Group();
    stoveGroup.position.set(-2.55, 0, 2.05);
    scene.add(stoveGroup);
    var whiteEnamel = makeMat(0xf0ede6);
    var darkMetal = makeMat(0x1a1a1a);
    var ovenGlass = makeMat(0x111827);
    var knobMat = makeMat(0x334155);
    var chromeMat = makeMat(0xaaaaaa);

    addMesh(new THREE.BoxGeometry(0.65, 0.84, 0.65), whiteEnamel, 0, 0.42, 0, stoveGroup);
    addMesh(new THREE.BoxGeometry(0.55, 0.48, 0.03), darkMetal, 0, 0.32, 0.33, stoveGroup);
    addMesh(new THREE.BoxGeometry(0.42, 0.32, 0.04), ovenGlass, 0, 0.32, 0.33, stoveGroup);
    addMesh(new THREE.BoxGeometry(0.46, 0.03, 0.04), chromeMat, 0, 0.52, 0.36, stoveGroup);
    addMesh(new THREE.BoxGeometry(0.58, 0.12, 0.03), whiteEnamel, 0, 0.72, 0.33, stoveGroup);
    for (var k = 0; k < 4; k++) {
        var kx = -0.21 + k * 0.14;
        var knob = addMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 8), knobMat, kx, 0.72, 0.34, stoveGroup);
        knob.rotation.x = Math.PI / 2;
    }
    addMesh(new THREE.BoxGeometry(0.67, 0.04, 0.67), whiteEnamel, 0, 0.86, 0, stoveGroup);
    addMesh(new THREE.BoxGeometry(0.67, 0.10, 0.03), whiteEnamel, 0, 0.91, -0.32, stoveGroup);

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

    var glowMat = new THREE.MeshBasicMaterial({ color: 0xff3b10, visible: false });
    var burnerGlow = addMesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16), glowMat, 0.16, 0.895, 0.14, stoveGroup);
    burnerGlow.rotation.x = Math.PI / 2;

    var stoveLight = new THREE.PointLight(0xff4500, 0, 2.0);
    stoveLight.position.set(0.16, 1.0, 0.14);
    stoveGroup.add(stoveLight);

    var panGroup = new THREE.Group();
    panGroup.position.set(0.16, 0.895, 0.14);
    stoveGroup.add(panGroup);
    var panMat = makeMat(0x2a2a2a);
    addMesh(new THREE.CylinderGeometry(0.10, 0.085, 0.035, 16), panMat, 0, 0.018, 0, panGroup);
    var panHandle = addMesh(new THREE.BoxGeometry(0.025, 0.018, 0.14), makeMat(0x111111), 0, 0.03, 0.14, panGroup);
    panHandle.rotation.x = -Math.PI / 18;

    var foodMat = makeMat(0xb91c1c);
    var sausage1 = addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.10, 8), foodMat, -0.03, 0.025, 0, panGroup);
    sausage1.rotation.z = Math.PI / 2;
    var sausage2 = addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.10, 8), foodMat, 0.03, 0.025, 0, panGroup);
    sausage2.rotation.z = Math.PI / 2;

    var stoveHitbox = addMesh(new THREE.BoxGeometry(0.75, 1.0, 0.75), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.5, 0, stoveGroup);
    stoveHitbox.userData = { name: 'Плита (Приготовить еду)', type: 'stove' };
    interactables.push(stoveHitbox);
    colliders.push({ minX: -2.95, maxX: -2.15, minZ: 1.72, maxZ: 2.38 });

    gameState.apartmentStoveGroup = stoveGroup;
    gameState.apartmentStoveMesh = stoveHitbox;
    gameState.stoveGlow = burnerGlow;
    gameState.stoveLight = stoveLight;
    gameState.stovePanGroup = panGroup;

    // ==================== KITCHEN FRIDGE ====================
    var fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(-2.4, 0, 2.7);
    fridgeGroup.rotation.y = Math.PI / 2;
    scene.add(fridgeGroup);

    var fi = makeMat(0xdddddd);
    addMesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), fi, 0, 1.1, -0.55, fridgeGroup);
    addMesh(new THREE.BoxGeometry(0.1, 2.2, 1.0), fi, -0.55, 1.1, 0, fridgeGroup);
    addMesh(new THREE.BoxGeometry(0.1, 2.2, 1.0), fi, 0.55, 1.1, 0, fridgeGroup);
    addMesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), fi, 0, 2.15, 0, fridgeGroup);
    addMesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), fi, 0, 0.05, 0, fridgeGroup);
    var shelfMat = new THREE.MeshLambertMaterial({ color: 0xaaaacc, transparent: true, opacity: 0.7 });
    addMesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), shelfMat, 0, 0.6, 0, fridgeGroup);
    addMesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), shelfMat, 0, 1.2, 0, fridgeGroup);
    addMesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), shelfMat, 0, 1.8, 0, fridgeGroup);
    addMesh(new THREE.SphereGeometry(0.07, 8, 8), makeMat(0xcc2222), 0.15, 1.3, 0.1, fridgeGroup);

    var fDoorGroup = new THREE.Group();
    fDoorGroup.position.set(0.6, 0, 0.5);
    fridgeGroup.add(fDoorGroup);
    var fDoor = addMesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), whiteMat, -0.6, 1.1, 0.05, fDoorGroup);
    fDoor.userData = { name: 'Холодильник', type: 'fridge', hingeGroup: fDoorGroup, isOpen: false, animating: false };
    interactables.push(fDoor);
    gameState.apartmentFridgeGroup = fridgeGroup;
    gameState.apartmentFridgeDoor = fDoor;
    colliders.push({ minX: -2.95, maxX: -1.8, minZ: 2.35, maxZ: 3.0 });

    // ==================== BATHROOM ROOM (ВАННАЯ КОМНАТА) ====================
    var bathFloorMat = new THREE.MeshLambertMaterial({ map: getBathroomFloorTexture() });
    var bathWallMat = new THREE.MeshLambertMaterial({ map: getBathroomWallTexture() });
    var bathCeilMat = makeMat(0xf1f5f9);

    // Floor & Ceiling (x: -6.0 to -3.0, z: -0.6 to +2.2)
    var bFloor = addMesh(new THREE.PlaneGeometry(3.0, 2.8), bathFloorMat, -4.5, 0.005, 0.8);
    bFloor.rotation.x = -Math.PI / 2;
    var bCeil = addMesh(new THREE.PlaneGeometry(3.0, 2.8), bathCeilMat, -4.5, 2.995, 0.8);
    bCeil.rotation.x = Math.PI / 2;

    // Far Left Wall at x = -6.0
    var bwLeft = addMesh(new THREE.PlaneGeometry(2.8, 3), bathWallMat, -6.0, 1.5, 0.8);
    bwLeft.rotation.y = Math.PI / 2;
    // Back Wall at z = -0.6
    addMesh(new THREE.PlaneGeometry(3.0, 3), bathWallMat, -4.5, 1.5, -0.6);
    // Front Wall at z = 2.2
    var bwFront = addMesh(new THREE.PlaneGeometry(3.0, 3), bathWallMat, -4.5, 1.5, 2.2);
    bwFront.rotation.y = Math.PI;
    // Dividing Wall (bathroom interior side at x = -3.0)
    var bwDivFront = addMesh(new THREE.PlaneGeometry(1.75, 3), bathWallMat, -3.0, 1.5, 1.325);
    bwDivFront.rotation.y = -Math.PI / 2;
    var bwDivTop = addMesh(new THREE.PlaneGeometry(1.0, 0.8), bathWallMat, -3.0, 2.6, -0.05);
    bwDivTop.rotation.y = -Math.PI / 2;

    // Bathroom Lighting
    var bathLight = new THREE.PointLight(0xfff7ed, 0.85, 7);
    bathLight.position.set(-4.5, 2.75, 0.8);
    scene.add(bathLight);
    gameState.bathroomLight = bathLight;

    // Soft Bath Mat in front of bathtub
    var matMat = makeMat(0x1e3a8a);
    var bathMatMesh = addMesh(new THREE.PlaneGeometry(0.9, 0.55), matMat, -4.5, 0.01, 1.3);
    bathMatMesh.rotation.x = -Math.PI / 2;

    // Heated Towel Rail (Полотенцесушитель) on wall x = -3.05
    var towelRailMat = makeMat(0xdddddd);
    var towelBlueMat = makeMat(0x0284c7);
    var towelWhiteMat = makeMat(0xf8fafc);
    var railGroup = new THREE.Group();
    railGroup.position.set(-3.05, 1.35, 1.3);
    scene.add(railGroup);
    // S-curve chrome bars
    addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.9, 8), towelRailMat, 0, 0, 0, railGroup);
    addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.45, 8), towelRailMat, -0.05, 0.35, 0, railGroup).rotation.z = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.45, 8), towelRailMat, -0.05, 0.0, 0, railGroup).rotation.z = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.45, 8), towelRailMat, -0.05, -0.35, 0, railGroup).rotation.z = Math.PI / 2;
    // Folded towels hanging
    addMesh(new THREE.BoxGeometry(0.04, 0.38, 0.28), towelBlueMat, -0.06, 0.18, 0, railGroup);
    addMesh(new THREE.BoxGeometry(0.04, 0.32, 0.24), towelWhiteMat, -0.06, -0.18, 0, railGroup);

    // ==================== 1. ULTRA-REALISTIC BATHTUB (ВАННАЯ КОМНАТА) ====================
    var tubGroup = new THREE.Group();
    tubGroup.position.set(-5.58, 0, 1.30);
    scene.add(tubGroup);

    // High-specular materials for realistic porcelain, chrome, and water
    var porcelainMat = new THREE.MeshPhongMaterial({ color: 0xfcfcfc, specular: 0xffffff, shininess: 95 });
    var porcelainInnerMat = new THREE.MeshPhongMaterial({ color: 0xf4f7f6, specular: 0xffffff, shininess: 85 });
    var tubChromeMat = new THREE.MeshPhongMaterial({ color: 0xe0e0e0, specular: 0xffffff, shininess: 120 });
    var tubWaterMat = new THREE.MeshPhongMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.70, specular: 0xffffff, shininess: 110 });
    var tubFoamMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, specular: 0xffffff, shininess: 80 });
    var rubberMat = makeMat(0x1e293b);
    var teakMat = makeMat(0x854d0e);
    var darkPlinthMat = makeMat(0x334155);

    // 1.1 Tiled Front Apron & Recessed Toe Kick Plinth (Экран под ванну и цоколь)
    // Recessed toe-kick plinth (allows standing close to tub)
    addMesh(new THREE.BoxGeometry(0.04, 0.08, 1.70), darkPlinthMat, 0.36, 0.04, 0, tubGroup);
    // Main front apron (smooth ceramic/acrylic finish with subtle grout lines)
    addMesh(new THREE.BoxGeometry(0.04, 0.50, 1.70), porcelainMat, 0.38, 0.33, 0, tubGroup);

    // Inspection Service Hatch (Сантехнический люк для доступа к сифону)
    var hatchFrame = addMesh(new THREE.BoxGeometry(0.015, 0.32, 0.32), tubChromeMat, 0.405, 0.28, 0.58, tubGroup);
    addMesh(new THREE.BoxGeometry(0.01, 0.29, 0.29), makeMat(0xe2e8f0), 0.405, 0.28, 0.58, tubGroup);
    // Chrome pull handle for hatch
    addMesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8), tubChromeMat, 0.415, 0.28, 0.68, tubGroup);

    // 1.2 Sanitary Silicone Sealant Bead along the Tile Walls (Белый водостойкий шов)
    var sealantMat = makeMat(0xf8fafc);
    var sealWall = addMesh(new THREE.CylinderGeometry(0.008, 0.008, 1.70, 8), sealantMat, -0.41, 0.61, 0, tubGroup);
    sealWall.rotation.x = Math.PI / 2;
    var sealBack = addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.82, 8), sealantMat, 0, 0.61, -0.84, tubGroup);
    sealBack.rotation.z = Math.PI / 2;

    // 1.3 Contoured Rims (Широкие закруглённые бортики)
    // Wall side rim (left)
    addMesh(new THREE.BoxGeometry(0.12, 0.04, 1.70), porcelainMat, -0.35, 0.59, 0, tubGroup);
    // Outer side rim with rounded lip (right)
    addMesh(new THREE.BoxGeometry(0.12, 0.04, 1.70), porcelainMat, 0.35, 0.59, 0, tubGroup);
    var rollLip = addMesh(new THREE.CylinderGeometry(0.025, 0.025, 1.70, 12, 1, false, 0, Math.PI), porcelainMat, 0.40, 0.58, 0, tubGroup);
    rollLip.rotation.x = Math.PI / 2;
    // Foot end rim (wide front ledge)
    addMesh(new THREE.BoxGeometry(0.80, 0.04, 0.14), porcelainMat, 0, 0.59, 0.78, tubGroup);
    // Head end rim (ergonomic back ledge)
    addMesh(new THREE.BoxGeometry(0.80, 0.04, 0.14), porcelainMat, 0, 0.59, -0.78, tubGroup);
    // Outer end panels
    addMesh(new THREE.BoxGeometry(0.80, 0.58, 0.04), porcelainMat, 0, 0.29, -0.83, tubGroup);
    addMesh(new THREE.BoxGeometry(0.80, 0.58, 0.04), porcelainMat, 0, 0.29,  0.83, tubGroup);

    // 1.4 HOLLOW Inner Basin with Ergonomic Sloped Backrest (Глубокая чаша с анатомическим наклоном)
    // Flat bottom basin with slight slope
    addMesh(new THREE.BoxGeometry(0.56, 0.03, 1.10), porcelainInnerMat, 0, 0.14, 0.16, tubGroup);
    // Sloped ergonomic backrest (comfortable 38-degree reclining surface)
    var backrest = addMesh(new THREE.BoxGeometry(0.56, 0.03, 0.54), porcelainInnerMat, 0, 0.36, -0.52, tubGroup);
    backrest.rotation.x = -Math.PI * 0.23;
    // Foot end vertical inner wall
    addMesh(new THREE.BoxGeometry(0.56, 0.45, 0.03), porcelainInnerMat, 0, 0.36, 0.72, tubGroup);
    // Inner side walls (slanted inwards towards floor)
    var leftInnerWall = addMesh(new THREE.BoxGeometry(0.03, 0.46, 1.48), porcelainInnerMat, -0.28, 0.37, 0.02, tubGroup);
    leftInnerWall.rotation.z = -0.12;
    var rightInnerWall = addMesh(new THREE.BoxGeometry(0.03, 0.46, 1.48), porcelainInnerMat, 0.28, 0.37, 0.02, tubGroup);
    rightInnerWall.rotation.z = 0.12;

    // 1.5 Chrome Drain & Overflow with Plug and Ball Chain (Слив-перелив и пробка на цепочке)
    // Chrome drain ring
    addMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.015, 16), tubChromeMat, 0, 0.142, 0.55, tubGroup);
    addMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 16), makeMat(0x0f172a), 0, 0.135, 0.55, tubGroup);
    // Chrome cross-bars strainer inside drain
    addMesh(new THREE.BoxGeometry(0.05, 0.008, 0.008), tubChromeMat, 0, 0.146, 0.55, tubGroup);
    addMesh(new THREE.BoxGeometry(0.008, 0.008, 0.05), tubChromeMat, 0, 0.146, 0.55, tubGroup);

    // Chrome overflow plate on foot-end inner wall
    var overPlate = addMesh(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 16), tubChromeMat, 0, 0.48, 0.71, tubGroup);
    overPlate.rotation.x = Math.PI / 2;
    // Overflow slots
    addMesh(new THREE.BoxGeometry(0.04, 0.006, 0.014), makeMat(0x0f172a), 0, 0.48, 0.71, tubGroup);

    // Black rubber plug resting beside drain with chrome ring
    addMesh(new THREE.CylinderGeometry(0.028, 0.022, 0.02, 12), rubberMat, 0.09, 0.15, 0.52, tubGroup);
    addMesh(new THREE.TorusGeometry(0.014, 0.004, 6, 12), tubChromeMat, 0.09, 0.165, 0.52, tubGroup).rotation.x = Math.PI / 2;
    // Ball chain links from overflow eyelet to plug
    for (var cl = 0; cl < 7; cl++) {
        var cRatio = cl / 6;
        var cx = 0.0 + cRatio * 0.09;
        var cy = 0.47 - cRatio * 0.32 - Math.sin(cRatio * Math.PI) * 0.06;
        var cz = 0.70 - cRatio * 0.18;
        addMesh(new THREE.SphereGeometry(0.0045, 6, 6), tubChromeMat, cx, cy, cz, tubGroup);
    }

    // 1.6 Clear Crystal Water Surface with Floating Soap Foam Clusters (Вода с пеной)
    var waterMesh = addMesh(new THREE.PlaneGeometry(0.56, 1.44), tubWaterMat, 0, 0.42, 0.04, tubGroup);
    waterMesh.rotation.x = -Math.PI / 2;
    gameState.tubWaterMesh = waterMesh;

    // Iridescent soap foam bubbles clustered near headrest & edges
    var foamGroup = new THREE.Group();
    foamGroup.position.set(0, 0.425, 0);
    tubGroup.add(foamGroup);
    var bubbleCoords = [
        // Headrest cluster
        { x: -0.16, z: -0.38, r: 0.036 },
        { x: -0.06, z: -0.42, r: 0.044 },
        { x:  0.08, z: -0.40, r: 0.040 },
        { x:  0.18, z: -0.36, r: 0.032 },
        { x: -0.10, z: -0.32, r: 0.030 },
        { x:  0.02, z: -0.30, r: 0.035 },
        // Side clusters
        { x: -0.22, z: -0.10, r: 0.026 },
        { x: -0.20, z:  0.12, r: 0.028 },
        { x:  0.22, z: -0.05, r: 0.025 },
        { x:  0.20, z:  0.20, r: 0.024 },
        { x: -0.12, z:  0.35, r: 0.022 }
    ];
    for (var bi = 0; bi < bubbleCoords.length; bi++) {
        var bc = bubbleCoords[bi];
        var bubble = addMesh(new THREE.SphereGeometry(bc.r, 8, 8), tubFoamMat, bc.x, bc.r * 0.4, bc.z, foamGroup);
        bubble.scale.set(1.2, 0.6, 1.2);
    }

    // 1.7 Heavy Chrome Mixer Tap (Двухвентильный смеситель с длинным поворотным изливом)
    var mixerGroup = new THREE.Group();
    mixerGroup.position.set(0, 0.74, 0.78);
    tubGroup.add(mixerGroup);

    // Two wall escutcheons (круглые отражатели у стены)
    var escL = addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), tubChromeMat, -0.09, 0, 0.08, mixerGroup);
    escL.rotation.x = Math.PI / 2;
    var escR = addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), tubChromeMat,  0.09, 0, 0.08, mixerGroup);
    escR.rotation.x = Math.PI / 2;

    // Hexagonal mixer body
    var mBody = addMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.22, 6), tubChromeMat, 0, 0, 0.02, mixerGroup);
    mBody.rotation.z = Math.PI / 2;

    // Long curved swivel spout (гусак)
    var spoutStem = addMesh(new THREE.CylinderGeometry(0.013, 0.013, 0.16, 12), tubChromeMat, 0, 0, -0.06, mixerGroup);
    spoutStem.rotation.x = Math.PI / 2;
    var spoutTip = addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 12), tubChromeMat, 0, -0.04, -0.14, mixerGroup);
    spoutTip.rotation.x = -Math.PI / 6;
    addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12), tubChromeMat, 0, -0.08, -0.16, mixerGroup);

    // Hot Water Cross-Handle (Вентиль с красным индексом)
    var hotH = new THREE.Group();
    hotH.position.set(-0.09, 0, 0.02);
    mixerGroup.add(hotH);
    addMesh(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8), tubChromeMat, 0, 0, -0.02, hotH).rotation.x = Math.PI / 2;
    addMesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), tubChromeMat, 0, 0, -0.035, hotH);
    addMesh(new THREE.BoxGeometry(0.012, 0.05, 0.012), tubChromeMat, 0, 0, -0.035, hotH);
    addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8), makeMat(0xdc2626), 0, 0, -0.042, hotH).rotation.x = Math.PI / 2;

    // Cold Water Cross-Handle (Вентиль с синим индексом)
    var coldH = new THREE.Group();
    coldH.position.set(0.09, 0, 0.02);
    mixerGroup.add(coldH);
    addMesh(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8), tubChromeMat, 0, 0, -0.02, coldH).rotation.x = Math.PI / 2;
    addMesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), tubChromeMat, 0, 0, -0.035, coldH);
    addMesh(new THREE.BoxGeometry(0.012, 0.05, 0.012), tubChromeMat, 0, 0, -0.035, coldH);
    addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8), makeMat(0x2563eb), 0, 0, -0.042, coldH).rotation.x = Math.PI / 2;

    // Diverter Knob (Кнопка переключателя ванна/душ)
    addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 8), tubChromeMat, 0, 0.03, 0.02, mixerGroup);
    addMesh(new THREE.SphereGeometry(0.012, 8, 8), tubChromeMat, 0, 0.05, 0.02, mixerGroup);

    // 1.8 Flexible Spiral Metal Shower Hose & Shower Wand on Wall Rail (Душевая штанга и шланг)
    var showerRailGroup = new THREE.Group();
    showerRailGroup.position.set(-0.35, 0, 0.78);
    tubGroup.add(showerRailGroup);

    var rMountB = addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), tubChromeMat, 0, 0.85, 0.06, showerRailGroup);
    rMountB.rotation.x = Math.PI / 2;
    var rMountT = addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), tubChromeMat, 0, 2.05, 0.06, showerRailGroup);
    rMountT.rotation.x = Math.PI / 2;

    // Chrome vertical slider bar (штанга)
    addMesh(new THREE.CylinderGeometry(0.013, 0.013, 1.25, 12), tubChromeMat, 0, 1.45, 0.02, showerRailGroup);
    addMesh(new THREE.BoxGeometry(0.04, 0.06, 0.06), tubChromeMat, 0, 1.90, 0.02, showerRailGroup);
    var wandCradle = addMesh(new THREE.CylinderGeometry(0.018, 0.014, 0.05, 8), tubChromeMat, 0.04, 1.90, -0.02, showerRailGroup);
    wandCradle.rotation.x = -Math.PI / 4;

    // Ergonomic Hand Shower Wand (Лейка душа)
    var wandGroup = new THREE.Group();
    wandGroup.position.set(0.04, 1.92, -0.02);
    wandGroup.rotation.x = -Math.PI / 4;
    showerRailGroup.add(wandGroup);
    addMesh(new THREE.CylinderGeometry(0.014, 0.011, 0.18, 12), tubChromeMat, 0, 0.05, 0, wandGroup);
    var wFace = addMesh(new THREE.CylinderGeometry(0.055, 0.048, 0.025, 16), tubChromeMat, 0, 0.16, 0.02, wandGroup);
    wFace.rotation.x = Math.PI / 6;
    addMesh(new THREE.CircleGeometry(0.048, 16), makeMat(0x334155), 0, 0.173, 0.025, wandGroup).rotation.x = -Math.PI / 2.8;

    // Flexible spiral hose hanging down to mixer
    for (var hi = 0; hi < 12; hi++) {
        var hPct = hi / 11;
        var hx = -0.31 + hPct * 0.31;
        var hy = 1.82 - hPct * 1.08 + Math.sin(hPct * Math.PI) * 0.14;
        var hz = 0.76 - Math.sin(hPct * Math.PI) * 0.12;
        addMesh(new THREE.SphereGeometry(0.009, 6, 6), tubChromeMat, hx, hy, hz, tubGroup);
    }

    // 1.9 Overhead Stainless Steel Curtain Rod & Translucent Shower Curtain (Карниз и шторка)
    var rodGroup = new THREE.Group();
    rodGroup.position.set(0, 2.28, 0);
    tubGroup.add(rodGroup);

    var rodLong = addMesh(new THREE.CylinderGeometry(0.016, 0.016, 1.72, 12), tubChromeMat, 0.38, 0, 0, rodGroup);
    rodLong.rotation.x = Math.PI / 2;
    var rodTurn = addMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.80, 12), tubChromeMat, -0.02, 0, -0.84, rodGroup);
    rodTurn.rotation.z = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), tubChromeMat, 0.38, 0, 0.85, rodGroup).rotation.x = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), tubChromeMat, -0.42, 0, -0.84, rodGroup).rotation.z = Math.PI / 2;

    for (var cr = 0; cr < 8; cr++) {
        var rZ = -0.76 + cr * 0.15;
        addMesh(new THREE.TorusGeometry(0.022, 0.004, 6, 12), tubChromeMat, 0.38, -0.025, rZ, rodGroup).rotation.y = Math.PI / 2;
    }

    var curtainMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
    addMesh(new THREE.BoxGeometry(0.08, 1.65, 0.45), curtainMat, 0.37, -0.86, -0.55, rodGroup);
    for (var f = 0; f < 3; f++) {
        var foldZ = -0.70 + f * 0.14;
        addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.62, 8), curtainMat, 0.36 + (f % 2) * 0.02, -0.86, foldZ, rodGroup);
    }

    // 1.10 Slatted Wooden Bath Tray with Spa Cosmetics (Деревянная решётка с принадлежностями)
    var trayGroup = new THREE.Group();
    trayGroup.position.set(0, 0.61, -0.05);
    tubGroup.add(trayGroup);

    addMesh(new THREE.BoxGeometry(0.78, 0.018, 0.045), teakMat, 0, 0, -0.07, trayGroup);
    addMesh(new THREE.BoxGeometry(0.78, 0.018, 0.045), teakMat, 0, 0,  0.00, trayGroup);
    addMesh(new THREE.BoxGeometry(0.78, 0.018, 0.045), teakMat, 0, 0,  0.07, trayGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.015, 0.20), teakMat, -0.32, -0.016, 0, trayGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.015, 0.20), teakMat,  0.32, -0.016, 0, trayGroup);

    // Green Shampoo Bottle with Pump Dispenser
    var shpMat = makeMat(0x0f766e);
    addMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.11, 12), shpMat, -0.12, 0.065, -0.03, trayGroup);
    addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), porcelainMat, -0.12, 0.13, -0.03, trayGroup);
    addMesh(new THREE.BoxGeometry(0.035, 0.01, 0.01), porcelainMat, -0.13, 0.142, -0.03, trayGroup);

    // Amber Shower Gel Bottle
    var gelMat = new THREE.MeshLambertMaterial({ color: 0xd97706, transparent: true, opacity: 0.85 });
    addMesh(new THREE.BoxGeometry(0.038, 0.10, 0.026), gelMat, 0.0, 0.06, -0.02, trayGroup);
    addMesh(new THREE.CylinderGeometry(0.01, 0.01, 0.016, 8), makeMat(0x111827), 0.0, 0.118, -0.02, trayGroup);

    // Yellow Sea Sponge
    var spgMesh = addMesh(new THREE.SphereGeometry(0.032, 8, 8), makeMat(0xfef08a), 0.12, 0.032, 0.02, trayGroup);
    spgMesh.scale.set(1.2, 0.75, 1.0);
    addMesh(new THREE.TorusGeometry(0.015, 0.003, 6, 12), makeMat(0xffffff), 0.16, 0.035, 0.02, trayGroup);

    // Ceramic Soap Dish with Lavender Soap Bar
    addMesh(new THREE.BoxGeometry(0.09, 0.014, 0.065), porcelainMat, -0.22, 0.017, 0.02, trayGroup);
    addMesh(new THREE.BoxGeometry(0.065, 0.018, 0.045), makeMat(0xc084fc), -0.22, 0.032, 0.02, trayGroup);

    // Interactive hitbox for bath tray
    var trayHitbox = addMesh(new THREE.BoxGeometry(0.80, 0.22, 0.26), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.08, 0, trayGroup);
    trayHitbox.userData = { name: 'Подставка с шампунем и мочалкой [F]', type: 'bathroom_tray' };
    interactables.push(trayHitbox);

    // 1.11 Corner 3-Tier Chrome Wire Rack on Wall (Угловая трёхъярусная полочка)
    var caddyGroup = new THREE.Group();
    caddyGroup.position.set(-0.36, 0, 0.76);
    tubGroup.add(caddyGroup);
    addMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.85, 8), tubChromeMat, 0, 1.30, 0, caddyGroup);
    addMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.85, 8), tubChromeMat, -0.04, 1.30, 0.04, caddyGroup);
    for (var tr = 0; tr < 3; tr++) {
        var tY = 0.95 + tr * 0.28;
        addMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 8, 1, false, 0, Math.PI / 2), tubChromeMat, -0.02, tY, 0.02, caddyGroup);
    }
    addMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 6), makeMat(0x0284c7), -0.02, 1.25, 0.02, caddyGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.01, 0.012), tubChromeMat, -0.02, 1.29, 0.02, caddyGroup);
    addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 12), makeMat(0xf472b6), -0.02, 1.54, 0.02, caddyGroup);
    addMesh(new THREE.CylinderGeometry(0.027, 0.027, 0.01, 12), makeMat(0xfacc15), -0.02, 1.565, 0.02, caddyGroup);

    // 1.12 Dynamic Running Water Stream & Splash Effect (Анимированная струя из крана)
    var streamGroup = new THREE.Group();
    streamGroup.position.set(0, 0.55, 0.62);
    tubGroup.add(streamGroup);
    streamGroup.visible = false;

    addMesh(new THREE.CylinderGeometry(0.018, 0.028, 0.26, 12),
        new THREE.MeshPhongMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.72, specular: 0xffffff }),
        0, 0, 0, streamGroup);

    var splashRing = addMesh(new THREE.TorusGeometry(0.065, 0.014, 6, 16),
        new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.85 }),
        0, -0.125, 0, streamGroup);
    splashRing.rotation.x = Math.PI / 2;

    gameState.tubWaterRunning = false;
    gameState.tubStreamGroup = streamGroup;
    gameState.tubSplashRing = splashRing;

    // 1.13 Solid Bathtub Hitbox & Obstacle Collider
    var tubHitbox = addMesh(new THREE.BoxGeometry(0.85, 0.75, 1.72), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.35, 0, tubGroup);
    tubHitbox.userData = { name: 'Ванная (Включить воду) [F]', type: 'bathroom_tub' };
    interactables.push(tubHitbox);
    colliders.push({ minX: -6.0, maxX: -5.05, minZ: 0.44, maxZ: 2.16 });

    // ==================== 2. TOILET (ТУАЛЕТ / УНИТАЗ) ====================
    var wcGroup = new THREE.Group();
    wcGroup.position.set(-4.1, 0, 1.92);
    scene.add(wcGroup);

    var ceramicMat = makeMat(0xf8fafc);
    var seatMat = makeMat(0xe2e8f0);
    // Pedestal base
    addMesh(new THREE.BoxGeometry(0.32, 0.36, 0.44), ceramicMat, 0, 0.18, -0.04, wcGroup);
    // Bowl top
    addMesh(new THREE.CylinderGeometry(0.20, 0.16, 0.16, 16), ceramicMat, 0, 0.36, -0.08, wcGroup);
    // Cistern tank at back wall
    addMesh(new THREE.BoxGeometry(0.44, 0.42, 0.22), ceramicMat, 0, 0.62, 0.16, wcGroup);
    // Cistern lid
    addMesh(new THREE.BoxGeometry(0.46, 0.04, 0.24), ceramicMat, 0, 0.84, 0.16, wcGroup);
    // Dual-flush chrome button on lid
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), chromeMat, 0, 0.87, 0.16, wcGroup);
    // Toilet seat & lid
    addMesh(new THREE.TorusGeometry(0.17, 0.025, 8, 16), seatMat, 0, 0.45, -0.08, wcGroup).rotation.x = Math.PI / 2;
    var wcLid = addMesh(new THREE.BoxGeometry(0.36, 0.025, 0.40), seatMat, 0, 0.48, -0.08, wcGroup);

    // Toilet Paper Holder on adjacent dividing wall (x = -3.1)
    var tpHolderGroup = new THREE.Group();
    tpHolderGroup.position.set(0.95, 0.68, -0.05);
    wcGroup.add(tpHolderGroup);
    addMesh(new THREE.BoxGeometry(0.02, 0.06, 0.16), chromeMat, 0, 0, 0, tpHolderGroup);
    var tpRoll = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), makeMat(0xffffff), -0.06, 0, 0, tpHolderGroup);
    tpRoll.rotation.x = Math.PI / 2;

    var wcHitbox = addMesh(new THREE.BoxGeometry(0.55, 0.9, 0.65), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.45, 0.05, wcGroup);
    wcHitbox.userData = { name: 'Туалет (Смыть) [F]', type: 'bathroom_toilet' };
    interactables.push(wcHitbox);
    colliders.push({ minX: -4.45, maxX: -3.75, minZ: 1.62, maxZ: 2.18 });

    // ==================== 3. SINK WITH MIRROR (РАКОВИНА С ЗЕРКАЛОМ) ====================
    var sinkGroup = new THREE.Group();
    sinkGroup.position.set(-4.6, 0, -0.38);
    scene.add(sinkGroup);

    var vanityMat = makeMat(0xf1f5f9);
    // Vanity base cabinet
    addMesh(new THREE.BoxGeometry(0.74, 0.78, 0.44), vanityMat, 0, 0.39, 0, sinkGroup);
    // Cabinet handles
    addMesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 8), chromeMat, -0.16, 0.42, 0.23, sinkGroup);
    addMesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 8), chromeMat,  0.16, 0.42, 0.23, sinkGroup);
    // Washbasin top
    addMesh(new THREE.BoxGeometry(0.78, 0.08, 0.48), ceramicMat, 0, 0.82, 0, sinkGroup);
    // Sink hollow basin
    var basinMat = makeMat(0xe2e8f0);
    addMesh(new THREE.BoxGeometry(0.56, 0.05, 0.32), basinMat, 0, 0.81, 0.02, sinkGroup);
    // Sink drain
    addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 12), makeMat(0x334155), 0, 0.84, 0.02, sinkGroup);
    // Chrome faucet
    var sTapGroup = new THREE.Group();
    sTapGroup.position.set(0, 0.86, -0.14);
    sinkGroup.add(sTapGroup);
    addMesh(new THREE.CylinderGeometry(0.018, 0.022, 0.12, 8), chromeMat, 0, 0.06, 0, sTapGroup);
    var spout = addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.10, 8), chromeMat, 0, 0.12, 0.04, sTapGroup);
    spout.rotation.x = Math.PI / 4;
    addMesh(new THREE.BoxGeometry(0.02, 0.06, 0.015), chromeMat, 0, 0.14, 0, sTapGroup);
    // Soap dish with soap bar
    addMesh(new THREE.BoxGeometry(0.11, 0.018, 0.08), ceramicMat, -0.26, 0.87, -0.06, sinkGroup);
    addMesh(new THREE.BoxGeometry(0.08, 0.022, 0.055), makeMat(0xa7f3d0), -0.26, 0.89, -0.06, sinkGroup);

    var sinkHitbox = addMesh(new THREE.BoxGeometry(0.82, 0.95, 0.52), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.48, 0, sinkGroup);
    sinkHitbox.userData = { name: 'Раковина (Включить воду) [F]', type: 'bathroom_sink' };
    interactables.push(sinkHitbox);
    colliders.push({ minX: -5.05, maxX: -4.15, minZ: -0.60, maxZ: -0.10 });

    // ==================== MIRROR (ЗЕРКАЛО НАД РАКОВИНОЙ) ====================
    var mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(-4.6, 1.58, -0.58);
    scene.add(mirrorGroup);

    var mirrorFrameMat = makeMat(0x3e2723);
    var mirrorGlassMat = new THREE.MeshLambertMaterial({ map: getBathroomMirrorTexture() });
    // Mirror Frame
    addMesh(new THREE.BoxGeometry(0.80, 1.02, 0.04), mirrorFrameMat, 0, 0, 0, mirrorGroup);
    // Mirror Glass Surface
    var mirrorGlass = addMesh(new THREE.PlaneGeometry(0.72, 0.94), mirrorGlassMat, 0, 0, 0.022, mirrorGroup);

    // Vanity Light Fixture (Бра) above the mirror
    var sSconceMat = makeMat(0xdddddd);
    var sGlobeMat = makeMat(0xfef08a);
    addMesh(new THREE.BoxGeometry(0.36, 0.03, 0.08), sSconceMat, 0, 0.58, 0.04, mirrorGroup);
    addMesh(new THREE.SphereGeometry(0.055, 12, 12), sGlobeMat, 0, 0.58, 0.09, mirrorGroup);
    var mirrorLight = new THREE.PointLight(0xffedd5, 0.5, 3.5);
    mirrorLight.position.set(0, 0.58, 0.15);
    mirrorGroup.add(mirrorLight);

    var mirrorHitbox = addMesh(new THREE.BoxGeometry(0.85, 1.05, 0.15), new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0.05, mirrorGroup);
    mirrorHitbox.userData = { name: 'Зеркало [F]', type: 'bathroom_mirror' };
    interactables.push(mirrorHitbox);

    // ==================== LIGHT SWITCH & AMBIENCE ====================
    var switchPlateMat = makeMat(0xdedad2);
    var switchRockerMat = makeMat(0xf0ede6);
    addMesh(new THREE.BoxGeometry(0.12, 0.16, 0.025), switchPlateMat, 0.80, 1.35, 2.98);
    addMesh(new THREE.BoxGeometry(0.06, 0.08, 0.035), switchRockerMat, 0.80, 1.35, 2.965);
    var sw = addMesh(new THREE.BoxGeometry(0.26, 0.30, 0.12), new THREE.MeshBasicMaterial({ visible: false }), 0.80, 1.35, 2.95);
    sw.userData = { name: 'Выключатель', type: 'switch' };
    interactables.push(sw);

    scene.add(new THREE.AmbientLight(0x1a1a1a, 1.0));
    var winLight = new THREE.PointLight(0x4488ff, 1.0, 15);
    winLight.position.set(0.4, 1.5, -2.8);
    scene.add(winLight);
    roomLight = new THREE.PointLight(0xffeedd, 0, 16);
    roomLight.position.set(0.4, 2.9, -0.2);
    scene.add(roomLight);

    // Snow outside window
    addSnow(-22, -3.45, -16, 16, 0, 9.5, 2600, 0.075);

    // Christmas tree in corner
    buildChristmasTree();

    // Chapter-specific setup
    if (isReturn) {
        gameState.lightOn = true;
        roomLight.intensity = 1.0;
        camera.position.set(0, 1.6, 2.0);
        camera.lookAt(0, 1.5, 0);
        setObjective('Закажи пиццу');

        var phone = addMesh(new THREE.BoxGeometry(0.15, 0.02, 0.3), makeMat(0x111111), 1.2, 0.61, -3.0);
        phone.userData = { name: 'Телефон (Заказать пиццу)', type: 'phone' };
        interactables.push(phone);
        gameState.apartmentPhoneMesh = phone;

        chapterUpdate = function() {};
    } else {
        camera.position.set(2.6, 0.8, -1.4);
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
    var phone = addMesh(new THREE.BoxGeometry(0.15, 0.02, 0.3), makeMat(0x111111), 1.2, 0.61, -3.0);
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
        cx.fillText('ЭКСТРЕННОЕ ОПОВЕЩЕНИЕ', w * 0.5 + 20, 104);

        cx.fillStyle = '#f87171';
        cx.font = 'bold 23px sans-serif';
        cx.fillText('В ГОРОДЕ ВВЕДЕН РЕЖИМ ЧС', w * 0.5 + 20, 136);

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
        cx.fillText('СРОЧНО: В ГОРОДЕ ВВЕДЕН РЕЖИМ ЧС • ЛЮДИ НАПАДАЮТ НА ЛЮДЕЙ • НЕ ВЫХОДИТЕ ИЗ ДОМА • ЗАПРИТЕ ДВЕРИ •', 10, 296);

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
        showThought('Диктор: «Внимание! В городе объявлен режим чрезвычайной ситуации! Зафиксированы нападения агрессивных людей друг на друга! Не выходите из дома и будьте осторожны!»');
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
        '<span style="font-size:30px;color:#ef4444;letter-spacing:4px;font-weight:bold;">РЕЖИМ ЧРЕЗВЫЧАЙНОЙ СИТУАЦИИ</span>' +
        '<br><span style="font-size:17px;color:#f59e0b;font-weight:bold;letter-spacing:2px;">КОНЦОВКА ВЫЖИВАНИЯ</span>' +
        '<br><br><div style="font-size:15px;color:#e2e8f0;line-height:1.7;max-width:660px;margin:0 auto;text-align:center;">' +
        'Теперь всё встало на свои места...<br>' +
        'Жуткие ночные тени за окном, вымершие улицы города, внезапное увольнение шефом («не спрашивайте почему»)...<br>' +
        'Это была не просто пятница 13-го — <b>в городе вспыхнула необъяснимая волна безумия!</b><br><br>' +
        '<div style="background:rgba(220, 38, 38, 0.18);border:1px solid #ef4444;border-radius:8px;padding:14px;margin:10px auto;max-width:580px;text-align:left;">' +
        '<b style="color:#f87171;">Экстренное сообщение Гражданской Обороны:</b><br>' +
        '<span style="color:#fef08a;font-size:14px;display:block;margin-top:4px;">' +
        '«Внимание! В городе объявлен режим чрезвычайной ситуации. Люди нападают на людей, не выходите из дома, заприте двери и будьте осторожны!»' +
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
            setObjective('Оставайся дома и выживай (Кровать: лечь спать)');
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
    bagGroup.position.set(-2.4, 0.875, 1.20);
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

// ==================== PROCEDURAL SUPERMARKET TEXTURES ====================
var cachedShopFloorTex = null;
var cachedShopCeilTex = null;
var cachedShopBannerTex = null;
var cachedAisleSignTex = {};
var cachedPromoPosterTex = {};
var cachedPriceRailTex = null;
var cachedWetFloorTex = null;
var cachedProduceScaleTex = null;
var cachedPOSScreenTex = null;

function getSupermarketFloorTexture() {
    if (cachedShopFloorTex) return cachedShopFloorTex;
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext('2d');

    // Polished commercial light grey ceramic supermarket floor
    ctx.fillStyle = '#dde1e3';
    ctx.fillRect(0, 0, 512, 512);

    for (var ty = 0; ty < 4; ty++) {
        for (var tx = 0; tx < 4; tx++) {
            var px = tx * 128;
            var py = ty * 128;
            var tileTone = ((tx * 3 + ty * 7) % 5 === 0) ? '#e4e8ea' : '#d8dedf';
            ctx.fillStyle = tileTone;
            ctx.fillRect(px + 2, py + 2, 124, 124);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            for (var d = 0; d < 50; d++) {
                ctx.fillRect(px + 4 + Math.random() * 118, py + 4 + Math.random() * 118, 2, 2);
            }
            ctx.fillStyle = 'rgba(100, 116, 139, 0.12)';
            for (var d2 = 0; d2 < 40; d2++) {
                ctx.fillRect(px + 4 + Math.random() * 118, py + 4 + Math.random() * 118, 2, 2);
            }

            ctx.strokeStyle = '#b2babc';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px + 1, py + 1, 126, 126);
        }
    }

    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 6);
    cachedShopFloorTex = tex;
    return cachedShopFloorTex;
}

function getSupermarketCeilingTexture() {
    if (cachedShopCeilTex) return cachedShopCeilTex;
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    for (var cy = 0; cy < 4; cy++) {
        for (var cx = 0; cx < 4; cx++) {
            var x0 = cx * 128;
            var y0 = cy * 128;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x0 + 2, y0 + 2, 124, 124);

            ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
            for (var p = 0; p < 70; p++) {
                ctx.fillRect(x0 + 6 + Math.random() * 116, y0 + 6 + Math.random() * 116, 2, 2);
            }

            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 3;
            ctx.strokeRect(x0, y0, 128, 128);
        }
    }

    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 5);
    cachedShopCeilTex = tex;
    return cachedShopCeilTex;
}

function getSupermarketBannerTexture() {
    if (cachedShopBannerTex) return cachedShopBannerTex;
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, '#15803d');
    grad.addColorStop(0.5, '#16a34a');
    grad.addColorStop(1, '#15803d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 1024, 18);
    ctx.fillRect(0, 238, 1024, 18);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 30, 984, 196);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 30, 984, 196);

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(100, 128, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('24', 100, 142);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('СУПЕРМАРКЕТ «ПРОДУКТЫ 24»', 180, 115);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('СВЕЖИЕ ПРОДУКТЫ • НИЗКИЕ ЦЕНЫ • КРУГЛОСУТОЧНО', 185, 165);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.fillText('Добро пожаловать! Приятных покупок!', 185, 200);

    cachedShopBannerTex = new THREE.CanvasTexture(canvas);
    return cachedShopBannerTex;
}

function getAisleSignTexture(num, title1, title2) {
    var key = num + '_' + title1;
    if (cachedAisleSignTex[key]) return cachedAisleSignTex[key];
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, 512, 160);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 152);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(60, 80, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(num), 60, 98);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(title1, 130, 68);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(title2, 130, 110);

    var tex = new THREE.CanvasTexture(canvas);
    cachedAisleSignTex[key] = tex;
    return tex;
}

function getPromoPosterTexture(type) {
    if (cachedPromoPosterTex[type]) return cachedPromoPosterTex[type];
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    var ctx = canvas.getContext('2d');

    if (type === 'sale') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(0, 0, 256, 384);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(10, 10, 236, 70);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('АКЦИЯ!', 128, 60);

        ctx.fillStyle = '#991b1b';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('СКИДКА ДО 30%', 128, 125);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('НА ВСЕ КОНСЕРВЫ', 128, 160);
        ctx.fillText('И КРУПЫ ГОСТ', 128, 185);

        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('-30%', 128, 260);

        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('*Цены указаны с учетом скидки', 128, 330);
        ctx.fillText('Срок акции: до 15 декабря', 128, 350);
    } else if (type === 'warning') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 384);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 0, 256, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ВНИМАНИЕ!', 128, 34);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('РЕЖИМ ГОРОДСКОЙ ТРЕВОГИ', 128, 85);

        ctx.fillStyle = '#334155';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        var lines = [
            'Уважаемые граждане!',
            'В связи со спецрежимом:',
            '1. Магазин закрывается',
            '   строго в 21:30.',
            '2. Отпуск товаров первой',
            '   необходимости: не более',
            '   5 единиц в одни руки.',
            '3. После покупок немедленно',
            '   следуйте домой и',
            '   заприте входные двери.',
            'Штаб Гражданской Обороны'
        ];
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 22, 120 + i * 19);
        }

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.strokeRect(130, 310, 100, 45);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('УТВЕРЖДЕНО', 180, 330);
        ctx.fillText('ШТАБ ГО 2026', 180, 345);
    } else {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, 256, 384);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ИНФОРМАЦИЯ', 128, 35);
        ctx.fillText('ДЛЯ ПОТРЕБИТЕЛЕЙ', 128, 60);

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(15, 80, 105, 120);
        ctx.fillRect(135, 80, 105, 120);
        ctx.fillRect(15, 220, 105, 120);
        ctx.fillRect(135, 220, 105, 120);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('ЛИЦЕНЗИЯ', 67, 130);
        ctx.fillText('ЗАКОН О ЗПП', 187, 130);
        ctx.fillText('ПЛАН ЭВАКУАЦИИ', 67, 270);
        ctx.fillText('КНИГА ОТЗЫВОВ', 187, 270);
    }

    var tex = new THREE.CanvasTexture(canvas);
    cachedPromoPosterTex[type] = tex;
    return tex;
}

function getPriceRailTexture() {
    if (cachedPriceRailTex) return cachedPriceRailTex;
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 32;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 512, 32);

    for (var i = 0; i < 8; i++) {
        var tx = i * 64 + 4;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(tx, 4, 56, 24);

        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(((i * 29 + 35) % 150 + 29) + ' ₽', tx + 4, 18);

        ctx.fillStyle = '#000000';
        for (var b = 0; b < 10; b++) {
            if ((b + i) % 2 === 0) {
                ctx.fillRect(tx + 36 + b * 1.5, 6, 1.2, 14);
            }
        }
    }

    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(4, 1);
    cachedPriceRailTex = tex;
    return cachedPriceRailTex;
}

function getWetFloorSignTexture() {
    if (cachedWetFloorTex) return cachedWetFloorTex;
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 384);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 244, 372);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(128, 50);
    ctx.lineTo(220, 200);
    ctx.lineTo(36, 200);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(128, 95, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(128, 110); ctx.lineTo(120, 145);
    ctx.lineTo(95, 165);
    ctx.moveTo(120, 145); ctx.lineTo(150, 160);
    ctx.lineTo(170, 145);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ОСТОРОЖНО!', 128, 240);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('СКОЛЬЗКИЙ ПОЛ', 128, 270);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CAUTION WET FLOOR', 128, 310);

    cachedWetFloorTex = new THREE.CanvasTexture(canvas);
    return cachedWetFloorTex;
}

function getProduceScaleTexture() {
    if (cachedProduceScaleTex) return cachedProduceScaleTex;
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, 256, 36);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ВЕСЫ САМООБСЛУЖИВАНИЯ', 128, 24);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(15, 50, 226, 60);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('0.000 кг', 128, 94);

    var fruits = [
        { name: '🍎 Яблоки', color: '#ef4444' },
        { name: '🍊 Апельсины', color: '#f97316' },
        { name: '🍌 Бананы', color: '#eab308' },
        { name: '🍋 Лимоны', color: '#84cc16' }
    ];
    for (var fi = 0; fi < 4; fi++) {
        var fx = (fi % 2) * 115 + 15;
        var fy = Math.floor(fi / 2) * 60 + 125;
        ctx.fillStyle = fruits[fi].color;
        ctx.fillRect(fx, fy, 110, 52);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(fruits[fi].name, fx + 55, fy + 32);
    }

    cachedProduceScaleTex = new THREE.CanvasTexture(canvas);
    return cachedProduceScaleTex;
}

function getPOSScreenTexture() {
    if (cachedPOSScreenTex) return cachedPOSScreenTex;
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 192);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 256, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('КАССА № 1 - [СМЕНА 13]', 10, 19);

    ctx.fillStyle = '#334155';
    ctx.fillRect(10, 36, 236, 95);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px monospace';
    ctx.fillText('1. ТУШЕНКА ГОВ. ГОСТ       149.00', 16, 56);
    ctx.fillText('2. ХЛЕБ НАРЕЗНОЙ БАТОН      32.00', 16, 74);
    ctx.fillText('3. МОЛОКО ПАСТ. 3.2%        58.00', 16, 92);
    ctx.fillText('4. ЧАЙ ЧЕРНЫЙ 25 ПАК.       65.00', 16, 110);

    ctx.fillStyle = '#15803d';
    ctx.fillRect(10, 140, 236, 42);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('К ОПЛАТЕ: КАРТОЙ', 16, 167);

    cachedPOSScreenTex = new THREE.CanvasTexture(canvas);
    return cachedPOSScreenTex;
}


// Helper functions for realistic supermarket
function buildSupermarketLighting() {
    // 8 Modular Fluorescent Troffers
    var lightPositions = [
        [-2.4, 3.25, -3.2], [2.4, 3.25, -3.2],
        [-2.4, 3.25, -0.6], [2.4, 3.25, -0.6],
        [-2.4, 3.25,  1.8], [2.4, 3.25,  1.8],
        [-2.4, 3.25,  4.2], [2.4, 3.25,  4.2]
    ];
    var fixtureMat = makeMat(0x64748b);
    var tubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (var li = 0; li < lightPositions.length; li++) {
        var lp = lightPositions[li];
        var trofferGroup = new THREE.Group();
        trofferGroup.position.set(lp[0], lp[1], lp[2]);
        // Housing
        addMesh(new THREE.BoxGeometry(0.85, 0.06, 2.0), fixtureMat, 0, 0, 0, trofferGroup);
        // Diffuser
        var dif = addMesh(new THREE.PlaneGeometry(0.75, 1.9), tubeMat, 0, -0.031, 0, trofferGroup);
        dif.rotation.x = Math.PI / 2;
        // Fluorescent point light
        var pl = new THREE.PointLight(0xfffbeb, 0.38, 7.5);
        pl.position.set(0, -0.2, 0);
        trofferGroup.add(pl);
        scene.add(trofferGroup);
    }

    // Overhead Galvanized HVAC Ducts
    var ductMat = makeMat(0x94a3b8);
    var duct1 = addMesh(new THREE.CylinderGeometry(0.16, 0.16, 11.8, 12), ductMat, -2.4, 3.12, 0);
    duct1.rotation.x = Math.PI / 2;
    var duct2 = addMesh(new THREE.CylinderGeometry(0.16, 0.16, 11.8, 12), ductMat,  2.4, 3.12, 0);
    duct2.rotation.x = Math.PI / 2;

    // Hanging Aisle Category Signs
    function addHangingSign(x, y, z, num, t1, t2) {
        var signTex = getAisleSignTexture(num, t1, t2);
        var signMat = new THREE.MeshBasicMaterial({ map: signTex });
        var signMesh1 = addMesh(new THREE.PlaneGeometry(1.6, 0.5), signMat, x, y, z);
        var signMesh2 = addMesh(new THREE.PlaneGeometry(1.6, 0.5), signMat, x, y, z);
        signMesh2.rotation.y = Math.PI;

        // Hanging silver chains from ceiling
        var chainMat = makeMat(0x64748b);
        addMesh(new THREE.CylinderGeometry(0.005, 0.005, 0.65, 4), chainMat, x - 0.7, y + 0.55, z);
        addMesh(new THREE.CylinderGeometry(0.005, 0.005, 0.65, 4), chainMat, x + 0.7, y + 0.55, z);
    }

    addHangingSign(-1.6, 2.35, -0.8, 1, 'ХЛЕБ • ВЫПЕЧКА', 'ЧАЙ • КОФЕ • СЛАДОСТИ');
    addHangingSign( 1.6, 2.35, -0.8, 2, 'БАКАЛЕЯ • КРУПЫ', 'МАКАРОНЫ • КОНСЕРВЫ');
    addHangingSign( 4.4, 2.35, -0.8, 3, 'СОКИ • ВОДА', 'ЧИПСЫ • СНЕКИ');
    addHangingSign( 0.0, 2.45, -4.6, 4, 'МОЛОКО • СЫРЫ', 'МЯСНАЯ ГАСТРОНОМИЯ');

    // Security Dome Cameras in ceiling corners
    var camMat = makeMat(0x1e293b);
    var redLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    function addDomeCamera(cx, cy, cz) {
        var cg = new THREE.Group();
        cg.position.set(cx, cy, cz);
        addMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 12), camMat, 0, 0.01, 0, cg);
        addMesh(new THREE.SphereGeometry(0.10, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), camMat, 0, 0, 0, cg);
        addMesh(new THREE.BoxGeometry(0.015, 0.015, 0.015), redLedMat, 0.05, -0.06, 0.05, cg);
        scene.add(cg);
    }
    addDomeCamera(-4.6, 3.28, -5.6);
    addDomeCamera( 4.6, 3.28,  5.6);

    // Glowing Exit Sign above sliding doors
    var exitSignMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    addMesh(new THREE.BoxGeometry(0.65, 0.22, 0.06), exitSignMat, 0, 2.75, 5.96);
}

function buildSupermarketCheckout() {
    var deskGroup = new THREE.Group();
    deskGroup.position.set(-3.2, 0, 3.6);

    var counterBodyMat = makeMat(0x334155);
    var stainlessMat = makeMat(0xd1d5db);
    var beltMat = makeMat(0x18181b);
    var screenMat = new THREE.MeshBasicMaterial({ map: getPOSScreenTexture() });
    var redLaserMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    var acrylicMat = new THREE.MeshLambertMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.35 });

    // 1. Counter base and stainless edge
    addMesh(new THREE.BoxGeometry(2.1, 0.88, 0.95), counterBodyMat, 0, 0.44, 0, deskGroup);
    addMesh(new THREE.BoxGeometry(2.14, 0.04, 0.99), stainlessMat, 0, 0.89, 0, deskGroup);

    // 2. Black Rubber Conveyor Belt
    addMesh(new THREE.BoxGeometry(1.25, 0.015, 0.48), beltMat, 0.35, 0.915, -0.15, deskGroup);
    // Divider bars ("Следующий покупатель")
    addMesh(new THREE.BoxGeometry(0.025, 0.02, 0.38), makeMat(0xfacc15), 0.70, 0.93, -0.15, deskGroup);
    addMesh(new THREE.BoxGeometry(0.025, 0.02, 0.38), makeMat(0xfacc15), 0.10, 0.93, -0.15, deskGroup);

    // 3. Barcode Scanner Glass with Red Laser
    addMesh(new THREE.BoxGeometry(0.24, 0.01, 0.20), makeMat(0x0f172a), -0.32, 0.915, -0.15, deskGroup);
    addMesh(new THREE.BoxGeometry(0.18, 0.005, 0.01), redLaserMat, -0.32, 0.92, -0.15, deskGroup);
    var laserGlow = new THREE.PointLight(0xef4444, 0.35, 0.6);
    laserGlow.position.set(-0.32, 0.95, -0.15);
    deskGroup.add(laserGlow);

    // 4. Touchscreen POS Register Monitor
    addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8), stainlessMat, -0.32, 1.02, 0.18, deskGroup);
    var posMon = addMesh(new THREE.BoxGeometry(0.34, 0.24, 0.03), counterBodyMat, -0.32, 1.20, 0.18, deskGroup);
    posMon.rotation.x = -0.22;
    var posScr = addMesh(new THREE.PlaneGeometry(0.30, 0.20), screenMat, -0.32, 1.20, 0.198, deskGroup);
    posScr.rotation.x = -0.22;

    // 5. Customer VFD Pole Display (green glowing numbers)
    addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.38, 8), stainlessMat, 0.15, 1.10, 0.28, deskGroup);
    addMesh(new THREE.BoxGeometry(0.22, 0.08, 0.04), counterBodyMat, 0.15, 1.30, 0.28, deskGroup);
    var vfdMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    addMesh(new THREE.PlaneGeometry(0.18, 0.045), vfdMat, 0.15, 1.30, 0.302, deskGroup);

    // 6. Bank Card PIN Pad Terminal (on swivel base)
    addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), stainlessMat, 0.65, 0.96, 0.24, deskGroup);
    var pinPad = addMesh(new THREE.BoxGeometry(0.11, 0.04, 0.17), makeMat(0x1e293b), 0.65, 1.04, 0.24, deskGroup);
    pinPad.rotation.x = 0.25;
    pinPad.rotation.y = 0.15;
    addMesh(new THREE.PlaneGeometry(0.08, 0.04), new THREE.MeshBasicMaterial({ color: 0x10b981 }), 0.65, 1.07, 0.22, deskGroup).rotation.x = -0.25;

    // 7. Thermal Receipt Printer
    addMesh(new THREE.BoxGeometry(0.14, 0.12, 0.15), counterBodyMat, -0.65, 0.96, 0.18, deskGroup);
    addMesh(new THREE.BoxGeometry(0.06, 0.03, 0.005), makeMat(0xffffff), -0.65, 1.03, 0.12, deskGroup); // receipt paper strip

    // 8. Acrylic Protective Sneeze Guard Screen
    addMesh(new THREE.BoxGeometry(1.6, 0.65, 0.015), acrylicMat, 0.15, 1.25, 0.08, deskGroup);

    // 9. Impulse Candy & Gum Rack (on counter side)
    var rackMat = makeMat(0x475569);
    addMesh(new THREE.BoxGeometry(0.38, 0.55, 0.18), rackMat, 0.95, 1.15, 0.32, deskGroup);
    for (var gi = 0; gi < 3; gi++) {
        var gy = 0.98 + gi * 0.15;
        // Orbit gums
        addMesh(new THREE.BoxGeometry(0.10, 0.02, 0.06), makeMat(0x38bdf8), 0.86, gy, 0.32, deskGroup);
        // Dirol gums
        addMesh(new THREE.BoxGeometry(0.10, 0.02, 0.06), makeMat(0x22c55e), 0.98, gy, 0.32, deskGroup);
        // Snickers chocolate bar
        addMesh(new THREE.BoxGeometry(0.08, 0.02, 0.04), makeMat(0x78350f), 1.08, gy, 0.32, deskGroup);
    }

    // 10. Cash Register Interaction Hitbox
    var cashInteract = addMesh(new THREE.BoxGeometry(0.9, 0.6, 0.7), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.15, -0.1, deskGroup);
    cashInteract.userData = { name: 'Касса (Оплатить покупки) [F]', type: 'cash_register' };
    interactables.push(cashInteract);

    // 11. CASHIER NPC (Люся)
    var cashierG = new THREE.Group();
    cashierG.position.set(-3.2, 0, 4.3);

    var apronMat = makeMat(0x15803d); // green supermarket vest
    var skinMat = makeMat(0xf8c291);  // female skin tone
    var darkPoloMat = makeMat(0x1e293b);
    var hairMat = makeMat(0x451a03);  // brown hair with clip

    // Stool / Chair
    addMesh(new THREE.CylinderGeometry(0.20, 0.20, 0.06, 12), makeMat(0x1e293b), 0, 0.48, 0, cashierG);
    addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 8), stainlessMat, 0, 0.24, 0, cashierG);

    // Torso in green uniform vest over dark polo
    var cTorso = addMesh(new THREE.BoxGeometry(0.38, 0.46, 0.24), apronMat, 0, 0.84, 0, cashierG);
    cTorso.rotation.x = -0.06;
    // Polo collar
    addMesh(new THREE.BoxGeometry(0.14, 0.05, 0.12), darkPoloMat, 0, 1.06, -0.02, cashierG);

    // Name badge: "Кассир: Люся"
    addMesh(new THREE.BoxGeometry(0.09, 0.04, 0.005), makeMat(0xffffff), 0.10, 0.96, -0.125, cashierG);

    // Neck & Head
    addMesh(new THREE.CylinderGeometry(0.05, 0.055, 0.09, 8), skinMat, 0, 1.12, -0.02, cashierG);
    var cHead = addMesh(new THREE.SphereGeometry(0.13, 12, 12), skinMat, 0, 1.25, -0.02, cashierG);
    cHead.scale.set(0.9, 1.1, 0.95);

    // Hair with clip / ponytail
    var cHair = addMesh(new THREE.SphereGeometry(0.14, 12, 12), hairMat, 0, 1.28, 0.02, cashierG);
    cHair.scale.set(0.95, 1.05, 1.0);
    // Hair bun / clip at back
    addMesh(new THREE.SphereGeometry(0.06, 8, 8), hairMat, 0, 1.26, 0.14, cashierG);

    // Face details
    var cEyeMat = makeMat(0x1e293b);
    addMesh(new THREE.BoxGeometry(0.03, 0.012, 0.01), cEyeMat, -0.045, 1.26, -0.13, cashierG);
    addMesh(new THREE.BoxGeometry(0.03, 0.012, 0.01), cEyeMat,  0.045, 1.26, -0.13, cashierG);
    addMesh(new THREE.BoxGeometry(0.02, 0.03, 0.02), skinMat, 0, 1.23, -0.14, cashierG); // nose

    // Arms resting forward near counter and scanner
    var lArm = addMesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), apronMat, -0.22, 0.88, -0.06, cashierG);
    lArm.rotation.x = 0.55;
    var rArm = addMesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), apronMat,  0.22, 0.88, -0.06, cashierG);
    rArm.rotation.x = 0.55;
    // Forearms resting horizontally
    var lFore = addMesh(new THREE.BoxGeometry(0.08, 0.07, 0.28), skinMat, -0.18, 0.88, -0.22, cashierG);
    lFore.rotation.y = -0.15;
    var rFore = addMesh(new THREE.BoxGeometry(0.08, 0.07, 0.28), skinMat,  0.18, 0.88, -0.22, cashierG);
    rFore.rotation.y = 0.15;

    // Cashier NPC Hitbox
    var cashierHitbox = addMesh(new THREE.BoxGeometry(0.65, 1.4, 0.65), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.9, 0, cashierG);
    cashierHitbox.userData = { name: 'Кассир (Люся) [F]', type: 'cashier_npc' };
    interactables.push(cashierHitbox);

    scene.add(cashierG);

    // Solid Colliders for Checkout
    colliders.push({ minX: -4.4, maxX: -2.0, minZ: 3.0, maxZ: 4.8 });

    scene.add(deskGroup);
    return deskGroup;
}

function buildCenterFreezerIsland() {
    return null;
}

function buildSupermarketEntranceFixtures() {
    // 1. Anti-Theft EAS Security Sensor Gates (flanking the exit)
    var gateMat = makeMat(0xe2e8f0);
    var ledBlueMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    function addSecurityGate(gx, gz) {
        var g = new THREE.Group();
        g.position.set(gx, 0, gz);
        // Pedestal base
        addMesh(new THREE.BoxGeometry(0.16, 0.06, 0.48), makeMat(0x334155), 0, 0.03, 0, g);
        // Upright acrylic antenna frame
        addMesh(new THREE.BoxGeometry(0.08, 1.45, 0.42), gateMat, 0, 0.78, 0, g);
        // Center aperture
        addMesh(new THREE.BoxGeometry(0.09, 1.15, 0.28), makeMat(0xf8fafc), 0, 0.78, 0, g);
        // Blue status LED on top
        addMesh(new THREE.BoxGeometry(0.085, 0.03, 0.08), ledBlueMat, 0, 1.52, 0, g);
        scene.add(g);
    }
    addSecurityGate(-1.3, 5.4);
    addSecurityGate( 1.3, 5.4);

    // 2. Yellow Caution Wet Floor Folding Sign
    var wetSignTex = getWetFloorSignTexture();
    var wetSignMat = new THREE.MeshBasicMaterial({ map: wetSignTex });
    var wetSignG = new THREE.Group();
    wetSignG.position.set(0.9, 0, 4.7);
    var ws1 = addMesh(new THREE.PlaneGeometry(0.28, 0.42), wetSignMat, 0, 0.21, 0.04, wetSignG);
    ws1.rotation.x = -0.16;
    var ws2 = addMesh(new THREE.PlaneGeometry(0.28, 0.42), wetSignMat, 0, 0.21, -0.04, wetSignG);
    ws2.rotation.x = 0.16;
    ws2.rotation.y = Math.PI;
    var wsHitbox = addMesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.25, 0, wetSignG);
    wsHitbox.userData = { name: 'Знак «Мокрый пол» [F]', type: 'caution_sign' };
    interactables.push(wsHitbox);
    scene.add(wetSignG);

    // 3. Nested Shopping Carts (Тележки для покупок)
    var cartG = new THREE.Group();
    cartG.position.set(2.8, 0, 4.8);
    var wireMat = makeMat(0xcbd5e1);
    var redCartMat = makeMat(0xdc2626);
    var wheelMat = makeMat(0x1e293b);

    for (var ci = 0; ci < 3; ci++) {
        var cz = -ci * 0.32;
        // Wire basket
        addMesh(new THREE.BoxGeometry(0.52, 0.42, 0.72), wireMat, 0, 0.62, cz, cartG);
        // Red handle bar
        addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.54, 8), redCartMat, 0, 0.86, cz + 0.36, cartG).rotation.z = Math.PI / 2;
        // Lower chassis
        addMesh(new THREE.BoxGeometry(0.48, 0.04, 0.68), wireMat, 0, 0.18, cz, cartG);
        // 4 Caster wheels
        addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), wheelMat, -0.22, 0.05, cz - 0.28, cartG);
        addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), wheelMat,  0.22, 0.05, cz - 0.28, cartG);
        addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), wheelMat, -0.22, 0.05, cz + 0.28, cartG);
        addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), wheelMat,  0.22, 0.05, cz + 0.28, cartG);
    }
    var cartHitbox = addMesh(new THREE.BoxGeometry(0.7, 1.0, 1.4), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.5, -0.3, cartG);
    cartHitbox.userData = { name: 'Тележки для покупок [F]', type: 'shopping_cart' };
    interactables.push(cartHitbox);
    colliders.push({ minX: 2.3, maxX: 3.3, minZ: 3.9, maxZ: 5.3 });
    scene.add(cartG);

    // 4. Customer Locker Cells (Ячейки для сумок)
    var lockerMat = makeMat(0x64748b);
    var lockKeyMat = makeMat(0xfacc15);
    var lockerG = new THREE.Group();
    lockerG.position.set(-4.85, 0, 4.8);
    addMesh(new THREE.BoxGeometry(0.42, 1.65, 1.2), lockerMat, 0, 0.825, 0, lockerG);
    // 8 Cell doors (2x4)
    for (var lx = 0; lx < 2; lx++) {
        for (var ly = 0; ly < 4; ly++) {
            var lz0 = -0.32 + lx * 0.64;
            var ly0 = 0.22 + ly * 0.38;
            addMesh(new THREE.BoxGeometry(0.44, 0.34, 0.58), makeMat(0x475569), 0.01, ly0, lz0, lockerG);
            // Key / lock
            addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), lockKeyMat, 0.23, ly0, lz0 + 0.22, lockerG).rotation.z = Math.PI / 2;
        }
    }
    colliders.push({ minX: -5.1, maxX: -4.5, minZ: 4.1, maxZ: 5.5 });
    scene.add(lockerG);
}


// ==================== BUILD: SHOP ====================
function buildShop() {
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.Fog(0xf1f5f9, 7, 28);

    // 1. Ambient & Directional Lighting
    var ambLight = new THREE.AmbientLight(0xfffaed, 0.92);
    scene.add(ambLight);

    var mainSun = new THREE.DirectionalLight(0xfffaea, 0.52);
    mainSun.position.set(0, 8, 2);
    scene.add(mainSun);

    // 2. Realistic Supermarket Fluorescent Troffers, HVAC Ducts, Hanging Signs, Security Cams, Exit Sign
    buildSupermarketLighting();

    // 3. Realistic Ceramic Tiled Floor with Entrance Tactile Strip & Subtle Marble Specular
    var floorTex = getSupermarketFloorTexture();
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(5, 6);
    var floorMat = makeMat(0xffffff, { map: floorTex, roughness: 0.28 });
    var floorGeo = new THREE.PlaneGeometry(10.2, 12.2);
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, 0);
    scene.add(floorMesh);

    // Entrance heavy rubber ribbed dirt-trapper mat
    addMesh(new THREE.BoxGeometry(2.8, 0.02, 1.8), makeMat(0x1e293b), 0, 0.01, 5.0);

    // 4. Acoustic Grid Suspended Ceiling
    var ceilTex = getSupermarketCeilingTexture();
    ceilTex.wrapS = THREE.RepeatWrapping;
    ceilTex.wrapT = THREE.RepeatWrapping;
    ceilTex.repeat.set(5, 6);
    var ceilMat = makeMat(0xffffff, { map: ceilTex, roughness: 0.88 });
    var ceilGeo = new THREE.PlaneGeometry(10.2, 12.2);
    var ceilMesh = new THREE.Mesh(ceilGeo, ceilMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(0, 3.3, 0);
    scene.add(ceilMesh);

    // 5. Walls & Supermarket Branding
    var wallMat = makeMat(0xf1f5f9);
    var stripeMat = makeMat(0x16a34a); // supermarket green accent

    // North wall (back)
    addMesh(new THREE.BoxGeometry(10.2, 3.3, 0.2), wallMat, 0, 1.65, -6.1);
    addMesh(new THREE.BoxGeometry(10.2, 0.25, 0.22), stripeMat, 0, 2.5, -6.08);

    // Back wall large supermarket branding banner
    var bannerTex = getSupermarketBannerTexture();
    var bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    addMesh(new THREE.PlaneGeometry(5.2, 0.8), bannerMat, 0, 2.78, -5.98);

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

    // Promotional posters on East Wall
    var promoTex = getPromoPosterTexture('discount');
    var promoMat = new THREE.MeshBasicMaterial({ map: promoTex });
    var pMesh1 = addMesh(new THREE.PlaneGeometry(0.85, 1.2), promoMat, 4.98, 1.8, 2.2);
    pMesh1.rotation.y = -Math.PI / 2;

    // Curfew & Consumer Corner on West Wall
    var curfewTex = getPromoPosterTexture('curfew');
    var curfewMat = new THREE.MeshBasicMaterial({ map: curfewTex });
    var cMesh = addMesh(new THREE.PlaneGeometry(0.8, 1.05), curfewMat, -4.98, 1.8, 1.2);
    cMesh.rotation.y = Math.PI / 2;

    var consumerTex = getPromoPosterTexture('consumer');
    var consumerMat = new THREE.MeshBasicMaterial({ map: consumerTex });
    var conMesh = addMesh(new THREE.PlaneGeometry(1.2, 0.85), consumerMat, -4.98, 1.8, 2.6);
    conMesh.rotation.y = Math.PI / 2;

    // Wall Clock
    var clockRimMat = makeMat(0x1e293b);
    addMesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16), clockRimMat, 3.6, 2.8, -5.98).rotation.x = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.22, 0.22, 0.042, 16), makeMat(0xffffff), 3.6, 2.8, -5.97).rotation.x = Math.PI / 2;
    addMesh(new THREE.BoxGeometry(0.012, 0.12, 0.01), clockRimMat, 3.6, 2.84, -5.94);
    addMesh(new THREE.BoxGeometry(0.08, 0.012, 0.01), clockRimMat, 3.63, 2.8, -5.94);

    // 6. Shelving Units (Gondolas) with Price Tag Rails
    var shelfMat = makeMat(0xf1f5f9);
    var shelfPostMat = makeMat(0x64748b);
    var priceRailMat = new THREE.MeshBasicMaterial({ map: getPriceRailTexture() });

    function createAisleGondola(gx, gzStart, gzEnd) {
        var gLen = gzEnd - gzStart;
        var gCenterZ = (gzStart + gzEnd) / 2;
        // Central perforated back panel
        addMesh(new THREE.BoxGeometry(0.08, 1.7, gLen), shelfPostMat, gx, 0.85, gCenterZ);
        // Base shelf plinth
        addMesh(new THREE.BoxGeometry(0.9, 0.16, gLen), shelfMat, gx, 0.08, gCenterZ);
        var shelfHeights = [0.52, 0.98, 1.45];
        for (var sh = 0; sh < shelfHeights.length; sh++) {
            var sy = shelfHeights[sh];
            addMesh(new THREE.BoxGeometry(0.42, 0.03, gLen), shelfMat, gx - 0.24, sy, gCenterZ);
            addMesh(new THREE.BoxGeometry(0.42, 0.03, gLen), shelfMat, gx + 0.24, sy, gCenterZ);

            // Red plastic price tag rails on shelf fronts
            addMesh(new THREE.BoxGeometry(0.015, 0.045, gLen), priceRailMat, gx - 0.45, sy - 0.01, gCenterZ);
            addMesh(new THREE.BoxGeometry(0.015, 0.045, gLen), priceRailMat, gx + 0.45, sy - 0.01, gCenterZ);
        }
        // Metal end uprights
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

    // Promotional Endcaps on front of gondolas
    (function() {
        var endcapMat = makeMat(0xe2e8f0);
        // Endcap 1 (west gondola front)
        addMesh(new THREE.BoxGeometry(0.72, 1.5, 0.32), endcapMat, -1.6, 0.75, 1.38);
        addMesh(new THREE.BoxGeometry(0.74, 0.04, 0.34), priceRailMat, -1.6, 0.80, 1.38);
        // Endcap 2 (east gondola front)
        addMesh(new THREE.BoxGeometry(0.72, 1.5, 0.32), endcapMat, 1.6, 0.75, 1.38);
        addMesh(new THREE.BoxGeometry(0.74, 0.04, 0.34), priceRailMat, 1.6, 0.80, 1.38);
    })();

    // East wall shelf unit
    (function() {
        var ewLen = 5.2;
        var ewCenterZ = -1.0;
        addMesh(new THREE.BoxGeometry(0.06, 1.8, ewLen), shelfPostMat, 4.85, 0.9, ewCenterZ);
        var ewHeights = [0.52, 0.98, 1.45];
        for (var i = 0; i < ewHeights.length; i++) {
            addMesh(new THREE.BoxGeometry(0.45, 0.03, ewLen), shelfMat, 4.65, ewHeights[i], ewCenterZ);
            addMesh(new THREE.BoxGeometry(0.015, 0.045, ewLen), priceRailMat, 4.42, ewHeights[i] - 0.01, ewCenterZ);
        }
        colliders.push({ minX: 4.3, maxX: 5.0, minZ: -3.7, maxZ: 1.7 });
    })();

    // 7. Back Wall Refrigerated Multi-Deck Cooler Bank
    (function() {
        var refMat = makeMat(0x1e293b);
        var glassDoorMat = new THREE.MeshLambertMaterial({ color: 0x90caf9, transparent: true, opacity: 0.35 });
        addMesh(new THREE.BoxGeometry(8.2, 2.2, 0.85), refMat, 0, 1.1, -5.55);
        addMesh(new THREE.BoxGeometry(8.0, 1.9, 0.65), makeMat(0xf8fafc), 0, 1.1, -5.5);
        // Interior cold cyan LED lighting
        var coolLight = new THREE.PointLight(0xa5f3fc, 0.7, 7.5);
        coolLight.position.set(0, 1.8, -5.2);
        scene.add(coolLight);

        // Cooler interior shelves with price rails
        var refHeights = [0.65, 1.05, 1.45];
        for (var ri = 0; ri < refHeights.length; ri++) {
            var ry = refHeights[ri];
            addMesh(new THREE.BoxGeometry(7.9, 0.03, 0.5), makeMat(0xcbd5e1), 0, ry, -5.35);
            addMesh(new THREE.BoxGeometry(7.9, 0.045, 0.015), priceRailMat, 0, ry - 0.01, -5.1);
        }

        // 4 Hinged glass display doors with vertical handles
        for (var d = 0; d < 4; d++) {
            var dx = -3.0 + d * 2.0;
            addMesh(new THREE.BoxGeometry(1.9, 1.9, 0.04), glassDoorMat, dx, 1.1, -5.1);
            addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), makeMat(0xe2e8f0), dx + 0.8, 1.1, -5.06);
        }
        colliders.push({ minX: -4.3, maxX: 4.3, minZ: -6.0, maxZ: -4.9 });
    })();

    // 8. Center aisle wide and open

    // 9. Produce Table with Crates & Self-Service Scale
    (function() {
        var woodMat = makeMat(0x8d5b4c);
        var crateMat = makeMat(0xa16207);
        addMesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), woodMat, 0, 0.75, 2.4);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, -0.72, 0.375, 2.05);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, 0.72, 0.375, 2.05);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, -0.72, 0.375, 2.75);
        addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), woodMat, 0.72, 0.375, 2.75);

        // Crates
        addMesh(new THREE.BoxGeometry(0.74, 0.16, 0.74), crateMat, -0.4, 0.85, 2.4);
        addMesh(new THREE.BoxGeometry(0.74, 0.16, 0.74), crateMat, 0.4, 0.85, 2.4);

        // Digital Self-Service Scale
        var scaleG = new THREE.Group();
        scaleG.position.set(0, 0.78, 2.0);
        addMesh(new THREE.BoxGeometry(0.32, 0.04, 0.28), makeMat(0xd1d5db), 0, 0.02, 0, scaleG);
        addMesh(new THREE.BoxGeometry(0.30, 0.015, 0.24), makeMat(0xe2e8f0), 0, 0.05, 0, scaleG);
        addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 8), makeMat(0x94a3b8), 0.12, 0.25, 0.10, scaleG);
        var scaleHead = addMesh(new THREE.BoxGeometry(0.24, 0.18, 0.04), makeMat(0x334155), 0.12, 0.48, 0.10, scaleG);
        scaleHead.rotation.x = -0.15;
        var scaleTex = getProduceScaleTexture();
        var sPlane = addMesh(new THREE.PlaneGeometry(0.21, 0.14), new THREE.MeshBasicMaterial({ map: scaleTex }), 0.12, 0.48, 0.078, scaleG);
        sPlane.rotation.x = -0.15;
        sPlane.rotation.y = Math.PI;

        // Produce plastic bags dispenser roll
        addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 12), makeMat(0xe0f2fe, { transparent: true, opacity: 0.6 }), -0.12, 0.12, 0.10, scaleG).rotation.z = Math.PI / 2;

        var scaleHitbox = addMesh(new THREE.BoxGeometry(0.4, 0.6, 0.35), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.3, 0, scaleG);
        scaleHitbox.userData = { name: 'Электронные весы (Контрольное взвешивание) [F]', type: 'produce_scale' };
        interactables.push(scaleHitbox);

        scene.add(scaleG);
        colliders.push({ minX: -0.85, maxX: 0.85, minZ: 1.8, maxZ: 2.8 });
    })();

    // 10. Realistic Supermarket Checkout Area (Belt, Scanner, POS Screen, PIN-pad, Cashier Svetlana)
    buildSupermarketCheckout();

    // 11. Supermarket Entrance & Security Fixtures (EAS Gates, Wet Floor Sign, Carts, Locker Cells)
    buildSupermarketEntranceFixtures();

    // 12. Glass Automatic Sliding Doors & Outdoor Blizzard
    var exitDoor = addMesh(new THREE.BoxGeometry(2.4, 2.5, 0.15), new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4 }), 0, 1.25, 5.9);
    exitDoor.userData = { name: 'Выход на улицу [F]', type: 'shop_exit' };
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

// ==================== PROCEDURAL SOVIET APARTMENT FACADE TEXTURE ====================
var cachedStreetBuildingTex = null;
function getStreetBuildingTexture() {
    if (cachedStreetBuildingTex) return cachedStreetBuildingTex;
    try {
        var canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        var ctx = canvas.getContext('2d');

        // Weathered dark concrete building paneling
        ctx.fillStyle = '#1c2128';
        ctx.fillRect(0, 0, 1024, 1024);

        // Panel seams (horizontal & vertical joints)
        ctx.strokeStyle = '#0e1217';
        ctx.lineWidth = 4;
        var floors = 8;
        var bays = 8;
        var bayW = 1024 / bays;
        var floorH = 1024 / floors;

        for (var f = 0; f <= floors; f++) {
            ctx.beginPath();
            ctx.moveTo(0, f * floorH);
            ctx.lineTo(1024, f * floorH);
            ctx.stroke();
        }
        for (var b = 0; b <= bays; b++) {
            ctx.beginPath();
            ctx.moveTo(b * bayW, 0);
            ctx.lineTo(b * bayW, 1024);
            ctx.stroke();
        }

        // Draw individual windows in each apartment panel
        for (var r = 0; r < floors; r++) {
            for (var c = 0; c < bays; c++) {
                var wx = c * bayW + bayW * 0.22;
                var wy = r * floorH + floorH * 0.22;
                var ww = bayW * 0.56;
                var wh = floorH * 0.56;

                // Concrete window casing
                ctx.fillStyle = '#0a0d12';
                ctx.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);

                // Window illumination pattern
                var pVal = Math.sin(r * 17.1 + c * 31.7);
                if (pVal > 0.48) {
                    ctx.fillStyle = '#f59e0b'; // warm cozy amber
                } else if (pVal > 0.28) {
                    ctx.fillStyle = '#fef08a'; // bright golden light
                } else if (pVal > 0.12) {
                    ctx.fillStyle = '#38bdf8'; // TV cold blue flicker
                } else {
                    ctx.fillStyle = '#070a0f'; // dark night window
                }
                ctx.fillRect(wx, wy, ww, wh);

                // Window frame panes (cross mullion)
                ctx.strokeStyle = '#181e26';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(wx + ww * 0.5, wy);
                ctx.lineTo(wx + ww * 0.5, wy + wh);
                ctx.moveTo(wx, wy + wh * 0.4);
                ctx.lineTo(wx + ww, wy + wh * 0.4);
                ctx.stroke();

                // Snowy windowsill
                ctx.fillStyle = 'rgba(235, 245, 255, 0.88)';
                ctx.fillRect(wx - 2, wy + wh - 1, ww + 4, 4);
            }
        }

        cachedStreetBuildingTex = new THREE.CanvasTexture(canvas);
        cachedStreetBuildingTex.wrapS = THREE.RepeatWrapping;
        cachedStreetBuildingTex.wrapT = THREE.RepeatWrapping;
        cachedStreetBuildingTex.repeat.set(4, 2);
    } catch(e) {
        cachedStreetBuildingTex = null;
    }
    return cachedStreetBuildingTex;
}

// Helper function to build a detailed snow-covered parked Soviet car
function buildSnowyCar(x, z, rotY, bodyColor) {
    var carGroup = new THREE.Group();
    carGroup.position.set(x, 0, z);
    carGroup.rotation.y = rotY;
    scene.add(carGroup);

    var carBodyMat = makeMat(bodyColor);
    var carGlassMat = makeMat(0x0f172a);
    var chromeMat = makeMat(0xd1d5db);
    var tireMat = makeMat(0x18181b);
    var hubcapMat = makeMat(0x9ca3af);
    var snowPuffMat = makeMat(0xf8fafc);
    var headlightMat = makeMat(0xfef08a);
    var taillightMat = makeMat(0xdc2626);

    // Lower chassis & body
    addMesh(new THREE.BoxGeometry(1.68, 0.48, 3.8), carBodyMat, 0, 0.44, 0, carGroup);

    // Cabin / Greenhouse
    addMesh(new THREE.BoxGeometry(1.52, 0.44, 1.95), carGlassMat, 0, 0.88, -0.15, carGroup);

    // Roof metal frame
    addMesh(new THREE.BoxGeometry(1.54, 0.05, 1.88), carBodyMat, 0, 1.11, -0.15, carGroup);

    // Front hood & rear trunk details
    addMesh(new THREE.BoxGeometry(1.64, 0.04, 1.05), carBodyMat, 0, 0.69, -1.25, carGroup);
    addMesh(new THREE.BoxGeometry(1.64, 0.04, 0.80), carBodyMat, 0, 0.69, 1.30, carGroup);

    // Bumpers
    addMesh(new THREE.BoxGeometry(1.72, 0.10, 0.12), chromeMat, 0, 0.28, -1.95, carGroup);
    addMesh(new THREE.BoxGeometry(1.72, 0.10, 0.12), chromeMat, 0, 0.28,  1.95, carGroup);

    // Headlights & Taillights
    addMesh(new THREE.BoxGeometry(0.24, 0.12, 0.04), headlightMat, -0.62, 0.48, -1.91, carGroup);
    addMesh(new THREE.BoxGeometry(0.24, 0.12, 0.04), headlightMat,  0.62, 0.48, -1.91, carGroup);
    addMesh(new THREE.BoxGeometry(0.28, 0.10, 0.04), taillightMat, -0.62, 0.48,  1.91, carGroup);
    addMesh(new THREE.BoxGeometry(0.28, 0.10, 0.04), taillightMat,  0.62, 0.48,  1.91, carGroup);

    // Front Grille
    addMesh(new THREE.BoxGeometry(0.85, 0.16, 0.04), chromeMat, 0, 0.48, -1.91, carGroup);

    // 4 Wheels
    var wheelPositions = [
        { x: -0.84, z: -1.15 },
        { x:  0.84, z: -1.15 },
        { x: -0.84, z:  1.15 },
        { x:  0.84, z:  1.15 }
    ];
    for (var w = 0; w < wheelPositions.length; w++) {
        var wp = wheelPositions[w];
        var wheel = addMesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12), tireMat, wp.x, 0.32, wp.z, carGroup);
        wheel.rotation.z = Math.PI / 2;
        var cap = addMesh(new THREE.CylinderGeometry(0.18, 0.18, 0.23, 10), hubcapMat, wp.x, 0.32, wp.z, carGroup);
        cap.rotation.z = Math.PI / 2;
    }

    // Heavy puffy winter snow accumulation on roof, hood, and trunk
    addMesh(new THREE.BoxGeometry(1.58, 0.16, 1.92), snowPuffMat, 0, 1.20, -0.15, carGroup);
    addMesh(new THREE.BoxGeometry(1.66, 0.14, 1.05), snowPuffMat, 0, 0.76, -1.25, carGroup);
    addMesh(new THREE.BoxGeometry(1.66, 0.14, 0.82), snowPuffMat, 0, 0.76,  1.30, carGroup);

    // Sloped snow on windshield and rear glass
    var frontSnow = addMesh(new THREE.BoxGeometry(1.50, 0.08, 0.48), snowPuffMat, 0, 0.94, -0.88, carGroup);
    frontSnow.rotation.x = -0.55;
    var rearSnow = addMesh(new THREE.BoxGeometry(1.50, 0.08, 0.44), snowPuffMat, 0, 0.94,  0.60, carGroup);
    rearSnow.rotation.x = 0.55;

    // Solid obstacle collider
    colliders.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z - 2.2, maxZ: z + 2.2 });
}

// ==================== BUILD: STREET ====================
function buildStreet(toWork) {
    var len = 50;
    scene.background = new THREE.Color(0x02050c);
    scene.fog = new THREE.Fog(0x02050c, 3, 24);

    var tlStreet = new THREE.TextureLoader();
    var stalkerTex = tlStreet.load(STALKER_FAR_B64);
    var stalkerMat = new THREE.MeshBasicMaterial({ map: stalkerTex });

    var snowGroundTex = tlStreet.load(SNOW_GROUND_B64);
    snowGroundTex.wrapS = THREE.RepeatWrapping;
    snowGroundTex.wrapT = THREE.RepeatWrapping;
    snowGroundTex.repeat.set(1.5, 18);
    var snowGroundMat = new THREE.MeshLambertMaterial({ map: snowGroundTex });

    var skyTex = tlStreet.load(NIGHT_SKY_B64);
    skyTex.wrapS = THREE.RepeatWrapping;
    skyTex.wrapT = THREE.RepeatWrapping;
    skyTex.repeat.set(2.5, 8);
    var skyMat = new THREE.MeshBasicMaterial({ map: skyTex });

    // 1. Central Snowy Asphalt Road
    var roadMat = makeMat(0x1e242d);
    var road = addMesh(new THREE.PlaneGeometry(5.2, len), roadMat, 0, 0.005, -len / 2);
    road.rotation.x = -Math.PI / 2;

    // Snow overlay on roadway
    var roadSnow = addMesh(new THREE.PlaneGeometry(5.2, len), snowGroundMat, 0, 0.012, -len / 2);
    roadSnow.rotation.x = -Math.PI / 2;

    // Subtle dark tire tracks in the snow
    var tireTrackMat = makeMat(0x181c22);
    var trackL = addMesh(new THREE.PlaneGeometry(0.38, len), tireTrackMat, -1.15, 0.015, -len / 2);
    trackL.rotation.x = -Math.PI / 2;
    var trackR = addMesh(new THREE.PlaneGeometry(0.38, len), tireTrackMat,  1.15, 0.015, -len / 2);
    trackR.rotation.x = -Math.PI / 2;

    // 2. Concrete Curbs (Бордюры) with snow caps
    var curbMat = makeMat(0x4b5563);
    var curbSnowMat = makeMat(0xf8fafc);
    var curbL = addMesh(new THREE.BoxGeometry(0.24, 0.22, len), curbMat, -2.62, 0.11, -len / 2);
    addMesh(new THREE.BoxGeometry(0.26, 0.06, len), curbSnowMat, -2.62, 0.24, -len / 2);
    var curbR = addMesh(new THREE.BoxGeometry(0.24, 0.22, len), curbMat,  2.62, 0.11, -len / 2);
    addMesh(new THREE.BoxGeometry(0.26, 0.06, len), curbSnowMat,  2.62, 0.24, -len / 2);

    // 3. Raised Pedestrian Sidewalks (Тротуары)
    var sidewalkMat = makeMat(0x374151);
    var walkL = addMesh(new THREE.BoxGeometry(3.6, 0.18, len), sidewalkMat, -4.45, 0.09, -len / 2);
    addMesh(new THREE.PlaneGeometry(3.6, len), snowGroundMat, -4.45, 0.185, -len / 2).rotation.x = -Math.PI / 2;
    var walkR = addMesh(new THREE.BoxGeometry(3.6, 0.18, len), sidewalkMat,  4.45, 0.09, -len / 2);
    addMesh(new THREE.PlaneGeometry(3.6, len), snowGroundMat,  4.45, 0.185, -len / 2).rotation.x = -Math.PI / 2;

    // 4. Volumetric Soft Snowdrifts (Сугробы) along curbs and building edges
    var snowdriftMat = makeMat(0xf1f5f9);
    var driftData = [
        { x: -2.8, z: -6,  w: 0.7, h: 0.38, d: 3.2 },
        { x:  2.8, z: -9,  w: 0.6, h: 0.32, d: 2.8 },
        { x: -2.8, z: -18, w: 0.8, h: 0.42, d: 3.6 },
        { x:  2.8, z: -23, w: 0.7, h: 0.36, d: 3.0 },
        { x: -2.8, z: -38, w: 0.8, h: 0.40, d: 3.4 },
        { x:  2.8, z: -43, w: 0.6, h: 0.34, d: 2.6 }
    ];
    for (var di = 0; di < driftData.length; di++) {
        var dd = driftData[di];
        addMesh(new THREE.BoxGeometry(dd.w, dd.h, dd.d), snowdriftMat, dd.x, dd.h * 0.5 + 0.10, dd.z);
    }

    // 5. Starry Night Sky Ceiling
    var skyCeiling = addMesh(new THREE.PlaneGeometry(28, len), skyMat, 0, 13.5, -len / 2);
    skyCeiling.rotation.x = Math.PI / 2;

    // 6. Soviet Panel Apartment Buildings (Хрущёвки / Панельки) with lit windows
    var buildingTex = getStreetBuildingTexture();
    var buildingMat = new THREE.MeshLambertMaterial({
        map: buildingTex || null,
        color: 0x99a3b0
    });

    // Left building block
    var lwall = addMesh(new THREE.PlaneGeometry(len, 14), buildingMat, -6.25, 7.0, -len / 2);
    lwall.rotation.y = Math.PI / 2;
    // Roof cornice on left
    addMesh(new THREE.BoxGeometry(0.5, 0.4, len), makeMat(0x334155), -6.1, 14.1, -len / 2);

    // Right building block
    var rwall = addMesh(new THREE.PlaneGeometry(len, 14), buildingMat, 6.25, 7.0, -len / 2);
    rwall.rotation.y = -Math.PI / 2;
    // Roof cornice on right
    addMesh(new THREE.BoxGeometry(0.5, 0.4, len), makeMat(0x334155), 6.1, 14.1, -len / 2);

    // Drainpipes running down buildings
    var pipeMat = makeMat(0x475569);
    addMesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 8), pipeMat, -6.15, 7.0, -12);
    addMesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 8), pipeMat, -6.15, 7.0, -36);
    addMesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 8), pipeMat,  6.15, 7.0, -20);
    addMesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 8), pipeMat,  6.15, 7.0, -42);

    // 7. Building Entrances (Подъезды) on Right Building
    var canopyMat = makeMat(0x334155);
    var doorIronMat = makeMat(0x1e293b);
    var entranceZList = [-9, -27];
    for (var ez = 0; ez < entranceZList.length; ez++) {
        var entZ = entranceZList[ez];
        // Concrete canopy
        addMesh(new THREE.BoxGeometry(1.6, 0.16, 2.2), canopyMat, 5.5, 2.8, entZ);
        // Snow on canopy
        addMesh(new THREE.BoxGeometry(1.64, 0.12, 2.24), curbSnowMat, 5.5, 2.92, entZ);
        // Steel entrance door with intercom
        addMesh(new THREE.BoxGeometry(0.12, 2.3, 1.2), doorIronMat, 6.18, 1.15, entZ);
        addMesh(new THREE.BoxGeometry(0.04, 0.14, 0.08), makeMat(0xd97706), 6.14, 1.25, entZ + 0.72);
        // Yellow entrance light over door
        var pLight = new THREE.PointLight(0xf59e0b, 0.85, 6);
        pLight.position.set(5.2, 2.65, entZ);
        scene.add(pLight);
        // Porch steps
        addMesh(new THREE.BoxGeometry(1.2, 0.12, 2.0), makeMat(0x475569), 5.6, 0.06, entZ);
    }

    // 8. Detailed Soviet Cast-Iron Streetlamps with Curved Necks and Sodium Glow
    var ironPoleMat = makeMat(0x1f2937);
    var lampGlassMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    var lampPuddleTex = makeMat(0xf59e0b, { transparent: true, opacity: 0.18 });

    var lampZCoords = [-3, -15, -27, -39];
    for (var li = 0; li < lampZCoords.length; li++) {
        var lz = lampZCoords[li];
        var lx = (li % 2 === 0) ? -2.48 : 2.48;
        var dirSign = (li % 2 === 0) ? 1 : -1;

        var lampGroup = new THREE.Group();
        lampGroup.position.set(lx, 0, lz);
        scene.add(lampGroup);

        // Fluted pedestal base
        addMesh(new THREE.CylinderGeometry(0.18, 0.26, 0.75, 10), ironPoleMat, 0, 0.38, 0, lampGroup);
        // Main tall post
        addMesh(new THREE.CylinderGeometry(0.065, 0.085, 4.4, 8), ironPoleMat, 0, 2.58, 0, lampGroup);
        // Arched arm reaching over road
        var arm = addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 8), ironPoleMat, dirSign * 0.38, 4.72, 0, lampGroup);
        arm.rotation.z = dirSign * (Math.PI / 3);
        // Lantern fixture & bulb
        addMesh(new THREE.BoxGeometry(0.36, 0.14, 0.26), ironPoleMat, dirSign * 0.75, 4.96, 0, lampGroup);
        addMesh(new THREE.SphereGeometry(0.11, 8, 8), lampGlassMat, dirSign * 0.75, 4.88, 0, lampGroup);

        // Warm sodium-vapor glow point light
        var streetLamp = new THREE.PointLight(0xffa238, toWork ? 1.5 : 0.95, 15);
        streetLamp.position.set(lx + dirSign * 0.75, 4.85, lz);
        scene.add(streetLamp);

        // Warm illuminated puddle of light on the snowy ground below
        var puddle = addMesh(new THREE.CircleGeometry(2.4, 16), lampPuddleTex, lx + dirSign * 0.75, 0.018, lz);
        puddle.rotation.x = -Math.PI / 2;

        colliders.push({ minX: lx - 0.28, maxX: lx + 0.28, minZ: lz - 0.28, maxZ: lz + 0.28 });
    }

    // 9. Overhead Sagging Power & Telephone Cables (Провода)
    var wireMat = makeMat(0x111827);
    for (var w = 0; w < 3; w++) {
        var wireY = 5.2 - w * 0.45;
        var wireZ = -8 - w * 14;
        var wire = addMesh(new THREE.CylinderGeometry(0.012, 0.012, 12.8, 6), wireMat, 0, wireY, wireZ);
        wire.rotation.z = Math.PI / 2;
    }

    // 10. Parked Snow-Covered Soviet Cars
    buildSnowyCar(2.05, -13.5, 0.08, 0x1e3a5f);  // Dark Blue Volga/Zhiguli on right curb
    buildSnowyCar(-2.05, -31.5, -0.06, 0x831843); // Deep Maroon Zhiguli on left curb

    // 11. Street Furniture: Trash Dumpsters & Wooden Benches
    // Soviet green dumpsters
    var dumpMat = makeMat(0x166534);
    var dumpGroup = new THREE.Group();
    dumpGroup.position.set(-3.7, 0, -21);
    dumpGroup.rotation.y = 0.15;
    scene.add(dumpGroup);
    addMesh(new THREE.BoxGeometry(1.2, 0.95, 0.9), dumpMat, 0, 0.52, 0, dumpGroup);
    addMesh(new THREE.BoxGeometry(1.26, 0.12, 0.96), curbSnowMat, 0, 1.05, 0, dumpGroup);
    colliders.push({ minX: -4.4, maxX: -3.0, minZ: -21.6, maxZ: -20.4 });

    // Wooden park benches covered in snow
    var benchWoodMat = makeMat(0x78350f);
    var bench1 = new THREE.Group();
    bench1.position.set(-3.6, 0, -6.5);
    scene.add(bench1);
    addMesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), ironPoleMat, -0.7, 0.23, 0, bench1);
    addMesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), ironPoleMat,  0.7, 0.23, 0, bench1);
    addMesh(new THREE.BoxGeometry(1.6, 0.06, 0.42), benchWoodMat, 0, 0.46, 0, bench1);
    addMesh(new THREE.BoxGeometry(1.64, 0.08, 0.44), curbSnowMat, 0, 0.52, 0, bench1);

    // 12. End and Rear Backdrops
    var endStreetTex = tlStreet.load(STREET_B64);
    var endStreetMat = new THREE.MeshBasicMaterial({ map: endStreetTex });
    var endBackdrop = addMesh(new THREE.PlaneGeometry(24, 14), endStreetMat, 0, 6.0, -len);
    var rearBackdrop = addMesh(new THREE.PlaneGeometry(24, 14), stalkerMat, 0, 6.0, 1.5);
    rearBackdrop.rotation.y = Math.PI;

    // 13. Atmospheric Night Lighting & Blizzard
    scene.add(new THREE.AmbientLight(0x152238, 1.15));
    // Heavy realistic blizzard falling everywhere along the entire street from sky to ground
    addSnow(-54, 4, -8, 8, 0, 13.0, 4200, 0.08);

    camera.position.set(0, 1.6, 0);
    camera.lookAt(0, 1.6, -5);

    // 3D Stalker figure in distance
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


// ==================== PROCEDURAL OFFICE TEXTURES ====================
var cachedOfficeScreenTexPlayer = null;
var cachedOfficeScreenTexOther = null;
var cachedOfficeFloorTex = null;
var cachedOfficeCeilingTex = null;
var cachedCorkboardTex = null;
var cachedWallClockTex = null;

function getOfficeComputerScreenTexture(isPlayer) {
    if (isPlayer && cachedOfficeScreenTexPlayer) return cachedOfficeScreenTexPlayer;
    if (!isPlayer && cachedOfficeScreenTexOther) return cachedOfficeScreenTexOther;

    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    var ctx = canvas.getContext('2d');

    if (isPlayer) {
        // Classic Windows 98 Teal Desktop
        ctx.fillStyle = '#008080';
        ctx.fillRect(0, 0, 512, 384);

        // COLUMN 1: Documents & Work (x: 16)
        // 1. Отчет_13.txt
        ctx.fillStyle = '#ffffff'; ctx.fillRect(18, 12, 20, 24);
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1; ctx.strokeRect(18, 12, 20, 24);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(21, 16, 14, 2); ctx.fillRect(21, 21, 14, 2); ctx.fillRect(21, 26, 10, 2);
        ctx.fillStyle = '#fef08a'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Отчет_13', 9, 48);

        // 2. MS Excel
        ctx.fillStyle = '#15803d'; ctx.fillRect(16, 56, 24, 20);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(19, 59, 10, 14);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('X', 21, 70);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Excel', 16, 88);

        // 3. Почта (Outlook)
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(16, 100, 24, 18);
        ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(16, 100); ctx.lineTo(28, 110); ctx.lineTo(40, 100); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Почта', 14, 130);

        // 4. Корзина
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(18, 144); ctx.lineTo(38, 144); ctx.lineTo(35, 164); ctx.lineTo(21, 164);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(21, 148, 14, 14);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Корзина', 10, 176);

        // COLUMN 2: Internet & Utilities (x: 68)
        // 5. Internet Explorer (Браузер)
        ctx.fillStyle = '#0284c7'; ctx.beginPath();
        ctx.arc(82, 22, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fef08a'; ctx.beginPath();
        ctx.arc(84, 19, 13, 0.4, 2.8); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Браузер', 66, 44);

        // 6. Калькулятор
        ctx.fillStyle = '#64748b'; ctx.fillRect(72, 56, 22, 22);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(75, 59, 16, 6);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px monospace';
        ctx.fillText('+-=', 75, 74);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Калькулятор', 55, 90);

        // 7. Заметки (Блокнот)
        ctx.fillStyle = '#fef08a'; ctx.fillRect(72, 100, 20, 22);
        ctx.strokeStyle = '#ca8a04'; ctx.strokeRect(72, 100, 20, 22);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(75, 104, 14, 2); ctx.fillRect(75, 109, 14, 2);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Заметки', 66, 134);

        // COLUMN 3: GAMES (MINECRAFT & ROBLOX!) (x: 126)
        // 8. 🟩 MINECRAFT.EXE
        ctx.fillStyle = '#4a2e18'; ctx.fillRect(130, 12, 24, 24);
        ctx.fillStyle = '#15803d'; ctx.fillRect(130, 12, 24, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(133, 20, 3, 3); ctx.fillRect(140, 20, 4, 4); ctx.fillRect(147, 20, 3, 3);
        ctx.fillStyle = '#facc15'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Minecraft', 122, 48);

        // 9. 🟥 ROBLOX PLAYER
        ctx.fillStyle = '#e11d48'; ctx.fillRect(130, 56, 24, 24);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(138, 64, 8, 8);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Roblox', 127, 92);

        // Open Document Editor Window
        var winX = 180;
        var winY = 22;
        var winW = 320;
        var winH = 320;

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(winX + 4, winY + 4, winW, winH);

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(winX, winY, winW, winH);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(winX, winY, winW, winH);

        ctx.fillStyle = '#000080';
        ctx.fillRect(winX + 3, winY + 3, winW - 6, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Текстовый редактор - [Отчет_13.txt]', winX + 8, winY + 17);

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(winX + winW - 20, winY + 5, 15, 15);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(winX + winW - 20, winY + 5, 15, 15);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('X', winX + winW - 16, winY + 16);

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(winX + 3, winY + 26, winW - 6, 18);
        ctx.fillStyle = '#000000';
        ctx.font = '10px sans-serif';
        ctx.fillText('Файл   Правка   Вид   Вставка   Справка', winX + 6, winY + 38);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(winX + 4, winY + 45, winW - 8, winH - 72);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(winX + 4, winY + 45, winW - 8, winH - 72);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('СЛУЖЕБНЫЙ ОТЧЕТ № 13-Б', winX + 14, winY + 70);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#475569';
        ctx.fillText('Смена: Ночная (21:00 - 06:00)', winX + 14, winY + 90);
        ctx.fillText('Сотрудник: Дежурный оператор', winX + 14, winY + 106);
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Статус: ОЖИДАЕТ ВВОДА ДАННЫХ...', winX + 14, winY + 135);
        ctx.fillStyle = '#0f766e';
        ctx.font = '10px monospace';
        ctx.fillText('Нажмите [F], чтобы открыть ПК,', winX + 14, winY + 168);
        ctx.fillText('перепечатать отчет, запустить 1С,', winX + 14, winY + 184);
        ctx.fillText('сыграть в Minecraft или Roblox!', winX + 14, winY + 200);

        ctx.fillStyle = '#000000';
        ctx.fillRect(winX + 14, winY + 218, 7, 13);

        // Windows 98 Taskbar at bottom
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(0, 354, 512, 30);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 354); ctx.lineTo(512, 354);
        ctx.stroke();

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(4, 358, 64, 22);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(4, 358, 64, 22);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(8, 363, 5, 5);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(14, 363, 5, 5);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(8, 369, 5, 5);
        ctx.fillStyle = '#eab308'; ctx.fillRect(14, 369, 5, 5);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Пуск', 24, 374);

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(72, 358, 105, 22);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(72, 358, 105, 22);
        ctx.fillStyle = '#000000';
        ctx.font = '9px sans-serif';
        ctx.fillText('📄 [Отчет_13.txt]', 76, 372);

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(181, 358, 85, 22);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(181, 358, 85, 22);
        ctx.fillStyle = '#000000';
        ctx.font = '9px sans-serif';
        ctx.fillText('🟩 Minecraft', 186, 372);

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(270, 358, 85, 22);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(270, 358, 85, 22);
        ctx.fillStyle = '#000000';
        ctx.font = '9px sans-serif';
        ctx.fillText('📊 1С:Склад', 276, 372);

        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(455, 358, 52, 22);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(455, 358, 52, 22);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('21:14', 466, 373);

        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        for (var sl = 0; sl < 384; sl += 3) {
            ctx.fillRect(0, sl, 512, 1);
        }

        cachedOfficeScreenTexPlayer = new THREE.CanvasTexture(canvas);
        return cachedOfficeScreenTexPlayer;
    } else {
        // Mikhail's screen: 1C Accounting and Green Server Terminal
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 512, 384);

        // Upper window: 1C: Бухгалтерия 7.7
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(10, 10, 492, 190);
        ctx.fillStyle = '#000080';
        ctx.fillRect(12, 12, 488, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('MS EXCEL 97 - [Сводная ведомость поставок (Ноябрь)]', 20, 27);

        // Table headers
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(12, 36, 488, 20);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('АРТИКУЛ    НАИМЕНОВАНИЕ        КОЛ-ВО   ЦЕНА   СТАТУС', 20, 50);

        // Table rows
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(12, 58, 488, 140);
        var rows = [
            '#0944-A    Консервы мясные     140 шт   120р   [В РЕЗЕРВЕ]',
            '#0945-B    Медикаменты тип-2    85 уп   350р   [ОТГРУЖЕНО]',
            '#0949-X    Генератор 5.5кВт      4 шт  45000р  [ДЕФИЦИТ]',
            '#0951-C    Топливо дизель      1200 л    52р   [ЗАБЛОКИР.]',
            '#0999-Z    Спецпакет "Карантин"  1 ящ    ----  [ОШИБКА]'
        ];
        for (var ri = 0; ri < rows.length; ri++) {
            if (ri === 4) ctx.fillStyle = '#dc2626';
            else ctx.fillStyle = '#1e293b';
            ctx.font = '10px monospace';
            ctx.fillText(rows[ri], 20, 78 + ri * 24);
        }

        // Lower window: Phosphor green terminal
        ctx.fillStyle = '#021810';
        ctx.fillRect(10, 212, 492, 160);
        ctx.strokeStyle = '#059669';
        ctx.strokeRect(10, 212, 492, 160);

        ctx.fillStyle = '#10b981';
        ctx.font = '11px monospace';
        ctx.fillText('C:\\DISTRICT_NET> ping 192.168.0.1 -t', 22, 234);
        ctx.fillText('Ответ от 192.168.0.1: число байт=32 время=4мс TTL=64', 22, 252);
        ctx.fillText('Ответ от 192.168.0.1: число байт=32 время=3мс TTL=64', 22, 270);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('ВНИМАНИЕ: Превышен интервал ожидания для запроса.', 22, 294);
        ctx.fillText('КРИТИЧЕСКИЙ СБОЙ: Связь с центральным шлюзом потеряна!', 22, 314);
        ctx.fillStyle = '#22c55e';
        ctx.fillText('C:\\DISTRICT_NET> _', 22, 340);

        // Scanlines overlay
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        for (var sl2 = 0; sl2 < 384; sl2 += 3) {
            ctx.fillRect(0, sl2, 512, 1);
        }

        cachedOfficeScreenTexOther = new THREE.CanvasTexture(canvas);
        return cachedOfficeScreenTexOther;
    }
}

function getOfficeFloorTexture() {
    if (cachedOfficeFloorTex) return cachedOfficeFloorTex;
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext('2d');

    // Base commercial carpet slate color
    ctx.fillStyle = '#252e3d';
    ctx.fillRect(0, 0, 512, 512);

    // Carpet tiles (4x4 tiles of 128x128)
    for (var ty = 0; ty < 4; ty++) {
        for (var tx = 0; tx < 4; tx++) {
            var px = tx * 128;
            var py = ty * 128;
            var isAlt = (tx + ty) % 2 === 0;

            ctx.fillStyle = isAlt ? '#2a3545' : '#222b39';
            ctx.fillRect(px + 2, py + 2, 124, 124);

            // Subtle carpet fibers / mottle
            ctx.fillStyle = isAlt ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)';
            for (var d = 0; d < 80; d++) {
                var rx = px + 4 + Math.random() * 120;
                var ry = py + 4 + Math.random() * 120;
                ctx.fillRect(rx, ry, 2, 2);
            }

            // Dark seam between carpet tiles
            ctx.strokeStyle = '#181f2a';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 1, py + 1, 126, 126);
        }
    }

    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 4);
    cachedOfficeFloorTex = tex;
    return cachedOfficeFloorTex;
}

function getOfficeCeilingTexture() {
    if (cachedOfficeCeilingTex) return cachedOfficeCeilingTex;
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext('2d');

    // White acoustic drop ceiling panels
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);

    // 4x4 grid of ceiling tiles
    for (var cy = 0; cy < 4; cy++) {
        for (var cx = 0; cx < 4; cx++) {
            var x0 = cx * 128;
            var y0 = cy * 128;
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x0 + 2, y0 + 2, 124, 124);

            // Acoustic pinhole speckles
            ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
            for (var p = 0; p < 70; p++) {
                var sx = x0 + 6 + Math.random() * 116;
                var sy = y0 + 6 + Math.random() * 116;
                ctx.fillRect(sx, sy, 2, 2);
            }

            // T-bar metal grid divider lines
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3;
            ctx.strokeRect(x0, y0, 128, 128);
        }
    }

    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    cachedOfficeCeilingTex = tex;
    return cachedOfficeCeilingTex;
}

function getCorkboardTexture() {
    if (cachedCorkboardTex) return cachedCorkboardTex;
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    // Cork background
    ctx.fillStyle = '#b68555';
    ctx.fillRect(0, 0, 512, 256);
    // Mottled cork texture
    ctx.fillStyle = 'rgba(120, 70, 30, 0.12)';
    for (var ci = 0; ci < 600; ci++) {
        var cx = Math.random() * 512;
        var cy = Math.random() * 256;
        var sz = 2 + Math.random() * 4;
        ctx.fillRect(cx, cy, sz, sz);
    }

    // Wooden frame around corkboard
    ctx.strokeStyle = '#5c3a21';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 246);

    // Pinned December Calendar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(30, 30, 120, 150);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(30, 30, 120, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('ДЕКАБРЬ 2026', 44, 50);
    // Calendar grid
    ctx.fillStyle = '#1e293b';
    ctx.font = '9px monospace';
    ctx.fillText('Пн Вт Ср Чт Пт Сб Вс', 34, 76);
    ctx.fillText(' 1  2  3  4  5  6  7', 34, 96);
    ctx.fillText(' 8  9 10 11 12 13 14', 34, 114);
    ctx.fillText('15 16 17 18 19 20 21', 34, 132);
    ctx.fillStyle = '#dc2626';
    ctx.fillText('22 23 24 25 26 27 28', 34, 150);
    ctx.fillText('29 30 31', 34, 168);
    // Red pushpin
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(90, 36, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pinned Yellow Memo Note
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(180, 40, 90, 85);
    ctx.fillStyle = '#854d0e';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('СРОЧНО!', 200, 58);
    ctx.font = '8px sans-serif';
    ctx.fillText('Сдать ночной', 190, 74);
    ctx.fillText('отчет до 22:00!', 190, 88);
    ctx.fillText('Шеф ругается.', 190, 102);
    // Blue pushpin
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(225, 45, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pinned Pink Memo Note
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(290, 50, 90, 80);
    ctx.fillStyle = '#831843';
    ctx.font = '8px sans-serif';
    ctx.fillText('Пароль от Wi-Fi:', 298, 70);
    ctx.font = 'bold 9px monospace';
    ctx.fillText('OfficeSec2026', 298, 86);
    ctx.font = '8px sans-serif';
    ctx.fillText('Не разглашать!', 298, 102);
    // Yellow pushpin
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(335, 55, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pinned Safety Memo (A4 Sheet)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(400, 30, 90, 130);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('ИНСТРУКЦИЯ', 412, 48);
    ctx.font = '7px sans-serif';
    ctx.fillText('При сирене ГО:', 410, 62);
    ctx.fillText('- Закрыть окна', 410, 76);
    ctx.fillText('- Запереть двери', 410, 90);
    ctx.fillText('- Не выходить на', 410, 104);
    ctx.fillText('  улицу до утра!', 410, 116);
    // Red stamp
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(420, 126, 50, 20);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('УТВЕРЖДЕНО', 423, 139);
    // Pushpin
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(445, 36, 4, 0, Math.PI * 2);
    ctx.fill();

    cachedCorkboardTex = new THREE.CanvasTexture(canvas);
    return cachedCorkboardTex;
}

function getWallClockTexture() {
    if (cachedWallClockTex) return cachedWallClockTex;
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    // Outer rim
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();

    // Inner dial face
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 128, 112, 0, Math.PI * 2);
    ctx.fill();

    // Hour numbers
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var nums = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    for (var ni = 0; ni < 12; ni++) {
        var nang = (ni / 12) * Math.PI * 2 - Math.PI / 2;
        var nx = 128 + Math.cos(nang) * 88;
        var ny = 128 + Math.sin(nang) * 88;
        ctx.fillText(nums[ni], nx, ny);
    }

    // Minute tick marks
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (var mi = 0; mi < 60; mi++) {
        var mang = (mi / 60) * Math.PI * 2;
        var x1 = 128 + Math.cos(mang) * 102;
        var y1 = 128 + Math.sin(mang) * 102;
        var x2 = 128 + Math.cos(mang) * (mi % 5 === 0 ? 94 : 98);
        var y2 = 128 + Math.sin(mang) * (mi % 5 === 0 ? 94 : 98);
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Hands set to 21:14
    var hrAng = (9.23 / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(hrAng) * 55, 128 + Math.sin(hrAng) * 55);
    ctx.stroke();

    var minAng = (14 / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(minAng) * 78, 128 + Math.sin(minAng) * 78);
    ctx.stroke();

    // Red second hand
    var secAng = (38 / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(secAng) * 88, 128 + Math.sin(secAng) * 88);
    ctx.stroke();

    // Center pivot cap
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(128, 128, 6, 0, Math.PI * 2);
    ctx.fill();

    cachedWallClockTex = new THREE.CanvasTexture(canvas);
    return cachedWallClockTex;
}

// ==================== WORKSTATION & FURNITURE BUILDERS ====================
function buildDetailedComputer(x, z, isPlayer) {
    var compGroup = new THREE.Group();
    compGroup.position.set(x, 0, z);

    var beigeMat = makeMat(0xded6c4);       // classic 90s PC beige
    var darkBeigeMat = makeMat(0xbab29f);   // recessed / shadowed bezel
    var blackPlasticMat = makeMat(0x1a1a1a);
    var ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    var ledOrangeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    var screenTex = getOfficeComputerScreenTexture(isPlayer);
    var screenMat = new THREE.MeshBasicMaterial({ map: screenTex });

    // 1. MONITOR STAND (on desk y = 0.78 - 0.80)
    // Swivel base
    addMesh(new THREE.CylinderGeometry(0.12, 0.14, 0.02, 16), beigeMat, 0, 0.81, -0.22, compGroup);
    // Stand neck / stem
    addMesh(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 12), darkBeigeMat, 0, 0.85, -0.22, compGroup);

    // 2. CRT MONITOR BODY
    // Main CRT rear chassis
    addMesh(new THREE.BoxGeometry(0.42, 0.34, 0.28), beigeMat, 0, 0.99, -0.34, compGroup);
    // Rear vent louvers
    addMesh(new THREE.BoxGeometry(0.32, 0.08, 0.01), darkBeigeMat, 0, 1.05, -0.485, compGroup);
    
    // Front bezel (frame surrounding CRT screen)
    addMesh(new THREE.BoxGeometry(0.46, 0.38, 0.08), beigeMat, 0, 0.99, -0.19, compGroup);
    // Inner bevel (dark frame around tube)
    addMesh(new THREE.BoxGeometry(0.40, 0.31, 0.02), darkBeigeMat, 0, 1.00, -0.145, compGroup);

    // Curved CRT Screen Glass
    var crtScreen = addMesh(new THREE.PlaneGeometry(0.38, 0.28), screenMat, 0, 1.00, -0.134, compGroup);
    // Screen Hitbox & Interaction
    if (isPlayer) {
        crtScreen.userData = { name: 'Твой рабочий компьютер [F]', type: 'computer' };
        interactables.push(crtScreen);
    } else {
        crtScreen.userData = { name: 'Компьютер коллеги [F]', type: 'other_computer' };
        interactables.push(crtScreen);
    }

    // Monitor Front Controls (under the screen)
    // Power button
    addMesh(new THREE.BoxGeometry(0.03, 0.018, 0.008), blackPlasticMat, 0.16, 0.835, -0.148, compGroup);
    // Power LED (Glowing green)
    addMesh(new THREE.BoxGeometry(0.008, 0.008, 0.006), ledGreenMat, 0.13, 0.835, -0.148, compGroup);
    // Adjustment knobs / dials (brightness/contrast)
    addMesh(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 8), darkBeigeMat, -0.12, 0.835, -0.148, compGroup);
    addMesh(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 8), darkBeigeMat, -0.09, 0.835, -0.148, compGroup);

    // CRT Screen Light Glow (illuminates desk & keyboard)
    var screenLight = new THREE.PointLight(isPlayer ? 0x60a5fa : 0x4ade80, 0.40, 1.3);
    screenLight.position.set(0, 1.0, -0.05);
    compGroup.add(screenLight);

    // 3. PC TOWER CASE (System Unit under / beside the desk on floor y = 0)
    var towerX = 0.65;
    var towerY = 0.22;
    var towerZ = -0.15;
    // Tower chassis
    addMesh(new THREE.BoxGeometry(0.18, 0.42, 0.44), beigeMat, towerX, towerY, towerZ, compGroup);
    // Front face panel
    addMesh(new THREE.BoxGeometry(0.176, 0.41, 0.02), darkBeigeMat, towerX, towerY, towerZ + 0.22, compGroup);
    // 5.25" CD-ROM drive
    addMesh(new THREE.BoxGeometry(0.14, 0.045, 0.015), beigeMat, towerX, towerY + 0.13, towerZ + 0.23, compGroup);
    addMesh(new THREE.BoxGeometry(0.11, 0.006, 0.016), blackPlasticMat, towerX, towerY + 0.13, towerZ + 0.232, compGroup);
    addMesh(new THREE.BoxGeometry(0.015, 0.008, 0.017), blackPlasticMat, towerX + 0.045, towerY + 0.118, towerZ + 0.232, compGroup);
    addMesh(new THREE.BoxGeometry(0.006, 0.006, 0.018), ledGreenMat, towerX - 0.045, towerY + 0.118, towerZ + 0.232, compGroup);
    // 3.5" Floppy Disk Drive
    addMesh(new THREE.BoxGeometry(0.11, 0.03, 0.015), beigeMat, towerX, towerY + 0.07, towerZ + 0.23, compGroup);
    addMesh(new THREE.BoxGeometry(0.08, 0.004, 0.016), blackPlasticMat, towerX, towerY + 0.072, towerZ + 0.232, compGroup);
    addMesh(new THREE.BoxGeometry(0.012, 0.006, 0.017), blackPlasticMat, towerX + 0.035, towerY + 0.065, towerZ + 0.232, compGroup);
    addMesh(new THREE.BoxGeometry(0.005, 0.005, 0.018), ledOrangeMat, towerX - 0.035, towerY + 0.065, towerZ + 0.232, compGroup);
    // Power & Reset buttons
    addMesh(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 10), blackPlasticMat, towerX - 0.03, towerY - 0.01, towerZ + 0.231, compGroup);
    addMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.01, 10), darkBeigeMat, towerX + 0.03, towerY - 0.01, towerZ + 0.231, compGroup);
    // Power & HDD LEDs
    addMesh(new THREE.BoxGeometry(0.006, 0.006, 0.005), ledGreenMat, towerX - 0.01, towerY - 0.01, towerZ + 0.232, compGroup);
    addMesh(new THREE.BoxGeometry(0.006, 0.006, 0.005), ledOrangeMat, towerX + 0.01, towerY - 0.01, towerZ + 0.232, compGroup);
    // Lower intake vent grill
    addMesh(new THREE.BoxGeometry(0.12, 0.08, 0.008), blackPlasticMat, towerX, towerY - 0.11, towerZ + 0.23, compGroup);

    // 4. KEYBOARD (on desk y = 0.80)
    var kbGroup = new THREE.Group();
    kbGroup.position.set(0, 0.81, 0.05);
    kbGroup.rotation.x = 0.05;
    // Keyboard base wedge
    addMesh(new THREE.BoxGeometry(0.46, 0.02, 0.16), beigeMat, 0, 0, 0, kbGroup);
    // Keybed recess
    addMesh(new THREE.BoxGeometry(0.44, 0.008, 0.145), darkBeigeMat, 0, 0.012, 0, kbGroup);
    // Main alphanumeric key block
    addMesh(new THREE.BoxGeometry(0.26, 0.012, 0.11), beigeMat, -0.07, 0.018, 0.01, kbGroup);
    // Function keys row (F1-F12)
    addMesh(new THREE.BoxGeometry(0.42, 0.010, 0.02), darkBeigeMat, 0, 0.018, -0.055, kbGroup);
    // Spacebar
    addMesh(new THREE.BoxGeometry(0.13, 0.012, 0.02), beigeMat, -0.07, 0.020, 0.055, kbGroup);
    // Navigation / Arrow cluster
    addMesh(new THREE.BoxGeometry(0.045, 0.012, 0.07), beigeMat, 0.10, 0.018, 0.02, kbGroup);
    // Numpad key cluster
    addMesh(new THREE.BoxGeometry(0.085, 0.012, 0.11), beigeMat, 0.18, 0.018, 0.01, kbGroup);
    // Lock indicator LEDs (green dots)
    addMesh(new THREE.BoxGeometry(0.004, 0.004, 0.004), ledGreenMat, 0.18, 0.022, -0.055, kbGroup);
    addMesh(new THREE.BoxGeometry(0.004, 0.004, 0.004), ledGreenMat, 0.19, 0.022, -0.055, kbGroup);
    compGroup.add(kbGroup);

    // 5. MOUSEPAD & MOUSE (on desk to the right of keyboard)
    var padMat = makeMat(0x1e293b);
    addMesh(new THREE.BoxGeometry(0.20, 0.004, 0.22), padMat, 0.32, 0.803, 0.05, compGroup);
    // Mouse body
    addMesh(new THREE.BoxGeometry(0.065, 0.03, 0.10), beigeMat, 0.32, 0.82, 0.05, compGroup);
    // Mouse button divider
    addMesh(new THREE.BoxGeometry(0.003, 0.005, 0.04), darkBeigeMat, 0.32, 0.835, 0.025, compGroup);
    addMesh(new THREE.BoxGeometry(0.06, 0.004, 0.003), darkBeigeMat, 0.32, 0.835, 0.005, compGroup);

    // 6. Cables
    var cableMat = makeMat(0x111111);
    var kbCable = addMesh(new THREE.CylinderGeometry(0.003, 0.003, 0.25, 6), cableMat, 0, 0.805, -0.08, compGroup);
    kbCable.rotation.x = Math.PI / 2;
    var mouseCable = addMesh(new THREE.CylinderGeometry(0.003, 0.003, 0.25, 6), cableMat, 0.32, 0.805, -0.08, compGroup);
    mouseCable.rotation.x = Math.PI / 2;

    scene.add(compGroup);
    return compGroup;
}

function buildOfficeDesk(x, z, isPlayerDesk) {
    var deskGroup = new THREE.Group();
    deskGroup.position.set(x, 0, z);

    var topMat = makeMat(0xb58d63);       // warm beech laminate top
    var edgeMat = makeMat(0x8a633a);      // wood edging
    var frameMat = makeMat(0x334155);     // dark grey steel
    var silverMat = makeMat(0xd1d5db);    // silver handles
    var panelMat = makeMat(0x94724d);     // modesty panel

    // Desktop surface
    addMesh(new THREE.BoxGeometry(1.70, 0.035, 0.85), topMat, 0, 0.78, 0, deskGroup);
    addMesh(new THREE.BoxGeometry(1.71, 0.038, 0.01), edgeMat, 0, 0.78, 0.425, deskGroup);
    addMesh(new THREE.BoxGeometry(1.71, 0.038, 0.01), edgeMat, 0, 0.78, -0.425, deskGroup);

    // Modesty Panel
    addMesh(new THREE.BoxGeometry(1.60, 0.40, 0.02), panelMat, 0, 0.52, -0.38, deskGroup);

    // Steel Legs (left side)
    addMesh(new THREE.BoxGeometry(0.05, 0.76, 0.05), frameMat, -0.78, 0.38, -0.38, deskGroup);
    addMesh(new THREE.BoxGeometry(0.05, 0.76, 0.05), frameMat, -0.78, 0.38,  0.38, deskGroup);
    addMesh(new THREE.BoxGeometry(0.05, 0.04, 0.76), frameMat, -0.78, 0.04,  0, deskGroup);

    // Three-Drawer Pedestal (right side under desk)
    var pedX = 0.58;
    addMesh(new THREE.BoxGeometry(0.42, 0.68, 0.76), topMat, pedX, 0.36, -0.02, deskGroup);
    for (var di = 0; di < 3; di++) {
        var dy = 0.58 - di * 0.21;
        addMesh(new THREE.BoxGeometry(0.40, 0.19, 0.015), topMat, pedX, dy, 0.365, deskGroup);
        addMesh(new THREE.BoxGeometry(0.14, 0.016, 0.02), silverMat, pedX, dy, 0.378, deskGroup);
        if (di === 0) {
            var lock = addMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.01, 8), silverMat, pedX + 0.14, dy + 0.05, 0.374, deskGroup);
            lock.rotation.x = Math.PI / 2;
        }
    }

    // Desk Accessories / Clutter
    // Coffee Mug
    var mugMat = makeMat(0xf8fafc);
    var coffeeMat = makeMat(0x382012);
    var mugX = -0.62;
    var mugZ = -0.15;
    addMesh(new THREE.CylinderGeometry(0.042, 0.038, 0.09, 14), mugMat, mugX, 0.84, mugZ, deskGroup);
    addMesh(new THREE.CylinderGeometry(0.036, 0.036, 0.01, 12), coffeeMat, mugX, 0.87, mugZ, deskGroup);
    var handleMesh = addMesh(new THREE.TorusGeometry(0.024, 0.007, 8, 12, Math.PI), mugMat, mugX - 0.042, 0.84, mugZ, deskGroup);
    handleMesh.rotation.z = Math.PI / 2;

    // Pen Holder Cup
    var cupMat = makeMat(0x1e293b);
    var penCupX = -0.62;
    var penCupZ = 0.12;
    addMesh(new THREE.CylinderGeometry(0.038, 0.034, 0.095, 12), cupMat, penCupX, 0.845, penCupZ, deskGroup);
    var penMat1 = makeMat(0x2563eb);
    var penMat2 = makeMat(0xdc2626);
    var penMat3 = makeMat(0xeab308);
    var p1 = addMesh(new THREE.CylinderGeometry(0.005, 0.005, 0.14, 6), penMat1, penCupX - 0.01, 0.92, penCupZ - 0.01, deskGroup);
    p1.rotation.z = 0.18;
    var p2 = addMesh(new THREE.CylinderGeometry(0.005, 0.005, 0.13, 6), penMat2, penCupX + 0.01, 0.91, penCupZ + 0.01, deskGroup);
    p2.rotation.x = -0.16;
    var p3 = addMesh(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 6), penMat3, penCupX, 0.90, penCupZ, deskGroup);
    p3.rotation.z = -0.14;

    // Document stack
    var paperMat = makeMat(0xffffff);
    var docStack = addMesh(new THREE.BoxGeometry(0.22, 0.025, 0.30), paperMat, -0.48, 0.81, 0.22, deskGroup);
    docStack.rotation.y = 0.06;

    // Solid obstacle collider
    colliders.push({ minX: x - 0.90, maxX: x + 0.90, minZ: z - 0.48, maxZ: z + 0.48 });

    scene.add(deskGroup);
    return deskGroup;
}

function buildColleague(x, z) {
    var cGroup = new THREE.Group();
    cGroup.position.set(x, 0, z);

    var skinMat = makeMat(0xdfa17a);        // Caucasian skin tone
    var hairMat = makeMat(0x2d1f18);        // dark brown styled hair
    var sweaterMat = makeMat(0x1e3a5f);     // navy blue knitted office sweater
    var shirtCollarMat = makeMat(0xf8fafc); // white dress shirt collar
    var pantsMat = makeMat(0x334155);       // slate grey office trousers
    var shoeMat = makeMat(0x0f172a);        // black leather shoes
    var glassesMat = makeMat(0x111111);     // wireframe glasses
    var lensMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.5 });

    // 1. CHAIR (5-Star Ergonomic Office Swivel Chair)
    var chairMat = makeMat(0x18181b);
    var chromeMat = makeMat(0x94a3b8);
    // Base hub & cylinder
    addMesh(new THREE.CylinderGeometry(0.04, 0.05, 0.20, 12), chromeMat, 0, 0.15, 0.65, cGroup);
    // 5 caster wheel legs radiating outwards
    for (var legI = 0; legI < 5; legI++) {
        var ang = (legI / 5) * Math.PI * 2;
        var legX = Math.cos(ang) * 0.16;
        var legZ = 0.65 + Math.sin(ang) * 0.16;
        var wheelLeg = addMesh(new THREE.BoxGeometry(0.03, 0.025, 0.32), chairMat, legX, 0.06, legZ, cGroup);
        wheelLeg.rotation.y = -ang;
        var tipX = Math.cos(ang) * 0.30;
        var tipZ = 0.65 + Math.sin(ang) * 0.30;
        addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), chairMat, tipX, 0.03, tipZ, cGroup);
    }
    // Chair seat cushion
    addMesh(new THREE.BoxGeometry(0.52, 0.08, 0.50), chairMat, 0, 0.48, 0.62, cGroup);
    // Chair backrest support bracket
    addMesh(new THREE.BoxGeometry(0.06, 0.38, 0.04), chromeMat, 0, 0.68, 0.85, cGroup);
    // Contoured backrest
    var backrest = addMesh(new THREE.BoxGeometry(0.48, 0.48, 0.06), chairMat, 0, 0.88, 0.84, cGroup);
    backrest.rotation.x = -0.08;
    // Armrests
    addMesh(new THREE.BoxGeometry(0.06, 0.03, 0.30), chairMat, -0.26, 0.70, 0.62, cGroup);
    addMesh(new THREE.BoxGeometry(0.06, 0.03, 0.30), chairMat,  0.26, 0.70, 0.62, cGroup);
    addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.20, 8), chromeMat, -0.26, 0.60, 0.62, cGroup);
    addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.20, 8), chromeMat,  0.26, 0.60, 0.62, cGroup);

    // 2. LEGS & SHOES (seated under desk)
    addMesh(new THREE.BoxGeometry(0.14, 0.13, 0.42), pantsMat, -0.12, 0.52, 0.42, cGroup);
    addMesh(new THREE.BoxGeometry(0.14, 0.13, 0.42), pantsMat,  0.12, 0.52, 0.42, cGroup);
    addMesh(new THREE.BoxGeometry(0.12, 0.40, 0.13), pantsMat, -0.12, 0.26, 0.18, cGroup);
    addMesh(new THREE.BoxGeometry(0.12, 0.40, 0.13), pantsMat,  0.12, 0.26, 0.18, cGroup);
    addMesh(new THREE.BoxGeometry(0.13, 0.07, 0.24), shoeMat, -0.12, 0.04, 0.14, cGroup);
    addMesh(new THREE.BoxGeometry(0.13, 0.07, 0.24), shoeMat,  0.12, 0.04, 0.14, cGroup);

    // 3. TORSO & SWEATER
    addMesh(new THREE.BoxGeometry(0.38, 0.16, 0.32), pantsMat, 0, 0.56, 0.62, cGroup);
    var torso = addMesh(new THREE.BoxGeometry(0.44, 0.46, 0.28), sweaterMat, 0, 0.82, 0.60, cGroup);
    torso.rotation.x = 0.08;
    addMesh(new THREE.BoxGeometry(0.16, 0.06, 0.14), shirtCollarMat, 0, 1.04, 0.56, cGroup);

    // 4. ARMS & HANDS (resting on desk typing on keyboard)
    var lUpperArm = addMesh(new THREE.BoxGeometry(0.11, 0.32, 0.12), sweaterMat, -0.26, 0.84, 0.55, cGroup);
    lUpperArm.rotation.x = 0.35;
    var rUpperArm = addMesh(new THREE.BoxGeometry(0.11, 0.32, 0.12), sweaterMat,  0.26, 0.84, 0.55, cGroup);
    rUpperArm.rotation.x = 0.35;

    var lForearm = addMesh(new THREE.BoxGeometry(0.10, 0.09, 0.36), sweaterMat, -0.16, 0.82, 0.30, cGroup);
    lForearm.rotation.y = -0.18;
    var rForearm = addMesh(new THREE.BoxGeometry(0.10, 0.09, 0.36), sweaterMat,  0.22, 0.82, 0.30, cGroup);
    rForearm.rotation.y = 0.15;

    var lHand = addMesh(new THREE.BoxGeometry(0.09, 0.04, 0.10), skinMat, -0.11, 0.825, 0.10, cGroup);
    lHand.rotation.y = -0.12;
    var rHand = addMesh(new THREE.BoxGeometry(0.085, 0.04, 0.10), skinMat, 0.28, 0.825, 0.10, cGroup);
    rHand.rotation.y = 0.08;

    // 5. NECK, HEAD & FACE
    addMesh(new THREE.CylinderGeometry(0.06, 0.07, 0.10, 10), skinMat, 0, 1.08, 0.55, cGroup);
    var head = addMesh(new THREE.BoxGeometry(0.20, 0.22, 0.21), skinMat, 0, 1.22, 0.52, cGroup);
    head.rotation.x = 0.12;

    var hairTop = addMesh(new THREE.BoxGeometry(0.216, 0.09, 0.226), hairMat, 0, 1.32, 0.51, cGroup);
    hairTop.rotation.x = 0.12;
    var hairBack = addMesh(new THREE.BoxGeometry(0.212, 0.15, 0.07), hairMat, 0, 1.23, 0.61, cGroup);
    hairBack.rotation.x = 0.12;

    addMesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), skinMat, -0.11, 1.22, 0.53, cGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), skinMat,  0.11, 1.22, 0.53, cGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.05, 0.04), skinMat, 0, 1.21, 0.40, cGroup);

    var eyeWhiteMat = makeMat(0xf1f5f9);
    var pupilMat = makeMat(0x0f172a);
    addMesh(new THREE.BoxGeometry(0.04, 0.018, 0.01), eyeWhiteMat, -0.05, 1.23, 0.41, cGroup);
    addMesh(new THREE.BoxGeometry(0.04, 0.018, 0.01), eyeWhiteMat,  0.05, 1.23, 0.41, cGroup);
    addMesh(new THREE.BoxGeometry(0.018, 0.018, 0.012), pupilMat, -0.05, 1.23, 0.408, cGroup);
    addMesh(new THREE.BoxGeometry(0.018, 0.018, 0.012), pupilMat,  0.05, 1.23, 0.408, cGroup);
    addMesh(new THREE.BoxGeometry(0.05, 0.012, 0.01), hairMat, -0.05, 1.26, 0.408, cGroup);
    addMesh(new THREE.BoxGeometry(0.05, 0.012, 0.01), hairMat,  0.05, 1.26, 0.408, cGroup);

    // Glasses
    addMesh(new THREE.BoxGeometry(0.06, 0.035, 0.005), glassesMat, -0.05, 1.23, 0.40, cGroup);
    addMesh(new THREE.BoxGeometry(0.06, 0.035, 0.005), glassesMat,  0.05, 1.23, 0.40, cGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.005, 0.005), glassesMat, 0, 1.24, 0.40, cGroup);
    addMesh(new THREE.BoxGeometry(0.05, 0.03, 0.002), lensMat, -0.05, 1.23, 0.401, cGroup);
    addMesh(new THREE.BoxGeometry(0.05, 0.03, 0.002), lensMat,  0.05, 1.23, 0.401, cGroup);

    // 6. INTERACTIVE HITBOX
    var colleagueHitbox = addMesh(new THREE.BoxGeometry(0.7, 1.4, 0.7), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.8, 0.55, cGroup);
    colleagueHitbox.userData = { name: 'Коллега (Михаил) [F]', type: 'colleague' };
    interactables.push(colleagueHitbox);

    // Collider so player can't walk into Mikhail
    colliders.push({ minX: x - 0.45, maxX: x + 0.45, minZ: z + 0.25, maxZ: z + 0.95 });

    scene.add(cGroup);
    return cGroup;
}

function buildFilingCabinet(x, z, rotY) {
    var cabGroup = new THREE.Group();
    cabGroup.position.set(x, 0, z);
    cabGroup.rotation.y = rotY || 0;

    var steelMat = makeMat(0x475569);
    var darkSteelMat = makeMat(0x334155);
    var chromeMat = makeMat(0xe2e8f0);

    // Main cabinet body
    addMesh(new THREE.BoxGeometry(0.48, 1.35, 0.62), steelMat, 0, 0.675, 0, cabGroup);
    addMesh(new THREE.BoxGeometry(0.50, 0.05, 0.64), darkSteelMat, 0, 0.025, 0, cabGroup);
    addMesh(new THREE.BoxGeometry(0.50, 0.03, 0.64), darkSteelMat, 0, 1.36, 0, cabGroup);

    // 4 Drawers
    for (var di = 0; di < 4; di++) {
        var dy = 0.20 + di * 0.31;
        addMesh(new THREE.BoxGeometry(0.44, 0.29, 0.015), steelMat, 0, dy, 0.315, cabGroup);
        addMesh(new THREE.BoxGeometry(0.444, 0.004, 0.016), darkSteelMat, 0, dy + 0.145, 0.316, cabGroup);
        addMesh(new THREE.BoxGeometry(0.12, 0.02, 0.025), chromeMat, 0, dy, 0.33, cabGroup);
        addMesh(new THREE.BoxGeometry(0.08, 0.04, 0.005), chromeMat, 0, dy + 0.07, 0.325, cabGroup);
        addMesh(new THREE.BoxGeometry(0.065, 0.028, 0.006), makeMat(0xffffff), 0, dy + 0.07, 0.326, cabGroup);
    }

    var halfW = 0.28;
    var halfD = 0.34;
    colliders.push({ minX: x - halfW, maxX: x + halfW, minZ: z - halfD, maxZ: z + halfD });

    scene.add(cabGroup);
    return cabGroup;
}

function buildOfficeShelving(x, z) {
    var shelfGroup = new THREE.Group();
    shelfGroup.position.set(x, 0, z);

    var woodMat = makeMat(0x6b4f3b);
    var darkMat = makeMat(0x4a3525);
    var redFolderMat = makeMat(0xb91c1c);
    var blueFolderMat = makeMat(0x1d4ed8);
    var yellowFolderMat = makeMat(0xd97706);
    var blackFolderMat = makeMat(0x18181b);
    var paperMat = makeMat(0xf8fafc);
    var boxMat = makeMat(0xca8a04);

    // Vertical side panels
    addMesh(new THREE.BoxGeometry(0.03, 2.20, 0.38), woodMat, -0.585, 1.10, 0, shelfGroup);
    addMesh(new THREE.BoxGeometry(0.03, 2.20, 0.38), woodMat,  0.585, 1.10, 0, shelfGroup);
    addMesh(new THREE.BoxGeometry(1.20, 2.20, 0.015), darkMat, 0, 1.10, -0.18, shelfGroup);
    addMesh(new THREE.BoxGeometry(1.20, 0.03, 0.38), woodMat, 0, 0.015, 0, shelfGroup);
    addMesh(new THREE.BoxGeometry(1.20, 0.03, 0.38), woodMat, 0, 2.185, 0, shelfGroup);

    // Intermediate shelves
    var shelfLevels = [0.45, 0.90, 1.35, 1.80];
    for (var si = 0; si < shelfLevels.length; si++) {
        var sy = shelfLevels[si];
        addMesh(new THREE.BoxGeometry(1.14, 0.03, 0.36), woodMat, 0, sy, 0.01, shelfGroup);
    }

    // Storage boxes
    addMesh(new THREE.BoxGeometry(0.32, 0.28, 0.34), boxMat, -0.34, 0.18, 0, shelfGroup);
    addMesh(new THREE.BoxGeometry(0.32, 0.28, 0.34), boxMat,  0.02, 0.18, 0, shelfGroup);
    addMesh(new THREE.BoxGeometry(0.32, 0.28, 0.34), boxMat,  0.38, 0.18, 0, shelfGroup);

    // Document binders
    var fMats = [redFolderMat, blueFolderMat, blackFolderMat, yellowFolderMat, blueFolderMat, redFolderMat, blackFolderMat, yellowFolderMat];
    for (var fi = 0; fi < 12; fi++) {
        var fx = -0.50 + fi * 0.085;
        var fmat = fMats[fi % fMats.length];
        addMesh(new THREE.BoxGeometry(0.075, 0.32, 0.28), fmat, fx, 0.63, 0, shelfGroup);
        addMesh(new THREE.BoxGeometry(0.05, 0.12, 0.005), paperMat, fx, 0.65, 0.141, shelfGroup);
    }

    for (var fi2 = 0; fi2 < 6; fi2++) {
        var fx2 = -0.50 + fi2 * 0.085;
        var fmat2 = fMats[(fi2 + 2) % fMats.length];
        addMesh(new THREE.BoxGeometry(0.075, 0.32, 0.28), fmat2, fx2, 1.08, 0, shelfGroup);
        addMesh(new THREE.BoxGeometry(0.05, 0.12, 0.005), paperMat, fx2, 1.10, 0.141, shelfGroup);
    }
    addMesh(new THREE.BoxGeometry(0.30, 0.14, 0.22), paperMat, 0.22, 0.99, 0, shelfGroup);
    addMesh(new THREE.BoxGeometry(0.24, 0.09, 0.30), paperMat, 0.38, 0.965, 0, shelfGroup);

    // Technical manuals
    for (var bi = 0; bi < 10; bi++) {
        var bx = -0.48 + bi * 0.055;
        var bmat = (bi % 2 === 0) ? darkMat : redFolderMat;
        addMesh(new THREE.BoxGeometry(0.048, 0.26, 0.22), bmat, bx, 1.50, 0, shelfGroup);
    }

    colliders.push({ minX: x - 0.62, maxX: x + 0.62, minZ: z - 0.24, maxZ: z + 0.24 });

    scene.add(shelfGroup);
    return shelfGroup;
}

function buildWaterCooler(x, z) {
    var wcGroup = new THREE.Group();
    wcGroup.position.set(x, 0, z);

    var whiteMat = makeMat(0xf1f5f9);
    var darkGreyMat = makeMat(0x334155);
    var waterBottleMat = new THREE.MeshLambertMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65
    });
    var coldTapMat = makeMat(0x2563eb);
    var hotTapMat = makeMat(0xdc2626);

    // Main cooler body
    addMesh(new THREE.BoxGeometry(0.36, 0.92, 0.36), whiteMat, 0, 0.46, 0, wcGroup);
    addMesh(new THREE.BoxGeometry(0.38, 0.04, 0.38), darkGreyMat, 0, 0.02, 0, wcGroup);

    // Dispenser alcove recess
    addMesh(new THREE.BoxGeometry(0.26, 0.22, 0.12), darkGreyMat, 0, 0.64, 0.13, wcGroup);
    addMesh(new THREE.BoxGeometry(0.24, 0.02, 0.10), darkGreyMat, 0, 0.54, 0.14, wcGroup);

    // Dispensing levers
    addMesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), coldTapMat, -0.06, 0.70, 0.14, wcGroup);
    addMesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), hotTapMat,   0.06, 0.70, 0.14, wcGroup);

    // 19-Liter Water Bottle
    addMesh(new THREE.CylinderGeometry(0.06, 0.07, 0.06, 16), whiteMat, 0, 0.94, 0, wcGroup);
    addMesh(new THREE.CylinderGeometry(0.14, 0.14, 0.40, 16), waterBottleMat, 0, 1.16, 0, wcGroup);
    addMesh(new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), waterBottleMat, 0, 1.36, 0, wcGroup);

    // Cup dispenser tube on the side
    addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 12), makeMat(0xe2e8f0), 0.20, 0.72, 0, wcGroup);
    addMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), darkGreyMat, 0.20, 0.93, 0, wcGroup);

    // Interactable Hitbox
    var wcHitbox = addMesh(new THREE.BoxGeometry(0.44, 1.5, 0.44), new THREE.MeshBasicMaterial({ visible: false }), 0, 0.75, 0, wcGroup);
    wcHitbox.userData = { name: 'Кулер для воды [F]', type: 'water_cooler' };
    interactables.push(wcHitbox);

    colliders.push({ minX: x - 0.25, maxX: x + 0.25, minZ: z - 0.25, maxZ: z + 0.25 });

    scene.add(wcGroup);
    return wcGroup;
}

function buildOfficeFluorescentLight(x, y, z, parentList) {
    var lightGroup = new THREE.Group();
    lightGroup.position.set(x, y, z);

    var fixtureMat = makeMat(0x64748b);
    var diffuserMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    addMesh(new THREE.BoxGeometry(1.30, 0.04, 0.60), fixtureMat, 0, 0, 0, lightGroup);
    var panel = addMesh(new THREE.PlaneGeometry(1.22, 0.52), diffuserMat, 0, -0.021, 0, lightGroup);
    panel.rotation.x = Math.PI / 2;

    var pLight = new THREE.PointLight(0xf1f5f9, 0.55, 9.0);
    pLight.position.set(0, -0.15, 0);
    lightGroup.add(pLight);

    if (parentList) parentList.push(pLight);

    scene.add(lightGroup);
    return lightGroup;
}

function buildOfficeWindow(x, y, z) {
    var winGroup = new THREE.Group();
    winGroup.position.set(x, y, z);

    var frameMat = makeMat(0x1e293b);
    var sillMat = makeMat(0x0f172a);
    var glassMat = new THREE.MeshBasicMaterial({
        color: 0x050c18,
        transparent: true,
        opacity: 0.82
    });

    // Window frame
    addMesh(new THREE.BoxGeometry(2.20, 0.08, 0.08), frameMat, 0, 0.76, 0, winGroup);
    addMesh(new THREE.BoxGeometry(2.20, 0.08, 0.08), frameMat, 0, -0.76, 0, winGroup);
    addMesh(new THREE.BoxGeometry(0.08, 1.60, 0.08), frameMat, -1.06, 0, 0, winGroup);
    addMesh(new THREE.BoxGeometry(0.08, 1.60, 0.08), frameMat,  1.06, 0, 0, winGroup);

    // Mullions
    addMesh(new THREE.BoxGeometry(2.20, 0.04, 0.06), frameMat, 0, 0, 0, winGroup);
    addMesh(new THREE.BoxGeometry(0.04, 1.60, 0.06), frameMat, 0, 0, 0, winGroup);

    // Sill
    addMesh(new THREE.BoxGeometry(2.32, 0.06, 0.18), sillMat, 0, -0.79, 0.06, winGroup);

    // Glass
    addMesh(new THREE.PlaneGeometry(2.12, 1.52), glassMat, 0, 0, 0.01, winGroup);

    scene.add(winGroup);
    return winGroup;
}

// ==================== BUILD: OFFICE ====================
var officeLights = [];

function buildOffice() {
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.Fog(0x020408, 1, 14);

    officeLights = [];

    // Materials
    var wallMat = makeMat(0xd1d5db);
    var floorTex = getOfficeFloorTexture();
    var floorMat = makeMat(0xffffff, { map: floorTex });
    var ceilingTex = getOfficeCeilingTexture();
    var ceilingMat = makeMat(0xffffff, { map: ceilingTex });
    var skirtingMat = makeMat(0x1e293b);

    // Floor & Ceiling
    var of = addMesh(new THREE.PlaneGeometry(8.4, 10.0), floorMat, 0, 0, -2.0);
    of.rotation.x = -Math.PI / 2;

    var oc = addMesh(new THREE.PlaneGeometry(8.4, 10.0), ceilingMat, 0, 3.0, -2.0);
    oc.rotation.x = Math.PI / 2;

    // Walls
    // Back wall (z = -7.0)
    addMesh(new THREE.PlaneGeometry(8.4, 3.0), wallMat, 0, 1.5, -7.0);
    addMesh(new THREE.BoxGeometry(8.4, 0.12, 0.03), skirtingMat, 0, 0.06, -6.98);

    // Front wall (z = 3.0)
    var fw = addMesh(new THREE.PlaneGeometry(8.4, 3.0), wallMat, 0, 1.5, 3.0);
    fw.rotation.y = Math.PI;
    addMesh(new THREE.BoxGeometry(8.4, 0.12, 0.03), skirtingMat, 0, 0.06, 2.98);

    // Left wall (x = -4.2)
    var lw = addMesh(new THREE.PlaneGeometry(10.0, 3.0), wallMat, -4.2, 1.5, -2.0);
    lw.rotation.y = Math.PI / 2;
    addMesh(new THREE.BoxGeometry(0.03, 0.12, 10.0), skirtingMat, -4.18, 0.06, -2.0);

    // Right wall (x = 4.2)
    var rw = addMesh(new THREE.PlaneGeometry(10.0, 3.0), wallMat, 4.2, 1.5, -2.0);
    rw.rotation.y = -Math.PI / 2;
    addMesh(new THREE.BoxGeometry(0.03, 0.12, 10.0), skirtingMat, 4.18, 0.06, -2.0);

    // Exit Door (smooth, lag-free door assembly with hinge pivot and generous hitbox)
    var doorFrameMat = makeMat(0x334155);
    var doorWoodMat = makeMat(0x451a03);
    var silverMat = makeMat(0xe2e8f0);

    addMesh(new THREE.BoxGeometry(1.26, 2.26, 0.06), doorFrameMat, 0, 1.13, 2.97);

    var officeDoorGroup = new THREE.Group();
    officeDoorGroup.position.set(-0.57, 0, 2.96);
    var exitDoor = addMesh(new THREE.BoxGeometry(1.14, 2.18, 0.04), doorWoodMat, 0.57, 1.10, 0, officeDoorGroup);
    var dHandle = addMesh(new THREE.BoxGeometry(0.14, 0.025, 0.05), silverMat, 0.99, 1.05, -0.04, officeDoorGroup);
    var lockMesh = addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8), silverMat, 0.99, 0.98, -0.02, officeDoorGroup);
    lockMesh.rotation.x = Math.PI / 2;
    scene.add(officeDoorGroup);
    gameState.officeDoorGroup = officeDoorGroup;
    gameState.officeDoorOpening = false;
    gameState.officeExiting = false;

    // Generous hitbox for instant and stable raycasting without flicker
    var doorHitbox = addMesh(new THREE.BoxGeometry(1.4, 2.3, 0.5), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.15, 2.90);
    doorHitbox.userData = { name: 'Выход на улицу (домой) [F]', type: 'office_exit' };
    interactables.push(doorHitbox);
    exitDoor.userData = doorHitbox.userData;
    dHandle.userData = doorHitbox.userData;

    var exitSignMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    addMesh(new THREE.BoxGeometry(0.55, 0.20, 0.05), exitSignMat, 0, 2.45, 2.96);

    // Light switch
    var osw = addMesh(new THREE.BoxGeometry(0.12, 0.16, 0.04), makeMat(0x94a3b8), 0.80, 1.35, 2.97);
    osw.userData = { name: 'Выключатель света [F]', type: 'office_switch' };
    interactables.push(osw);
    addMesh(new THREE.BoxGeometry(0.04, 0.07, 0.02), makeMat(0xffffff), 0.80, 1.35, 2.95);

    // 4 Fluorescent Light Fixtures in Ceiling
    buildOfficeFluorescentLight(-1.5, 2.98, -4.8, officeLights);
    buildOfficeFluorescentLight( 1.5, 2.98, -4.8, officeLights);
    buildOfficeFluorescentLight(-1.5, 2.98, -1.2, officeLights);
    buildOfficeFluorescentLight( 1.5, 2.98, -1.2, officeLights);

    // Office Windows looking out into blizzard
    buildOfficeWindow(-2.2, 1.7, -6.96);
    buildOfficeWindow( 2.2, 1.7, -6.96);

    // Snowfall outside office windows
    addSnow(-9.0, -7.2, -4.5, 4.5, 0, 5.0, 450, 0.06);

    // Corkboard on back wall
    var corkTex = getCorkboardTexture();
    var corkMat = new THREE.MeshBasicMaterial({ map: corkTex });
    var corkBoard = addMesh(new THREE.PlaneGeometry(1.8, 0.9), corkMat, 0, 1.8, -6.95);
    corkBoard.userData = { name: 'Доска объявлений [F]', type: 'office_board' };
    interactables.push(corkBoard);

    // Wall Clock
    var clockTex = getWallClockTexture();
    var clockMat = new THREE.MeshBasicMaterial({ map: clockTex });
    addMesh(new THREE.CircleGeometry(0.24, 24), clockMat, 0, 2.45, -6.95);

    // Filing Cabinets along left wall
    buildFilingCabinet(-3.85, -6.1, Math.PI / 2);
    buildFilingCabinet(-3.85, -5.3, Math.PI / 2);

    // Office Shelving with binders
    buildOfficeShelving(-3.85, -3.2);

    // Water Cooler near entrance right wall
    buildWaterCooler(3.7, 0.8);

    // Potted Office Plant in corner
    var plantGroup = new THREE.Group();
    plantGroup.position.set(3.7, 0, -6.5);
    var potMat = makeMat(0xc2410c);
    addMesh(new THREE.CylinderGeometry(0.22, 0.16, 0.38, 14), potMat, 0, 0.19, 0, plantGroup);
    addMesh(new THREE.CylinderGeometry(0.21, 0.21, 0.02, 14), makeMat(0x382012), 0, 0.38, 0, plantGroup);
    var leafMat = makeMat(0x15803d);
    for (var li = 0; li < 7; li++) {
        var lang = (li / 7) * Math.PI * 2;
        var leaf = addMesh(new THREE.BoxGeometry(0.18, 0.02, 0.34), leafMat, Math.cos(lang) * 0.12, 0.46 + (li % 3) * 0.06, Math.sin(lang) * 0.12, plantGroup);
        leaf.rotation.y = -lang;
        leaf.rotation.x = 0.35;
    }
    scene.add(plantGroup);
    colliders.push({ minX: 3.4, maxX: 4.0, minZ: -6.8, maxZ: -6.2 });

    // ==================== WORKSTATIONS & DESKS ====================
    // Desk 1: PLAYER'S DESK (x = -1.3, z = -5.0)
    buildOfficeDesk(-1.3, -5.0, true);
    buildDetailedComputer(-1.3, -5.0, true);

    // Player's Office Chair
    var chairMat = makeMat(0x18181b);
    var chromeMat = makeMat(0x94a3b8);
    var playerChairGroup = new THREE.Group();
    playerChairGroup.position.set(-1.3, 0, -4.35);
    addMesh(new THREE.CylinderGeometry(0.04, 0.05, 0.20, 12), chromeMat, 0, 0.15, 0, playerChairGroup);
    for (var pci = 0; pci < 5; pci++) {
        var pang = (pci / 5) * Math.PI * 2;
        var pwLeg = addMesh(new THREE.BoxGeometry(0.03, 0.025, 0.32), chairMat, Math.cos(pang) * 0.16, 0.06, Math.sin(pang) * 0.16, playerChairGroup);
        pwLeg.rotation.y = -pang;
        addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), chairMat, Math.cos(pang) * 0.30, 0.03, Math.sin(pang) * 0.30, playerChairGroup);
    }
    var pChairSeat = addMesh(new THREE.BoxGeometry(0.52, 0.08, 0.50), chairMat, 0, 0.48, 0, playerChairGroup);
    pChairSeat.userData = { name: 'Офисное кресло [F]', type: 'office_chair', sitX: -1.3, sitZ: -4.35, lookX: -1.3, lookZ: -5.3 };
    interactables.push(pChairSeat);
    addMesh(new THREE.BoxGeometry(0.06, 0.38, 0.04), chromeMat, 0, 0.68, 0.22, playerChairGroup);
    var pBackrest = addMesh(new THREE.BoxGeometry(0.48, 0.48, 0.06), chairMat, 0, 0.88, 0.21, playerChairGroup);
    pBackrest.rotation.x = -0.08;
    addMesh(new THREE.BoxGeometry(0.06, 0.03, 0.30), chairMat, -0.26, 0.70, 0, playerChairGroup);
    addMesh(new THREE.BoxGeometry(0.06, 0.03, 0.30), chairMat,  0.26, 0.70, 0, playerChairGroup);
    addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.20, 8), chromeMat, -0.26, 0.60, 0, playerChairGroup);
    addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.20, 8), chromeMat,  0.26, 0.60, 0, playerChairGroup);
    scene.add(playerChairGroup);

    // Yellow physical folder for work (Key quest item)
    var folderMat = makeMat(0xddaa00);
    var yellowFolder = addMesh(new THREE.BoxGeometry(0.32, 0.025, 0.42), folderMat, -0.92, 0.81, -4.92);
    yellowFolder.rotation.y = 0.22;
    yellowFolder.userData = { name: 'Желтая папка (документы) [F]', type: 'yellow_folder' };
    interactables.push(yellowFolder);

    // Desk 2: COWORKER'S DESK (x = 1.3, z = -5.0)
    buildOfficeDesk(1.3, -5.0, false);
    buildDetailedComputer(1.3, -5.0, false);
    // COWORKER (Михаил) sitting at this desk!
    buildColleague(1.3, -5.0);

    // Desk 3 & 4 (Back row, empty night shift desks)
    buildOfficeDesk(-1.3, -2.0, false);
    buildDetailedComputer(-1.3, -2.0, false);
    var chair3 = addMesh(new THREE.BoxGeometry(0.50, 0.08, 0.48), chairMat, -1.3, 0.48, -1.35);
    chair3.userData = { name: 'Офисное кресло [F]', type: 'office_chair', sitX: -1.3, sitZ: -1.35, lookX: -1.3, lookZ: -2.3 };
    interactables.push(chair3);

    buildOfficeDesk(1.3, -2.0, false);
    buildDetailedComputer(1.3, -2.0, false);
    var chair4 = addMesh(new THREE.BoxGeometry(0.50, 0.08, 0.48), chairMat, 1.3, 0.48, -1.35);
    chair4.userData = { name: 'Офисное кресло [F]', type: 'office_chair', sitX: 1.3, sitZ: -1.35, lookX: 1.3, lookZ: -2.3 };
    interactables.push(chair4);

    // Ambient Lighting
    scene.add(new THREE.AmbientLight(0x18202a, 1.2));

    // Global room light reference
    roomLight = new THREE.PointLight(0xf8fafc, 0.65, 16);
    roomLight.position.set(0, 2.7, -3.0);
    scene.add(roomLight);
    gameState.lightOn = true;

    // Player initial spawn & camera orientation
    camera.position.set(-1.3, 1.6, -3.6);
    camera.lookAt(-1.3, 1.45, -5.2);
    setObjective('Перепечатай отчет из желтой папки');

    chapterUpdate = function() {
        camera.position.x = Math.max(-3.8, Math.min(3.8, camera.position.x));
        if (camera.position.z > 2.7) {
            camera.position.z = 2.7;
            if (velocity.z < 0) velocity.z = 0;
        }
        if (camera.position.z < -6.5) {
            camera.position.z = -6.5;
            if (velocity.z > 0) velocity.z = 0;
        }
        if (gameState.officeDoorOpening && gameState.officeDoorGroup) {
            if (gameState.officeDoorGroup.rotation.y > -Math.PI * 0.45) {
                gameState.officeDoorGroup.rotation.y -= 0.05;
            }
        }
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
    
    else if (d.type === 'bathroom_door') {
        if (d.animating) return;
        d.animating = true;
        if (!d.isOpen) {
            d.isOpen = true;
            gameState.bathroomDoorOpen = true;
            playDoorOpenSound();
            showThought('Открыл дверь в ванную комнату.');
            if (gameState.bathroomDoorCollider) {
                var cIdx = colliders.indexOf(gameState.bathroomDoorCollider);
                if (cIdx !== -1) colliders.splice(cIdx, 1);
            }
            var brot = 0;
            var biv = setInterval(function() {
                if (d.hingeGroup) d.hingeGroup.rotation.y -= 0.05;
                brot += 0.05;
                if (brot >= Math.PI * 0.55) {
                    clearInterval(biv);
                    d.animating = false;
                }
            }, 25);
        } else {
            d.isOpen = false;
            gameState.bathroomDoorOpen = false;
            playDoorOpenSound();
            showThought('Закрыл дверь в ванную комнату.');
            var brot2 = 0;
            var biv2 = setInterval(function() {
                if (d.hingeGroup) d.hingeGroup.rotation.y += 0.05;
                brot2 += 0.05;
                if (brot2 >= Math.PI * 0.55) {
                    clearInterval(biv2);
                    d.animating = false;
                    if (gameState.bathroomDoorCollider) {
                        colliders.push(gameState.bathroomDoorCollider);
                    }
                }
            }, 25);
        }
    }
    else if (d.type === 'bathroom_sink') {
        playWaterStreamSound();
        if (ch === 8) {
            showThought('Включил кран над раковиной... Вода пока ещё течёт. Умылся холодной водой, чтобы прогнать страх.');
        } else {
            showThought('Включил кран над раковиной... Чистая прохладная вода. Умыл лицо и освежился.');
        }
    }
    else if (d.type === 'bathroom_toilet') {
        playToiletFlushSound();
        showThought('Нажал кнопку смыва... Вода с характерным шумом ушла в канализацию.');
    }
    else if (d.type === 'bathroom_tub') {
        if (!gameState.tubWaterRunning) {
            gameState.tubWaterRunning = true;
            if (gameState.tubStreamGroup) gameState.tubStreamGroup.visible = true;
            playWaterStreamSound();
            showThought('Включил смеситель над ванной... Горячая чистая вода с шумом полилась из крана в ванну, поднимается пар.');
        } else {
            gameState.tubWaterRunning = false;
            if (gameState.tubStreamGroup) gameState.tubStreamGroup.visible = false;
            playClickSound();
            showThought('Закрыл кран. Вода в ванной успокоилась.');
        }
    }
    else if (d.type === 'bathroom_tray') {
        playClickSound();
        showThought('На деревянной полочке стоят шампунь, гель для душа, ароматное мыло и мягкая мочалка. Всё готово для горячей ванны.');
    }
    else if (d.type === 'bathroom_mirror') {
        playClickSound();
        if (ch === 1) {
            showThought('Смотрю в зеркало над раковиной... Сонное бледное лицо, синяки под глазами. Надо спешить на работу.');
        } else if (ch === 5) {
            showThought('В зеркале отражаются усталые глаза после тяжёлой ночной смены... Скорее бы лечь в постель.');
        } else if (ch === 6) {
            showThought('Смотрю в зеркало... Прекрасное утро! Кошмар закончился, выгляжу бодрым и полным сил.');
        } else if (ch === 8) {
            showThought('В зеркале отражается тревога в глазах... В городе апокалипсис. Главное — сидеть дома и не шуметь.');
        } else {
            showThought('Смотрю в своё отражение в зеркале.');
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
                    var pizzaBox = addMesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), makeMat(0xeeaa55), -2.0, 0.45, -2.05);
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
                showThought('Ложусь поспать... Главное — никому не открывать дверь.');
                camera.position.set(2.6, 0.8, -1.4);
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
                showThought('Ложусь вздремнуть...');
                camera.position.set(2.6, 0.8, -1.4);
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
                showThought('Выхожу на работу...');
                return;
            }
            if (gameState.hasKey && gameState.watchedTV) {
                gameState.doorOpen = true;
                playDoorLockSound();
                playDoorOpenSound();
                showThought('Дверь открыта! Выхожу на работу...');
                var dr = 0;
                var div2 = setInterval(function() {
                    if (d.hingeGroup) d.hingeGroup.rotation.y -= 0.03;
                    dr += 0.03;
                    if (dr >= Math.PI / 2) {
                        clearInterval(div2);
                    }
                }, 30);
                setTimeout(function() {
                    loadChapter(2);
                }, 1400);
            } else if (!gameState.hasKey) {
                showThought('Дверь заперта. Нужно найти ключ.');
            } else {
                showThought('Хм, может включить ТВ перед уходом?');
            }
        } else if (ch === 5) {
            showThought('Я только что вернулся домой, на улице мороз. Дверь закрыта, никуда больше не пойду.');
        } else if (ch === 6) {
            if (!ch6Phone.sergeyReplied) {
                showThought('Нужно ответить Сергею на телефоне.');
                setObjective('Ответь на сообщение Сергея');
                return;
            }
            if (!ch6Phone.moneyChecked) {
                showThought('Надо проверить баланс карты... Вдруг зарплата пришла, тогда смогу купить продуктов.');
                setObjective('Проверь баланс в приложении банка');
                return;
            }
            if (gameState.doorOpen) {
                showThought('Выхожу в подъезд и иду в магазин...');
                return;
            }
            gameState.doorOpen = true;
            playDoorOpenSound();
            showThought('Открыл дверь в подъезд. Выхожу в магазин за продуктами...');
            var dr = 0;
            var div6 = setInterval(function() {
                if (d.hingeGroup) d.hingeGroup.rotation.y -= 0.03;
                dr += 0.03;
                if (dr >= Math.PI / 2) {
                    clearInterval(div6);
                }
            }, 30);
            setTimeout(function() {
                loadChapter(7);
            }, 1400);
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
    else if (d.type === 'colleague') {
        if (!gameState.computerUsed) {
            showThought('Михаил: "Ты тоже это слышишь за окном?.. Весь вечер сирены выли, а теперь тишина гробовая. Шеф свалил еще в пять, сказал закрыть всё. Доделывай свой отчёт и давай валить отсюда."');
        } else {
            showThought('Михаил: "Отправил? Красава. Выходи первым, я пока сервер выключу и свет потушу. До завтра... если оно настанет."');
        }
    }
    else if (d.type === 'other_computer') {
        showThought('Компьютер коллеги. На экране открыта 1С и зеленый терминал с предупреждением о потере связи.');
    }
    else if (d.type === 'office_switch') {
        gameState.lightOn = !gameState.lightOn;
        if (roomLight) roomLight.intensity = gameState.lightOn ? 0.65 : 0.0;
        if (typeof officeLights !== 'undefined' && officeLights) {
            for (var oli = 0; oli < officeLights.length; oli++) {
                officeLights[oli].intensity = gameState.lightOn ? 0.55 : 0.0;
            }
        }
        showThought(gameState.lightOn ? 'Свет включен.' : 'Свет выключен.');
    }
    else if (d.type === 'water_cooler') {
        showThought('Кулер для воды. Вода ледяная... Сейчас не до чая.');
    }
    else if (d.type === 'office_board') {
        showThought('Доска объявлений. Записка: "В связи с чрезвычайной ситуацией покинуть офис до 22:00".');
    }
    else if (d.type === 'computer') {
        gameState.inUI = true;
        controls.unlock();
        document.getElementById('computer-ui').style.display = 'block';
        if (!gameState.computerUsed) {
            showThought('Нужно перепечатать отчет из желтой папки.');
        } else {
            showThought('Отчет отправлен, но компьютер еще включен.');
        }
    }
    else if (d.type === 'yellow_folder') {
        gameState.inUI = true;
        controls.unlock();
        document.getElementById('folder-ui').style.display = 'flex';
        showThought('Отчет за сегодня...');
    }
    else if (d.type === 'office_exit') {
        if (gameState.officeExiting) return;
        if (gameState.computerUsed) {
            gameState.officeExiting = true;
            gameState.officeDoorOpening = true;
            playDoorOpenSound();
            showThought('Смена окончена. Выхожу в ночную метель. Скорее домой...');
            setTimeout(function() {
                gameState.officeExiting = false;
                gameState.officeDoorOpening = false;
                loadChapter(4);
            }, 1200);
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
            showThought('Кассир Люся: «Вы уже всё оплатили! Скорее бегите домой, на улице люди нападают на людей... Берегите себя!»');
            return;
        }
        if (gameState.cart.length === 0) {
            showThought('Кассир Люся: «Сначала выберите продукты на полках, затем подойдите на кассу. И поторопитесь, на улице небезопасно!»');
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
        showThought('Пик! Оплата картой прошла успешно (-' + gameState.cartTotal + ' ₽). Кассир Люся: «Чек в пакете... Будь очень осторожен на улице, люди нападают на людей! Беги скорее домой!»');
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
        else if (d.type === 'cashier_npc') {
        if (gameState.shopPaid) {
            showThought('Кассир Люся: «Ты уже всё оплатил, беги скорее домой! На улицах люди нападают на людей... Запри дверь на все замки и не выходи!»');
        } else if (gameState.cart.length > 0) {
            showThought('Кассир Люся: «Будь осторожен, милый... На улице люди нападают на людей! Оплачивай скорее покупки на кассе и беги домой!»');
        } else {
            showThought('Кассир Люся: «Будь осторожен на улице... Люди нападают на людей, глаза у них какие-то бешеные! Быстро бери что нужно и беги домой!»');
        }
    }
    else if (d.type === 'freezer_chest') {
        showThought('Морозильная бонета: внутри морозный пар, температура -18.5°C. Аккуратно сложены пачки сибирских пельменей и замороженная клюква.');
    }
    else if (d.type === 'produce_scale') {
        showThought('Контрольные весы самообслуживания: дисплей показывает 0.000 кг. Рядом висит рулон фасовочных полиэтиленовых пакетов.');
    }
    else if (d.type === 'caution_sign') {
        showThought('Желтый знак: «ОСТОРОЖНО! МОКРЫЙ ПОЛ / CAUTION WET FLOOR». Снег с улицы тает у входа.');
    }
    else if (d.type === 'shopping_cart') {
        showThought('Ряд металлических тележек для продуктов. Они сцеплены цепочками с монетоприемниками.');
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
// ==================== REALISTIC OFFICE COMPUTER SYSTEM ====================
var compHighestZ = 30;
var compActiveApps = {};
var calcVal = '0';
var calcOp = null;
var calcPrev = null;
var calcWaitNext = false;

window.openCompApp = function(appId) {
    var winId = (appId === 'report' || appId === 'docs') ? 'comp-window' : ('comp-win-' + appId);
    var el = document.getElementById(winId);
    if (!el) return;

    compHighestZ++;
    el.style.zIndex = compHighestZ;
    el.style.display = 'flex';
    compActiveApps[appId] = { id: appId, winId: winId, title: getAppTitle(appId) };

    var startMenu = document.getElementById('comp-start-menu');
    if (startMenu) startMenu.style.display = 'none';

    renderTaskbarTabs();
};

window.closeCompApp = function(appId) {
    if (appId === 'minecraft' && window.stopMCSurvival) window.stopMCSurvival();
    var winId = (appId === 'report' || appId === 'docs') ? 'comp-window' : ('comp-win-' + appId);
    var el = document.getElementById(winId);
    if (el) el.style.display = 'none';
    delete compActiveApps[appId];
    renderTaskbarTabs();
};

window.minimizeCompWindow = function(winId) {
    var el = document.getElementById(winId);
    if (el) {
        el.style.display = (el.style.display === 'none') ? 'flex' : 'none';
        if (el.style.display === 'flex') {
            compHighestZ++;
            el.style.zIndex = compHighestZ;
        }
    }
};

window.toggleStartMenu = function() {
    var sm = document.getElementById('comp-start-menu');
    if (sm) {
        sm.style.display = (sm.style.display === 'block') ? 'none' : 'block';
    }
};

window.openCompFolder = function() {
    window.openCompApp('report');
};

window.closeCompFolder = function() {
    window.closeCompApp('report');
};

function getAppTitle(appId) {
    var titles = {
        'report': '📄 Отчет_13.txt',
        'minecraft': '🟩 Minecraft 1.5.2',
        'roblox': '🟥 Roblox Player',
        'excel': '📈 MS Excel',
        'browser': '🌐 Internet Explorer',
        'mail': '✉️ Outlook Express',
        'calc': '🧮 Калькулятор',
        'notepad': '📝 Заметки',
        'trash': '🗑️ Корзина'
    };
    return titles[appId] || appId;
}

function renderTaskbarTabs() {
    var container = document.getElementById('comp-taskbar-tabs');
    if (!container) return;
    container.innerHTML = '';
    var keys = Object.keys(compActiveApps);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var app = compActiveApps[k];
        var tab = document.createElement('div');
        tab.className = 'taskbar-tab active';
        tab.textContent = app.title;
        (function(targetWinId) {
            tab.onclick = function() {
                window.minimizeCompWindow(targetWinId);
            };
        })(app.winId);
        container.appendChild(tab);
    }
}

// ==================== MINECRAFT SURVIVAL ZOMBIE COMBAT ENGINE ====================
var mcSurvivalRunning = false;
var mcAnimId = null;
var mcCanvas = null;
var mcCtx = null;
var mcSteve = null;
var mcZombies = [];
var mcParticles = [];
var mcSpawnTimer = 0;
var mcGroanTimer = 0;
var mcKeys = {};
var mcKeyboardBound = false;

// Audio Synthesizers for Minecraft Combat
function playMCSwordSwing() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.12);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
}

function playMCHitSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.08);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
}

function playMCSteveHurtSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.15);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
}

function playMCZombieGroan() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(52, now + 0.35);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
}

function playMCEatSound() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    for (var i = 0; i < 3; i++) {
        var t = now + i * 0.08;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260 + i * 50, t);
        g.gain.setValueAtTime(0.16, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
    }
}

function initMCSurvival() {
    mcSteve = {
        x: 275,
        y: 200,
        vx: 0,
        vy: 0,
        isGrounded: true,
        facing: 1, // 1: right, -1: left
        hp: 20, // 10 full hearts (2 HP each)
        maxHp: 20,
        kills: 0,
        level: 1,
        xp: 0,
        attacking: false,
        attackCooldown: 0,
        hurtTimer: 0,
        isDead: false,
        steaks: 3,
        walkAnim: 0
    };
    mcZombies = [];
    mcParticles = [];
    mcSpawnTimer = 40;
    mcGroanTimer = 90;

    // Spawn 2 starting zombies
    spawnMCZombie(-25);
    spawnMCZombie(605);
}

function spawnMCZombie(customX) {
    var fromLeft = Math.random() < 0.5;
    var zx = (customX !== undefined) ? customX : (fromLeft ? -25 : 605);
    mcZombies.push({
        x: zx,
        y: 200,
        hp: 18,
        maxHp: 18,
        speed: 1.0 + Math.random() * 0.7,
        facing: (zx < 275) ? 1 : -1,
        hurtTimer: 0,
        attackCooldown: 0,
        walkAnim: Math.random() * 10
    });
}

window.mcAttack = function() {
    if (!mcSteve || mcSteve.isDead || mcSteve.attackCooldown > 0) return;
    mcSteve.attacking = true;
    mcSteve.attackCooldown = 15;
    playMCSwordSwing();

    var hitAny = false;
    var reach = 60;
    for (var i = 0; i < mcZombies.length; i++) {
        var z = mcZombies[i];
        var dx = z.x - mcSteve.x;
        var inFront = (mcSteve.facing === 1) ? (dx > -15 && dx < reach) : (dx < 15 && dx > -reach);
        if (inFront && Math.abs(z.y - mcSteve.y) < 32) {
            z.hp -= 7; // Diamond sword damage
            z.hurtTimer = 10;
            z.x += mcSteve.facing * 28; // Knockback
            hitAny = true;

            // Critical hit spark particles
            for (var p = 0; p < 6; p++) {
                mcParticles.push({
                    x: z.x + 8,
                    y: z.y + 14,
                    vx: (Math.random() - 0.5) * 4 + mcSteve.facing * 3,
                    vy: -Math.random() * 3 - 1,
                    color: '#facc15',
                    life: 14
                });
            }

            if (z.hp <= 0) {
                mcSteve.kills++;
                mcSteve.xp += 35;
                if (mcSteve.xp >= 100) {
                    mcSteve.level++;
                    mcSteve.xp -= 100;
                    mcSteve.hp = Math.min(mcSteve.maxHp, mcSteve.hp + 6);
                }
                // Death smoke poof
                for (var sp = 0; sp < 12; sp++) {
                    mcParticles.push({
                        x: z.x + 8,
                        y: z.y + 16,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -Math.random() * 2.5 - 0.5,
                        color: '#f8fafc',
                        life: 20
                    });
                }
                if (Math.random() < 0.35) {
                    mcSteve.steaks++;
                }
            }
        }
    }

    if (hitAny) {
        playMCHitSound();
    }
};

window.mcEatSteak = function() {
    if (!mcSteve || mcSteve.isDead || mcSteve.steaks <= 0) return;
    if (mcSteve.hp >= mcSteve.maxHp) return;
    mcSteve.steaks--;
    mcSteve.hp = Math.min(mcSteve.maxHp, mcSteve.hp + 6);
    playMCEatSound();
    for (var p = 0; p < 6; p++) {
        mcParticles.push({
            x: mcSteve.x + 8,
            y: mcSteve.y + 8,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 2 - 1,
            color: '#ef4444',
            life: 25
        });
    }
};

window.mcMoveLeft = function(active) {
    if (mcSteve) {
        mcKeys['ArrowLeft'] = active;
        if (active) mcSteve.facing = -1;
    }
};

window.mcMoveRight = function(active) {
    if (mcSteve) {
        mcKeys['ArrowRight'] = active;
        if (active) mcSteve.facing = 1;
    }
};

window.mcJump = function() {
    if (mcSteve && !mcSteve.isDead && mcSteve.isGrounded) {
        mcSteve.vy = -7.5;
        mcSteve.isGrounded = false;
    }
};

window.mcRespawn = function() {
    initMCSurvival();
};

function mcKeyDownHandler(e) {
    if (!mcSurvivalRunning) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        mcKeys['ArrowLeft'] = true;
        if (mcSteve) mcSteve.facing = -1;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        mcKeys['ArrowRight'] = true;
        if (mcSteve) mcSteve.facing = 1;
    } else if (e.code === 'Space') {
        e.preventDefault();
        window.mcAttack();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.mcJump();
    } else if (e.code === 'KeyE') {
        e.preventDefault();
        window.mcEatSteak();
    }
}

function mcKeyUpHandler(e) {
    if (!mcSurvivalRunning) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        mcKeys['ArrowLeft'] = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        mcKeys['ArrowRight'] = false;
    }
}

function mcLoop() {
    if (!mcSurvivalRunning) return;

    // UPDATE
    if (mcSteve) {
        if (!mcSteve.isDead) {
            // Horizontal speed
            var speed = 2.8;
            if (mcKeys['ArrowLeft']) {
                mcSteve.x -= speed;
                mcSteve.facing = -1;
                mcSteve.walkAnim += 0.25;
            } else if (mcKeys['ArrowRight']) {
                mcSteve.x += speed;
                mcSteve.facing = 1;
                mcSteve.walkAnim += 0.25;
            } else {
                mcSteve.walkAnim = 0;
            }

            // Bounds
            mcSteve.x = Math.max(10, Math.min(550, mcSteve.x));

            // Gravity & Jump
            mcSteve.vy += 0.45;
            mcSteve.y += mcSteve.vy;
            if (mcSteve.y >= 200) {
                mcSteve.y = 200;
                mcSteve.vy = 0;
                mcSteve.isGrounded = true;
            }

            // Attack cooldown
            if (mcSteve.attackCooldown > 0) {
                mcSteve.attackCooldown--;
                if (mcSteve.attackCooldown <= 0) mcSteve.attacking = false;
            }

            // Hurt timer
            if (mcSteve.hurtTimer > 0) mcSteve.hurtTimer--;

            // Spawn zombies
            mcSpawnTimer--;
            if (mcSpawnTimer <= 0) {
                var maxZ = 3 + Math.floor(mcSteve.kills / 4);
                if (mcZombies.length < Math.min(8, maxZ)) {
                    spawnMCZombie();
                }
                mcSpawnTimer = Math.max(65, 170 - mcSteve.kills * 4);
            }

            // Zombie Groans
            mcGroanTimer--;
            if (mcGroanTimer <= 0) {
                if (mcZombies.length > 0) playMCZombieGroan();
                mcGroanTimer = 160 + Math.floor(Math.random() * 120);
            }
        }

        // Update Zombies
        for (var zi = mcZombies.length - 1; zi >= 0; zi--) {
            var z = mcZombies[zi];
            if (z.hp <= 0) {
                mcZombies.splice(zi, 1);
                continue;
            }

            if (z.hurtTimer > 0) z.hurtTimer--;
            if (z.attackCooldown > 0) z.attackCooldown--;

            if (!mcSteve.isDead) {
                var dx = mcSteve.x - z.x;
                z.facing = (dx > 0) ? 1 : -1;
                z.walkAnim += 0.18;

                if (Math.abs(dx) > 20) {
                    z.x += z.facing * z.speed;
                } else {
                    if (z.attackCooldown <= 0) {
                        z.attackCooldown = 45;
                        mcSteve.hp -= 3;
                        mcSteve.hurtTimer = 14;
                        mcSteve.x += z.facing * 14;
                        playMCSteveHurtSound();

                        if (mcSteve.hp <= 0) {
                            mcSteve.hp = 0;
                            mcSteve.isDead = true;
                        }
                    }
                }
            }
        }

        // Update Particles
        for (var pi = mcParticles.length - 1; pi >= 0; pi--) {
            var part = mcParticles[pi];
            part.x += part.vx;
            part.y += part.vy;
            part.life--;
            if (part.life <= 0) mcParticles.splice(pi, 1);
        }
    }

    // RENDER
    if (mcCtx && mcCanvas) {
        var ctx = mcCtx;
        var w = mcCanvas.width;
        var h = mcCanvas.height;

        // Dark Night Sky
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);

        // Stars
        ctx.fillStyle = '#ffffff';
        var stars = [
            [25, 20], [70, 40], [115, 15], [175, 45], [235, 25],
            [305, 35], [365, 18], [425, 42], [485, 22], [545, 50],
            [45, 65], [145, 80], [285, 70], [405, 85], [515, 75]
        ];
        for (var s = 0; s < stars.length; s++) {
            ctx.fillRect(stars[s][0], stars[s][1], 2, 2);
        }

        // Square Moon
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(495, 18, 36, 36);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(499, 22, 12, 12);
        ctx.fillRect(515, 36, 10, 10);

        // Mountains silhouette
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(0, 236);
        ctx.lineTo(75, 170); ctx.lineTo(155, 200); ctx.lineTo(255, 150);
        ctx.lineTo(375, 210); ctx.lineTo(465, 160); ctx.lineTo(580, 236);
        ctx.closePath(); ctx.fill();

        // Ground: Grass & Dirt Blocks
        for (var gx = 0; gx < w; gx += 20) {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(gx, 236, 20, 44);
            ctx.fillStyle = '#15803d';
            ctx.fillRect(gx, 236, 20, 6);
            ctx.strokeStyle = '#451a03';
            ctx.strokeRect(gx, 236, 20, 44);
        }

        // 2 Flickering Torches
        var torches = [85, 475];
        for (var ti = 0; ti < torches.length; ti++) {
            var tx = torches[ti];
            ctx.fillStyle = '#b45309';
            ctx.fillRect(tx + 2, 212, 4, 24);
            var fOff = (Math.random() - 0.5) * 2;
            ctx.fillStyle = '#f97316';
            ctx.fillRect(tx + 1 + fOff, 206, 6, 6);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(tx + 2 + fOff, 208, 4, 4);
        }

        // Draw Zombies
        for (var zi = 0; zi < mcZombies.length; zi++) {
            var z = mcZombies[zi];
            drawMCZombie(ctx, z);
        }

        // Draw Steve
        if (mcSteve) {
            drawMCSteve(ctx, mcSteve);
        }

        // Draw Particles
        for (var pi = 0; pi < mcParticles.length; pi++) {
            var part = mcParticles[pi];
            ctx.fillStyle = part.color;
            ctx.fillRect(part.x, part.y, 4, 4);
        }

        // HUD on Canvas
        drawMCHUD(ctx);

        // Game Over Overlay
        if (mcSteve && mcSteve.isDead) {
            ctx.fillStyle = 'rgba(153, 27, 27, 0.78)';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ВЫ ПОГИБЛИ!', w / 2, 105);

            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = '#fef08a';
            ctx.fillText('Зомби одолели вас в ночном бою...', w / 2, 135);
            ctx.fillText('Убито зомби: ' + mcSteve.kills, w / 2, 160);
        }
    }

    mcAnimId = requestAnimationFrame(mcLoop);
}

function drawMCSteve(ctx, s) {
    var sx = Math.floor(s.x);
    var sy = Math.floor(s.y);
    var hurt = (s.hurtTimer > 0);

    ctx.save();
    if (s.facing === -1) {
        ctx.translate(sx + 10, sy);
        ctx.scale(-1, 1);
        ctx.translate(-(sx + 10), -sy);
    }

    // Head (14x14)
    ctx.fillStyle = hurt ? '#ef4444' : '#f8c291';
    ctx.fillRect(sx + 3, sy, 14, 14);
    // Hair
    ctx.fillStyle = hurt ? '#b91c1c' : '#451a03';
    ctx.fillRect(sx + 3, sy, 14, 4);
    ctx.fillRect(sx + 3, sy + 4, 4, 4);
    // Eyes
    if (!hurt) {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(sx + 11, sy + 6, 4, 3);
        ctx.fillStyle = '#2563eb'; ctx.fillRect(sx + 13, sy + 6, 2, 3);
    }

    // Torso (14x14)
    ctx.fillStyle = hurt ? '#dc2626' : '#06b6d4';
    ctx.fillRect(sx + 3, sy + 14, 14, 14);

    // Legs (14x12) with walk swing
    var legSwing = Math.sin(s.walkAnim) * 4;
    ctx.fillStyle = hurt ? '#991b1b' : '#1e3a8a';
    ctx.fillRect(sx + 4 - legSwing, sy + 28, 5, 12);
    ctx.fillRect(sx + 11 + legSwing, sy + 28, 5, 12);

    // Arms & Diamond Sword
    // Left arm (back)
    ctx.fillStyle = hurt ? '#dc2626' : '#0891b2';
    ctx.fillRect(sx, sy + 14, 4, 13);

    // Right arm holding Diamond Sword
    ctx.fillStyle = hurt ? '#dc2626' : '#0891b2';
    ctx.fillRect(sx + 16, sy + 14, 4, 13);

    // Diamond Sword
    ctx.save();
    if (s.attacking) {
        // Attack slash forward
        ctx.translate(sx + 18, sy + 20);
        ctx.rotate(0.9);
        // Diamond Blade
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, -22, 5, 22);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(1, -22, 2, 20);
        // Guard & Hilt
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(-3, 0, 11, 3);
        ctx.fillStyle = '#78350f'; ctx.fillRect(1, 3, 3, 5);

        // Slash arc effect
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 26, -1.2, 0.8);
        ctx.stroke();
    } else {
        // Idle / ready stance
        ctx.translate(sx + 18, sy + 22);
        ctx.rotate(-0.4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, -20, 5, 20);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(1, -20, 2, 18);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(-3, 0, 11, 3);
        ctx.fillStyle = '#78350f'; ctx.fillRect(1, 3, 3, 5);
    }
    ctx.restore();

    ctx.restore();
}

function drawMCZombie(ctx, z) {
    var zx = Math.floor(z.x);
    var zy = Math.floor(z.y);
    var hurt = (z.hurtTimer > 0);

    ctx.save();
    if (z.facing === -1) {
        ctx.translate(zx + 10, zy);
        ctx.scale(-1, 1);
        ctx.translate(-(zx + 10), -zy);
    }

    // Mini Health Bar above zombie
    var barW = 20;
    var hpPct = Math.max(0, z.hp / z.maxHp);
    ctx.fillStyle = '#000000';
    ctx.fillRect(zx, zy - 8, barW, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(zx + 1, zy - 7, Math.floor((barW - 2) * hpPct), 2);

    // Head (14x14) - Green Skin
    ctx.fillStyle = hurt ? '#ef4444' : '#15803d';
    ctx.fillRect(zx + 3, zy, 14, 14);
    // Dark hair/spots
    ctx.fillStyle = hurt ? '#b91c1c' : '#166534';
    ctx.fillRect(zx + 3, zy, 14, 3);
    // Zombie Eye sockets
    ctx.fillStyle = '#052e16';
    ctx.fillRect(zx + 10, zy + 6, 4, 3);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(zx + 12, zy + 7, 2, 2);

    // Torso (14x14) - Blue shirt
    ctx.fillStyle = hurt ? '#dc2626' : '#0284c7';
    ctx.fillRect(zx + 3, zy + 14, 14, 14);

    // Outstretched Arms (Classic Zombie pose)
    ctx.fillStyle = hurt ? '#dc2626' : '#0284c7';
    ctx.fillRect(zx + 14, zy + 15, 12, 4);
    ctx.fillStyle = hurt ? '#b91c1c' : '#15803d'; // green hands
    ctx.fillRect(zx + 24, zy + 15, 4, 4);

    // Legs with walk swing
    var legSwing = Math.sin(z.walkAnim) * 3;
    ctx.fillStyle = hurt ? '#991b1b' : '#1e3a8a';
    ctx.fillRect(zx + 4 - legSwing, zy + 28, 5, 12);
    ctx.fillRect(zx + 11 + legSwing, zy + 28, 5, 12);

    ctx.restore();
}

function drawMCHUD(ctx) {
    if (!mcSteve) return;

    // 10 Hearts (top-left)
    var hX = 14;
    var hY = 12;
    var totalHearts = 10;
    for (var h = 0; h < totalHearts; h++) {
        var heartHP = (h + 1) * 2;
        var bx = hX + h * 13;
        // Background black heart
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx, hY, 11, 10);

        if (mcSteve.hp >= heartHP) {
            // Full Red Heart
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(bx + 1, hY + 1, 9, 8);
            ctx.fillStyle = '#f87171';
            ctx.fillRect(bx + 2, hY + 2, 2, 2); // shine
        } else if (mcSteve.hp >= heartHP - 1) {
            // Half Red Heart
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(bx + 1, hY + 1, 4, 8);
        }
    }

    // Top Stats bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('💀 ЗОМБИ: ' + mcSteve.kills + '  |  ⭐ УР: ' + mcSteve.level + '  |  🥩 СТЕЙК: ' + mcSteve.steaks, 566, 21);

    // Level XP bar
    var xpW = 120;
    var xpPct = Math.min(1, mcSteve.xp / 100);
    ctx.fillStyle = '#000000';
    ctx.fillRect(566 - xpW, 26, xpW, 5);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(566 - xpW + 1, 27, Math.floor((xpW - 2) * xpPct), 3);
}

window.stopMCSurvival = function() {
    mcSurvivalRunning = false;
    if (mcAnimId) {
        cancelAnimationFrame(mcAnimId);
        mcAnimId = null;
    }
    if (mcKeyboardBound) {
        window.removeEventListener('keydown', mcKeyDownHandler);
        window.removeEventListener('keyup', mcKeyUpHandler);
        mcKeyboardBound = false;
    }
};

window.openMCDialog = function(type) {
    var menu = document.getElementById('mc-menu-view');
    var dialog = document.getElementById('mc-dialog-view');
    var title = document.getElementById('mc-dialog-title');
    var content = document.getElementById('mc-dialog-content');
    if (!menu || !dialog) return;

    menu.style.display = 'none';
    dialog.style.display = 'block';

    if (type === 'single') {
        title.textContent = '🟩 Minecraft: Режим Выживания (Бой с зомби)';
        content.innerHTML = '<div style="margin-bottom:6px;font-size:12px;color:#f87171;font-weight:bold;">⚔️ РЕЖИМ ВЫЖИВАНИЯ: Ночь настала! Отбивайся алмазным мечом от орд зомби!</div>' +
            '<canvas id="mc-canvas" width="580" height="280" style="background:#090d16;border:3px solid #383838;cursor:crosshair;display:block;margin:0 auto;box-shadow:0 4px 12px rgba(0,0,0,0.6);"></canvas>' +
            '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;">' +
            '<button class="mc-btn mc-btn-game" onmousedown="window.mcMoveLeft(true)" onmouseup="window.mcMoveLeft(false)" onmouseleave="window.mcMoveLeft(false)">◄ Влево (A)</button>' +
            '<button class="mc-btn mc-btn-game" onmousedown="window.mcMoveRight(true)" onmouseup="window.mcMoveRight(false)" onmouseleave="window.mcMoveRight(false)">► Вправо (D)</button>' +
            '<button class="mc-btn mc-btn-game mc-btn-jump" onclick="window.mcJump()">▲ Прыжок (W)</button>' +
            '<button class="mc-btn mc-btn-game mc-btn-attack" onclick="window.mcAttack()">⚔️ УДАР МЕЧОМ (ЛКМ / Пробел)</button>' +
            '<button class="mc-btn mc-btn-game mc-btn-eat" onclick="window.mcEatSteak()">🥩 Съесть стейк (+3 ❤️)</button>' +
            '<button class="mc-btn mc-btn-game mc-btn-respawn" onclick="window.mcRespawn()">🔄 Заново</button>' +
            '</div>';

        setTimeout(function() {
            mcCanvas = document.getElementById('mc-canvas');
            if (mcCanvas) {
                mcCtx = mcCanvas.getContext('2d');
                initMCSurvival();

                mcCanvas.onmousedown = function(e) {
                    e.preventDefault();
                    window.mcAttack();
                };

                if (!mcKeyboardBound) {
                    window.addEventListener('keydown', mcKeyDownHandler);
                    window.addEventListener('keyup', mcKeyUpHandler);
                    mcKeyboardBound = true;
                }

                window.stopMCSurvival();
                mcSurvivalRunning = true;
                mcLoop();
            }
        }, 50);
    } else if (type === 'multi') {
        window.stopMCSurvival();
        title.textContent = 'Сетевая игра: Поиск серверов';
        content.innerHTML = '<div style="background:#222;padding:10px;border:1px solid #444;text-align:left;margin-bottom:8px;">' +
            '<div style="font-weight:bold;color:#60a5fa;">Hypixel Network (mc.hypixel.net)</div>' +
            '<div style="color:#aaa;font-size:11px;">Игроков: 48,210 / 60,000 | Режимы: Zombie Survival, BedWars, SkyWars</div>' +
            '<div style="color:#4ade80;font-weight:bold;margin-top:4px;">🟢 СЕРВЕР ДОСТУПЕН (Пинг: 18ms)</div>' +
            '</div>' +
            '<div style="background:#222;padding:10px;border:1px solid #444;text-align:left;margin-bottom:8px;">' +
            '<div style="font-weight:bold;color:#60a5fa;">Сервер друзей: Выживание с Зомби (192.168.1.13:25565)</div>' +
            '<div style="color:#aaa;font-size:11px;">Режим: Хардкор выживание, волны монстров</div>' +
            '<div style="color:#4ade80;font-weight:bold;margin-top:4px;">🟢 ОНЛАЙН (Игроков: 4/20)</div>' +
            '</div>';
    } else {
        window.stopMCSurvival();
        title.textContent = 'Настройки Minecraft';
        content.innerHTML = '<p style="color:#facc15;">Поле зрения (FOV): Normal (70°)</p>' +
            '<p style="color:#ef4444;font-weight:bold;">Режим игры: ВЫЖИВАНИЕ (Бой с зомби)</p>' +
            '<p style="color:#60a5fa;">Сложность: Нормальная (Монстры спавнятся ночью)</p>' +
            '<p style="color:#e2e8f0;">Управление: A/D — движение, Space / ЛКМ — удар мечом, W — прыжок, E — съесть стейк</p>';
    }
};

window.closeMCDialog = function() {
    if (window.stopMCSurvival) window.stopMCSurvival();
    var menu = document.getElementById('mc-menu-view');
    var dialog = document.getElementById('mc-dialog-view');
    if (menu && dialog) {
        menu.style.display = 'flex';
        dialog.style.display = 'none';
    }
};

// Roblox in-game client logic
window.launchRobloxGame = function(gameName) {
    var modal = document.getElementById('rb-loading-modal');
    var title = document.getElementById('rb-loading-title');
    var desc = document.getElementById('rb-loading-desc');
    if (!modal) return;

    modal.style.display = 'flex';
    title.textContent = 'Подключение к «' + gameName + '»...';
    desc.textContent = 'Поиск доступных серверов Roblox... Загрузка плейса...';

    setTimeout(function() {
        if (modal.style.display === 'flex') {
            title.textContent = '❌ Ошибка подключения 279';
            desc.textContent = 'Добро пожаловать в плейс «Roblox»! Сервер загружен, приятной игры!';
        }
    }, 1400);
};

window.closeRobloxModal = function() {
    var modal = document.getElementById('rb-loading-modal');
    if (modal) modal.style.display = 'none';
};

// 1C helper (neutralized)
window.alert1C = function() {};

// Outlook Express helper
window.showMailBody = function(idx) {
    var pane = document.getElementById('mail-reading-pane');
    var items = document.querySelectorAll('.mail-item');
    if (items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
        }
        if (items[idx]) items[idx].classList.add('active');
    }
    if (!pane) return;

    if (idx === 0) {
        pane.innerHTML = '<div class="mail-body-header"><div><strong>От:</strong> Шеф &lt;boss@trans-logistics.ru&gt;</div><div><strong>Тема:</strong> СРОЧНО: Закрывайте офис и уходите!</div></div>' +
            '<div class="mail-body-text">Смирнов, бросай всё второстепенное. Отправь отчет № 13-Б, чтобы сервер зафиксировал закрытие смены, и немедленно беги домой. На улицах творится кошмар, я еле выехал за кольцевую. Запри квартиру и жди утра.</div>';
    } else if (idx === 1) {
        pane.innerHTML = '<div class="mail-body-header"><div><strong>От:</strong> Охрана комплекса &lt;security@complex.ru&gt;</div><div><strong>Тема:</strong> Внимание: Ворота блокируются в 22:00</div></div>' +
            '<div class="mail-body-text">Уведомляем дежурную смену: в 22:00 внешний периметр бизнес-центра запирается на засовы. Все, кто останется внутри, будут заблокированы до снятия комендантского часа.</div>';
    } else {
        pane.innerHTML = '<div class="mail-body-header"><div><strong>От:</strong> Михаил &lt;mikhail@trans-logistics.ru&gt;</div><div><strong>Тема:</strong> Ты почти закончил?</div></div>' +
            '<div class="mail-body-text">У меня в 1С половина связей отвалилась. Слышишь вой на улице? Доделывай отчет и давай сваливать вместе.</div>';
    }
};

// Calculator logic
window.calcAction = function(val) {
    var screen = document.getElementById('calc-display');
    if (!screen) return;

    if (val === 'C') {
        calcVal = '0';
        calcOp = null;
        calcPrev = null;
        calcWaitNext = false;
        screen.value = '0';
    } else if (val === '+' || val === '-' || val === '*' || val === '/') {
        calcPrev = parseFloat(screen.value);
        calcOp = val;
        calcWaitNext = true;
    } else if (val === '=') {
        if (calcOp && calcPrev !== null) {
            var cur = parseFloat(screen.value);
            var res = 0;
            if (calcOp === '+') res = calcPrev + cur;
            else if (calcOp === '-') res = calcPrev - cur;
            else if (calcOp === '*') res = calcPrev * cur;
            else if (calcOp === '/') res = cur !== 0 ? (calcPrev / cur) : 0;
            screen.value = String(Math.round(res * 10000) / 10000);
            calcVal = screen.value;
            calcOp = null;
            calcPrev = null;
            calcWaitNext = true;
        }
    } else {
        if (screen.value === '0' || calcWaitNext) {
            screen.value = val;
            calcWaitNext = false;
        } else {
            screen.value += val;
        }
        calcVal = screen.value;
    }
};

// Simple window dragging
var compDragTarget = null;
var compDragOffX = 0;
var compDragOffY = 0;

window.startDragWindow = function(e, winId) {
    var el = document.getElementById(winId);
    if (!el) return;
    compHighestZ++;
    el.style.zIndex = compHighestZ;
    compDragTarget = el;
    var rect = el.getBoundingClientRect();
    compDragOffX = e.clientX - rect.left;
    compDragOffY = e.clientY - rect.top;

    document.addEventListener('mousemove', onCompDragMove);
    document.addEventListener('mouseup', onCompDragEnd);
};

function onCompDragMove(e) {
    if (!compDragTarget) return;
    var left = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - compDragOffX));
    var top = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - compDragOffY));
    compDragTarget.style.left = left + 'px';
    compDragTarget.style.top = top + 'px';
}

function onCompDragEnd() {
    compDragTarget = null;
    document.removeEventListener('mousemove', onCompDragMove);
    document.removeEventListener('mouseup', onCompDragEnd);
}

    window.closeComputerUI = function() { 
        document.getElementById('computer-ui').style.display = 'none'; 
        var startMenu = document.getElementById('comp-start-menu');
        if (startMenu) startMenu.style.display = 'none';
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

        // Apartment boundary (chapters 1, 5, 6, and 8) - Compound Main Room + Bathroom + Doorway
        // Apartment boundary (chapters 1, 5, 6, and 8) - Compound Main Room + Bathroom + Doorway
        if (gameState.chapter === 1 || gameState.chapter === 5 || gameState.chapter === 6 || gameState.chapter === 8) {
            var p = camera.position;
            var inBathroomDoorway = (p.z >= -0.55 && p.z <= 0.45 && p.x <= -2.70 && p.x >= -3.30);
            var inBathroom = (p.x <= -2.75);

            if (inBathroom) {
                // Inside bathroom boundaries (x: -5.75 to -2.75, z: -0.45 to 2.05)
                p.x = Math.max(-5.75, p.x);
                p.z = Math.max(-0.45, Math.min(2.05, p.z));

                // Cannot cross back to main room through the dividing wall unless through doorway
                if (!inBathroomDoorway && p.x > -3.15) {
                    p.x = -3.15;
                    if (velocity.x > 0) velocity.x = 0;
                }
            } else {
                // Inside main room boundaries (x: -2.75 to 3.55, z: -3.15 to 2.75)
                p.x = Math.min(3.55, p.x);
                if (p.z < -3.15) {
                    p.z = -3.15;
                    if (velocity.z < 0) velocity.z = 0;
                }
                if (p.z > 2.75) {
                    p.z = 2.75;
                    if (velocity.z > 0) velocity.z = 0;
                }
                // Cannot cross into bathroom through dividing wall unless through doorway
                if (!inBathroomDoorway && p.x < -2.75) {
                    p.x = -2.75;
                    if (velocity.x < 0) velocity.x = 0;
                }
            }
        }

        if (gameState.chapter === 7) {
            var sp = camera.position;
            sp.x = Math.max(-4.6, Math.min(4.6, sp.x));
            sp.z = Math.max(-5.5, Math.min(5.5, sp.z));
        }
    }

    
        // Bathtub water splash animation when water is running
        if (gameState.tubWaterRunning && gameState.tubStreamGroup && gameState.tubStreamGroup.visible) {
            if (gameState.tubSplashRing) {
                var sTime = Date.now() * 0.008;
                var sc = 1.0 + Math.sin(sTime * 5) * 0.12;
                gameState.tubSplashRing.scale.set(sc, sc, sc);
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
