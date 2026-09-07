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

        {/* Botão Flutuante de WhatsApp Oficial Kiron Tech */}
        <a
          href="https://wa.me/5579996781719?text=Ol%C3%A1!%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20VePix%20para%20minha%20loja%20virtual."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl shadow-green-500/30 transition-all hover:scale-110 hover:shadow-green-500/50 focus:outline-none"
          title="Falar no WhatsApp: (79) 99678-1719"
          aria-label="Atendimento via WhatsApp: (79) 99678-1719"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      </body>
    </html>
  );
}
