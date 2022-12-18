
/* IMPORT */

import _ from 'lodash';
import fs from 'node:fs';
import path from 'node:path';
import {NeuralNetwork, Tensor, Trainers} from 'toygrad';
import {DATASET_PATH, DATASET_TRAIN_LIMIT, DATASET_TRAIN_PERC} from './constants';
import {DUMMY_BUFFER} from './constants';
import {CONFIGS} from './constants';
import {argmax, forEachLine, getNormalized, getNgrams, getTopKeys, padEnd} from './utils';
import type {DatasetRaw, DatumRaw, Dataset, Datum, Config, Result} from './types';

/* HELPERS */

const getConfigsLangs = ( configs: Config[] ): string[] => {

  return _.uniq ( configs.flatMap ( config => config.langs ) );

};

const getDatasetRaw = ( langs: string[] ): DatasetRaw => {

  const datasetRaw: DatasetRaw = {};
  const langsSet = new Set ( langs );
  const csv = fs.readFileSync ( DATASET_PATH );

  forEachLine ( csv, line => {

    const parts = line.split ( '\t' );

    if ( parts.length !== 3 ) return; // Something went wrong with this line

    const lang = parts[1];
    const sentence = parts[2];

    if ( !langsSet.has ( lang ) ) return;

    if ( datasetRaw[lang]?.length >= DATASET_TRAIN_LIMIT ) return; // Already parsed enough sentences

    const sentenceNorm = getNormalized ( sentence );
    const unigrams = getNgrams ( sentenceNorm, 1 );
    const bigrams = getNgrams ( sentenceNorm, 2 );
    const trigrams = getNgrams ( sentenceNorm, 3 );

    const datumRaw: DatumRaw = { lang, sentence, unigrams, bigrams, trigrams };

    datasetRaw[lang] ||= [];
    datasetRaw[lang].push ( datumRaw );

  });

  return datasetRaw;

};

const getDatasetRawTopNgrams = ( dataset: DatasetRaw, config: Config, type: 'unigrams' | 'bigrams' | 'trigrams' ): string[] => {

  const ngrams: Record<string, Record<string, number>> = {};

  config.langs.forEach ( lang => {

    dataset[lang]?.forEach ( datum => {

      Object.values ( datum[type] ).forEach ( ngram => {

        ngrams[lang] ||= {};
        ngrams[lang][ngram.value] ||= 0;
        ngrams[lang][ngram.value] += ngram.count;

      });

    });

  });

  const valuesByLangs = Object.values ( ngrams ).map ( getTopKeys );
  const values: string[] = [];
  const valuesSet = new Set<string> ();
  const valuesLimit = config.network[type].input;

  while ( values.length < valuesLimit ) {
    for ( const valuesByLang of valuesByLangs ) {
      while ( true ) {
        const value = valuesByLang.shift ();
        if ( !value ) break;
        if ( valuesSet.has ( value ) ) continue;
        values.push ( value );
        valuesSet.add ( value );
        break;
      }
    }
  }

  const valuesLimited = padEnd ( values.slice ( 0, valuesLimit ), valuesLimit, '' );

  return valuesLimited;

};

