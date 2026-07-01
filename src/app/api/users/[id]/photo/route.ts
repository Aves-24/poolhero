import { NextResponse } from "next/server";
import { uploadPhoto, deletePhotoByUrl } from "@/lib/drive";
import { updateUser, getUsers } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024)
      return NextResponse.json({ error: "Plik za duży (max 8 MB)" }, { status: 400 });
    if (!file.type.startsWith("image/"))
      return NextResponse.json({ error: "Tylko pliki graficzne (jpg, png, webp…)" }, { status: 400 });

    // Usuń stare zdjęcie z Drive jeśli istnieje
    const users = await getUsers();
    const existing = users.find((u) => u.id === params.id);
    if (existing?.photoUrl) {
      await deletePhotoByUrl(existing.photoUrl).catch(() => {});
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const filename = `poolhero-${params.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const photoUrl = await uploadPhoto(buffer, file.type, filename);

    const updated = await updateUser(params.id, { photoUrl });
    return NextResponse.json({ photoUrl, user: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const users = await getUsers();
    const existing = users.find((u) => u.id === params.id);
    if (existing?.photoUrl) {
      await deletePhotoByUrl(existing.photoUrl).catch(() => {});
    }
    const updated = await updateUser(params.id, { photoUrl: "" });
    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
