const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const secretKey = 'c728df1b2ec73affb68ffdac90016cd0debe8d23dc657814d84a594004e9f7c1';
    
    // Generate token like PHP does
    const header = JSON.stringify({ typ: 'JWT', alg: 'HS256' });
    const payload = JSON.stringify({
        user_id: 1,
        user_name: 'Super Admin',
        system_id: 6,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 
    });
    
    const base64UrlHeader = Buffer.from(header).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const base64UrlPayload = Buffer.from(payload).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const signature = crypto.createHmac('sha256', secretKey).update(`${base64UrlHeader}.${base64UrlPayload}`).digest('base64');
    const base64UrlSignature = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const tokenStr = `${base64UrlHeader}.${base64UrlPayload}.${base64UrlSignature}`;
    console.log("Token gerado:");
    
    // Agora valida como o auth.ts
    const parts = tokenStr.split('.');
    const [h, p, s] = parts;
    const expectedSig = crypto.createHmac('sha256', secretKey)
                              .update(`${h}.${p}`)
                              .digest('base64url');
                              
    console.log("Expected Sig:", expectedSig);
    console.log("Received Sig:", s);
    if (expectedSig !== s) console.log("ERRO: Assinatura não bate!");
    else console.log("OK: Assinatura bate.");
    
    try {
        const decodedPayload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
        console.log("Decoded Payload:", decodedPayload);
    } catch(e) {
        console.log("ERRO ao decodificar payload:", e.message);
    }
    
    const user = await prisma.user.findFirst({
        where: { role: 'PLATFORM_ADMIN' }
    });
    console.log("Usuário ADMIN encontrado:", user ? user.email : "NENHUM");
}
test().finally(() => prisma.$disconnect());
