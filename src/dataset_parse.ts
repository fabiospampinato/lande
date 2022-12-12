
// @ts-nocheck

/* IMPORT */

import _ from 'lodash';
import events from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import readlines from 'n-readlines';
import reader from 'line-reader';
import {Encoder, Layers, NeuralNetwork, Tensor, Trainers} from 'toygrad';
import {UNIGRAMS_LENGTH, BIGRAMS_LENGTH, TRIGRAMS_LENGTH} from './constants';
import {DATASET_PERC, TRAINING_PERC, TEST_PERC} from './constants';
import Ngrams from './ngrams';
import {padEnd, sortByValue} from './utils';

/* HELPERS */

// const DATASET_CSV_PATH = path.join ( process.cwd (), 'resources', 'dataset.csv' );
const DATASET_CSV_PATH = path.join ( process.cwd (), 'resources', 'dataset_small.csv' );
const DATASET_JSON_PATH = path.join ( process.cwd (), 'resources', 'dataset.json' );

const LANGS_ACTIVE = ['eng', 'rus', 'ita', 'tur', 'epo', 'deu', /* 'fra', 'spa', 'por', 'hun', 'jpn', 'heb', 'ber', 'pol' */].sort ();
const LANGS_ACTIVE_IDS = LANGS_ACTIVE.map ( ( _, index ) => index );
const LANGS_ACTIVE_MAP = _.zipObject ( LANGS_ACTIVE, LANGS_ACTIVE_IDS );
const LANGS_ACTIVE_INVERSE_MAP = _.zipObject ( LANGS_ACTIVE_IDS, LANGS_ACTIVE );
const LANGS_ACTIVE_SET = new Set ( LANGS_ACTIVE );

const PARSE_LIMIT = 2000;

const EPOCHS = 1;

/* MAIN */




const argmax = arr => {
  return arr.indexOf ( Math.max ( ...Array.from ( arr ) ) );
};












console.time('embedding');
class EmebeddingTensor extends Tensor {

};
class Embedding extends Layers.AbstractInput<InputOptions> {
  constructor ( options: InputOptions, prev?: Abstract ) {
    super ( options, prev );
    this.osx = 1;
    this.osy = options.dimensions;
    this.osz = options.sz;
    this.dimensions = options.dimensions;
    this.vocabulary = options.vocabulary;
    this.weights = new Tensor ( 1, this.dimensions, this.vocabulary );
  }
  forward ( input: Tensor, isTraining: boolean ): Tensor {
    this.it = input;
    const output = new Tensor ( 1, this.dimensions, this.osz, 0 );
    for ( let z = 0; z < this.osz; z++ ) {
      const index = input.w[z];
      for ( let y = 0; y < this.osy; y++ ) {
        output.set ( 0, y, z, this.weights.get ( 0, y, index ) );
      }
    }
    this.ot = output;
    return this.ot;
  }
  backward (): void {
    const input = this.it;
    const output = this.ot;
    for ( let z = 0; z < this.osz; z++ ) {
      const index = input.w[z];
      for ( let y = 0; y < this.osy; y++ ) {
        this.weights.w.set ( 0, y, index, this.weights.get ( 0, y, index ) + this.ot.getGrad ( 0, y, z ) );
      }
    }
  }
  getAsOptions () {
    return {
      _weights: Encoder.encode ( this.weights.w, 'f16' )
    };
  }
  getParamsAndGrads () {
    return[];
    // return { params: this.ot, grads: this.ot.dw, l1decay: 0, l2decay: 0 };
  }
}
console.timeEnd('embedding');























console.time ( 'reading' );
const csv = fs.readFileSync ( DATASET_CSV_PATH, 'utf8' );
console.timeEnd ( 'reading' );





