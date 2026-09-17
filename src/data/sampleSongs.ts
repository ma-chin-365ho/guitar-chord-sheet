import { SongData } from '../types/chord';

export const SAMPLE_SONGS: SongData[] = [
  {
    id: 'sample-country-road',
    title: 'カントリー・ロード (Take Me Home, Country Roads)',
    artist: 'John Denver / 日本語詞',
    key: 'G',
    capo: 0,
    tempo: 84,
    timeSignature: '4/4',
    notes: 'アコースティックギターのストロークにぴったりの名曲です。C/GやEm7へのコードチェンジを滑らかに弾きましょう。',
    updatedAt: Date.now(),
    content: `[Intro]
[G] [D] [Em] [C]
[G] [D] [C] [G]

[Aメロ]
[G]カントリー・ロード この[Em]道
[D]ずっとゆけば
[C]あの街に[G]つづいてる
[D]気がする[G]カントリー・ロード

[Bメロ]
[Em]ひとりぼっち[D]おそれずに
[G]生きようと[C]夢見てた
[G]さみしさ[D]押し込めて
[Em]強い自分を[F]守ってい[D]た

[サビ]
[G]カントリー・ロード この[D]道
[Em]ずっとゆけば[C]
あの[G]街につづいてる[D]
気がする[C]カントリー・ロード[G]

[Outro]
[G]カントリー・ロード
[D]明日はいつもの[G]わたし
`
  },
  {
    id: 'sample-stand-by-me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    key: 'A',
    capo: 2,
    tempo: 118,
    timeSignature: '4/4',
    notes: 'Capo 2でGフォーム（G - Em - C - D）で弾くと簡単に弾き語りできます！',
    updatedAt: Date.now() - 10000,
    content: `[Intro]
[G] | [G] | [Em] | [Em]
[C] | [D] | [G] | [G]

[Verse 1]
When the [G]night has come
And the [Em]land is dark
And the [C]moon is the [D]only light we'll [G]see

[Verse 2]
No I [G]won't be afraid, no I [Em]won't be afraid
Just as [C]long as you [D]stand, stand by [G]me

[Chorus]
So darling, darling, [G]stand by me, oh [Em]stand by me
Oh [C]stand, [D]stand by me, [G]stand by me

[Outro]
[G] [Em] [C] [D] [G]
`
  },
  {
    id: 'sample-amazing-grace',
    title: 'アメイジング・グレイス (Amazing Grace)',
    artist: 'Traditional',
    key: 'C',
    capo: 0,
    tempo: 72,
    timeSignature: '3/4',
    notes: '3拍子のアルペジオやスローストロークで弾き語る定番曲です。',
    updatedAt: Date.now() - 20000,
    content: `[Verse 1]
A-[C]mazing grace! How [F]sweet the [C]sound
That saved a wretch like [G7]me!
I [C]once was lost, but [F]now am [C]found;
Was blind, but [G7]now I [C]see.

[Verse 2]
'Twas [C]grace that taught my [F]heart to [C]fear,
And grace my fears re-[G7]lieved;
How [C]precious did that [F]grace ap-[C]pear
The hour I [G7]first be-[C]lieved.
`
  }
];
