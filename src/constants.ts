
/* IMPORT */

import path from 'node:path';
import process from 'node:process';
import type {Config} from './types';

/* MAIN */

const DATASET_PATH = path.join ( process.cwd (), 'resources', 'dataset.csv' );

const DATASET_BENCHMARK_LENGTH_MIN = 35;
const DATASET_BENCHMARK_LIMIT = 1000;

const DATASET_TRAIN_LENGTH_MIN = 40;
const DATASET_TRAIN_LIMIT = 9000;

const DATASET_TEST_LENGTH_MIN = 35;
const DATASET_TEST_LIMIT = 30000;

const DATASET_TRAIN_PERC = 0.8;

const CONFIGS: Config[] = [
  {
    id: 't50',
    langs: ['eng', 'deu', 'fra', 'ita', 'rus', 'tur', 'fin', 'heb', 'hun', 'jpn', 'nld', 'pol', 'por', 'spa', 'ukr', 'ces', 'cmn', 'dan', 'lit', 'mar', 'mkd', 'swe', 'ara', 'ell', 'pes', 'ron', 'srp', 'bel', 'bul', 'ckb', 'hau', 'hin', 'ind', 'isl', 'kor', 'nob', 'slk', 'tgl', 'vie', 'aze', 'ben', 'cat', 'eus', 'hrv', 'hye', 'kat', 'run', 'afr', 'est', 'kaz'].sort (),
    network: {
      batchSize: 100,
      epochs: 4,
      unigrams: 120,
      bigrams: 175,
      trigrams: 175,
      quadgrams: 150,
      hidden: 120
    }
  }
];

/* EXPORT */

export {DATASET_PATH, DATASET_BENCHMARK_LENGTH_MIN, DATASET_BENCHMARK_LIMIT, DATASET_TRAIN_LENGTH_MIN, DATASET_TRAIN_LIMIT, DATASET_TEST_LENGTH_MIN, DATASET_TEST_LIMIT, DATASET_TRAIN_PERC,CONFIGS};