console.time ( 'parsing' );
const datasetByLang: Record<string, { input: Tensor, output: number }[]> = {};
// const rl = readline.createInterface ({ input: fs.createReadStream ( DATASET_CSV_PATH ) });
// const rl = new readlines ( DATASET_CSV_PATH );
// rl.on ( 'line', line => {
// let line = null;
// while ( line = rl.next ()?.toString () ) {
// const asd = reader.eachLine ( DATASET_CSV_PATH, line => {
const lines = csv.split ( '\n' );
lines.forEach ( line => {
  const parts = line.split ( '\t' );
  if ( parts.length !== 3 ) return;
  const lang = parts[1].trim ();
  if ( !LANGS_ACTIVE_SET.has ( lang ) ) return;
  if ( datasetByLang[lang]?.length >= PARSE_LIMIT ) return;
  const sentence = parts[2].trim ();
  // const substrings = Ngrams.preparse ( sentence );
  const [g1, f1] = Ngrams.get ( sentence, 1, UNIGRAMS_LENGTH, true );
  const [g2, f2] = Ngrams.get ( sentence, 2, BIGRAMS_LENGTH, true );
  const [g3, f3] = Ngrams.get ( sentence, 3, TRIGRAMS_LENGTH, true );
  // const input = new Tensor ( 1, 1, INPUT_LENGTH, new Float32Array ( [...g1, ...g2, ...g3] ) );
  // const output = LANGS_ACTIVE_MAP[lang];
  // const databit = { input, output };
  // const inputg1 = new Tensor ( 1, 1, UNIGRAMS_LENGTH, new Float32Array ( g1 ) );
  // const inputg2 = new Tensor ( 1, 1, BIGRAMS_LENGTH, new Float32Array ( g2 ) );
  // const inputg3 = new Tensor ( 1, 1, TRIGRAMS_LENGTH, new Float32Array ( g3 ) );
  // const inputf1 = new Tensor ( 1, 1, UNIGRAMS_LENGTH, new Float32Array ( f1 ) );
  // const inputf2 = new Tensor ( 1, 1, BIGRAMS_LENGTH, new Float32Array ( f2 ) );
  // const inputf3 = new Tensor ( 1, 1, TRIGRAMS_LENGTH, new Float32Array ( f3 ) );
  // const inputn1 = new Tensor ( 1, 1, UNIGRAMS_LENGTH * 2, new Float32Array ([ ...g1, ...f1 ]) );
  // const inputn2 = new Tensor ( 1, 1, BIGRAMS_LENGTH * 2, new Float32Array ([ ...g2, ...f2 ]) );
  // const inputn3 = new Tensor ( 1, 1, TRIGRAMS_LENGTH * 2, new Float32Array ([ ...g3, ...f3 ]) );
  const input = new Tensor ( 1, 1, ( UNIGRAMS_LENGTH + BIGRAMS_LENGTH + TRIGRAMS_LENGTH ) * 2, new Float32Array ([ ...g1, ...f1, ...g2, ...f2, ...g3, ...f3 ]) );
  const output = LANGS_ACTIVE_MAP[lang];
  // const databit = { inputg1, inputg2, inputg3, inputf1, inputf2, inputf3, inputn1, inputn2, inputn3, input, output };
  const databit = { input, output };
  datasetByLang[lang] ||= [];
  datasetByLang[lang].push ( databit );
});
// await events.once ( rl, 'close' );
console.timeEnd ( 'parsing' );





console.time ( 'divide' );
let TRAIN_SET = [];
let TEST_SET = [];
LANGS_ACTIVE.forEach ( lang => {
  const dataset = _.shuffle ( datasetByLang[lang] );
  const datasetTrain = dataset.slice ( 0, Math.floor ( dataset.length * TRAINING_PERC ) );
  const datasetTest = dataset.slice ( Math.floor ( dataset.length * TRAINING_PERC ) );
  TRAIN_SET = TRAIN_SET.concat ( datasetTrain );
  TEST_SET = TEST_SET.concat ( datasetTest );
});
console.timeEnd ( 'divide' );









// console.time('train.n1');
// const nn1 = new NeuralNetwork ({
//   layers: [
//     // { type: 'input', sx: 1, sy: 1, sz: UNIGRAMS_LENGTH + BIGRAMS_LENGTH + TRIGRAMS_LENGTH },
//     new Embedding ({ dimensions: 64, sz: UNIGRAMS_LENGTH + BIGRAMS_LENGTH + TRIGRAMS_LENGTH, vocabulary: 8192 / 2 * 3 }),
//     { type: 'dense', filters: 64, bias: 0 },
//     { type: 'tanh' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainern1 = new Trainers.Adadelta ( nn1, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     trainern1.train ( batch[i].input, batch[i].output );
//   };
// }
// console.timeEnd('train.n1');

