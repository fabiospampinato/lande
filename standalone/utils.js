// node_modules/toygrad/dist/buffer.js
var Buffer = class extends Float32Array {
};
var buffer_default = Buffer;

// node_modules/toygrad/dist/utils.js
var isBuffer = (value) => {
  return value instanceof Float32Array;
};
var isNumber = (value) => {
  return typeof value === "number";
};
var isUndefined = (value) => {
  return typeof value === "undefined";
};
var randn = (mean, stdev) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  const rand = z * stdev + mean;
  return rand;
};

// node_modules/toygrad/dist/tensor.js
var Tensor = class {
  constructor(sx, sy, sz, value, dvalue) {
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
    this.length = sx * sy * sz;
    if (isUndefined(value)) {
      const scale = Math.sqrt(1 / this.length);
      const get = () => randn(0, scale);
      this.w = new buffer_default(this.length).map(get);
    } else if (isNumber(value)) {
      this.w = new buffer_default(this.length);
      if (value !== 0) {
        this.w.fill(value);
      }
    } else if (isBuffer(value)) {
      this.w = value;
    } else {
      this.w = new buffer_default(value);
    }
    this.dw = dvalue || new buffer_default(this.length);
  }
  index(x, y, z) {
    return (this.sx * y + x) * this.sz + z;
  }
  get(x, y, z) {
    return this.w[this.index(x, y, z)];
  }
  set(x, y, z, value) {
    return this.w[this.index(x, y, z)] = value;
  }
  add(x, y, z, value) {
    return this.w[this.index(x, y, z)] += value;
  }
  getGrad(x, y, z) {
    return this.dw[this.index(x, y, z)];
  }
  setGrad(x, y, z, value) {
    return this.dw[this.index(x, y, z)] = value;
  }
  addGrad(x, y, z, value) {
    return this.dw[this.index(x, y, z)] += value;
  }
  clone() {
    const clone = new Tensor(this.sx, this.sy, this.sz, this.w);
    clone.w = clone.w.slice();
    return clone;
  }
  cloneWithZeros() {
    return new Tensor(this.sx, this.sy, this.sz, 0);
  }
};
var tensor_default = Tensor;

// src/utils.ts
var forEachLine = (buffer, callback) => {
  let start = 0;
  while (true) {
    const end = buffer.indexOf("\n", start);
    if (end <= start)
      break;
    const line = buffer.subarray(start, end).toString();
    callback(line);
    start = end + 1;
  }
};
var getNgrams = (str, length) => {
  let ngrams = {};
  let total = 0;
  for (let i = 0, l = str.length - length; i <= l; i++) {
    const value = str.slice(i, i + length);
    ngrams[value] || (ngrams[value] = { value, count: 0, frequency: 0 });
    ngrams[value].count += 1;
    total += 1;
  }
  for (let value in ngrams) {
    ngrams[value].frequency = ngrams[value].count / total;
  }
  return ngrams;
};
var getNormalized = (str) => {
  const hyphenRe = /-+/g;
  const ignoreRe = /[^\p{L}\p{M}\s]/gu;
  const whitespaceRe = /\s{2,}/g;
  return ` ${str.replace(hyphenRe, " ").replace(ignoreRe, "").replace(whitespaceRe, " ").toLowerCase().trim()} `;
};
var getTopKeys = (obj) => {
  const keys = Object.keys(obj);
  const keysSorted = keys.sort((a, b) => obj[b] - obj[a]);
  return keysSorted;
};
var infer = (text, langs, ngrams, nn) => {
  const textNorm = getNormalized(text);
  const unigrams = getNgrams(textNorm, 1);
  const bigrams = getNgrams(textNorm, 2);
  const trigrams = getNgrams(textNorm, 3);
  const inputUnigrams = ngrams.unigrams.map((value) => {
    var _a;
    return ((_a = unigrams[value]) == null ? void 0 : _a.frequency) || 0;
  });
  const inputBigrams = ngrams.bigrams.map((value) => {
    var _a;
    return ((_a = bigrams[value]) == null ? void 0 : _a.frequency) || 0;
  });
  const inputTrigrams = ngrams.trigrams.map((value) => {
    var _a;
    return ((_a = trigrams[value]) == null ? void 0 : _a.frequency) || 0;
  });
  const inputNgrams = [...inputUnigrams, ...inputBigrams, ...inputTrigrams];
  const input = new tensor_default(1, 1, inputNgrams.length, new Float32Array(inputNgrams));
  const output = nn.forward(input, false).w;
  const result = Array.from(output).map((probability, index) => [langs[index], probability]);
  const resultSorted = result.sort((a, b) => b[1] - a[1]);
  return resultSorted;
};
var padEnd = (arr, length, padder) => {
  if (arr.length >= length)
    return arr;
  const padding = new Array(length - arr.length).fill(padder);
  const padded = arr.concat(padding);
  return padded;
};
export {
  forEachLine,
  getNgrams,
  getNormalized,
  getTopKeys,
  infer,
  padEnd
};
