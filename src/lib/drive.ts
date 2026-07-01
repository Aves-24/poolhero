import { google } from "googleapis";
import { Readable } from "stream";

const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SA_KEY = process.env.GOOGLE_PRIVATE_KEY;

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: SA_EMAIL,
    key: (SA_KEY || "").replace(/^"/, "").replace(/"$/, "").replace(/\\n/g, "\n").trim(),
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return google.drive({ version: "v3", auth });
}

export async function uploadPhoto(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const drive = getDriveClient();

  const res = await drive.files.create({
    requestBody: { name: filename, mimeType },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id",
  });

  const fileId = res.data.id!;

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

export async function deletePhotoByUrl(photoUrl: string): Promise<void> {
  const match = photoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!match) return;
  const fileId = match[1];
  try {
    await getDriveClient().files.delete({ fileId });
  } catch {
    // plik mógł już zostać usunięty
  }
}