// console.time('test.n1');{
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
// // debugger;
//   const actual = argmax ( nn1.forward ( sample.input, false ).w );
//   // console.log(actual)
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.n1');
// console.log('nn1',JSON.stringify(nn1.getAsOptions ('f16')).length);
// }






































































// console.time('train.g1');
// const nng1 = new NeuralNetwork ({
//   layers: [
//     // { type: 'input', sx: 1, sy: 1, sz: UNIGRAMS_LENGTH },
//     new Embedding ({ dimensions: 12, sz: UNIGRAMS_LENGTH, vocabulary: 8192 }),
//     { type: 'dense', filters: 12, bias: 0.1 },
//     { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainern1 = new Trainers.Adadelta ( nng1, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     trainern1.train ( batch[i].inputg1, batch[i].output );
//   };
// }
// console.timeEnd('train.g1');

// console.time('test.g1');
// {
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const actual = argmax ( nng1.forward ( sample.inputg1, false ).w );
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.g1');
// console.log('nn.g1',JSON.stringify(nng1.getAsOptions ('f16')).length);
// }












// console.time('train.g2');
// const nng2 = new NeuralNetwork ({
//   layers: [
//     // { type: 'input', sx: 1, sy: 1, sz: BIGRAMS_LENGTH },
//     new Embedding ({ dimensions: 12, sz: BIGRAMS_LENGTH, vocabulary: 8192 }),
//     { type: 'dense', filters: 12, bias: 0.1 },
//     { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainern2 = new Trainers.Adadelta ( nng2, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     trainern2.train ( batch[i].inputg2, batch[i].output );
//   };
// }
// console.timeEnd('train.g2');

// console.time('test.g2');
// {
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const actual = argmax ( nng2.forward ( sample.inputg2, false ).w );
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.g2');
// console.log('nn.g2',JSON.stringify(nng2.getAsOptions ('f16')).length);
// }











// console.time('train.g3');
// const nng3 = new NeuralNetwork ({
//   layers: [
//     // { type: 'input', sx: 1, sy: 1, sz: TRIGRAMS_LENGTH },
//     new Embedding ({ dimensions: 12, sz: TRIGRAMS_LENGTH, vocabulary: 8192 }),
//     { type: 'dense', filters: 12, bias: 0.1 },
//     { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainern3 = new Trainers.Adadelta ( nng3, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     trainern3.train ( batch[i].inputg3, batch[i].output );
//   };
// }
// console.timeEnd('train.g3');

// console.time('test.g3');
// {
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const actual = argmax ( nng3.forward ( sample.inputg3, false ).w );
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.g3');
// console.log('nn.g3',JSON.stringify(nng3.getAsOptions ('f16')).length);
// }











// console.time('train.f1');
// const nnf1 = new NeuralNetwork ({
//   layers: [
//     // { type: 'input', sx: 1, sy: 1, sz: UNIGRAMS_LENGTH },
//     new Embedding ({ dimensions: 12, sz: UNIGRAMS_LENGTH, vocabulary: 8192 }),
//     { type: 'dense', filters: 12, bias: 0.1 },
//     { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainerf1 = new Trainers.Adadelta ( nnf1, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     trainerf1.train ( batch[i].inputf1, batch[i].output );
//   };
// }
// console.timeEnd('train.f1');

// console.time('test.f1');
// {
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const actual = argmax ( nnf1.forward ( sample.inputf1, false ).w );
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.f1');
// console.log('nn.f1',JSON.stringify(nnf1.getAsOptions ('f16')).length);
// }











// console.time('train.f2');
// const nnf2 = new NeuralNetwork ({
//   layers: [
//     // { type: 'input', sx: 1, sy: 1, sz: BIGRAMS_LENGTH },
//     new Embedding ({ dimensions: 12, sz: BIGRAMS_LENGTH, vocabulary: 8192 }),
//     { type: 'dense', filters: 12, bias: 0.1 },
//     { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainerf2 = new Trainers.Adadelta ( nnf2, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     trainerf2.train ( batch[i].inputf2, batch[i].output );
//   };
// }
// console.timeEnd('train.f2');

// console.time('test.f2');
// {
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const actual = argmax ( nnf2.forward ( sample.inputf2, false ).w );
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.f2');
// console.log('nn.f2',JSON.stringify(nnf2.getAsOptions ('f16')).length);
// }









