export function humanFileSize(size) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return {
    size: (size / Math.pow(1024, i)).toLocaleString(),
    unit: ["B", "KB", "MB", "GB", "TB"][i],
  };
}

export async function scanFiles(item, path = "", fileItems = []) {
  if (item.isFile) {
    return await new Promise((resolve, reject) => {
      try {
        item.file(function (file) {
          if (file) {
            fileItems.push({ file, path });
            resolve(fileItems);
          } else {
            reject("File Not Found");
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  } else if (item.isDirectory) {
    const directoryReader = item.createReader();
    const promisEntries = [];
    await new Promise((resolve, reject) => {
      try {
        directoryReader.readEntries((entries) => {
          for (let entry of entries) {
            promisEntries.push(
              scanFiles(entry, path + item.name + "/", fileItems)
            );
          }
          resolve(promisEntries);
        });
      } catch (e) {
        reject(e);
      }
    });
    await Promise.all(promisEntries);
  }
  return fileItems;
}

export async function tranformFileItems(dataTransferItems) {
  const filteItems = [];
  for (const dataTransferItem of dataTransferItems) {
    const item = dataTransferItem.webkitGetAsEntry();
    if (item) {
      filteItems.push(scanFiles(item));
    }
  }
  return (await Promise.all(filteItems)).reduce(function (arr, row) {
    return arr.concat(row);
  }, []);
}
