
/* IMPORT */

import {hash, padEnd} from './utils';

/* MAIN */

const Ngrams = {

  /* API */

  normalize: ( str: string ): string => {

    const numberRe = /\d/g;
    const punctuationRe = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
    const whitespaceRe = /\s+/g;
    const normalized = str.toLowerCase ().replace ( numberRe, '' ).replace ( punctuationRe, '' );

    return normalized;

  },

  preparse: ( str: string ): string[] => {

    const numberRe = /\d/g;
    const punctuationRe = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
    const whitespaceRe = /\s+/g;
    const normalized = str.toLowerCase ().replace ( numberRe, '' ).replace ( punctuationRe, '' );
    const substrings = normalized.split ( whitespaceRe );

    return substrings;

  },

  get: ( sentence: string, length: number, limit: number = 1000, padded: boolean = false ): [number[], number[]] => {

    let table: Record<string, number> = {};
    let total = 0;

    sentence = Ngrams.normalize ( sentence );

    for ( let i = 0, l = sentence.length - length; i <= l; i++ ) {

      const ngram = sentence.slice ( i, i + length );
      const counter = ( table[ngram] || 0 ) + 1;

      table[ngram] = counter;
      total += 1;

    }

    const entries = Object.entries ( table );
    const entriesByCounters = entries.sort ( ( a, b ) => b[1] - a[1] );
    const entriesByLimit = ( entriesByCounters.length > limit ) ? entriesByCounters.slice ( 0, limit ) : entriesByCounters;
    const entriesByFrequencies = entriesByLimit.map<[number, number]> ( ([ ngram, counter ]) => [hash ( ngram ), counter / total] );

    const ngrams = entriesByFrequencies.map ( entry => entry[0] );
    const frequencies = entriesByFrequencies.map ( entry => entry[1] );

    const ngramsPadded = padded ? padEnd ( ngrams, limit, 0 ) : ngrams;
    const frequenciesPadded = padded ? padEnd ( frequencies, limit, 0 ) : frequencies;

    return [ngramsPadded, frequenciesPadded];

  }

};

/* EXPORT */

export default Ngrams;