// console.time('train.f3');
// const nnf3 = new NeuralNetwork ({
//   layers: [
//     // { type: 'input', sx: 1, sy: 1, sz: TRIGRAMS_LENGTH },
//     new Embedding ({ dimensions: 12, sz: TRIGRAMS_LENGTH, vocabulary: 8192 }),
//     { type: 'dense', filters: 12, bias: 0.1 },
//     { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainerf3 = new Trainers.Adadelta ( nnf3, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     trainerf3.train ( batch[i].inputf3, batch[i].output );
//   };
// }
// console.timeEnd('train.f3');

// console.time('test.f3');
// {
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const actual = argmax ( nnf3.forward ( sample.inputf3, false ).w );
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.f3');
// console.log('nn.f3',JSON.stringify(nnf3.getAsOptions ('f16')).length);
// }










// console.time('train.merged');
// const nnx = new NeuralNetwork ({
//   layers: [
//     { type: 'input', sx: 1, sy: 1, sz: LANGS_ACTIVE.length * 6 },
//     { type: 'dense', filters: 128, bias: 0.1 },
//     { type: 'relu' },
//     { type: 'dense', filters: 128, bias: 0.1 },
//     { type: 'relu' },
//     { type: 'dense', filters: 128, bias: 0.1 },
//     { type: 'relu' },
//     { type: 'dense', filters: 128, bias: 0.1 },
//     { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     // { type: 'dense', filters: 64, bias: 0.1 },
//     // { type: 'relu' },
//     { type: 'dense', filters: LANGS_ACTIVE.length },
//     { type: 'softmax' }
//   ]
// });

// const trainerx = new Trainers.Adadelta ( nnx, {
//   batchSize: 1
// });

// for ( let epoch = 0, epochs = EPOCHS; epoch < epochs; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 5000 === 0 ) console.log ( `Epoch ${epoch + 1}/${epochs} - ${i}/${batch.length}` );
//     const outputg1 = Array.from ( nng1.forward ( batch[i].inputg1, false ).w );
//     const outputg2 = Array.from ( nng2.forward ( batch[i].inputg2, false ).w );
//     const outputg3 = Array.from ( nng3.forward ( batch[i].inputg3, false ).w );
//     const outputf1 = Array.from ( nnf1.forward ( batch[i].inputf1, false ).w );
//     const outputf2 = Array.from ( nnf2.forward ( batch[i].inputf2, false ).w );
//     const outputf3 = Array.from ( nnf3.forward ( batch[i].inputf3, false ).w );
//     const merged = new Float32Array ([ ...outputg1, ...outputg2, ...outputg3, ...outputf1, ...outputf2, ...outputf3 ]);
//     const input = new Tensor ( 1, 1, merged.length, merged );
//     trainerx.train ( input, batch[i].output );
//   };
// }
// console.timeEnd('train.merged');

// console.time('test.merged');
// {
// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const outputg1 = Array.from ( nng1.forward ( sample.inputg1, false ).w );
//   const outputg2 = Array.from ( nng2.forward ( sample.inputg2, false ).w );
//   const outputg3 = Array.from ( nng3.forward ( sample.inputg3, false ).w );
//   const outputf1 = Array.from ( nnf1.forward ( sample.inputf1, false ).w );
//   const outputf2 = Array.from ( nnf2.forward ( sample.inputf2, false ).w );
//   const outputf3 = Array.from ( nnf3.forward ( sample.inputf3, false ).w );
//   const merged = new Float32Array ([ ...outputg1, ...outputg2, ...outputg3, ...outputf1, ...outputf2, ...outputf3 ]);
//   const input = new Tensor ( 1, 1, merged.length, merged );
//   const actual = argmax ( nnx.forward ( input, false ).w );
//   const expected = sample.output;
//   const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
//     resultByLang[expectedLang].fail += 1;
//   }
// }

// // console.log(JSON.stringify(resultByLang,undefined,2));
// // console.log('==================================');
// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.timeEnd('test.merged');
// console.log('nn.x',JSON.stringify(nnx.getAsOptions ('f16')).length);
// }
























































