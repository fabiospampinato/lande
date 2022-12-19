
/* IMPORT */

import {describe} from 'fava';
import lande from '../standalone/t50.js';

/* MAIN */

describe ( 'Lande', it => {

  it ( 'maybe works', t => {

    t.is ( lande ( 'What language is this sentence written in?' )[0][0], 'eng' );
    t.is ( lande ( 'In che lingua è scritta questa frase?' )[0][0], 'ita' );

  });

});
