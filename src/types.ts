
/* IMPORT */

import type {Tensor} from 'toygrad';

/* DATASET */

type Dataset = {
  train: Datum[],
  test: Datum[]
};

type Datum = {
  lang: string,
  sentence: string,
  input: Tensor,
  output: number
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

type DatasetTest = {
  [lang: string]: DatumTest[]
};

type DatumTest = {
  lang: string,
  sentence: string
};

/* OTHERS */

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
    learningRate: number,
    epochs: number,
    unigrams: number,
    bigrams: number,
    trigrams: number,
    hidden: number
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
