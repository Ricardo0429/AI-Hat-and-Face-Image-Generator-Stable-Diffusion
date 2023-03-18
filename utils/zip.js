import JSZip from "jszip";
import { Upload } from "upload-js";

const upload = Upload({ apiKey: "public_W142heBDQe23q9gaoApzSNosGFs3" });

const onProgress = ({ progress }) => {
  console.log(`File uploading: ${progress}% complete.`);
};

export const generateZip = async (arr) => {
  const zip = JSZip();
  if (arr.length) {
    for (const element of arr) {
      zip.file(`image_${element.file.size}.png`, element.file, {
        binary: true,
      });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    try {
      const { fileUrl } = await upload.uploadFile(blob, { onProgress });
      return fileUrl;
    } catch (error) {
      console.log(error);
    }
  }
};
