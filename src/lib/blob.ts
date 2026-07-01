import { put, del } from "@vercel/blob";

export async function uploadPhoto(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deletePhotoByUrl(photoUrl: string): Promise<void> {
  try {
    await del(photoUrl);
  } catch {
    // plik mógł już zostać usunięty
  }
}
