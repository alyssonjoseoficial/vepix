import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vepix.com.br"),
  title: "VePix | Crie sua Loja Virtual com IA e 0% de Taxas por Venda",
  description: "Tenha sua loja virtual no ar em minutos: gerador de descrições persuasivas com IA Gemini, vitrine inteligente, checkout Pix transparente e ZERO comissão sobre seu faturamento.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://vepix.com.br",
    title: "VePix - A Loja Virtual com IA e 0% de Comissão por Venda",
    description: "Pare de perder até 5% das suas vendas em taxas. Tenha loja virtual com inteligência artificial nativa e mensalidade fixa.",
    siteName: "VePix - Ecossistema Kiron Tech",
    images: [
      {
        url: "/vepix_logo_LP.png",
        width: 1200,
        height: 630,
        alt: "VePix Loja Virtual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VePix - Loja Virtual com IA e Zero Comissão",
    description: "Plataforma completa de e-commerce sem cobrança de comissão por venda.",
    images: ["/vepix_logo_LP.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <head>
        {/* Google Tag Manager */}
        <Script id="kiron-gtm-vepix" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.KIRON_TRACKING = { system: 'vepix', domain: 'vepix.com.br' };
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', window.KIRON_GTM_ID || 'GTM-KIRONTECH');
          `}
        </Script>
      </head>
      <body className="min-h-full font-sans antialiased">
        {/* GTM Noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KIRONTECH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