const getDataset = ( dataset: DatasetRaw, config: Config ): Dataset => {

  const unigrams = getDatasetRawTopNgrams ( dataset, config, 'unigrams' );
  const bigrams = getDatasetRawTopNgrams ( dataset, config, 'bigrams' );
  const trigrams = getDatasetRawTopNgrams ( dataset, config, 'trigrams' );

  let train: Datum[] = [];
  let test: Datum[] = [];

  config.langs.forEach ( lang => {

    const data: Datum[] = [];

    dataset[lang]?.forEach ( datumRaw => {

      const unigramsInput = new Tensor ( 1, 1, config.network.unigrams.input, new Float32Array ( unigrams.map ( value => datumRaw.unigrams[value]?.frequency || 0 ) ), DUMMY_BUFFER );
      const bigramsInput = new Tensor ( 1, 1, config.network.bigrams.input, new Float32Array ( bigrams.map ( value => datumRaw.bigrams[value]?.frequency || 0 ) ), DUMMY_BUFFER );
      const trigramsInput = new Tensor ( 1, 1, config.network.trigrams.input, new Float32Array ( trigrams.map ( value => datumRaw.trigrams[value]?.frequency || 0 ) ), DUMMY_BUFFER );
      const output = config.langs.indexOf ( datumRaw.lang );

      const datum: Datum = { lang, sentence: datumRaw.sentence, unigramsInput, bigramsInput, trigramsInput, output };

      data.push ( datum );

    });

    const trainLength = Math.floor ( data.length * DATASET_TRAIN_PERC );

    train = train.concat ( data.slice ( 0, trainLength ) );
    test = test.concat ( data.slice ( trainLength ) );

  });

  return { train, test };

};

/* MAIN */

const langs = getConfigsLangs ( CONFIGS );
const datasetRaw = getDatasetRaw ( langs );

