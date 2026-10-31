import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: "admin@demo.com" } });
    if (existing) return NextResponse.json({ message: "Demo account already exists! Click Sign In below." });

    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: { email: "admin@demo.com", passwordHash, name: "Demo Admin" }
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: "Dhaka Gadget Store (Demo)",
        memberships: { create: { userId: user.id, role: "OWNER" } }
      }
    });

    await prisma.product.createMany({
      data: [
        { workspaceId: workspace.id, name: "ANC Wireless Earbuds Pro", sku: "EAR-01", price: 2500, discountPrice: 2200, stockQuantity: 15, description: "Active Noise Cancellation, 24h battery" },
        { workspaceId: workspace.id, name: "Smart Watch Series 8", sku: "WTC-08", price: 3200, stockQuantity: 10, description: "AMOLED display, IP68 waterproof" }
      ]
    });

    await prisma.knowledgeBaseEntry.create({
      data: { workspaceId: workspace.id, type: "Policy", question: "Delivery Charge", answer: "Inside Dhaka 60 BDT (24-48h). Outside Dhaka 120 BDT (3-5 days)." }
    });

    const customer = await prisma.customer.create({
      data: { workspaceId: workspace.id, name: "Rahim Uddin (Demo)", phone: "01711-000000", leadStatus: "Qualified" }
    });

    await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        customerId: customer.id,
        channel: "Demo",
        status: "Open",
        messages: {
          create: [
            { senderType: "Customer", content: "Bhaiya, ANC Wireless Earbuds Pro er dam koto? Dhakay delivery charge koto?" }
          ]
        }
      }
    });

    return NextResponse.json({ message: "✅ Demo Workspace & Data Created! Now click Sign In." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Database error" }, { status: 500 });
  }
}