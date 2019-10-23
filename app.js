'use strict';
const fs = require('fs');
const readline = require('readline');
 // Node.js に用意されたモジュールの呼び出し。
 // fs は、FileSystem の略で、ファイルを扱うためのモジュール。
 // readline は、ファイルを一行ずつ読み込むためのモジュール。

const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
 // popu-pref.csv ファイルから、ファイルを読み込みを行う Stream を生成。
 // それを readline オブジェクトの input として設定、 rl オブジェクトを作成。
 // ここで作成された rl オブジェクトも Stream のインタフェースを持っている。

const prefectureDataMap = new Map();
 // 集計されたデータを格納する連想配列。
 // ここでは添字となるキー(key): 都道府県、値 (value):集計データのオブジェクトとする。

rl.on('line', (lineString) => {
     // rl オブジェクトで line というイベントが発生したらこの無名関数を呼んで、という意味。
    const columns = lineString.split(',');
     // 引数 lineString で与えられた文字列を「,」で分割、それを columns という配列に。
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
     // 配列 columns の要素へ並び順の番号でアクセスし、年、県、人口、をそれぞれ変数に保存。
     // parseInt() は、文字列を整数値に変換する関数
    if (year === 2010 || year === 2015) {
         // 集計年の数値 year が、 2010 または 2015 である時を if 文で判定。
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
         // 連想配列 prefectureDataMap からデータを取得。
         // value の値が Falsy の場合、value に初期値となるオブジェクトを代入。
         // その県の処理が初めてなら、value は undefined になるため value に値が代入される。
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        prefectureDataMap.set(prefecture, value);
         // オブジェクトのプロパティを更新してから連想配列に保存。
    }
});

rl.on('close', () => {
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
     // for-of 構文。Map や Array の中身を of の前の変数に代入し for ループができる。
     // 分割代入という方法。const [変数名1, 変数名2] のように変数と一緒に配列を宣言することで、
     // 第一要素の key という変数にキーを、第二要素の value という変数に値を代入できる。
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
     // Array.from(prefectureDataMap) の部分は、連想配列を普通の配列に変換する処理。
     // 連想配列は順番を持たないのでこのようにしている。
     // 更に、Array の sort 関数を呼んで無名関数を渡す。
     // これは比較関数と言い、これによって並び替えをするルールを決められる。
     // pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
     // 逆なら正の整数、そのままにしたいときは 0 を返す必要がある。
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ':' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });
    console.log(rankingStrings);
});
 // 'close' イベントは、全ての行を読み込み終わった際に呼び出される。
 // 各県各年男女のデータが集計された Map のオブジェクトを出力する。


/* 
Node.js では、入出力が発生する処理をほとんど Stream という形で扱う。
Stream とは非同期で情報を取り扱うための概念で、情報自体ではなく情報の流れに注目する。
Node.js で Stream を扱う際は、 Stream に対してイベントを監視し、
イベントが発生した時に呼び出される関数を設定することによって、情報を利用する。
このように、あらかじめイベントが発生したときに実行される関数を設定しておいて、
起こったイベントに応じて処理を行うことをイベント駆動型プログラミングと呼ぶ。 
*/

