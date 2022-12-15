
/* IMPORT */

import type {Tensor} from 'toygrad';

/* MAIN */

type DatasetTest = {
  [lang: string]: DatumTest[]
};

type DatumTest = {
  lang: string,
  sentence: string
};

type DatasetRaw = {
  [lang: string]: DatumRaw[]
};

type DatumRaw = {
  lang: string,
  sentence: string,
  unigrams: Record<string, Ngram>,
  bigrams: Record<string, Ngram>,
  trigrams: Record<string, Ngram>
};

type Dataset = {
  train: Datum[],
  test: Datum[]
};

type Datum = {
  lang: string,
  sentence: string,
  unigramsInput: Tensor,
  bigramsInput: Tensor,
  trigramsInput: Tensor,
  output: number
};

type Ngram = {
  value: string,
  count: number,
  frequency: number
};

type Config = {
  id: string,
  langs: string[],
  network: {
    batchSize: number,
    epochs: number,
    unigrams: {
      input: number,
      hidden: number,
      output: number
    },
    bigrams: {
      input: number,
      hidden: number,
      output: number
    },
    trigrams: {
      input: number,
      hidden: number,
      output: number
    },
    omnigrams: {
      input: number,
      hidden: number,
      output: number
    }
  }
};

type Result = [lang: string, probability: number][];

type Stats = {
  lang: string,
  name?: string,
  sentences: number
}[];

/* EXPORT */

export type {Dataset, Datum, DatasetRaw, DatumRaw, DatasetTest, DatumTest};
export type {Ngram, Config, Result, Stats};
