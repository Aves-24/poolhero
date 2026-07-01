import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

/**
 * Zwraca e-mail zalogowanego właściciela (małymi literami) lub null.
 * Każda trasa API używa go do filtrowania danych — użytkownik widzi
 * i modyfikuje wyłącznie swoje profile i testy.
 */
export async function getOwnerEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  return email ? email.toLowerCase() : null;
}
