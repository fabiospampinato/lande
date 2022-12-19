
/* IMPORT */

import path from 'node:path';
import type {Config} from './types';

/* MAIN */

const DATASET_PATH = path.join ( process.cwd (), 'resources', 'dataset.csv' );

const DATASET_BENCHMARK_LIMIT = 1000;

const DATASET_TRAIN_LIMIT = 10000;

const DATASET_TEST_LIMIT = 30000;

const DATASET_TRAIN_PERC = 0.8;

const CONFIGS: Config[] = [
  {
    id: 't50',
    langs: ['eng', 'deu', 'fra', 'ita', 'rus', 'tur', 'fin', 'heb', 'hun', 'jpn', 'nld', 'pol', 'por', 'spa', 'ukr', 'ces', 'cmn', 'dan', 'lit', 'mar', 'mkd', 'swe', 'ara', 'ell', 'pes', 'ron', 'srp', 'bel', 'bul', 'ckb', 'hau', 'hin', 'ind', 'isl', 'kor', 'nob', 'slk', 'tgl', 'vie', 'aze', 'ben', 'cat', 'eus', 'hrv', 'hye', 'kat', 'run', 'afr', 'est', 'kaz'].sort (),
    network: {
      batchSize: 1,
      learningRate: 0.002,
      epochs: 3,
      unigrams: 85,
      bigrams: 160,
      trigrams: 160,
      hidden: 85
    }
  }
];

/* EXPORT */

export {DATASET_PATH, DATASET_BENCHMARK_LIMIT, DATASET_TRAIN_LIMIT, DATASET_TEST_LIMIT, DATASET_TRAIN_PERC,CONFIGS};
