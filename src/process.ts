
/* IMPORT */

import _ from 'lodash';
import fs from 'node:fs';
import path from 'node:path';
import {NeuralNetwork, Tensor, Trainers} from 'toygrad';
import {DATASET_PATH, DATASET_TRAIN_LIMIT, DATASET_TRAIN_PERC, CONFIGS} from './constants';
import {forEachLine, getNormalized, getNgrams, getTopKeys, padEnd} from './utils';
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
  const valuesLimit = config.network[type];

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

      const inputUnigrams = unigrams.map ( value => datumRaw.unigrams[value]?.frequency || 0 );
      const inputBigrams = bigrams.map ( value => datumRaw.bigrams[value]?.frequency || 0 );
      const inputTrigrams = trigrams.map ( value => datumRaw.trigrams[value]?.frequency || 0 );
      const inputNgrams = [...inputUnigrams, ...inputBigrams, ...inputTrigrams];
      const input = new Tensor ( 1, 1, inputNgrams.length, new Float32Array ( inputNgrams ) );
      const output = config.langs.indexOf ( datumRaw.lang );

      const datum: Datum = { lang, sentence: datumRaw.sentence, input, output };

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

  /* TRAINING */

  const nn = new NeuralNetwork ({
    layers: [
      { type: 'input', sx: 1, sy: 1, sz: config.network.unigrams + config.network.bigrams + config.network.trigrams },
      { type: 'dense', filters: config.network.hidden, bias: 0.1 },
      { type: 'relu' },
      { type: 'dense', filters: config.langs.length },
      { type: 'softmax' }
    ]
  });

  const trainer = new Trainers.SGD ( nn, {
    batchSize: config.network.batchSize,
    learningRate: config.network.learningRate
  });

  for ( let epoch = 0; epoch < config.network.epochs; epoch++ ) {
    const batch = _.shuffle ( dataset.train );
    for ( let i = 0, l = batch.length; i < l; i++ ) {
      if ( i % 10000 === 0 ) console.log ( `Epoch ${epoch + 1}/${config.network.epochs} - ${i}/${batch.length}` );
      trainer.train ( batch[i].input, batch[i].output );
    }
  }

  /* SAVING */

  const langs = config.langs;
  const langsPath = path.join ( process.cwd (), 'standalone', `${config.id}-langs.js` );
  const langsModule = `export default ${JSON.stringify ( langs )};`;

  const unigrams = getDatasetRawTopNgrams ( datasetRaw, config, 'unigrams' );
  const bigrams = getDatasetRawTopNgrams ( datasetRaw, config, 'bigrams' );
  const trigrams = getDatasetRawTopNgrams ( datasetRaw, config, 'trigrams' );
  const ngrams = { unigrams, bigrams, trigrams };
  const ngramsPath = path.join ( process.cwd (), 'standalone', `${config.id}-ngrams.js` );
  const ngramsModule = `export default ${JSON.stringify ( ngrams )};`;

  const nnPath = path.join ( process.cwd (), 'standalone', `${config.id}-options.js` );
  const nnOptions = nn.getAsOptions ( 'f8' );
  const nnModule = `export default ${JSON.stringify ( nnOptions )};`;

  fs.writeFileSync ( langsPath, langsModule );
  fs.writeFileSync ( ngramsPath, ngramsModule );
  fs.writeFileSync ( nnPath, nnModule );

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

  console.log ( `=== results ===` );
  console.log ( 'Pass:', pass );
  console.log ( 'Fail:', fail );
  console.log ( 'Loss:', loss );
  console.log ( 'Accuracy:', ( pass * 100 ) / ( pass + fail ) );
  console.log ( 'Weights:', ( ( config.network.unigrams + config.network.bigrams + config.network.trigrams ) * config.network.hidden ) + config.network.hidden + ( ( config.network.hidden * config.langs.length ) + config.langs.length ) );

}
