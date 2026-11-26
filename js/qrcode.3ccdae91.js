// Mokh Rush QR code maker (US-52, D-80): draws the Phone buzzer join link as a QR code in the browser,
// with no external service. Byte mode, error correction level M, versions 1 to 15 (up to 412 bytes),
// the mask with the lowest penalty. Returns an <svg> element built with DOM calls (no innerHTML).
// The algorithm follows Project Nayuki's "QR Code generator library" (MIT License,
// Copyright (c) Project Nayuki, https://www.nayuki.io/page/qr-code-generator-library), condensed to
// what the join link needs.
'use strict';

(function (root) {
  const MAX_VERSION = 15;
  // Level M, index = version (0 unused): error correction codewords per block and number of blocks.
  const ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24];
  const ECC_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10];
  const FORMAT_LEVEL_M = 0; // the 2 format bits of level M
  const QUIET = 4;          // light border, in modules

  function bit(value, i) {
    return ((value >>> i) & 1) !== 0;
  }

  /** Data modules of a version: the whole symbol minus the function patterns. */
  function rawModules(ver) {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const align = Math.floor(ver / 7) + 2;
      result -= (25 * align - 10) * align - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  function dataCodewords(ver) {
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * ECC_BLOCKS[ver];
  }

  function alignmentPositions(ver, size) {
    if (ver === 1) return [];
    const count = Math.floor(ver / 7) + 2;
    const step = Math.floor((ver * 8 + count * 3 + 5) / (count * 4 - 4)) * 2;
    const result = [6];
    for (let pos = size - 7; result.length < count; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  // ---------- Reed-Solomon over GF(2^8), polynomial 0x11D ----------

  function gfMultiply(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i -= 1) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function rsDivisor(degree) {
    const result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let rootValue = 1;
    for (let i = 0; i < degree; i += 1) {
      for (let j = 0; j < result.length; j += 1) {
        result[j] = gfMultiply(result[j], rootValue);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      rootValue = gfMultiply(rootValue, 0x02);
    }
    return result;
  }

  function rsRemainder(data, divisor) {
    const result = divisor.map(() => 0);
    data.forEach((b) => {
      const factor = b ^ result.shift();
      result.push(0);
      divisor.forEach((coef, i) => { result[i] ^= gfMultiply(coef, factor); });
    });
    return result;
  }

  // ---------- Codewords ----------

  /** The data codewords: byte mode header, the bytes, terminator and padding. */
  function encodeData(bytes, ver) {
    const bits = [];
    const push = (value, length) => {
      for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
    };
    push(0x4, 4);
    push(bytes.length, ver <= 9 ? 8 : 16);
    bytes.forEach((b) => push(b, 8));
    const capacity = dataCodewords(ver) * 8;
    push(0, Math.min(4, capacity - bits.length));
    push(0, (8 - (bits.length % 8)) % 8);
    for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);
    const words = [];
    for (let i = 0; i < bits.length; i += 8) {
      words.push(bits.slice(i, i + 8).reduce((acc, b) => (acc << 1) | b, 0));
    }
    return words;
  }

  /** Split into blocks, add each block's error correction and interleave. */
  function addEcc(data, ver) {
    const blocks = ECC_BLOCKS[ver];
    const eccLen = ECC_PER_BLOCK[ver];
    const raw = Math.floor(rawModules(ver) / 8);
    const shortBlocks = blocks - (raw % blocks);
    const shortLen = Math.floor(raw / blocks);
    const divisor = rsDivisor(eccLen);
    const list = [];
    let k = 0;
    for (let i = 0; i < blocks; i += 1) {
      const dat = data.slice(k, k + shortLen - eccLen + (i < shortBlocks ? 0 : 1));
      k += dat.length;
      const ecc = rsRemainder(dat, divisor);
      if (i < shortBlocks) dat.push(0);
      list.push(dat.concat(ecc));
    }
    const result = [];
    for (let i = 0; i < list[0].length; i += 1) {
      list.forEach((block, j) => {
        if (i !== shortLen - eccLen || j >= shortBlocks) result.push(block[i]);
      });
    }
    return result;
  }

  // ---------- The symbol ----------

  function makeGrid(size) {
    const grid = [];
    for (let y = 0; y < size; y += 1) grid.push(new Array(size).fill(false));
    return grid;
  }

  function QrSymbol(ver) {
    this.ver = ver;
    this.size = ver * 4 + 17;
    this.modules = makeGrid(this.size);
    this.fixed = makeGrid(this.size); // function patterns: never masked or filled with data
  }

  QrSymbol.prototype.setFixed = function (x, y, dark) {
    this.modules[y][x] = dark;
    this.fixed[y][x] = true;
  };

  QrSymbol.prototype.drawFunctionPatterns = function () {
    const size = this.size;
    for (let i = 0; i < size; i += 1) {
      this.setFixed(6, i, i % 2 === 0);
      this.setFixed(i, 6, i % 2 === 0);
    }
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach((c) => this.drawFinder(c[0], c[1]));
    const align = alignmentPositions(this.ver, size);
    const last = align.length - 1;
    align.forEach((ay, i) => align.forEach((ax, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) this.setFixed(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }));
    this.drawFormat(0); // placeholder, redrawn with the chosen mask
    this.drawVersion();
  };

  QrSymbol.prototype.drawFinder = function (cx, cy) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const x = cx + dx;
        const y = cy + dy;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) this.setFixed(x, y, dist !== 2 && dist !== 4);
      }
    }
  };

  QrSymbol.prototype.drawFormat = function (mask) {
    const data = (FORMAT_LEVEL_M << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const size = this.size;
    for (let i = 0; i <= 5; i += 1) this.setFixed(8, i, bit(bits, i));
    this.setFixed(8, 7, bit(bits, 6));
    this.setFixed(8, 8, bit(bits, 7));
    this.setFixed(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i += 1) this.setFixed(14 - i, 8, bit(bits, i));
    for (let i = 0; i < 8; i += 1) this.setFixed(size - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i += 1) this.setFixed(8, size - 15 + i, bit(bits, i));
    this.setFixed(8, size - 8, true); // the dark module
  };

  QrSymbol.prototype.drawVersion = function () {
    if (this.ver < 7) return;
    let rem = this.ver;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.ver << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFixed(a, b, bit(bits, i));
      this.setFixed(b, a, bit(bits, i));
    }
  };

  /** Place the codewords in the zigzag order, skipping the function patterns. */
  QrSymbol.prototype.drawCodewords = function (words) {
    const size = this.size;
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert += 1) {
        for (let j = 0; j < 2; j += 1) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!this.fixed[y][x] && i < words.length * 8) {
            this.modules[y][x] = bit(words[i >>> 3], 7 - (i & 7));
            i += 1;
          }
        }
      }
    }
  };

  const MASKS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];

  /** XOR the mask on the data modules (applying it twice undoes it). */
  QrSymbol.prototype.applyMask = function (mask) {
    for (let y = 0; y < this.size; y += 1) {
      for (let x = 0; x < this.size; x += 1) {
        if (!this.fixed[y][x] && MASKS[mask](x, y)) this.modules[y][x] = !this.modules[y][x];
      }
    }
  };

  /** The standard penalty (ISO 18004 rules 1 to 4): lower reads more reliably. */
  QrSymbol.prototype.penalty = function () {
    const size = this.size;
    const m = this.modules;
    const line = (i, horizontal) => {
      const out = [];
      for (let k = 0; k < size; k += 1) out.push(horizontal ? m[i][k] : m[k][i]);
      return out;
    };
    const finderLike = [true, false, true, true, true, false, true];
    let score = 0;
    for (let i = 0; i < size; i += 1) {
      [true, false].forEach((horizontal) => {
        const cells = line(i, horizontal);
        let run = 1;
        for (let k = 1; k <= size; k += 1) {
          if (k < size && cells[k] === cells[k - 1]) {
            run += 1;
          } else {
            if (run >= 5) score += 3 + (run - 5);
            run = 1;
          }
        }
        for (let k = 0; k + 7 <= size; k += 1) {
          if (!finderLike.every((v, d) => cells[k + d] === v)) continue;
          const lightBefore = k >= 4 && cells.slice(k - 4, k).every((v) => !v);
          const lightAfter = k + 11 <= size && cells.slice(k + 7, k + 11).every((v) => !v);
          if (lightBefore || lightAfter) score += 40;
        }
      });
    }
    let dark = 0;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (m[y][x]) dark += 1;
        if (x + 1 < size && y + 1 < size && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) score += 3;
      }
    }
    const total = size * size;
    score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return score;
  };

  function utf8(text) {
    return Array.from(new TextEncoder().encode(text));
  }

  /** The QR code of `text`: { size, isDark(x, y) }. Throws when the text is too long. */
  function encode(text) {
    const bytes = utf8(text);
    let ver = 1;
    while (ver <= MAX_VERSION && bytes.length + (ver <= 9 ? 2 : 3) > dataCodewords(ver)) ver += 1;
    if (ver > MAX_VERSION) throw new Error('Text too long for a QR code');
    const words = addEcc(encodeData(bytes, ver), ver);
    const sym = new QrSymbol(ver);
    sym.drawFunctionPatterns();
    sym.drawCodewords(words);
    let best = 0;
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask += 1) {
      sym.applyMask(mask);
      sym.drawFormat(mask);
      const score = sym.penalty();
      if (score < bestScore) {
        best = mask;
        bestScore = score;
      }
      sym.applyMask(mask);
    }
    sym.applyMask(best);
    sym.drawFormat(best);
    return { size: sym.size, isDark: (x, y) => sym.modules[y][x] };
  }

  /** An <svg> of the QR code (dark on light, with the quiet zone); `label` is its accessible name. */
  function svg(text, label) {
    const NS = 'http://www.w3.org/2000/svg';
    const code = encode(text);
    const full = code.size + QUIET * 2;
    const node = document.createElementNS(NS, 'svg');
    node.setAttribute('viewBox', '0 0 ' + full + ' ' + full);
    node.setAttribute('shape-rendering', 'crispEdges');
    node.setAttribute('role', 'img');
    if (label) node.setAttribute('aria-label', label);
    const back = document.createElementNS(NS, 'rect');
    back.setAttribute('width', String(full));
    back.setAttribute('height', String(full));
    back.setAttribute('fill', '#ffffff');
    node.appendChild(back);
    let d = '';
    for (let y = 0; y < code.size; y += 1) {
      for (let x = 0; x < code.size; x += 1) {
        if (code.isDark(x, y)) d += 'M' + (x + QUIET) + ' ' + (y + QUIET) + 'h1v1h-1z';
      }
    }
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', '#000000');
    node.appendChild(path);
    return node;
  }

  root.BrainRushQR = { encode: encode, svg: svg };
})(typeof window !== 'undefined' ? window : globalThis);
