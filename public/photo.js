export const ORIGINAL_LIMIT = 12 * 1024 * 1024;
export async function preparePhoto(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("image_invalid");
  if (file.size > ORIGINAL_LIMIT) throw new Error("original_size");
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("image_invalid");
  }
  try {
    if (
      bitmap.width < 16 ||
      bitmap.height < 16 ||
      bitmap.width > 12000 ||
      bitmap.height > 12000 ||
      bitmap.width * bitmap.height > 48000000
    )
      throw new Error("original_dimensions");
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.88),
    );
    if (!blob || blob.size > 3 * 1024 * 1024) throw new Error("image_size");
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return {
      image: { mimeType: "image/jpeg", data },
      preview: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    bitmap.close();
  }
}
export function releasePhoto(photo) {
  if (photo?.preview) URL.revokeObjectURL(photo.preview);
}
