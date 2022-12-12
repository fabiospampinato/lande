
/* IMPORT */

import _ from 'lodash';
import sha1 from 'sha1';

/* HELPERS */

const hash = _.memoize (( str: string ): number => { //TODO: Try different hashing algorithms

  // return ( djb2a ( str ) % 8192 ) + 1;

  str = str.padStart ( 3, '0' );

  const bytes = _.attempt ( () => sha1 ( str, { asBytes: true } ) );

  if ( _.isError ( bytes ) ) return 0;

  return ( ( ( bytes[0] << 6 ) + ( bytes[1] & 0b0011_1111 ) ) / ( 8192 * 2 ) );

  // return ( ( bytes[0] << 4 ) + ( bytes[1] & 0b0000_1111 ) );

  // return ( ( bytes[0] << 5 ) + ( bytes[1] & 0b0001_1111 ) );

  // return ( ( bytes[0] << 5 ) + ( bytes[1] & 0b0001_1111 ) ) - ( 8192 / 2 );

  // return ( ( ( bytes[0] << 5 ) + ( bytes[1] & 0b0001_1111 ) ) / 8192 );

  // return ( ( ( bytes[0] << 5 ) + ( bytes[1] & 0b0001_1111 ) ) / 8192 ) + 1;

  // return ( ( ( bytes[0] << 5 ) + ( bytes[1] & 0b0001_1111 ) ) / 8192 ) - 0.5;

});

const padEnd = <T> ( arr: T[], length: number, padder: T ): T[] => {

  if ( arr.length >= length ) return arr;

  const padding = new Array ( length - arr.length ).fill ( padder );
  const padded = arr.concat ( padding );

  return padded;

};

const sortByValue = ( obj: Record<string, number> ): Record<string, number> => {

  return Object.fromEntries ( Object.entries ( obj ).sort ( ( a, b ) => b[1] - a[1] ) );

};

/* EXPORT */

export {hash, padEnd, sortByValue};
