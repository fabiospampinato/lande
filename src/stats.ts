
/* IMPORT */

import langdb from 'langs';
import fs from 'node:fs';
import path from 'node:path';
import {DATASET_PATH} from './constants';
import {forEachLine} from './utils';
import type {Stats} from './types';

/* HELPERS */

const getDatasetStats = (): Stats => {

  const stats: Stats = [];
  const sentences: Record<string, number> = {};
  const csv = fs.readFileSync ( DATASET_PATH );

  forEachLine ( csv, line => {

    const parts = line.split ( '\t' );

    if ( parts.length !== 3 ) return; // Something went wrong with this line

    const lang = parts[1];

    sentences[lang] ||= 0;
    sentences[lang] += 1;

  });

  const langs = Object.keys ( sentences );
  const langsSorted = langs.sort ( ( a, b ) => sentences[b] - sentences[a] );

  langsSorted.forEach ( lang => {

    const name = langdb.where ( '3', lang )?.name;
    const stat = { lang, name, sentences: sentences[lang] };

    stats.push ( stat );

  });

  return stats;

};

/* MAIN */

const stats = getDatasetStats ();
const statsPath = path.join ( process.cwd (), 'resources', 'stats.json' );

fs.writeFileSync ( statsPath, JSON.stringify ( stats, undefined, 2 ) );
