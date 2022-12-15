
/* IMPORT */

import {NeuralNetwork} from 'toygrad';
import {infer} from './utils.js';
import langs from './t50-langs.js';
import ngrams from './t50-ngrams.js';
import nn1options from './t50-nn1.js';
import nn2options from './t50-nn2.js';
import nn3options from './t50-nn3.js';
import nnXoptions from './t50-nnX.js';

/* HELPERS */

const nn1 = new NeuralNetwork ( nn1options );
const nn2 = new NeuralNetwork ( nn2options );
const nn3 = new NeuralNetwork ( nn3options );
const nnX = new NeuralNetwork ( nnXoptions );

/* MAIN */

/**
 * @param {string} input
 * @returns {[string, number][]}
 * */

const process = input => infer ( input, langs, ngrams, nn1, nn2, nn3, nnX );

/* EXPORT */

export default process;
