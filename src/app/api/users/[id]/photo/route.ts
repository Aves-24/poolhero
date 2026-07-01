import { NextResponse } from "next/server";
import { uploadPhoto, deletePhotoByUrl } from "@/lib/blob";
import { updateUser, getUsers } from "@/lib/sheets";
import { getOwnerEmail } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getOwnerEmail();
    if (!owner) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    if (file.size > 4 * 1024 * 1024)
      return NextResponse.json({ error: "Plik za duży (max 4 MB)" }, { status: 400 });
    if (!file.type.startsWith("image/"))
      return NextResponse.json({ error: "Tylko pliki graficzne (jpg, png, webp…)" }, { status: 400 });

    // Tylko profile należące do zalogowanego właściciela
    const users = await getUsers(owner);
    const existing = users.find((u) => u.id === params.id);
    if (!existing) return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 });
    if (existing.photoUrl) {
      await deletePhotoByUrl(existing.photoUrl).catch(() => {});
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const filename = `poolhero-${params.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const photoUrl = await uploadPhoto(buffer, file.type, filename);

    const updated = await updateUser(params.id, { photoUrl }, owner);
    return NextResponse.json({ photoUrl, user: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getOwnerEmail();
    if (!owner) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

    const users = await getUsers(owner);
    const existing = users.find((u) => u.id === params.id);
    if (!existing) return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 });
    if (existing.photoUrl) {
      await deletePhotoByUrl(existing.photoUrl).catch(() => {});
    }
    const updated = await updateUser(params.id, { photoUrl: "" }, owner);
    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
