import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSalesReply } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const auth = await getActiveWorkspace();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { conversationId } = await req.json();
    const ws = await prisma.workspace.findUnique({ where: { id: auth.workspace.id }, include: { products: true, knowledgeBase: true } });
    const conv = await prisma.conversation.findFirst({ where: { id: conversationId, workspaceId: auth.workspace.id }, include: { messages: { orderBy: { createdAt: 'asc' } } } });
    if (!ws || !conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const kbText = ws.knowledgeBase.map(k => `${k.question}: ${k.answer}`).join("\n");
    const prodText = ws.products.map(p => `${p.name}: Regular ${p.price} BDT, Discount ${p.discountPrice || p.price} BDT, Stock: ${p.stockQuantity}`).join("\n");
    const history = conv.messages.map(m => ({ sender: m.senderType, content: m.content }));

    const result = await generateSalesReply(history, { storeName: ws.name, knowledgeBase: kbText, products: prodText });
    await prisma.aIUsage.create({ data: { workspaceId: ws.id, modelConfig: "gemini-2.5-flash" } });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}