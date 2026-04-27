import type { Metadata } from "next";
import "./globals.css";
import Background from "./Background";
import Menu from "./Menu";
import { Cormorant_Infant } from "next/font/google";
import CanvasDust from "./CanvasDust";
import { NextIntlClientProvider } from "next-intl";
import Translation from "./Translation";
import { getMessages, getTranslations } from "next-intl/server";
import Loading from "./Loading";
import Scroll from "./Scroll";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const baseUrl = "https://afes-portfolio.vercel.app";

  return {
    metadataBase: new URL(baseUrl),
    title: t("title"),
    description: t("description"),
    keywords: [
      "Sytnikov Afes Igor",
      "Creative Developer",
      "Frontend",
      "Backend",
      "React",
      "Next.js",
      "PixiJS",
      "Fullstack",
      "Kyiv",
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ua: "/ua",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      siteName: "Sytnikov Afes Igor Portfolio",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
      locale: locale === "ua" ? "uk_UA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const cormorant = Cormorant_Infant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${cormorant.variable}`}>
        <Loading />
        <NextIntlClientProvider messages={messages}>
          <Background />
          <CanvasDust />
          <Menu />
          <Translation />
          <div className="mt-[140px]">
            <Scroll>{children}</Scroll>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
