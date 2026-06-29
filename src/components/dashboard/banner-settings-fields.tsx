"use client";

import { useState } from "react";
import { Label } from "@/components/ui/input";
import { Input } from "@/components/ui/input";


export function BannerSettingsFields({ settings }: { settings: any }) {
  const [b1Mode, setB1Mode] = useState(settings?.banner1Mode ?? "DYNAMIC");
  const [b2Mode, setB2Mode] = useState(settings?.banner2Mode ?? "DYNAMIC");

  return (
    <>
      {/* Banner 1 */}
      <div className="grid gap-4 sm:grid-cols-2 bg-orange-50 p-4 rounded-xl border border-orange-200 mt-4">
        <div className="col-span-2 flex justify-between items-center">
          <h3 className="font-bold text-orange-800">Banner Superior (Ex: Frete Grátis / Cupom)</h3>
          <div className="w-48">
            <input type="hidden" name="banner1Mode" value={b1Mode} />
            <select 
              value={b1Mode} 
              onChange={(e) => setB1Mode(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-orange-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="DYNAMIC">Textos e Cores</option>
              <option value="IMAGE">Imagem Fixa</option>
            </select>
          </div>
        </div>

        {b1Mode === "DYNAMIC" ? (
          <>
            <div>
              <Label htmlFor="banner1Tag">Tag (Etiqueta)</Label>
              <Input id="banner1Tag" name="banner1Tag" defaultValue={settings?.banner1Tag ?? "CUPONS"} />
            </div>
            <div>
              <Label htmlFor="banner1Color">Cor do Fundo</Label>
              <Input 
                id="banner1Color" 
                name="banner1Color" 
                type="color" 
                defaultValue={settings?.banner1Color?.startsWith('#') ? settings.banner1Color : "#ea580c"} 
              />
            </div>
            <div>
              <Label htmlFor="banner1Title">Título Principal</Label>
              <Input id="banner1Title" name="banner1Title" defaultValue={settings?.banner1Title ?? "Frete Grátis"} />
            </div>
            <div>
              <Label htmlFor="banner1Subtitle">Subtítulo</Label>
              <Input id="banner1Subtitle" name="banner1Subtitle" defaultValue={settings?.banner1Subtitle ?? "Confira condições"} />
            </div>
          </>
        ) : (
          <div className="col-span-2">
            <Label htmlFor="banner1Image">Enviar Imagem do Banner 1</Label>
            <div className="mt-2 flex items-center gap-4">
              {settings?.banner1ImageUrl && (
                <img src={settings.banner1ImageUrl} alt="Banner 1" className="h-16 w-32 rounded-md object-cover border border-orange-300" />
              )}
              <Input id="banner1Image" name="banner1Image" type="file" accept="image/*" className="max-w-xs bg-white" />
            </div>
            <p className="mt-1 text-xs text-orange-600">
              Tamanho recomendado: <strong>600x200 pixels</strong> (Proporção horizontal 3:1). Se enviada, a imagem substituirá os textos e cores do banner.
            </p>
          </div>
        )}
      </div>

      {/* Banner 2 */}
      <div className="grid gap-4 sm:grid-cols-2 bg-slate-800 p-4 rounded-xl border border-slate-700 mt-4 text-white">
        <div className="col-span-2 flex justify-between items-center">
          <h3 className="font-bold text-white">Banner Inferior (Ex: Novidades / Cashback)</h3>
          <div className="w-48 text-black">
            <input type="hidden" name="banner2Mode" value={b2Mode} />
            <select 
              value={b2Mode} 
              onChange={(e) => setB2Mode(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="DYNAMIC">Textos e Cores</option>
              <option value="IMAGE">Imagem Fixa</option>
            </select>
          </div>
        </div>

        {b2Mode === "DYNAMIC" ? (
          <>
            <div>
              <Label htmlFor="banner2Tag" className="text-slate-300">Tag (Etiqueta)</Label>
              <Input id="banner2Tag" name="banner2Tag" className="text-black" defaultValue={settings?.banner2Tag ?? "NOVIDADE"} />
            </div>
            <div>
              <Label htmlFor="banner2Color" className="text-slate-300">Cor do Fundo</Label>
              <Input 
                id="banner2Color" 
                name="banner2Color" 
                type="color" 
                className="text-black" 
                defaultValue={settings?.banner2Color?.startsWith('#') ? settings.banner2Color : "#0f172a"} 
              />
            </div>
            <div>
              <Label htmlFor="banner2Title" className="text-slate-300">Título Principal</Label>
              <Input id="banner2Title" name="banner2Title" className="text-black" defaultValue={settings?.banner2Title ?? "Cashback"} />
            </div>
            <div>
              <Label htmlFor="banner2Subtitle" className="text-slate-300">Subtítulo</Label>
              <Input id="banner2Subtitle" name="banner2Subtitle" className="text-black" defaultValue={settings?.banner2Subtitle ?? "Em todas as compras"} />
            </div>
          </>
        ) : (
          <div className="col-span-2">
            <Label htmlFor="banner2Image" className="text-slate-300">Enviar Imagem do Banner 2</Label>
            <div className="mt-2 flex items-center gap-4">
              {settings?.banner2ImageUrl && (
                <img src={settings.banner2ImageUrl} alt="Banner 2" className="h-16 w-32 rounded-md object-cover border border-slate-600" />
              )}
              <Input id="banner2Image" name="banner2Image" type="file" accept="image/*" className="max-w-xs text-black bg-slate-100" />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Tamanho recomendado: <strong>600x200 pixels</strong> (Proporção horizontal 3:1). Se enviada, a imagem substituirá os textos e cores do banner.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
