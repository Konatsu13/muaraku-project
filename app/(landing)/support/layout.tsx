import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Bantuan",
  description:
    "Hubungi tim MuaraKu dan pantau tiket bantuan untuk kendala akun, laporan barang, klaim, privasi, dan keamanan.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
