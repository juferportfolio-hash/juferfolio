import type { Metadata } from "next";
import "@fontsource/archivo/300.css";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "./globals.css";
import Frame from "@/components/Frame";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Júlia Ferreira — Portfolio",
  description:
    "Júlia Ferreira is a experienced and talented illustrator and designer based in Rio de Janeiro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/pok1buc.css" />
      </head>
      <body className="h-full bg-bg text-ink font-archivo">
        <div className="fixed inset-3 flex flex-col">
          <Header />
          <Frame>{children}</Frame>
        </div>
      </body>
    </html>
  );
}
