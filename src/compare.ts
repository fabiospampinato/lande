
/* IMPORT */

import _ from 'lodash';
import {loadModule} from 'cld3-asm';
import {franc as franc} from 'franc';
// import {franc as francAll} from 'franc-all';
import {franc as francMin} from 'franc-min';
import fs from 'node:fs';
import colors from 'tiny-colors';
import lande from '../standalone/t50.js';
import {DATASET_PATH, DATASET_TRAIN_LIMIT, DATASET_TEST_LENGTH_MIN, DATASET_TEST_LIMIT, CONFIGS} from './constants';
import DB from './db';
import {forEachLine} from './utils';
import type {DatasetTest, DatumTest} from './types';

/* HELPERS */

const getDataset = ( langs: string[] ): DatasetTest => {

  const dataset: DatasetTest = {};
  const langsSet = new Set ( langs );
  const csv = fs.readFileSync ( DATASET_PATH );

  forEachLine ( csv, line => {

    const parts = line.split ( '\t' );

    if ( parts.length !== 3 ) return; // Something went wrong with this line

    const lang = parts[1];
    const sentence = parts[2];

    if ( !langsSet.has ( lang ) ) return;

    if ( dataset[lang]?.length >= DATASET_TEST_LIMIT + DATASET_TRAIN_LIMIT ) return; // Already parsed enough sentences

    if ( sentence.length <= DATASET_TEST_LENGTH_MIN ) return;

    const datum: DatumTest = { lang, sentence };

    dataset[lang] ||= [];
    dataset[lang].push ( datum );

  });

  langs.forEach ( lang => {

    dataset[lang] = dataset[lang].slice ( - DATASET_TEST_LIMIT );

  });

  return dataset;

};

/* MAIN */

const dataset = getDataset ( CONFIGS[0].langs );
const results: Record<string, Record<'cld3' | 'franc' | 'francAll' | 'francMin' | 'lande', { pass: number, fail: number, total: number }>> = {};
const bcp2iso = Object.fromEntries ( Object.values ( DB ).map ( lang => [lang.bcp47, lang.iso6393] ) );

const cldFactory = await loadModule ();
const cld = cldFactory.create ( 0, 1_000_000 );

CONFIGS[0].langs.forEach ( lang => {

  const result = results[lang] = {
    cld3: {
      pass: 0,
      fail: 0,
      total: 0
    },
    franc: {
      pass: 0,
      fail: 0,
      total: 0
    },
    francAll: {
      pass: 0,
      fail: 0,
      total: 0
    },
    francMin: {
      pass: 0,
      fail: 0,
      total: 0
    },
    lande: {
      pass: 0,
      fail: 0,
      total: 0
    }
  };

  dataset[lang]?.forEach ( datum => {

    const resultCld3 = bcp2iso[cld.findLanguage ( datum.sentence ).language];
    const resultFranc = franc ( datum.sentence );
    // const resultFrancAll = francAll ( datum.sentence );
    const resultFrancMin = francMin ( datum.sentence );
    const resultLande = lande ( datum.sentence )[0][0];

    result.cld3.total += 1;
    result.franc.total += 1;
    result.francAll.total += 1;
    result.francMin.total += 1;
    result.lande.total += 1;

    if ( resultCld3 === datum.lang ) {
      result.cld3.pass += 1;
    } else {
      result.cld3.fail += 1;
    }

    if ( resultFranc === datum.lang ) {
      result.franc.pass += 1;
    } else {
      result.franc.fail += 1;
    }

    // if ( resultFrancAll === datum.lang ) {
    //   result.francAll.pass += 1;
    // } else {
    //   result.francAll.fail += 1;
    // }

    if ( resultFrancMin === datum.lang ) {
      result.francMin.pass += 1;
    } else {
      result.francMin.fail += 1;
    }

    if ( resultLande === datum.lang ) {
      result.lande.pass += 1;
    } else {
      result.lande.fail += 1;
    }

  });

});

CONFIGS[0].langs.forEach ( lang => {

  const result = results[lang];
  const resultCld3 = result.cld3.pass / result.cld3.total;
  const resultFranc = result.franc.pass / result.franc.total;
  const resultFrancAll = result.francAll.pass / result.francAll.total;
  const resultFrancMin = result.francMin.pass / result.francMin.total;
  const resultLande = result.lande.pass / result.lande.total;
  const resultMin = Math.min ( resultCld3, resultFranc, resultFrancAll, resultFrancMin, resultLande );
  const resultMax = Math.max ( resultCld3, resultFranc, resultFrancAll, resultFrancMin, resultLande );
  const colorize = ( nr: number ) => ( nr === resultMin ? colors.red ( String ( nr ) ) : ( ( nr === resultMax ) ? colors.green ( String ( nr ) ) : colors.yellow ( String ( nr ) ) ) );

  console.log ( `- ${lang}` );
  console.log ( `  - cld3: ${colorize ( resultCld3 )}` );
  console.log ( `  - franc: ${colorize ( resultFranc )}` );
  console.log ( `  - francAll: ${colorize ( resultFrancAll )}` );
  console.log ( `  - francMin: ${colorize ( resultFrancMin )}` );
  console.log ( `  - lande: ${colorize ( resultLande )}` );

});

const totalResultCld3 = _.sum ( Object.values ( results ).map ( result => result.cld3.pass ) ) / _.sum ( Object.values ( results ).map ( result => result.cld3.total ) );
const totalResultFranc = _.sum ( Object.values ( results ).map ( result => result.franc.pass ) ) / _.sum ( Object.values ( results ).map ( result => result.franc.total ) );
const totalResultFrancAll = _.sum ( Object.values ( results ).map ( result => result.francAll.pass ) ) / _.sum ( Object.values ( results ).map ( result => result.francAll.total ) );
const totalResultFrancMin = _.sum ( Object.values ( results ).map ( result => result.francMin.pass ) ) / _.sum ( Object.values ( results ).map ( result => result.francMin.total ) );
const totalResultLande = _.sum ( Object.values ( results ).map ( result => result.lande.pass ) ) / _.sum ( Object.values ( results ).map ( result => result.lande.total ) );

console.log ( '- average' );
console.log ( `  - cld3: ${totalResultCld3}` );
console.log ( `  - franc: ${totalResultFranc}` );
console.log ( `  - francAll: ${totalResultFrancAll}` );
console.log ( `  - francMin: ${totalResultFrancMin}` );
console.log ( `  - lande: ${totalResultLande}` );
