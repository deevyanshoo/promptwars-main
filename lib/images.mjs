import { InputError } from "./contracts.mjs";
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 1600;
const fail = () => {
  throw new InputError("image_invalid");
};
function dimensions(bytes, mime) {
  if (mime === "image/png") {
    if (
      bytes.length < 45 ||
      !bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      fail();
    if (
      bytes.readUInt32BE(8) !== 13 ||
      bytes.toString("ascii", 12, 16) !== "IHDR"
    )
      fail();
    let offset = 8,
      ended = false;
    while (offset + 12 <= bytes.length) {
      const length = bytes.readUInt32BE(offset);
      if (length > bytes.length - offset - 12) fail();
      const kind = bytes.toString("ascii", offset + 4, offset + 8);
      if (kind === "acTL") fail();
      offset += length + 12;
      if (kind === "IEND") {
        if (length !== 0 || offset !== bytes.length) fail();
        ended = true;
        break;
      }
    }
    if (!ended) fail();
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (mime === "image/jpeg") {
    if (
      bytes.length < 12 ||
      bytes[0] !== 255 ||
      bytes[1] !== 216 ||
      bytes.at(-2) !== 255 ||
      bytes.at(-1) !== 217
    )
      fail();
    let offset = 2,
      size;
    while (offset < bytes.length - 2) {
      if (bytes[offset++] !== 255) fail();
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 218) break;
      if (marker === 0 || marker === 216 || marker === 217) fail();
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > bytes.length) fail();
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) fail();
      if ([192, 193, 194].includes(marker)) {
        if (length < 8 || bytes[offset + 2] !== 8) fail();
        size = {
          height: bytes.readUInt16BE(offset + 3),
          width: bytes.readUInt16BE(offset + 5),
        };
      }
      offset += length;
    }
    if (!size) fail();
    return size;
  }
  if (mime === "image/webp") {
    if (
      bytes.length < 30 ||
      bytes.toString("ascii", 0, 4) !== "RIFF" ||
      bytes.toString("ascii", 8, 12) !== "WEBP" ||
      bytes.readUInt32LE(4) + 8 !== bytes.length
    )
      fail();
    let offset = 12,
      size;
    while (offset + 8 <= bytes.length) {
      const type = bytes.toString("ascii", offset, offset + 4),
        length = bytes.readUInt32LE(offset + 4),
        start = offset + 8;
      if (length > bytes.length - start || ["ANIM", "ANMF"].includes(type))
        fail();
      if (type === "VP8X") {
        if (length !== 10 || bytes[start] & 2) fail();
        size = {
          width: 1 + bytes.readUIntLE(start + 4, 3),
          height: 1 + bytes.readUIntLE(start + 7, 3),
        };
      } else if (type === "VP8 ") {
        if (
          length < 10 ||
          !bytes
            .subarray(start + 3, start + 6)
            .equals(Buffer.from([157, 1, 42]))
        )
          fail();
        size ||= {
          width: bytes.readUInt16LE(start + 6) & 16383,
          height: bytes.readUInt16LE(start + 8) & 16383,
        };
      } else if (type === "VP8L") {
        if (length < 5 || bytes[start] !== 47) fail();
        const bits = bytes.readUInt32LE(start + 1);
        size ||= {
          width: (bits & 16383) + 1,
          height: ((bits >>> 14) & 16383) + 1,
        };
      }
      offset = start + length + (length % 2);
    }
    if (!size || offset !== bytes.length) fail();
    return size;
  }
  fail();
}
export function validateUpload(value) {
  if (
    !value ||
    typeof value !== "object" ||
    !["image/jpeg", "image/png", "image/webp"].includes(value.mimeType) ||
    typeof value.data !== "string"
  )
    fail();
  if (value.data.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4)
    throw new InputError("image_size");
  if (
    !value.data.length ||
    value.data.length % 4 !== 0 ||
    /[^A-Za-z0-9+/=]/.test(value.data) ||
    !/^[^=]*={0,2}$/.test(value.data)
  )
    fail();
  const bytes = Buffer.from(value.data, "base64");
  if (bytes.toString("base64") !== value.data || bytes.length > MAX_IMAGE_BYTES)
    fail();
  const { width, height } = dimensions(bytes, value.mimeType);
  if (
    width < 16 ||
    height < 16 ||
    width > MAX_IMAGE_EDGE ||
    height > MAX_IMAGE_EDGE ||
    width * height > 2560000
  )
    throw new InputError("image_dimensions");
  return { mimeType: value.mimeType, data: value.data, width, height };
}
