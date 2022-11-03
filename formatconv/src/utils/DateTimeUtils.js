/* 
 クラス名 : dateTimeUtils.js
 概要 : ファイル処理
 作成者 : GICM
 作成日 : 2022/10/27　 
*/

export function convertMilisecondToMinuteSecond(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
