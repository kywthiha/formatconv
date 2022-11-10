/* 
 クラス名 : fileUtils.js
 概要 : ファイル処理
 作成者 : GICM
 作成日 : 2022/10/27　 
*/

// ファイルサイズを画面に表示するため計算処理
export function humanFileSize(size) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return {
    size: (size / Math.pow(1024, i)).toLocaleString(),
    unit: ["B", "KB", "MB", "GB", "TB"][i],
  };
}

// フォルダー中身を読み出す
async function readAllDirectoryEntries(directoryReader) {
  let entries = [];
  let readEntries = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
}

// Promise機能に変更
async function readEntriesPromise(directoryReader) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.log(err);
  }
}

// 選択されたフォルダーの中身を読み込み処理
export async function getAllFileEntries(dataTransferItem) {
  const fileItems = [];
  // Use BFS to traverse entire directory/file structure
  const queue = [dataTransferItem];
  while (queue.length > 0) {
    const entry = queue.shift();
    // ファイルの場合のみ読み込みする
    if (entry.isFile) {
      fileItems.push(
        await new Promise((resolve, reject) => {
          try {
            entry.file(
              function (file) {
                if (file) {
                  resolve(file);
                } else {
                  reject("ファイルが存在しません。");
                }
              },
              (e) => {
                reject(e);
              }
            );
          } catch (e) {
            reject(e);
          }
        })
      );
    } else if (entry.isDirectory) {
      // フォルダーの場合、フォルダー中身を読み込み
      queue.push(...(await readAllDirectoryEntries(entry.createReader())));
    }
  }
  return fileItems;
}
