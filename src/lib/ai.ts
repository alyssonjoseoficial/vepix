import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function generateProductDescription(input: {
  name: string;
  category?: string;
  price?: number;
  storeName?: string;
}) {
  if (!process.env.GEMINI_API_KEY) {
    return `ERRO: A variável GEMINI_API_KEY não foi encontrada pelo sistema. Você tem certeza que reiniciou o servidor no terminal fechando (Ctrl+C) e rodando "npm run dev" de novo?`;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Você é um copywriter de e-commerce brasileiro. Escreva uma descrição persuasiva, moderna e objetiva (máximo 120 palavras) para o produto abaixo. Use tom profissional e focado em benefícios. Não use markdown.

Produto: ${input.name}
Categoria: ${input.category ?? "Geral"}
Preço: ${input.price ? `R$ ${input.price.toFixed(2)}` : "não informado"}
Loja: ${input.storeName ?? "Loja online"}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e: any) {
    console.error("Erro na geração Gemini:", e);
    return `ERRO DA API DO GOOGLE: ${e.message || String(e)}. Verifique se a sua chave é válida e tente novamente.`;
  }
}

export async function getRecommendedProducts(
  products: { id: string; name: string; description: string }[],
  userContext?: string
) {
  if (!genAI || products.length === 0) {
    // Fallback genérico: embaralha e pega 4
    return products.map(p => p.id).sort(() => 0.5 - Math.random()).slice(0, 4);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const catalog = products.map(p => `ID: ${p.id} | Nome: ${p.name} | Desc: ${p.description.substring(0, 50)}`).join('\n');
  
  const prompt = `Você é um avançado algoritmo de recomendação de e-commerce estilo streaming.
Sua missão é selecionar os 4 produtos mais interessantes e atrativos do catálogo abaixo para mostrar na vitrine principal.
${userContext ? `O usuário demonstrou interesse recente em: "${userContext}". Priorize itens relacionados a isso, mas mantenha variedade.` : 'Selecione produtos que tenham alto apelo geral e formem uma vitrine variada e interessante.'}

Catálogo de Produtos:
${catalog}

Retorne ÚNICA e EXCLUSIVAMENTE um array JSON contendo os 4 IDs selecionados. Exemplo: ["id1", "id2", "id3", "id4"]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Extrai o JSON da resposta
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      const ids = JSON.parse(jsonMatch[0]);
      if (Array.isArray(ids)) return ids;
    }
  } catch (e) {
    // Silencia o erro no terminal para não travar a tela do Next.js no modo dev
    // console.error("Erro na recomendação IA:", e);
  }

  // Fallback em caso de erro na IA
  return products.map(p => p.id).sort(() => 0.5 - Math.random()).slice(0, 4);
}
