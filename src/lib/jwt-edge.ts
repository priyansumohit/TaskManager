const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function verifyAccessTokenEdge(
  token: string
): Promise<{ id: number } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSig = await hmacSha256(ACCESS_SECRET, `${header}.${payload}`);
    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payload))
    );

    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;

    return { id: decoded.id };
  } catch {
    return null;
  }
}
