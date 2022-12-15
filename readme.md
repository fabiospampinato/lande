# Lande

A little neural network for natural language detection.

This model is trained with data from the [Tatoeba](https://tatoeba.org/) project, and as a consequence it works well on short inputs too.

## Model

This model is loosely inspired by [`CLD3`](https://github.com/google/cld3), but getting something like that to work seems to require a lot of parameters, so this works a bit differently.

Architecture:

1. A little 1-layer fully connected classifer is trained only on 1-grams.
2. A little 1-layer fully connected classifer is trained only on 2-grams.
3. A little 1-layer fully connected classifer is trained only on 3-grams.
4. A little 1-layer fully connected classifier is trained on the output of the other 3 classifiers.

Details:

1. Character ngrams, at length 1, 2 and 3, are extracted from the input string, with the assumption that with that data it should be possible to tell apart natural languages fairly reliably, if the input string is long enough.
2. Compared to `CLD3` ngrams are not hashed, as I think that kinda unpredictably confuses the model, as now different ngrams can have the same hash, so unimportant ngrams could be confused for important ones. Also that requires allocating a somewhat large key space for the hashes, while instead we want to be parsimonious with that, if we only need to remember 100 1-grams that's what we should be allocating memory for, but a small key space would get quickly crowded with colliding hashes, making it somewhat useless.
3. Instead only the most frequent X ngrams of supported languages are considered, as they carry the most amount of signal overall, and the rest are simply discarded.
4. Then in order to reduce the number of parameters significantly compared to `CLD3` a poor man's kind of sparsity is achieved by building the final model out of smaller internal models, each looking at ngrams at a fixed length. With the idea behind this being that having each neuron look at all 1-ngrams, 2-grams and 3-grams is probably useless.
5. Lastly no embedding layers are used, as I think they are not needed with this approach because the model is being given clearer signals compared to `CLD3`, all inputs of the internal classifiers are 1-ngrams, 2-grams or 3-grams, each input corresponds to one unique ngram etc., this further reduces the number of parameters needed.

## Languages

The following 50 languages are supported.

If you want to experiment you can tweak some internal constants and add more languages, remove languages (which necessarily improves accuracy for the remaining ones), tweak hyper-parameters for the neural networks etc.

| ISO 639-3 | Name        |
| --------- | ----------- |
| `afr`     | Afrikaans   |
| `ara`     | Arabic      |
| `aze`     | Azerbaijani |
| `bel`     | Belarusian  |
| `ben`     | Bengali     |
| `bul`     | Bulgarian   |
| `cat`     | Catalan     |
| `ces`     | Czech       |
| `ckb`     | Kurdish     |
| `cmn`     | Mandarin    |
| `dan`     | Danish      |
| `deu`     | German      |
| `ell`     | Greek       |
| `eng`     | English     |
| `est`     | Estonian    |
| `eus`     | Basque      |
| `fin`     | Finnish     |
| `fra`     | French      |
| `hau`     | Hausa       |
| `heb`     | Hebrew      |
| `hin`     | Hindi       |
| `hrv`     | Croatian    |
| `hun`     | Hungarian   |
| `hye`     | Armenian    |
| `ind`     | Indonesian  |
| `isl`     | Icelandic   |
| `ita`     | Italian     |
| `jpn`     | Japanese    |
| `kat`     | Georgian    |
| `kaz`     | Kazakh      |
| `kor`     | Korean      |
| `lit`     | Lithuanian  |
| `mar`     | Marathi     |
| `mkd`     | Macedonian  |
| `nld`     | Dutch       |
| `nob`     | Norwegian   |
| `pes`     | Persian     |
| `pol`     | Polish      |
| `por`     | Portuguese  |
| `ron`     | Romanian    |
| `run`     | Rundi       |
| `rus`     | Russian     |
| `slk`     | Slovak      |
| `spa`     | Spanish     |
| `srp`     | Serbian     |
| `swe`     | Swedish     |
| `tgl`     | Tagalog     |
| `tur`     | Turkish     |
| `ukr`     | Ukrainian   |
| `vie`     | Vietnamese  |

## Install

```sh
npm install --save lande
```

## Usage

The library exports a single function which gives you a sorted list of detected languages and their probabilities.

```ts
import lande from 'lande';

lande ( 'What language is this sentence written in?' ); // => [['eng', 0.9999921321868896], ['deu', 0.000002357382982154377], ['heb', 0.000001461773877053929], ...]
lande ( 'In che lingua è scritta questa frase?' ); // => [['ita', 0.9999935626983643], ['ell', 0.0000025603442281862954], ['vie', 0.000002114558583343751], ...]
```

## License

MIT © Fabio Spampinato
