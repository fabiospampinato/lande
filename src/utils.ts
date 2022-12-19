
/* IMPORT */

import {Tensor} from 'toygrad';
import type {NeuralNetwork} from 'toygrad';
import type {Ngram, Result} from './types';

/* MAIN */

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

  let ngrams: Record<string, Ngram> = {};
  let total = 0;

  for ( let i = 0, l = str.length - length; i <= l; i++ ) {

    const value = str.slice ( i, i + length );

    ngrams[value] ||= { value, count: 0, frequency: 0 };
    ngrams[value].count += 1;
    total += 1;

  }

  for ( let value in ngrams ) {

    ngrams[value].frequency = ngrams[value].count / total;

  }

  return ngrams;

};

const getNormalized = ( str: string ): string => {

  const hyphenRe = /-+/g;
  const ignoreRe = /[^\p{L}\p{M}\s]/gu;
  const whitespaceRe = /\s{2,}/g;

  return ` ${str.replace ( hyphenRe, ' ' ).replace ( ignoreRe, '' ).replace ( whitespaceRe, ' ' ).toLowerCase ().trim ()} `;

};

const getTopKeys = ( obj: Record<string, number> ): string[] => {

  const keys = Object.keys ( obj );
  const keysSorted = keys.sort ( ( a, b ) => obj[b] - obj[a] );

  return keysSorted;

};

const infer = ( text: string, langs: string[], ngrams: Record<'unigrams' | 'bigrams' | 'trigrams' | 'quadgrams', string[]>, nn: NeuralNetwork ): Result => {

  const textNorm = getNormalized ( text );
  const unigrams = getNgrams ( textNorm, 1 );
  const bigrams = getNgrams ( textNorm, 2 );
  const trigrams = getNgrams ( textNorm, 3 );
  const quadgrams = getNgrams ( textNorm, 4 );
  const inputUnigrams = ngrams.unigrams.map ( value => unigrams[value]?.frequency || 0 );
  const inputBigrams = ngrams.bigrams.map ( value => bigrams[value]?.frequency || 0 );
  const inputTrigrams = ngrams.trigrams.map ( value => trigrams[value]?.frequency || 0 );
  const inputQuadgrams = ngrams.quadgrams.map ( value => quadgrams[value]?.frequency || 0 );
  const inputNgrams = [...inputUnigrams, ...inputBigrams, ...inputTrigrams, ...inputQuadgrams];
  const input = new Tensor ( 1, 1, inputNgrams.length, new Float32Array ( inputNgrams ) );
  const output = nn.forward ( input, false ).w;
  const result = Array.from ( output ).map<[string, number]> ( ( probability, index ) => [langs[index], probability] );
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

export {forEachLine, getNgrams, getNormalized, getTopKeys, infer, padEnd};