console.time('train');
const nn = new NeuralNetwork ({
  layers: [
    { type: 'input', sx: 1, sy: 1, sz: ( UNIGRAMS_LENGTH + BIGRAMS_LENGTH + TRIGRAMS_LENGTH ) * 2 },
    // new Embedding ({ dimensions: 24, sz: INPUT_LENGTH, vocabulary: 50_000 }),
    // { type: 'dropout', probability: 0.25 },
    { type: 'dense', filters: 128, bias: 0.1 },
    { type: 'relu' },
    { type: 'dense', filters: 128, bias: 0.1 },
    { type: 'relu' },
    // { type: 'dense', filters: 32, bias: 0.1 },
    // { type: 'relu' },
    // { type: 'dense', filters: 32, bias: 0.1 },
    // { type: 'relu' },
    // { type: 'dense', filters: 128 },
    // { type: 'tanh' },
    // { type: 'dense', filters: 64 },
    // { type: 'tanh' },
    { type: 'dense', filters: LANGS_ACTIVE.length },
    { type: 'softmax' }
  ]
});

const trainer = new Trainers.Adadelta ( nn, {
  batchSize: 1
});

for ( let epoch = 0; epoch < EPOCHS; epoch++ ) {
  const batch = _.shuffle ( TRAIN_SET );
  for ( let i = 0, l = batch.length; i < l; i++ ) {
    if ( i % 1000 === 0 ) console.log ( `Epoch ${epoch} - ${i}/${batch.length}` );
    trainer.train ( batch[i].input, batch[i].output );
  };
}
console.timeEnd('train');








console.time('test');
const resultByLang = {};

let pass = 0;
let fail = 0;

for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
  const sample = TEST_SET[i];
  const actual = argmax ( nn.forward ( sample.input, false ).w );
  const expected = sample.output;
  const expectedLang = LANGS_ACTIVE_INVERSE_MAP[expected];
  if ( expected === actual ) {
    pass += 1;
    resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
    resultByLang[expectedLang].pass += 1;
  } else {
    fail += 1;
    resultByLang[expectedLang] ||= { pass: 0, fail: 0 };
    resultByLang[expectedLang].fail += 1;
  }
}

console.log(JSON.stringify(resultByLang,undefined,2));
console.log('==================================');
console.log ( 'Pass:', pass );
console.log ( 'Fail:', fail );
console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
console.timeEnd('test');


fs.writeFileSync('nn.json', JSON.stringify(nn.getAsOptions ('f16')));``
console.log(JSON.stringify(nn.getAsOptions ('f16')).length);













// ------------------------------------------------------













// console.time ( 'reading' );
// const csv = fs.readFileSync ( DATASET_CSV_PATH, 'utf8' );
// const lines = csv.split ( '\n' );
// console.timeEnd ( 'reading' );





// console.time ( 'parsing' );
// const linesUsed = Math.floor ( lines.length * DATASET_PERC );
// const dataset: { lang: string, sentence: string }[] = [];
// lines.slice ( 0, linesUsed ).forEach ( line => {
//   const parts = line.split ( '\t' );
//   if ( parts.length !== 3 ) return;
//   const lang = parts[1].trim ();
//   const sentence = parts[2].trim ();
//   const substrings = Ngrams.preparse ( sentence );
//   const [g1, f1] = Ngrams.get ( substrings, 1, UNIGRAMS_LENGTH, false );
//   const [g2, f2] = Ngrams.get ( substrings, 2, BIGRAMS_LENGTH, false );
//   const [g3, f3] = Ngrams.get ( substrings, 3, TRIGRAMS_LENGTH, false );
//   const databit = { lang, sentence, g1, f1, g2, f2, g3, f3 };
//   dataset.push ( databit );
// });
// console.timeEnd ( 'parsing' );





// console.time ( 'producing.lang' );
// const langs = _.uniq ( dataset.map ( databit => databit.lang ) ).sort ().filter ( lang => lang.length === 3 );
// const langsPath = path.join ( process.cwd (), 'resources', 'langs.json' );
// fs.writeFileSync ( langsPath, JSON.stringify ( langs ) );
// console.timeEnd ( 'producing.lang' );





