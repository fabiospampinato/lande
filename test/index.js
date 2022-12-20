
/* IMPORT */

import {describe} from 'fava';
import lande from '../standalone/t50.js';

/* MAIN */

describe ( 'Lande', it => {

  it ( 'maybe works', t => {

    t.is ( lande ( 'What language is this sentence written in?' )[0][0], 'eng' );
    t.is ( lande ( 'In welcher Sprache ist dieser Satz geschrieben?' )[0][0], 'deu' );
    t.is ( lande ( 'Dans quelle langue est écrite cette phrase?' )[0][0], 'fra' );
    t.is ( lande ( 'In che lingua è scritta questa frase?' )[0][0], 'ita' );
    t.is ( lande ( 'На каком языке написано это предложение?' )[0][0], 'rus' );
    t.is ( lande ( 'Bu cümle hangi dilde yazılmıştır?' )[0][0], 'tur' );
    t.is ( lande ( 'Millä kielellä tämä lause on kirjoitettu?' )[0][0], 'fin' );
    t.is ( lande ( 'באיזו שפה כתוב המשפט הזה?' )[0][0], 'heb' );
    t.is ( lande ( 'Milyen nyelven van írva ez a mondat?' )[0][0], 'hun' );
    t.is ( lande ( 'この文は何語で書かれていますか。' )[0][0], 'jpn' );
    t.is ( lande ( 'In welke taal is deze zin geschreven?' )[0][0], 'nld' );
    t.is ( lande ( 'W jakim języku jest napisane to zdanie?' )[0][0], 'pol' );
    t.is ( lande ( 'Em que língua está escrita esta frase?' )[0][0], 'por' );
    t.is ( lande ( '¿En qué idioma está escrita esta oración?' )[0][0], 'spa' );
    // t.is ( lande ( 'Якою мовою написано це речення?' )[0][0], 'ukr' );
    t.is ( lande ( 'V jakém jazyce je tato věta napsána?' )[0][0], 'ces' );
    t.is ( lande ( '这句话是用什么语言写的？' )[0][0], 'cmn' );
    t.is ( lande ( 'Hvilket sprog er denne sætning skrevet på?' )[0][0], 'dan' );
    t.is ( lande ( 'Kokia kalba parašytas šis sakinys?' )[0][0], 'lit' );
    t.is ( lande ( 'हे वाक्य कोणत्या भाषेत लिहिले आहे?' )[0][0], 'mar' );
    // t.is ( lande ( 'На кој јазик е напишана оваа реченица?' )[0][0], 'mkd' );
    t.is ( lande ( 'Vilket språk är den här meningen skriven på?' )[0][0], 'swe' );
    t.is ( lande ( 'بأي لغة كتبت هذه الجملة؟' )[0][0], 'ara' );
    t.is ( lande ( 'Σε ποια γλώσσα είναι γραμμένη αυτή η πρόταση;' )[0][0], 'ell' );
    t.is ( lande ( 'این جمله به چه زبانی نوشته شده است؟' )[0][0], 'pes' );
    t.is ( lande ( 'În ce limbă este scrisă această propoziție?' )[0][0], 'ron' );
    t.is ( lande ( 'На ком језику је написана ова реченица?' )[0][0], 'srp' );
    t.is ( lande ( 'На якой мове напісаны гэты сказ?' )[0][0], 'bel' );
    t.is ( lande ( 'На какъв език е написано това изречение?' )[0][0], 'bul' );
    // t.is ( lande ( 'Ev hevok bi kîjan zimanî hatiye nivîsandin?' )[0][0], 'ckb' );
    t.is ( lande ( 'Wane harshe aka rubuta wannan jumla?' )[0][0], 'hau' );
    t.is ( lande ( 'यह वाक्य किस भाषा में लिखा गया है?' )[0][0], 'hin' );
    t.is ( lande ( 'Dalam bahasa apa kalimat ini ditulis?' )[0][0], 'ind' );
    t.is ( lande ( 'Á hvaða tungumáli er þessi setning skrifuð?' )[0][0], 'isl' );
    t.is ( lande ( '이 문장은 어떤 언어로 쓰여졌나요?' )[0][0], 'kor' );
    t.is ( lande ( 'Hvilket språk er denne setningen skrevet på?' )[0][0], 'nob' );
    t.is ( lande ( 'V akom jazyku je napísaná táto veta?' )[0][0], 'slk' );
    // t.is ( lande ( '???' )[0][0], 'tgl' );
    t.is ( lande ( 'Câu này được viết bằng ngôn ngữ nào?' )[0][0], 'vie' );
    t.is ( lande ( 'Bu cümlə hansı dildə yazılıb?' )[0][0], 'aze' );
    t.is ( lande ( 'এই বাক্যটি কোন ভাষায় লেখা?' )[0][0], 'ben' );
    t.is ( lande ( 'En quina llengua està escrita aquesta frase?' )[0][0], 'cat' );
    t.is ( lande ( 'Zein hizkuntzatan dago idatzita esaldi hau?' )[0][0], 'eus' );
    t.is ( lande ( 'Na kojem je jeziku napisana ova rečenica?' )[0][0], 'hrv' );
    t.is ( lande ( 'Ի՞նչ լեզվով է գրված այս նախադասությունը:' )[0][0], 'hye' );
    t.is ( lande ( 'რა ენაზეა დაწერილი ეს წინადადება?' )[0][0], 'kat' );
    // t.is ( lande ( '???' )[0][0], 'run' );
    t.is ( lande ( 'In watter taal is hierdie sin geskryf?' )[0][0], 'afr' );
    t.is ( lande ( 'Mis keeles see lause on kirjutatud?' )[0][0], 'est' );
    t.is ( lande ( 'Бұл сөйлем қай тілде жазылған?' )[0][0], 'kaz' );

  });

});
