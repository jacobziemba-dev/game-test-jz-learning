class SpriteSystem {
  constructor({ basePath = 'assets/sprites/' } = {}) {
    this.basePath = basePath;
    this.atlases = new Map();
    this._warned = new Set();
  }

  registerManifest(manifest = {}) {
    for (const [atlasId, config] of Object.entries(manifest)) {
      this.registerAtlas(atlasId, config);
    }
  }

  registerAtlas(atlasId, config = {}) {
    if (!atlasId) return;

    const atlas = {
      id: atlasId,
      imagePath: config.imagePath ?? null,
      image: null,
      ready: false,
      failed: false,
      frames: config.frames ?? {},
    };

    if (atlas.imagePath) {
      const img = new Image();
      atlas.image = img;

      img.onload = () => {
        atlas.ready = true;
        atlas.failed = false;
      };

      img.onerror = () => {
        atlas.ready = false;
        atlas.failed = true;
        this._warnOnce(`atlas-load:${atlasId}`, `SpriteSystem: failed to load atlas ${atlasId} (${atlas.imagePath})`);
      };

      img.src = this._resolvePath(atlas.imagePath);
    }

    this.atlases.set(atlasId, atlas);
  }

  isAtlasReady(atlasId) {
    const atlas = this.atlases.get(atlasId);
    if (!atlas) return false;
    if (!atlas.imagePath) return false;
    return !!atlas.ready && !atlas.failed;
  }

  drawFrame(ctx, atlasId, frameKey, x, y, width, height, options = {}) {
    const atlas = this.atlases.get(atlasId);
    if (!atlas) {
      this._warnOnce(`atlas-missing:${atlasId}`, `SpriteSystem: missing atlas ${atlasId}`);
      return false;
    }

    if (!atlas.ready || !atlas.image) return false;

    const rect = atlas.frames?.[frameKey];
    if (!rect) {
      this._warnOnce(`frame-missing:${atlasId}:${frameKey}`, `SpriteSystem: missing frame ${frameKey} in atlas ${atlasId}`);
      return false;
    }

    const anchorX = options.anchorX ?? 0.5;
    const anchorY = options.anchorY ?? 1;
    const alpha = options.alpha ?? 1;
    const flipX = !!options.flipX;
    const pixelPerfect = options.pixelPerfect !== false;

    let dx = x - width * anchorX;
    let dy = y - height * anchorY;

    if (pixelPerfect) {
      dx = Math.round(dx);
      dy = Math.round(dy);
      width = Math.round(width);
      height = Math.round(height);
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    if (flipX) {
      ctx.translate(Math.round(x), Math.round(y));
      ctx.scale(-1, 1);
      const localX = Math.round(-(width * (1 - anchorX)));
      const localY = Math.round(-(height * anchorY));
      ctx.drawImage(
        atlas.image,
        rect.x,
        rect.y,
        rect.w,
        rect.h,
        localX,
        localY,
        width,
        height
      );
    } else {
      ctx.drawImage(
        atlas.image,
        rect.x,
        rect.y,
        rect.w,
        rect.h,
        dx,
        dy,
        width,
        height
      );
    }

    ctx.imageSmoothingEnabled = prevSmooth;
    ctx.restore();
    return true;
  }

  _resolvePath(imagePath) {
    if (imagePath.startsWith('/') || imagePath.startsWith('./') || imagePath.startsWith('../')) {
      return imagePath;
    }
    return `${this.basePath}${imagePath}`;
  }

  _warnOnce(key, message) {
    if (this._warned.has(key)) return;
    this._warned.add(key);
    console.warn(message);
  }
}