// console.time ( 'producing.data' );
// const datasetStats = {};
// const datasetBylanguage = _.groupBy ( dataset, 'lang' );
// langs.forEach ( lang => {
//   const dataset = datasetBylanguage[lang];
//   datasetStats[lang] = dataset.length;
//   const output = langs.indexOf ( lang );
//   const encode = arr => Encoder.encode ( new Float32Array ( arr ), 'f32' );
//   const lines = dataset.map ( databit => [output, encode ( databit.g1 ), encode ( databit.g2 ), encode ( databit.g3 )].join ( ',' ) );
//   const csv = lines.join ( '\n' );
//   const datasetPath = path.join ( process.cwd (), 'resources', 'languages', `${lang}.json` );
//   fs.writeFileSync ( datasetPath, csv );
// });
// console.timeEnd ( 'producing.data' );





// console.time ( 'producing.stats' );
// const statsPath = path.join ( process.cwd (), 'resources', 'stats.json' );
// fs.writeFileSync ( statsPath, JSON.stringify ( sortByValue ( datasetStats ) ) );
// console.timeEnd ( 'producing.stats' );











/* ----------------------------------------- */
/* ----------------------------------------- */
/* ----------------------------------------- */
/* ----------------------------------------- */
/* ----------------------------------------- */










// console.time('filtering');
// const langsPath = path.join ( process.cwd (), 'resources', 'langs.json' );
// const datasetLangs = JSON.parse ( fs.readFileSync ( langsPath ) );

// const statsPath = path.join ( process.cwd (), 'resources', 'stats.json' );
// const datasetStats = JSON.parse ( fs.readFileSync ( statsPath ) );
// const langsFrancMin = ['cmn', 'spa', 'eng', 'rus', 'arb', 'ben', 'hin', 'por', 'ind', 'jpn', 'fra', 'deu', 'jav', 'jav', 'kor', 'tel', 'vie', 'mar', 'ita', 'tam', 'tur', 'urd', 'guj', 'pol', 'ukr', 'kan', 'mai', 'mal', 'pes', 'mya', 'swh', 'sun', 'ron', 'pan', 'bho', 'amh', 'hau', 'fuv', 'bos', 'bos', 'hrv', 'nld', 'srp', 'srp', 'tha', 'ckb', 'yor', 'uzn', 'uzn', 'zlm', 'zlm', 'ibo', 'npi', 'ceb', 'skr', 'tgl', 'hun', 'azj', 'azj', 'sin', 'koi', 'ell', 'ces', 'mag', 'run', 'bel', 'plt', 'qug', 'mad', 'nya', 'zyb', 'pbu', 'kin', 'zul', 'bul', 'swe', 'lin', 'som', 'hms', 'hnj', 'ilo', 'kaz']
// const langsFiltered = langsFrancMin.filter ( lang => lang in datasetStats && datasetStats[lang] > 500_000 ).sort ();
// console.timeEnd('filtering');





// console.time('reading');
// const datasetBylanguage = langsFiltered.map ( lang => {
//   const datasetPath = path.join ( process.cwd (), 'resources', 'languages', `${lang}.json` );
//   const csv = fs.readFileSync ( datasetPath, 'utf8' );
//   const lines = csv.split ( '\n' );
//   const dataset = lines.map ( line => {
//     const parts = line.split ( ',' );
//     const output = parseInt ( parts[0] );
//     const g1 = Encoder.decode ( parts[1], 'f32' );
//     const g2 = Encoder.decode ( parts[2], 'f32' );
//     const g3 = Encoder.decode ( parts[3], 'f32' );
//     return { output, g1, g2, g3 };
//   });
//   return dataset;
// });
// console.timeEnd('reading');





// const TRAIN_LEGTH = 100000;
// const TEST_LENGTH = 30000;
// console.time('shuffling');
// let TRAIN = [];
// let TEST = [];
// datasetBylanguage.forEach ( dataset => {
//   const shuffled = _.shuffle ( dataset );
//   const train = shuffled.slice ( 0, TRAIN_LEGTH );
//   const test = shuffled.slice ( TRAIN_LEGTH, TRAIN_LEGTH + TEST_LENGTH );
//   TRAIN = TRAIN.concat ( train );
//   TEST = TEST.concat ( test );
// });
// console.timeEnd('shuffling');





// console.time('writing');
// const trainPath = path.join ( process.cwd (), 'resources', 'train.json' );
// const testPath = path.join ( process.cwd (), 'resources', 'test.json' );
// const toEncoded = databit => ({ output: databit.output, g1: Encoder.encode ( databit.g1, 'f32' ), g2: Encoder.encode ( databit.g2, 'f32' ), g3: Encoder.encode ( databit.g3, 'f32' ) });
// fs.writeFileSync ( trainPath, JSON.stringify ( TRAIN.map ( toEncoded ) ) );
// fs.writeFileSync ( testPath, JSON.stringify ( TEST.map ( toEncoded ) ) );
// console.timeEnd('writing');










