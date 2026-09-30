import { describe, expect, it } from "vitest";

import { urlBase64ToUint8Array } from "@/features/push/url-base64";

describe("urlBase64ToUint8Array", () => {
  it("decodifica base64url sem padding (múltiplo de 4)", () => {
    // "hello world" em base64 é "aGVsbG8gd29ybGQ=" — sem o "=" e sem +/- especiais.
    const bytes = urlBase64ToUint8Array("aGVsbG8gd29ybGQ");
    expect(Buffer.from(bytes).toString("utf-8")).toBe("hello world");
  });

  it("troca - por + e _ por / (alfabeto base64url)", () => {
    // Buffer "\xfb\xff\xbf" força os bytes 251/255/191, cujo base64 padrão usa "+" e "/".
    const raw = Buffer.from([0xfb, 0xff, 0xbf]);
    const standard = raw.toString("base64"); // "+/+/" style
    const urlSafe = standard.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(standard).not.toBe(urlSafe);
    const bytes = urlBase64ToUint8Array(urlSafe);
    expect(Array.from(bytes)).toEqual([0xfb, 0xff, 0xbf]);
  });

  it("decodifica a chave pública VAPID real (65 bytes, ponto EC P-256 não comprimido)", () => {
    const vapidPublicKey = "BF6B3ErXb6_z2PP8LkAYOWHD3jPw8ftT1ygsAIXxWAwR_sRzcHS4dBvUmbtT9LlWBW0xBQX_fjrl6XkSDrYI9uU";
    const bytes = urlBase64ToUint8Array(vapidPublicKey);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(65);
    expect(bytes[0]).toBe(0x04);
  });
});
