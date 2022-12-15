
/* IMPORT */

import {Tensor} from 'toygrad';
import type {NeuralNetwork} from 'toygrad';
import type {Ngram, Result} from './types';

/* MAIN */

const argmax = ( arrLike: ArrayLike<number> ): number => {

  const arr = Array.from ( arrLike );

  return arr.indexOf ( Math.max ( ...arr ) );

};

const forEachLine = ( buffer: Buffer, callback: ( line: string ) => void ): void => {

  let start = 0;

  while ( true ) {

    const end = buffer.indexOf ( '\n', start );

    if ( end <= start ) break;

    const line = buffer.subarray ( start, end ).toString ();

    callback ( line );

    start = end + 1;

  }

};

const getNgrams = ( str: string, length: number ): Record<string, Ngram> => {

  let ngrams: Record<string, number> = {};
  let total = 0;

  for ( let i = 0, l = str.length - length; i <= l; i++ ) {

    const value = str.slice ( i, i + length );

    ngrams[value] ||= 0;
    ngrams[value] += 1;
    total += 1;

  }

  const values = Object.keys ( ngrams );
  const valuesSorted = values.sort ( ( a, b ) => ngrams[b] - ngrams[a] );
  const valuesDetailed = valuesSorted.map ( value => ({ value, count: ngrams[value], frequency: ngrams[value] / total }) );
  const valuesDetailedTable = Object.fromEntries ( valuesDetailed.map ( ngram => [ngram.value, ngram] ) );

  return valuesDetailedTable;

};

const getNormalized = ( str: string ): string => {

  const ignoreRe = /[^\p{L}\p{M}\s]/gu;
  const whitespaceRe = /\s{2,}/g;

  return ` ${str.replace ( ignoreRe, '' ).replace ( whitespaceRe, ' ' ).toLowerCase ().trim ()} `;

};

const getTopKeys = ( obj: Record<string, number> ): string[] => {

  const keys = Object.keys ( obj );
  const keysSorted = keys.sort ( ( a, b ) => obj[b] - obj[a] );

  return keysSorted;

};

const infer = ( input: string, langs: string[], ngrams: Record<'unigrams' | 'bigrams' | 'trigrams', string[]>, nn1: NeuralNetwork, nn2: NeuralNetwork, nn3: NeuralNetwork, nnX: NeuralNetwork ): Result => {

  const inputNorm = getNormalized ( input );
  const unigrams = getNgrams ( inputNorm, 1 );
  const bigrams = getNgrams ( inputNorm, 2 );
  const trigrams = getNgrams ( inputNorm, 3 );
  const input1 = new Tensor ( 1, 1, ngrams.unigrams.length, new Float32Array ( ngrams.unigrams.map ( value => unigrams[value]?.frequency || 0 ) ) );
  const input2 = new Tensor ( 1, 1, ngrams.bigrams.length, new Float32Array ( ngrams.bigrams.map ( value => bigrams[value]?.frequency || 0 ) ) );
  const input3 = new Tensor ( 1, 1, ngrams.trigrams.length, new Float32Array ( ngrams.trigrams.map ( value => trigrams[value]?.frequency || 0 ) ) );
  const output1 = nn1.forward ( input1, false ).w;
  const output2 = nn2.forward ( input2, false ).w;
  const output3 = nn3.forward ( input3, false ).w;
  const inputX = new Tensor ( 1, 1, langs.length * 3, new Float32Array ([ ...Array.from ( output1 ), ...Array.from ( output2 ), ...Array.from ( output3 ) ]) );
  const outputX = nnX.forward ( inputX, false ).w;
  const result = Array.from ( outputX ).map<[string, number]> ( ( probability, index ) => [langs[index], probability] );
  const resultSorted = result.sort ( ( a, b ) => b[1] - a[1] );

  return resultSorted;

};

const padEnd = <T> ( arr: T[], length: number, padder: T ): T[] => {

  if ( arr.length >= length ) return arr;

  const padding = new Array ( length - arr.length ).fill ( padder );
  const padded = arr.concat ( padding );

  return padded;

};

/* EXPORT */

export {argmax, forEachLine, getNgrams, getNormalized, getTopKeys, infer, padEnd};