/* ----------------------------------------- */
/* ----------------------------------------- */
/* ----------------------------------------- */
/* ----------------------------------------- */
/* ----------------------------------------- */










// console.time('reading');
// // const trainPath = path.join ( process.cwd (), 'resources', 'train.json' );
// // const testPath = path.join ( process.cwd (), 'resources', 'test.json' );
// const toInput = databit => ({ output: langsFiltered.indexOf ( datasetLangs[databit.output] ), input: new Tensor ( 1, 1, UNIGRAMS_LENGTH + BIGRAMS_LENGTH + TRIGRAMS_LENGTH, new Float32Array ( [...padEnd ( Array.from ( Encoder.decode ( databit.g1 ) ), UNIGRAMS_LENGTH, 0 ), ...padEnd ( Array.from ( Encoder.decode ( databit.g2 ) ), BIGRAMS_LENGTH, 0 ), ...padEnd ( Array.from ( Encoder.decode ( databit.g3 ) ), TRIGRAMS_LENGTH, 0 )] ) ) });
// const TRAIN_SET = _.shuffle ( JSON.parse ( fs.readFileSync ( trainPath ) ).map ( toInput ) );
// const TEST_SET = _.shuffle ( JSON.parse ( fs.readFileSync ( testPath ) ).map ( toInput ) );
// console.timeEnd('reading');






// console.time('train');
// const nn = new NeuralNetwork ({
//   layers: [
//     { type: 'input', sx: 1, sy: 1, sz: UNIGRAMS_LENGTH + BIGRAMS_LENGTH + TRIGRAMS_LENGTH },
//     { type: 'dense', filters: 512 },
//     { type: 'relu' },
//     { type: 'dense', filters: langsFiltered.length },
//     { type: 'softmax' }
//   ]
// });

// const trainer = new Trainers.Adadelta ( nn, {
//   batchSize: 4
// });

// for ( let epoch = 0; epoch < 2; epoch++ ) {
//   const batch = _.shuffle ( TRAIN_SET );
//   for ( let i = 0; i < batch.length; i++ ) {
//     if ( i % 1000 === 0 ) console.log ( `Epoch ${epoch} - ${i}/${batch.length}` );
//     trainer.train ( batch[i].input, batch[i].output );
//   };
// }
// console.timeEnd('train');







// console.time('test');
// const argmax = arr => {
//   return arr.indexOf ( Math.max ( ...Array.from ( arr ) ) );
// };

