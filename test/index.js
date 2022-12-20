
/* IMPORT */

import {describe} from 'fava';
import lande from '../standalone/t50.js';

/* MAIN */

describe ( 'Lande', it => {

  it ( 'maybe works', t => {

    const inferLanguage = sentence => lande ( sentence )[0][0];

    t.is ( inferLanguage ( 'What language is this sentence written in?' ), 'eng' );
    t.is ( inferLanguage ( 'In welcher Sprache ist dieser Satz geschrieben?' ), 'deu' );
    t.is ( inferLanguage ( 'Dans quelle langue est écrite cette phrase?' ), 'fra' );
    t.is ( inferLanguage ( 'In che lingua è scritta questa frase?' ), 'ita' );
    t.is ( inferLanguage ( 'На каком языке написано это предложение?' ), 'rus' );
    t.is ( inferLanguage ( 'Bu cümle hangi dilde yazılmıştır?' ), 'tur' );
    t.is ( inferLanguage ( 'Millä kielellä tämä lause on kirjoitettu?' ), 'fin' );
    t.is ( inferLanguage ( 'באיזו שפה כתוב המשפט הזה?' ), 'heb' );
    t.is ( inferLanguage ( 'Milyen nyelven van írva ez a mondat?' ), 'hun' );
    t.is ( inferLanguage ( 'この文は何語で書かれていますか。' ), 'jpn' );
    t.is ( inferLanguage ( 'In welke taal is deze zin geschreven?' ), 'nld' );
    t.is ( inferLanguage ( 'W jakim języku jest napisane to zdanie?' ), 'pol' );
    t.is ( inferLanguage ( 'Em que língua está escrita esta frase?' ), 'por' );
    t.is ( inferLanguage ( '¿En qué idioma está escrita esta oración?' ), 'spa' );
    // t.is ( inferLanguage ( 'Якою мовою написано це речення?' ), 'ukr' );
    t.is ( inferLanguage ( 'V jakém jazyce je tato věta napsána?' ), 'ces' );
    t.is ( inferLanguage ( '这句话是用什么语言写的？' ), 'cmn' );
    t.is ( inferLanguage ( 'Hvilket sprog er denne sætning skrevet på?' ), 'dan' );
    t.is ( inferLanguage ( 'Kokia kalba parašytas šis sakinys?' ), 'lit' );
    t.is ( inferLanguage ( 'हे वाक्य कोणत्या भाषेत लिहिले आहे?' ), 'mar' );
    // t.is ( inferLanguage ( 'На кој јазик е напишана оваа реченица?' ), 'mkd' );
    t.is ( inferLanguage ( 'Vilket språk är den här meningen skriven på?' ), 'swe' );
    t.is ( inferLanguage ( 'بأي لغة كتبت هذه الجملة؟' ), 'ara' );
    t.is ( inferLanguage ( 'Σε ποια γλώσσα είναι γραμμένη αυτή η πρόταση;' ), 'ell' );
    t.is ( inferLanguage ( 'این جمله به چه زبانی نوشته شده است؟' ), 'pes' );
    t.is ( inferLanguage ( 'În ce limbă este scrisă această propoziție?' ), 'ron' );
    t.is ( inferLanguage ( 'На ком језику је написана ова реченица?' ), 'srp' );
    t.is ( inferLanguage ( 'На якой мове напісаны гэты сказ?' ), 'bel' );
    t.is ( inferLanguage ( 'На какъв език е написано това изречение?' ), 'bul' );
    // t.is ( inferLanguage ( 'Ev hevok bi kîjan zimanî hatiye nivîsandin?' ), 'ckb' );
    t.is ( inferLanguage ( 'Wane harshe aka rubuta wannan jumla?' ), 'hau' );
    t.is ( inferLanguage ( 'यह वाक्य किस भाषा में लिखा गया है?' ), 'hin' );
    t.is ( inferLanguage ( 'Dalam bahasa apa kalimat ini ditulis?' ), 'ind' );
    t.is ( inferLanguage ( 'Á hvaða tungumáli er þessi setning skrifuð?' ), 'isl' );
    t.is ( inferLanguage ( '이 문장은 어떤 언어로 쓰여졌나요?' ), 'kor' );
    t.is ( inferLanguage ( 'Hvilket språk er denne setningen skrevet på?' ), 'nob' );
    t.is ( inferLanguage ( 'V akom jazyku je napísaná táto veta?' ), 'slk' );
    // t.is ( inferLanguage ( '???' ), 'tgl' );
    t.is ( inferLanguage ( 'Câu này được viết bằng ngôn ngữ nào?' ), 'vie' );
    t.is ( inferLanguage ( 'Bu cümlə hansı dildə yazılıb?' ), 'aze' );
    t.is ( inferLanguage ( 'এই বাক্যটি কোন ভাষায় লেখা?' ), 'ben' );
    t.is ( inferLanguage ( 'En quina llengua està escrita aquesta frase?' ), 'cat' );
    t.is ( inferLanguage ( 'Zein hizkuntzatan dago idatzita esaldi hau?' ), 'eus' );
    t.is ( inferLanguage ( 'Na kojem je jeziku napisana ova rečenica?' ), 'hrv' );
    t.is ( inferLanguage ( 'Ի՞նչ լեզվով է գրված այս նախադասությունը:' ), 'hye' );
    t.is ( inferLanguage ( 'რა ენაზეა დაწერილი ეს წინადადება?' ), 'kat' );
    // t.is ( inferLanguage ( '???' ), 'run' );
    t.is ( inferLanguage ( 'In watter taal is hierdie sin geskryf?' ), 'afr' );
    t.is ( inferLanguage ( 'Mis keeles see lause on kirjutatud?' ), 'est' );
    t.is ( inferLanguage ( 'Бұл сөйлем қай тілде жазылған?' ), 'kaz' );

  });

});
