
/* IMPORT */

import {loadModule} from 'cld3-asm';
import {franc as franc} from 'franc';
import {franc as francAll} from 'franc-all';
import {franc as francMin} from 'franc-min';
import fs from 'node:fs';
import lande from '../standalone/t50.js';
import {DATASET_PATH, DATASET_BENCHMARK_LENGTH_MIN, DATASET_BENCHMARK_LIMIT, CONFIGS} from './constants';
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

    if ( dataset[lang]?.length >= DATASET_BENCHMARK_LIMIT ) return; // Already parsed enough sentences

    if ( sentence.length <= DATASET_BENCHMARK_LENGTH_MIN ) return;

    const datum: DatumTest = { lang, sentence };

    dataset[lang] ||= [];
    dataset[lang].push ( datum );

  });

  return dataset;

};

/* MAIN */

const cldFactory = await loadModule ();
const cld = cldFactory.create ( 0, 1_000_000 );
const dataset = getDataset ( CONFIGS[0].langs );

console.time ( 'cld3' );
Object.values ( dataset ).forEach ( data => {
  data.forEach ( datum => {
    cld.findLanguage ( datum.sentence );
  });
});
console.timeEnd ( 'cld3' );

console.time ( 'franc' );
Object.values ( dataset ).forEach ( data => {
  data.forEach ( datum => {
    franc ( datum.sentence );
  });
});
console.timeEnd ( 'franc' );

console.time ( 'francAll' );
Object.values ( dataset ).forEach ( data => {
  data.forEach ( datum => {
    francAll ( datum.sentence );
  });
});
console.timeEnd ( 'francAll' );

console.time ( 'francMin' );
Object.values ( dataset ).forEach ( data => {
  data.forEach ( datum => {
    francMin ( datum.sentence );
  });
});
console.timeEnd ( 'francMin' );

console.time ( 'lande' );
Object.values ( dataset ).forEach ( data => {
  data.forEach ( datum => {
    lande ( datum.sentence );
  });
});
console.timeEnd ( 'lande' );