// const resultByLang = {};

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = TEST_SET.length; i < l; i++ ) {
//   const sample = TEST_SET[i];
//   const actual = argmax ( nn.forward ( sample.input, false ).w );
//   const expected = sample.output;
//   if ( expected === actual ) {
//     pass += 1;
//     resultByLang[langsFiltered[expected]] = resultByLang[langsFiltered[expected]] || { pass: 0, fail: 0 };
//     resultByLang[langsFiltered[expected]].pass += 1;
//   } else {
//     fail += 1;
//     resultByLang[langsFiltered[expected]] = resultByLang[langsFiltered[expected]] || { pass: 0, fail: 0 };
//     resultByLang[langsFiltered[expected]].fail += 1;
//   }
// }

// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );
// console.log(JSON.stringify(resultByLang,undefined,2));

// console.timeEnd('test');










// console.time('save');
// const options = nn.getAsOptions ( 'f16' );
// const optionsPath = path.join ( process.cwd (), 'resources', 'options.json' );
// fs.writeFileSync ( optionsPath, JSON.stringify ( options ) );
// console.log('Save length:', JSON.stringify ( options ).length);
// console.time('save');







// console.log(langsFiltered);
// console.log(langsFiltered.length);
































































// console.time ( 'saving' );
// fs.writeFileSync ( DATASET_JSON_PATH, JSON.stringify ( dataset ) );
// console.timeEnd ( 'saving' );

// console.time ( 'loading' );
// const dataset: { lang: string, sentence: string }[] = JSON.parse ( fs.readFileSync ( DATASET_JSON_PATH, 'utf8' ) );
// console.timeEnd ( 'loading' );

// const LANG_ACTIVE = new Set ([ 'deu', 'rus', 'fra', 'eng', 'spa', 'ita', 'bul', 'bre', 'cat', 'ces', 'dan', 'ell', 'est', 'fas', 'fao', 'gle', 'gla', 'heb', 'hrv', 'isl', 'kat', 'ltz', 'lit', 'mkd', 'mon', 'nor', 'npi', 'nld', 'nor', 'pol', 'por', 'ron', 'slk', 'slv', 'srp', 'swe', 'tuk', 'tur' ]);
// const langMap = {
//   'deu': 0,
//   'rus': 1,
//   'fra': 2,
//   'eng': 3,
//   'spa': 4,
//   'ita': 5,
//   'bul': 6,
//   'bre': 7,
//   'cat': 8,
//   'ces': 9,
//   'dan': 10,
//   'ell': 11,
//   'est': 12,
//   'fas': 13,
//   'fao': 14,
//   'gle': 15,
//   'gla': 16,
//   'heb': 17,
//   'hrv': 18,
//   'isl': 19,
//   'kat': 20,
//   'ltz': 21,
//   'lit': 22,
//   'mkd': 23,
//   'mon': 24,
//   'nor': 25,
//   'npi': 26,
//   'nld': 27,
//   'nor': 28,
//   'pol': 29,
//   'por': 30,
//   'ron': 31,
//   'slk': 32,
//   'slv': 33,
//   'srp': 34,
//   'swe': 35,
//   'tuk': 36,
//   'tur': 37
// };

// const datasetFiltered = _.shuffle ( dataset.filter ( databit => LANG_ACTIVE.has ( databit.lang ) ) );
// const datasetTrain = datasetFiltered.slice ( 0, Math.floor ( datasetFiltered.length * TRAINING_PERC ) );
// const datasetTest = datasetFiltered.slice ( Math.floor ( datasetFiltered.length * TRAINING_PERC ) );

// console.log('total:', datasetFiltered.length);
// console.log('train:', datasetTrain.length);
// console.log('test:', datasetTest.length);


// const nn = new NeuralNetwork ({
//   learningRate: 0.02,
//   layers: [
//     {
//       inputs: UNIGRAMS_LENGTH + BIGRAMS_LENGTH + TRIGRAMS_LENGTH,
//       outputs: 512,
//       activation: 'leakyrelu'
//     },
//     {
//       inputs: 512,
//       outputs: LANG_ACTIVE.size,
//       activation: 'softmax'
//     }
//   ]
// });

// /* TRAIN */

// nn.trainLoop ( 1, () => {
//   const batch = _.shuffle ( datasetTrain );
//   for ( let i = 0, l = batch.length; i < l; i++ ) {
//     if ( i % 10000 === 0 ) console.log(i);
//     const data = batch[i];
//     const input = [...data.g1, ...data.g2, ...data.g3];
//     const expected = new Array ( LANG_ACTIVE.size ).fill ( 0 );
//     expected[langMap[data.lang]] = 1;
//     const result = nn.trainSingle ( input, expected );
//     // if(!Array.from(result[2][3].buffer).every(x=>!Number.isNaN(x))) debugger;
//     // const actual = result.indexOf ( Math.max ( ...result ) );
//   }
// });

// /* TEST */

// let pass = 0;
// let fail = 0;

// for ( let i = 0, l = datasetTest.length; i < l; i++ ) {
//   const data = datasetTest[i];
//   const input = [...data.g1, ...data.g2, ...data.g3];
//   debugger;
//   const output = nn.infer ( input );
//   // const expected = new Array ( LANG_ACTIVE.size ).fill ( 0 );
//   // expected[langMap[data.lang]] = 1;
//   const expected = langMap[data.lang];
//   const actual = output.indexOf ( Math.max ( ...output ) );
//   if ( expected === actual ) {
//     pass += 1;
//   } else {
//     fail += 1;
//   }
// }

// console.log ( 'Pass:', pass );
// console.log ( 'Fail:', fail );
// console.log ( 'Success:', ( pass * 100 ) / ( pass + fail ) );






// console.log(nn.exportAsFunction ().toString ().length);
// fs.writeFileSync('nn.js', nn.exportAsFunction ().toString ());


