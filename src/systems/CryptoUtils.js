class CryptoUtils {
  /**
   * Returns a cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
   * @returns {number}
   */
  static secureRandom() {
    const array = new Uint32Array(1);
    (self.crypto || window.crypto).getRandomValues(array);
    return array[0] / 0x100000000; // 2^32
  }
}
