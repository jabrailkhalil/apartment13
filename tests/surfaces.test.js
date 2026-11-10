const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const THREE = require('../three.min.js');

function surfaceRuntime() {
    const context = vm.createContext({
        THREE,
        renderer: { capabilities: { getMaxAnisotropy: () => 16 } },
        createProceduralTexture(width, height, draw) {
            const canvas = { width, height };
            draw({
                createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
                putImageData: image => { canvas.pixels = image.data; }
            }, width, height);
            return new THREE.CanvasTexture(canvas);
        }
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../surface-textures.js'), 'utf8'), context);
    return context;
}

function plane(width, height, x, y, z, rotationY = 0) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height));
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotationY;
    return mesh;
}

function uvAtWorldPoint(mesh, x, y, z) {
    const positions = mesh.geometry.attributes.position;
    const uvs = mesh.geometry.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
        const point = new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
        if (point.distanceTo(new THREE.Vector3(x, y, z)) < 0.00001) return [uvs.getX(i), uvs.getY(i)];
    }
    throw new Error('Expected shared corner was not found');
}

test('wall fragments share UVs across a window cutout, including rotated walls', () => {
    const runtime = surfaceRuntime();
    for (const rotation of [0, Math.PI, Math.PI / 2, -Math.PI / 2]) {
        const root = new THREE.Group();
        root.rotation.y = rotation;
        const side = plane(2, 3, -2, 1.5, -3.2);
        const lintel = plane(2, 0.75, 0, 2.625, -3.2);
        root.add(side, lintel);
        root.updateMatrixWorld(true);
        runtime.mapSurfaceUVs(side, 1.8, 1.8);
        runtime.mapSurfaceUVs(lintel, 1.8, 1.8);
        const shared = new THREE.Vector3(-1, 3, -3.2).applyMatrix4(root.matrixWorld);
        assert.deepEqual(uvAtWorldPoint(side, ...shared.toArray()), uvAtWorldPoint(lintel, ...shared.toArray()));
    }
});

test('a small lintel has the same texture density as a full-height wall', () => {
    const runtime = surfaceRuntime();
    const wall = plane(2, 3, 0, 1.5, -3.2);
    const lintel = plane(2, 0.75, 0, 2.625, -3.2);
    runtime.mapSurfaceUVs(wall, 1.8, 1.8);
    runtime.mapSurfaceUVs(lintel, 1.8, 1.8);
    const wallUV = wall.geometry.attributes.uv;
    const lintelUV = lintel.geometry.attributes.uv;
    const wallDensity = Math.abs(wallUV.getY(0) - wallUV.getY(2)) / 3;
    const lintelDensity = Math.abs(lintelUV.getY(0) - lintelUV.getY(2)) / 0.75;
    assert.ok(Math.abs(wallDensity - lintelDensity) < 0.000001);
});

test('snow uses identical border pixels on both axes and survives chapter reuse', () => {
    const runtime = surfaceRuntime();
    const texture = runtime.getSnowSurfaceTexture();
    assert.equal(runtime.getSnowSurfaceTexture(), texture);
    const { width, height, pixels } = texture.image;
    const pixel = (x, y) => [...pixels.slice((y * width + x) * 4, (y * width + x) * 4 + 4)];
    for (let y = 0; y < height; y++) assert.deepEqual(pixel(0, y), pixel(width - 1, y));
    for (let x = 0; x < width; x++) assert.deepEqual(pixel(x, 0), pixel(x, height - 1));
    assert.equal(texture.wrapS, THREE.RepeatWrapping);
    assert.equal(texture.repeat.x, 1);
    assert.equal(texture.anisotropy, 8);
});

function pointerRuntime(requestPointerLock) {
    const listeners = {};
    const document = {
        addEventListener(type, handler) { (listeners[type] ||= new Set()).add(handler); },
        removeEventListener(type, handler) { listeners[type]?.delete(handler); },
        getElementById: () => null,
        exitPointerLock() {}
    };
    const context = vm.createContext({
        THREE, document,
        velocity: new THREE.Vector3(1, 0, 1),
        moveForward: true, moveBackward: true, moveLeft: true, moveRight: true,
        stepTimer: 1,
        showThought() {}
    });
    const source = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
    vm.runInContext(source.slice(source.indexOf('function resetMovement()'), source.indexOf('// ==================== HELPERS')), context);
    const camera = new THREE.PerspectiveCamera();
    const controls = new context.PointerLock(camera, { requestPointerLock });
    const emit = (type, event) => { for (const handler of listeners[type] || []) handler(event); };
    return { context, controls, camera, emit };
}

test('unsupported pointer lock provides drag look and clears held movement on pause', () => {
    const { context, controls, camera, emit } = pointerRuntime(undefined);
    controls.lock();
    assert.equal(controls.isLocked, true);
    assert.equal(controls.useDragLook, true);
    const initial = camera.quaternion.clone();
    emit('mousemove', { movementX: 100, movementY: 0 });
    assert.ok(camera.quaternion.equals(initial));
    emit('mousedown', { button: 2, target: { tagName: 'CANVAS' }, preventDefault() {} });
    emit('mousemove', { movementX: 100, movementY: 0 });
    assert.ok(!camera.quaternion.equals(initial));
    context.moveForward = true;
    context.velocity.set(1, 0, 1);
    controls.unlock();
    assert.equal(controls.isLocked, false);
    assert.equal(context.moveForward, false);
    assert.equal(context.velocity.length(), 0);
});

test('a rejected pointer-lock request cannot resume the game after it was paused', async () => {
    let rejectLock;
    const { controls } = pointerRuntime(() => new Promise((resolve, reject) => { rejectLock = reject; }));
    controls.lock();
    controls.unlock();
    rejectLock(new Error('Pointer lock denied'));
    await Promise.resolve();
    assert.equal(controls.isLocked, false);
    assert.equal(controls.useDragLook, false);
});

test('overlapping furniture colliders use the position resolved by the previous collider', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0.9, 1.6, 0);
    const colliders = [
        { minX: 0, maxX: 1, minZ: -10, maxZ: 10 },
        { minX: 0.5, maxX: 0.9, minZ: -10, maxZ: 10 }
    ];
    const context = vm.createContext({ camera, colliders });
    const source = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
    vm.runInContext(source.slice(source.indexOf('function checkCollisions()'), source.indexOf('// ==================== INIT')), context);
    context.checkCollisions();
    for (const box of colliders) assert.ok(camera.position.x >= box.maxX + 0.28);
});
