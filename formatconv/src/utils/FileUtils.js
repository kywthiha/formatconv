export function humanFileSize(size) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return {
    size: (size / Math.pow(1024, i)).toLocaleString(),
    unit: ["B", "KB", "MB", "GB", "TB"][i],
  };
}

// Get all the entries (files or sub-directories) in a directory
// by calling readEntries until it returns empty array
async function readAllDirectoryEntries(directoryReader) {
  let entries = [];
  let readEntries = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
}

// Wrap readEntries in a promise to make working with readEntries easier
// readEntries will return only some of the entries in a directory
// e.g. Chrome returns at most 100 entries at a time
async function readEntriesPromise(directoryReader) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.log(err);
  }
}

export async function getAllFileEntries(dataTransferItem) {
  const fileItems = [];
  // Use BFS to traverse entire directory/file structure
  const queue = [dataTransferItem];
  while (queue.length > 0) {
    const entry = queue.shift();
    if (entry.isFile) {
      fileItems.push(
        await new Promise((resolve, reject) => {
          try {
            entry.file(
              function (file) {
                if (file) {
                  resolve(file);
                } else {
                  reject("File Not Found");
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
      queue.push(...(await readAllDirectoryEntries(entry.createReader())));
    }
  }
  return fileItems;
}
