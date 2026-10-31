import { getActiveWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InboxClient from "./InboxClient";

export default async function InboxPage() {
  const auth = await getActiveWorkspace();
  if (!auth) redirect("/login");
  const conversations = await prisma.conversation.findMany({
    where: { workspaceId: auth.workspace.id },
    include: { customer: true, messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' }
  });
  const products = await prisma.product.findMany({ where: { workspaceId: auth.workspace.id } });
  return <InboxClient initialConversations={conversations} products={products} storeName={auth.workspace.name} />;
}