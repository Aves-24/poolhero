/**
 * Skaluje i kompresuje zdjęcie w przeglądarce przed wysłaniem na serwer.
 * Zdjęcia z telefonu (5-10+ MB) łatwo przekraczają limit żądania na Vercel
 * (~4.5 MB) — a to tylko miniaturka profilu, więc nie trzeba pełnej rozdzielczości.
 */
export async function resizeImage(file: File, maxDimension = 800, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  return blob ?? file;
}
