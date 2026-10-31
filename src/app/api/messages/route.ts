import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const auth = await getActiveWorkspace();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId, content, senderType } = await req.json();
  const [msg] = await prisma.$transaction([
    prisma.message.create({ data: { conversationId, content, senderType: senderType || "Agent" } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })
  ]);
  return NextResponse.json(msg);
}