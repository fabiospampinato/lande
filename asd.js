import lande from './standalone/t50.js';

console.log ( lande ( 'What language is this sentence written in?' ) ); // => [['eng', 0.9999921321868896], ['deu', 0.000002357382982154377], ['heb', 0.000001461773877053929], ...]
console.log ( lande ( 'In che lingua è scritta questa frase?' ) ); // => [['ita', 0.9999935626983643], ['ell', 0.0000025603442281862954], ['vie', 0.000002114558583343751], ...]
