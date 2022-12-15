# Lande

A tiny neural network for natural language detection.

This model is trained with data from the [Tatoeba](https://tatoeba.org/) project.

## Model

This model is loosely inspired by [`CLD3`](https://github.com/google/cld3), but getting something like that to work seems to require a lot of parameters, so this works a bit differently.

Architecture:

1. A little 1-layer fully connected classifer is trained only on 1-grams.
2. A little 1-layer fully connected classifer is trained only on 2-grams.
3. A little 1-layer fully connected classifer is trained only on 3-grams.
4. A little 1-layer fully connected classifier is trained on the output of the other 3 classifiers.

Details:

1. Character ngrams, at length 1, 2 and 3, are extracted from the input string, with the assumption that with that data it should be possible to tell apart natural languages fairly reliably.
2. Compared to `CLD3` ngrams are not hashed, as I think that kinda unpredictably confuses the model, as now different ngrams can have the same hash, so unimportant ngrams could be confused for important ones. Also that requires allocating a somewhat large key space for the hashes, while instead we want to be parsimonious with that, if we only need to remember 50 1-grams that's what we should be allocating memory for, but a small key space would get quickly crowded with colliding hashes, making it somewhat useless.
3. Instead only the most frequent X ngrams of supported languages are considered, as they carry the most amount of signal overall, and the rest are simply discarded.
4. Then in order to reduce the number of parameters significantly compared to `CLD3` a poor man's kind of sparsity is achieved by building the final model out of smaller internal models, each looking at ngrams at a fixed length. With the idea behind this being that having each neuron look at all 1-ngrams, 2-grams and 3-grams is probably useless.
5. Lastly no embedding layers are used, as I think they are not needed with this approach because the model is being given clearer signals compared to `CLD3`, all inputs of the internal classifiers are 1-ngrams, 2-grams or 3-grams, each input corresponds to one unique ngram etc., this further reduces the number of parameters needed.

## Install

```sh
npm install --save lande
```

## Usage

```ts
//TODO
```

## License

MIT © Fabio Spampinato
