
/* IMPORT */

import path from 'node:path';
import type {Config} from './types';

/* MAIN */

const DATASET_PATH = path.join ( process.cwd (), 'resources', 'dataset.csv' );

const DATASET_LIMIT = 20000;

const DATASET_TRAIN_PERC = 0.8;

const TATOEBA10_LANGS = ['eng', 'rus', 'ita', 'tur', 'epo', 'ber', 'deu', 'kab', 'fra', 'por'].sort ();

const TATOEBA10_CONFIG: Config = {
  id: 't10',
  langs: TATOEBA10_LANGS,
  network: {
    batchSize: 1,
    epochs: 3,
    unigrams: {
      input: 90,
      hidden: 30,
      output: TATOEBA10_LANGS.length
    },
    bigrams: {
      input: 120,
      hidden: 30,
      output: TATOEBA10_LANGS.length
    },
    trigrams: {
      input: 90,
      hidden: 30,
      output: TATOEBA10_LANGS.length
    },
    omnigrams: {
      input: TATOEBA10_LANGS.length * 3,
      hidden: 30,
      output: TATOEBA10_LANGS.length
    }
  }
};

const CONFIGS = [TATOEBA10_CONFIG];

/* EXPORT */

export {DATASET_PATH, DATASET_LIMIT, DATASET_TRAIN_PERC};
export {TATOEBA10_LANGS, TATOEBA10_CONFIG, CONFIGS};
