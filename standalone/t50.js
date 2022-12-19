
/* IMPORT */

import {NeuralNetwork} from 'toygrad';
import langs from './t50-langs.js';
import ngrams from './t50-ngrams.js';
import options from './t50-options.js';
import {infer} from './utils.js';

/* HELPERS */

const nn = new NeuralNetwork ( options );

/* MAIN */

/**
 * @param {string} text
 * @returns {[string, number][]}
 * */

const lande = text => infer ( text, langs, ngrams, nn );

/* EXPORT */

export default lande;
