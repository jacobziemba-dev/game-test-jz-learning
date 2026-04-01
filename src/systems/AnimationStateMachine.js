class AnimationStateMachine {
  constructor(clips = {}, defaultClip = null) {
    this.clips = clips;
    this.currentClip = null;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;

    const firstClip = Object.keys(clips)[0] ?? null;
    this.defaultClip = defaultClip ?? firstClip;

    if (this.defaultClip) {
      this.setClip(this.defaultClip, true);
    }
  }

  setClip(name, forceReset = false) {
    if (!name || !this.clips[name]) return false;
    if (!forceReset && this.currentClip === name) return true;

    this.currentClip = name;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    return true;
  }

  update(dt) {
    const clip = this._getActiveClip();
    if (!clip) return;

    const frameCount = clip.frames.length;
    if (frameCount <= 1) return;

    const fps = Math.max(1, clip.fps ?? 8);
    const frameDuration = 1 / fps;

    this.frameTimer += dt;

    while (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      this.currentFrameIndex += 1;

      if (this.currentFrameIndex >= frameCount) {
        if (clip.loop === false) {
          this.currentFrameIndex = frameCount - 1;
          this.frameTimer = 0;
          break;
        }
        this.currentFrameIndex = 0;
      }
    }
  }

  getFrameKey() {
    const clip = this._getActiveClip();
    if (!clip) return null;

    const safeIndex = Math.max(0, Math.min(this.currentFrameIndex, clip.frames.length - 1));
    return clip.frames[safeIndex] ?? null;
  }

  _getActiveClip() {
    if (this.currentClip && this.clips[this.currentClip]) {
      return this._normalizeClip(this.clips[this.currentClip]);
    }

    if (this.defaultClip && this.clips[this.defaultClip]) {
      this.currentClip = this.defaultClip;
      return this._normalizeClip(this.clips[this.defaultClip]);
    }

    return null;
  }

  _normalizeClip(clipDef) {
    if (Array.isArray(clipDef)) {
      return {
        frames: clipDef,
        fps: 8,
        loop: true,
      };
    }

    return {
      frames: Array.isArray(clipDef.frames) ? clipDef.frames : [],
      fps: clipDef.fps ?? 8,
      loop: clipDef.loop !== false,
    };
  }
}
