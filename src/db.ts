
/* MAIN */

const DB = [
  /* < 100_000_000 */
  {
    'name': 'English',
    'iso6393': 'eng',
    'bcp47': 'en'
  },
  /* < 1_000_000 */
  {
    'name': 'German',
    'iso6393': 'deu',
    'bcp47': 'de'
  },
  {
    'name': 'French',
    'iso6393': 'fra',
    'bcp47': 'fr'
  },
  {
    'name': 'Italian',
    'iso6393': 'ita',
    'bcp47': 'it'
  },
  {
    'name': 'Russian',
    'iso6393': 'rus',
    'bcp47': 'ru'
  },
  {
    'name': 'Turkish',
    'iso6393': 'tur',
    'bcp47': 'tr'
  },
  /* < 500_000 */
  {
    'name': 'Finnish',
    'iso6393': 'fin',
    'bcp47': 'fi'
  },
  {
    'name': 'Hebrew',
    'iso6393': 'heb',
    'bcp47': 'iw'
  },
  {
    'name': 'Hungarian',
    'iso6393': 'hun',
    'bcp47': 'hu'
  },
  {
    'name': 'Japanese',
    'iso6393': 'jpn',
    'bcp47': 'ja'
  },
  {
    'name': 'Dutch',
    'iso6393': 'nld',
    'bcp47': 'nl'
  },
  {
    'name': 'Polish',
    'iso6393': 'pol',
    'bcp47': 'pl'
  },
  {
    'name': 'Portuguese',
    'iso6393': 'por',
    'bcp47': 'pt'
  },
  {
    'name': 'Spanish',
    'iso6393': 'spa',
    'bcp47': 'es'
  },
  {
    'name': 'Ukrainian',
    'iso6393': 'ukr',
    'bcp47': 'uk'
  },
  /* < 100_000 */
  {
    'name': 'Czech',
    'iso6393': 'ces',
    'bcp47': 'cs'
  },
  {
    'name': 'Mandarin',
    'iso6393': 'cmn',
    'bcp47': 'zh'
  },
  {
    'name': 'Danish',
    'iso6393': 'dan',
    'bcp47': 'da'
  },
  {
    'name': 'Lithuanian',
    'iso6393': 'lit',
    'bcp47': 'lt'
  },
  {
    'name': 'Marathi',
    'iso6393': 'mar',
    'bcp47': 'mr'
  },
  {
    'name': 'Macedonian',
    'iso6393': 'mkd',
    'bcp47': 'mk'
  },
  {
    'name': 'Swedish',
    'iso6393': 'swe',
    'bcp47': 'sv'
  },
  /* < 50_000 */
  {
    'name': 'Arabic',
    'iso6393': 'ara',
    'bcp47': 'ar'
  },
  {
    'name': 'Greek',
    'iso6393': 'ell',
    'bcp47': 'el'
  },
  {
    'name': 'Persian',
    'iso6393': 'pes',
    'bcp47': 'fa'
  },
  {
    'name': 'Romanian',
    'iso6393': 'ron',
    'bcp47': 'ro'
  },
  {
    'name': 'Serbian',
    'iso6393': 'srp',
    'bcp47': 'sr'
  },
  /* < 25_000 */
  {
    'name': 'Belarusian',
    'iso6393': 'bel',
    'bcp47': 'be'
  },
  {
    'name': 'Bulgarian',
    'iso6393': 'bul',
    'bcp47': 'bg'
  },
  {
    'name': 'Kurdish',
    'iso6393': 'ckb',
    'bcp47': 'ku'
  },
  {
    'name': 'Hausa',
    'iso6393': 'hau',
    'bcp47': 'ha'
  },
  {
    'name': 'Hindi',
    'iso6393': 'hin',
    'bcp47': 'hi'
  },
  {
    'name': 'Indonesian',
    'iso6393': 'ind',
    'bcp47': 'id'
  },
  {
    'name': 'Icelandic',
    'iso6393': 'isl',
    'bcp47': 'is'
  },
  {
    'name': 'Korean',
    'iso6393': 'kor',
    'bcp47': 'ko'
  },
  {
    'name': 'Norwegian Bokmål',
    'iso6393': 'nob',
    'bcp47': 'no'
  },
  {
    'name': 'Slovak',
    'iso6393': 'slk',
    'bcp47': 'sk'
  },
  {
    'name': 'Tagalog',
    'iso6393': 'tgl',
    'bcp47': 'tl'
  },
  {
    'name': 'Vietnamese',
    'iso6393': 'vie',
    'bcp47': 'vi'
  },
  /* < 10_000 */
  {
    'name': 'Azerbaijani',
    'iso6393': 'aze',
    'bcp47': 'az'
  },
  {
    'name': 'Bengali',
    'iso6393': 'ben',
    'bcp47': 'bn'
  },
  {
    'name': 'Catalan',
    'iso6393': 'cat',
    'bcp47': 'ca'
  },
  {
    'name': 'Basque',
    'iso6393': 'eus',
    'bcp47': 'eu'
  },
  {
    'name': 'Croatian',
    'iso6393': 'hrv',
    'bcp47': 'hr'
  },
  {
    'name': 'Armenian',
    'iso6393': 'hye',
    'bcp47': 'hy'
  },
  {
    'name': 'Georgian',
    'iso6393': 'kat',
    'bcp47': 'ka'
  },
  {
    'name': 'Rundi',
    'iso6393': 'run',
    'bcp47': 'rn'
  },
  /* < 5_000 */
  {
    'name': 'Afrikaans',
    'iso6393': 'afr',
    'bcp47': 'af'
  },
  {
    'name': 'Estonian',
    'iso6393': 'est',
    'bcp47': 'et'
  },
  {
    'name': 'Irish',
    'iso6393': 'gle',
    'bcp47': 'ga'
  },
  {
    'name': 'Javanese',
    'iso6393': 'jav',
    'bcp47': 'jv'
  },
  {
    'name': 'Kazakh',
    'iso6393': 'kaz',
    'bcp47': 'kk'
  },
  {
    'name': 'Mongolian',
    'iso6393': 'mon',
    'bcp47': 'mn'
  },
  {
    'name': 'Norwegian Nynorsk',
    'iso6393': 'nno',
    'bcp47': 'nn'
  },
  {
    'name': 'Albanian',
    'iso6393': 'sqi',
    'bcp47': 'sq'
  },
  {
    'name': 'Thai',
    'iso6393': 'tha',
    'bcp47': 'th'
  },
  {
    'name': 'Urdu',
    'iso6393': 'urd',
    'bcp47': 'ur'
  }
];

/* EXPORT */

export default DB;
