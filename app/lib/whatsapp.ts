export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let clean = phone.replace(/\D/g, "");
  
  // If starts with 0, convert to 62
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  }
  
  // Ensure it starts with 62
  if (!clean.startsWith("62")) {
    clean = "62" + clean;
  }
  
  return clean;
}

export function isValidIndonesianPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Indonesian mobile numbers start with 628 and are 10-14 digits long
  const regex = /^628[1-9][0-9]{7,11}$/;
  return regex.test(normalized);
}

export async function sendWhatsAppOTP(phone: string, otpCode: string): Promise<{ success: boolean; provider: string; error?: string }> {
  const normalized = normalizePhoneNumber(phone);
  
  if (!isValidIndonesianPhoneNumber(phone)) {
    return { success: false, provider: "none", error: "Nomor WhatsApp tidak valid. Gunakan format nomor Indonesia (e.g., 0812xxxxxxxx)." };
  }

  const message = `[SummitPass] Kode OTP Anda adalah: ${otpCode}. Kode ini berlaku selama 5 menit. Harap jangan membagikan kode ini kepada siapapun demi keamanan akun Anda.`;

  // 1. Fonnte Provider Integration
  const fonnteToken = process.env.FONNTE_TOKEN;
  if (fonnteToken) {
    try {
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: fonnteToken,
        },
        body: new URLSearchParams({
          target: normalized,
          message: message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === true) {
        return { success: true, provider: "Fonnte" };
      }
      return { success: false, provider: "Fonnte", error: data.reason || "Fonnte API returned failure." };
    } catch (e: any) {
      return { success: false, provider: "Fonnte", error: e.message || "Failed to connect to Fonnte." };
    }
  }

  // 2. Mock Fallback for Local Development / MVP Demo
  console.log("==============================================");
  console.log(`[WHATSAPP MOCK SENDER]`);
  console.log(`Tujuan: ${normalized}`);
  console.log(`Pesan: ${message}`);
  console.log("==============================================");
  return { success: true, provider: "Mock (Development)" };
}