for ( const config of CONFIGS ) {

  console.log ( `=== ${config.id} ===` );

  const dataset = getDataset ( datasetRaw, config );

  /* NN UNIGRAMS */

  const nn1 = new NeuralNetwork ({
    layers: [
      { type: 'input', sx: 1, sy: 1, sz: config.network.unigrams.input },
      { type: 'dense', filters: config.network.unigrams.hidden, bias: 0.1 },
      { type: 'relu' },
      { type: 'dense', filters: config.network.unigrams.output },
      { type: 'softmax' }
    ]
  });

  const trainer1 = new Trainers.Adadelta ( nn1, {
    batchSize: config.network.batchSize
  });

  for ( let epoch = 0; epoch < config.network.epochs; epoch++ ) {
    const batch = _.shuffle ( dataset.train );
    for ( let i = 0, l = batch.length; i < l; i++ ) {
      if ( i % 10000 === 0 ) console.log ( `[NN1] Epoch ${epoch + 1}/${config.network.epochs} - ${i}/${batch.length}` );
      trainer1.train ( batch[i].unigramsInput, batch[i].output );
    }
  }

  let pass1 = 0;
  let fail1 = 0;

  for ( let i = 0; i < dataset.test.length; i++ ) {
    const sample = dataset.test[i];
    const expected = sample.output;
    const actual = argmax ( nn1.forward ( sample.unigramsInput, false ).w );
    if ( expected === actual ) {
      pass1 += 1;
    } else {
      fail1 += 1;
    }
  }

  console.log ( 'Pass:', pass1 );
  console.log ( 'Fail:', fail1 );
  console.log ( 'Accuracy:', ( pass1 * 100 ) / ( pass1 + fail1 ) );

  /* NN BIGRAMS */

  const nn2 = new NeuralNetwork ({
    layers: [
      { type: 'input', sx: 1, sy: 1, sz: config.network.bigrams.input },
      { type: 'dense', filters: config.network.bigrams.hidden, bias: 0.1 },
      { type: 'relu' },
      { type: 'dense', filters: config.network.bigrams.output },
      { type: 'softmax' }
    ]
  });

  const trainer2 = new Trainers.Adadelta ( nn2, {
    batchSize: config.network.batchSize
  });

  for ( let epoch = 0; epoch < config.network.epochs; epoch++ ) {
    const batch = _.shuffle ( dataset.train );
    for ( let i = 0, l = batch.length; i < l; i++ ) {
      if ( i % 10000 === 0 ) console.log ( `[NN2] Epoch ${epoch + 1}/${config.network.epochs} - ${i}/${batch.length}` );
      trainer2.train ( batch[i].bigramsInput, batch[i].output );
    }
  }

  let pass2 = 0;
  let fail2 = 0;

  for ( let i = 0; i < dataset.test.length; i++ ) {
    const sample = dataset.test[i];
    const expected = sample.output;
    const actual = argmax ( nn2.forward ( sample.bigramsInput, false ).w );
    if ( expected === actual ) {
      pass2 += 1;
    } else {
      fail2 += 1;
    }
  }

  console.log ( 'Pass:', pass2 );
  console.log ( 'Fail:', fail2 );
  console.log ( 'Accuracy:', ( pass2 * 100 ) / ( pass2 + fail2 ) );

  /* NN TRIGRAMS */

  const nn3 = new NeuralNetwork ({
    layers: [
      { type: 'input', sx: 1, sy: 1, sz: config.network.trigrams.input },
      { type: 'dense', filters: config.network.trigrams.hidden, bias: 0.1 },
      { type: 'relu' },
      { type: 'dense', filters: config.network.trigrams.output },
      { type: 'softmax' }
    ]
  });

  const trainer3 = new Trainers.Adadelta ( nn3, {
    batchSize: config.network.batchSize
  });

  for ( let epoch = 0; epoch < config.network.epochs; epoch++ ) {
    const batch = _.shuffle ( dataset.train );
    for ( let i = 0, l = batch.length; i < l; i++ ) {
      if ( i % 10000 === 0 ) console.log ( `[NN3] Epoch ${epoch + 1}/${config.network.epochs} - ${i}/${batch.length}` );
      trainer3.train ( batch[i].trigramsInput, batch[i].output );
    }
  }

  let pass3 = 0;
  let fail3 = 0;

  for ( let i = 0; i < dataset.test.length; i++ ) {
    const sample = dataset.test[i];
    const expected = sample.output;
    const actual = argmax ( nn3.forward ( sample.trigramsInput, false ).w );
    if ( expected === actual ) {
      pass3 += 1;
    } else {
      fail3 += 1;
    }
  }

  console.log ( 'Pass:', pass3 );
  console.log ( 'Fail:', fail3 );
  console.log ( 'Accuracy:', ( pass3 * 100 ) / ( pass3 + fail3 ) );

  /* NN OMNIGRAMS */

  const nnX = new NeuralNetwork ({
    layers: [
      { type: 'input', sx: 1, sy: 1, sz: config.network.omnigrams.input },
      { type: 'dense', filters: config.network.omnigrams.hidden, bias: 0.1 },
      { type: 'relu' },
      { type: 'dense', filters: config.network.omnigrams.output },
      { type: 'softmax' }
    ]
  });

  const trainerX = new Trainers.Adadelta ( nnX, {
    batchSize: config.network.batchSize
  });

  for ( let epoch = 0; epoch < config.network.epochs; epoch++ ) {
    const batch = _.shuffle ( dataset.train );
    for ( let i = 0, l = batch.length; i < l; i++ ) {
      if ( i % 10000 === 0 ) console.log ( `[NNX] Epoch ${epoch + 1}/${config.network.epochs} - ${i}/${batch.length}` );
      const unigramOutput = nn1.forward ( batch[i].unigramsInput, false ).w;
      const bigramOutput = nn2.forward ( batch[i].bigramsInput, false ).w;
      const trigramOutput = nn3.forward ( batch[i].trigramsInput, false ).w;
      const ngramsOutput = new Float32Array ([ ...Array.from ( unigramOutput ), ...Array.from ( bigramOutput ), ...Array.from ( trigramOutput ) ]);
      const input = new Tensor ( 1, 1, config.network.omnigrams.input, ngramsOutput );
      trainerX.train ( input, batch[i].output );
    }
  }

  /* NN SAVING */

  const langs = config.langs;
  const langsPath = path.join ( process.cwd (), 'standalone', `${config.id}-langs.js` );
  const langsModule = `export default ${JSON.stringify ( langs )};`;

  const unigrams = getDatasetRawTopNgrams ( datasetRaw, config, 'unigrams' );
  const bigrams = getDatasetRawTopNgrams ( datasetRaw, config, 'bigrams' );
  const trigrams = getDatasetRawTopNgrams ( datasetRaw, config, 'trigrams' );
  const ngrams = { unigrams, bigrams, trigrams };
  const ngramsPath = path.join ( process.cwd (), 'standalone', `${config.id}-ngrams.js` );
  const ngramsModule = `export default ${JSON.stringify ( ngrams )};`;

  const nn1path = path.join ( process.cwd (), 'standalone', `${config.id}-nn1.js` );
  const nn1options = nn1.getAsOptions ( 'f16' );
  const nn1module = `export default ${JSON.stringify ( nn1options )};`;

  const nn2path = path.join ( process.cwd (), 'standalone', `${config.id}-nn2.js` );
  const nn2options = nn2.getAsOptions ( 'f16' );
  const nn2module = `export default ${JSON.stringify ( nn2options )};`;

  const nn3path = path.join ( process.cwd (), 'standalone', `${config.id}-nn3.js` );
  const nn3options = nn3.getAsOptions ( 'f16' );
  const nn3module = `export default ${JSON.stringify ( nn3options )};`;

  const nnXpath = path.join ( process.cwd (), 'standalone', `${config.id}-nnX.js` );
  const nnXoptions = nnX.getAsOptions ( 'f16' );
  const nnXmodule = `export default ${JSON.stringify ( nnXoptions )};`;

  fs.writeFileSync ( langsPath, langsModule );
  fs.writeFileSync ( ngramsPath, ngramsModule );
  fs.writeFileSync ( nn1path, nn1module );
  fs.writeFileSync ( nn2path, nn2module );
  fs.writeFileSync ( nn3path, nn3module );
  fs.writeFileSync ( nnXpath, nnXmodule );

  /* TESTING */

  const {default: lande} = await import ( `../standalone/${config.id}.js` );

  let pass = 0;
  let fail = 0;
  let loss = 0;

  for ( let i = 0; i < dataset.test.length; i++ ) {

    const datum = dataset.test[i];
    const result: Result = lande ( datum.sentence );

    const expectedLang = datum.lang;
    const actualLang = result[0][0];

    const expectedProbability = 1;
    const actualProbability = result.find ( result => result[0] === expectedLang )?.[1] || 0;

    loss += ( expectedProbability - actualProbability ) / dataset.test.length;

    if ( expectedLang === actualLang ) {
      pass += 1;
    } else {
      fail += 1;
    }

  }

  console.log ( 'Pass:', pass );
  console.log ( 'Fail:', fail );
  console.log ( 'Loss:', loss );
  console.log ( 'Accuracy:', ( pass * 100 ) / ( pass + fail ) );

  /* LOGGING */

  const weightsUnigrams = ( config.network.unigrams.input * config.network.unigrams.hidden ) + config.network.unigrams.hidden + ( config.network.unigrams.hidden * config.network.unigrams.output );
  const weightsBigrams = ( config.network.bigrams.input * config.network.bigrams.hidden ) + config.network.bigrams.hidden + ( config.network.bigrams.hidden * config.network.bigrams.output );
  const weightsTrigrams = ( config.network.trigrams.input * config.network.trigrams.hidden ) + config.network.trigrams.hidden + ( config.network.trigrams.hidden * config.network.trigrams.output );
  const weightsOmnigrams = ( config.network.omnigrams.input * config.network.omnigrams.hidden ) + config.network.omnigrams.hidden + ( config.network.omnigrams.hidden * config.network.omnigrams.output );
  const weightsTotal = weightsUnigrams + weightsBigrams + weightsTrigrams + weightsOmnigrams;

  console.log ( '-----' );
  console.log ( 'Weights 1N:', weightsUnigrams );
  console.log ( 'Weights 2N:', weightsBigrams );
  console.log ( 'Weights 3N:', weightsTrigrams );
  console.log ( 'Weights XN:', weightsOmnigrams );
  console.log ( 'Weights:', weightsTotal );

}
