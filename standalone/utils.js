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
var argmax = (arrLike) => {
  const arr = Array.from(arrLike);
  return arr.indexOf(Math.max(...arr));
};
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
    ngrams[value] || (ngrams[value] = 0);
    ngrams[value] += 1;
    total += 1;
  }
  const values = Object.keys(ngrams);
  const valuesSorted = values.sort((a, b) => ngrams[b] - ngrams[a]);
  const valuesDetailed = valuesSorted.map((value) => ({ value, count: ngrams[value], frequency: ngrams[value] / total }));
  const valuesDetailedTable = Object.fromEntries(valuesDetailed.map((ngram) => [ngram.value, ngram]));
  return valuesDetailedTable;
};
var getNormalized = (str) => {
  const ignoreRe = /[^\p{L}\p{M}\s]/gu;
  const whitespaceRe = /\s{2,}/g;
  return ` ${str.replace(ignoreRe, "").replace(whitespaceRe, " ").toLowerCase().trim()} `;
};
var getTopKeys = (obj) => {
  const keys = Object.keys(obj);
  const keysSorted = keys.sort((a, b) => obj[b] - obj[a]);
  return keysSorted;
};
var infer = (input, langs, ngrams, nn1, nn2, nn3, nnX) => {
  const inputNorm = getNormalized(input);
  const unigrams = getNgrams(inputNorm, 1);
  const bigrams = getNgrams(inputNorm, 2);
  const trigrams = getNgrams(inputNorm, 3);
  const input1 = new tensor_default(1, 1, ngrams.unigrams.length, new Float32Array(ngrams.unigrams.map((value) => {
    var _a;
    return ((_a = unigrams[value]) == null ? void 0 : _a.frequency) || 0;
  })));
  const input2 = new tensor_default(1, 1, ngrams.bigrams.length, new Float32Array(ngrams.bigrams.map((value) => {
    var _a;
    return ((_a = bigrams[value]) == null ? void 0 : _a.frequency) || 0;
  })));
  const input3 = new tensor_default(1, 1, ngrams.trigrams.length, new Float32Array(ngrams.trigrams.map((value) => {
    var _a;
    return ((_a = trigrams[value]) == null ? void 0 : _a.frequency) || 0;
  })));
  const output1 = nn1.forward(input1, false).w;
  const output2 = nn2.forward(input2, false).w;
  const output3 = nn3.forward(input3, false).w;
  const inputX = new tensor_default(1, 1, langs.length * 3, new Float32Array([...Array.from(output1), ...Array.from(output2), ...Array.from(output3)]));
  const outputX = nnX.forward(inputX, false).w;
  const result = Array.from(outputX).map((probability, index) => [langs[index], probability]);
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
  argmax,
  forEachLine,
  getNgrams,
  getNormalized,
  getTopKeys,
  infer,
  padEnd
};
