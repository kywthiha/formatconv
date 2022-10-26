import * as zip from "@zip.js/zip.js";

export function filesToZip(file_list, folder_name) {
  return new Promise((resolve, reject) => {
    const zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"), {
      bufferedWrite: true,
    });
    Promise.all(
      file_list.map(async (item) => {
        const { file, options } = item;
        await zipWriter.add(file.name, new zip.BlobReader(file), options);
      })
    )
      .then(() => {
        zipWriter.close().then((blob) => {
          const file = new File([blob], folder_name, {
            type: blob.type,
          });
          resolve(file);
        });
      })
      .catch((e) => {
        reject(e);
      });
  });
}
