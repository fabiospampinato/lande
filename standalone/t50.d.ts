type Language = 'afr' | 'ara' | 'aze' | 'bel' | 'ben' | 'bul' | 'cat' | 'ces' | 'ckb' | 'cmn' | 'dan' | 'deu' | 'ell' | 'eng' | 'est' | 'eus' | 'fin' | 'fra' | 'hau' | 'heb' | 'hin' | 'hrv' | 'hun' | 'hye' | 'ind' | 'isl' | 'ita' | 'jpn' | 'kat' | 'kaz' | 'kor' | 'lit' | 'mar' | 'mkd' | 'nld' | 'nob' | 'pes' | 'pol' | 'por' | 'ron' | 'run' | 'rus' | 'slk' | 'spa' | 'srp' | 'swe' | 'tgl' | 'tur' | 'ukr' | 'vie';
declare const lande: (text: string) => [Language, number][];
export default lande;
export type { Language };
