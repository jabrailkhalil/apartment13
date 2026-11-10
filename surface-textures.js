// Shared surface mapping: one UV scale and origin for every piece of a wall.
// Keep ES5 syntax so the game still runs without a build step.
function mapSurfaceUVs(mesh, tileWidth, tileHeight) {
    mesh.updateMatrixWorld(true);
    var geometry = mesh.geometry;
    var positions = geometry.attributes.position;
    var uvs = geometry.attributes.uv;
    var normal = new THREE.Vector3(0, 0, 1).transformDirection(mesh.matrixWorld);
    var horizontal = Math.abs(normal.x) > 0.5 ? 'z' : 'x';
    var vertical = Math.abs(normal.y) > 0.5 ? 'z' : 'y';
    var point = new THREE.Vector3();
    for (var i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
        uvs.setXY(i, point[horizontal] / tileWidth, point[vertical] / tileHeight);
    }
    uvs.needsUpdate = true;
    mesh.userData.surfaceTileSize = [tileWidth, tileHeight];
    return mesh;
}

function mapMaterialSurfaces(root, material, tileWidth, tileHeight) {
    root.updateMatrixWorld(true);
    root.traverse(function(mesh) {
        if (mesh.isMesh && mesh.material === material && mesh.geometry.type === 'PlaneGeometry') {
            mapSurfaceUVs(mesh, tileWidth, tileHeight);
        }
    });
}

function configureSurfaceTexture(texture, mirrored) {
    texture.wrapS = texture.wrapT = mirrored ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
}

var cachedWallpaperTexture = null;
function getWallpaperTexture() {
    if (!cachedWallpaperTexture) {
        cachedWallpaperTexture = configureSurfaceTexture(new THREE.TextureLoader().load(WALLPAPER_TILE_B64), true);
    }
    return cachedWallpaperTexture;
}

// Periodic value noise. Both borders sample the same point on the noise grid;
// unlike a photograph it has no baked street lamps, footprints or dark frame.
function surfaceHash(x, y, seed) {
    var value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return value - Math.floor(value);
}

function periodicSurfaceNoise(u, v, cells, seed) {
    var x = u * cells, y = v * cells;
    var ix = Math.floor(x), iy = Math.floor(y);
    var fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    var a = surfaceHash(ix % cells, iy % cells, seed);
    var b = surfaceHash((ix + 1) % cells, iy % cells, seed);
    var c = surfaceHash(ix % cells, (iy + 1) % cells, seed);
    var d = surfaceHash((ix + 1) % cells, (iy + 1) % cells, seed);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

var cachedSnowSurfaceTexture = null;
function getSnowSurfaceTexture() {
    if (cachedSnowSurfaceTexture) return cachedSnowSurfaceTexture;
    cachedSnowSurfaceTexture = createProceduralTexture(512, 512, function(ctx, width, height) {
        var pixels = ctx.createImageData(width, height);
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var u = x / (width - 1), v = y / (height - 1);
                var drift = periodicSurfaceNoise(u, v, 4, 13);
                var grain = periodicSurfaceNoise(u, v, 48, 29);
                var fine = periodicSurfaceNoise(u, v, 128, 7);
                var shade = 184 + drift * 24 + grain * 13 + fine * 8;
                var offset = (y * width + x) * 4;
                pixels.data[offset] = shade;
                pixels.data[offset + 1] = shade + 6;
                pixels.data[offset + 2] = shade + 12;
                pixels.data[offset + 3] = 255;
            }
        }
        ctx.putImageData(pixels, 0, 0);
    });
    return configureSurfaceTexture(cachedSnowSurfaceTexture, false);
}

var cachedTireTrackTexture = null;
function getTireTrackTexture() {
    if (cachedTireTrackTexture) return cachedTireTrackTexture;
    cachedTireTrackTexture = createProceduralTexture(128, 128, function(ctx, width, height) {
        var fade = ctx.createLinearGradient(0, 0, width, 0);
        fade.addColorStop(0, 'rgba(255,255,255,0)');
        fade.addColorStop(0.2, 'rgba(255,255,255,0.6)');
        fade.addColorStop(0.5, 'rgba(255,255,255,0.85)');
        fade.addColorStop(0.8, 'rgba(255,255,255,0.6)');
        fade.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 6;
        for (var y = -32; y < height + 32; y += 32) {
            ctx.beginPath();
            ctx.moveTo(12, y); ctx.lineTo(64, y + 16); ctx.lineTo(116, y);
            ctx.stroke();
        }
    });
    configureSurfaceTexture(cachedTireTrackTexture, false);
    cachedTireTrackTexture.wrapS = THREE.ClampToEdgeWrapping;
    return cachedTireTrackTexture;
}

var cachedNightSkyTexture = null;
function getNightSkyTexture() {
    if (cachedNightSkyTexture) return cachedNightSkyTexture;
    cachedNightSkyTexture = createProceduralTexture(1024, 512, function(ctx, width, height) {
        var sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#02050c');
        sky.addColorStop(0.5, '#0b1524');
        sky.addColorStop(1, '#02050c');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);
        for (var i = 0; i < 240; i++) {
            var x = 4 + surfaceHash(i, 1, 37) * (width - 8);
            var y = 12 + surfaceHash(i, 2, 37) * (height * 0.42 - 12);
            var alpha = 0.15 + surfaceHash(i, 3, 37) * 0.4;
            ctx.fillStyle = 'rgba(186,205,229,' + alpha + ')';
            ctx.fillRect(x, y, 1, 1);
        }
    });
    cachedNightSkyTexture.wrapS = THREE.RepeatWrapping;
    return cachedNightSkyTexture;
}

function addNightSky() {
    var sky = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.MeshBasicMaterial({
        map: getNightSkyTexture(), side: THREE.BackSide, fog: false, depthWrite: false
    }));
    sky.position.z = -25;
    sky.name = 'continuous-night-sky';
    scene.add(sky);
    return sky;
}
