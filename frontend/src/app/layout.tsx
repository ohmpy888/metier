import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import SparklesBackground from "../components/SparklesBackground";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "Metier Blog | แพลตฟอร์มแบ่งปันเรื่องราวที่ดีที่สุด",
  description: "อ่านและแชร์เรื่องราวความรู้ ประสบการณ์ และมุมมองใหม่ๆ ได้ที่นี่",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={promptFont.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SparklesBackground />
        {children}
      </body>
    </html>
  );

}


