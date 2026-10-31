"use client";
import { useState } from "react";

export default function InboxClient({ initialConversations, products, storeName }: any) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id || null);
  const [replyText, setReplyText] = useState("");
  const [simText, setSimText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const activeConv = conversations.find((c: any) => c.id === activeId);

  const sendMsg = async (content: string, senderType: string) => {
    if (!content.trim() || !activeId) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, content, senderType })
    });
    const saved = await res.json();
    setConversations((prev: any) => prev.map((c: any) => c.id === activeId ? { ...c, messages: [...c.messages, saved] } : c));
    if (senderType === "Agent") setReplyText("");
    else setSimText("");
  };

  const generateAI = async () => {
    if (!activeId) return;
    setLoadingAI(true);
    const res = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId })
    });
    const data = await res.json();
    setReplyText(data.reply || data.error || "Check GEMINI_API_KEY in Vercel settings");
    setLoadingAI(false);
  };

  return (
    <div className="flex h-screen w-full divide-x bg-white text-sm">
      <div className="w-72 flex flex-col">
        <div className="p-4 border-b font-bold text-indigo-600">{storeName}</div>
        <div className="flex-1 overflow-y-auto divide-y">
          {conversations.map((c: any) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full text-left p-4 hover:bg-slate-50 ${activeId === c.id ? 'bg-indigo-50' : ''}`}>
              <div className="font-semibold text-slate-900">{c.customer.name}</div>
              <div className="text-xs text-slate-500 truncate">{c.messages[c.messages.length - 1]?.content}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        {activeConv && (
          <>
            <div className="p-3 bg-amber-50 border-b flex gap-2">
              <input value={simText} onChange={e => setSimText(e.target.value)} placeholder="Simulate customer message (Bangla/Banglish/English)..." className="flex-1 border rounded px-3 py-1.5 text-xs bg-white" />
              <button onClick={() => sendMsg(simText, "Customer")} className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold">Receive Demo Msg</button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {activeConv.messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.senderType === 'Agent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-xl px-4 py-2 ${m.senderType === 'Agent' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-800'}`}>
                    <div className="text-[10px] opacity-70">{m.senderType}</div>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t space-y-2">
              <button onClick={generateAI} disabled={loadingAI} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                {loadingAI ? "Gemini Thinking..." : "✨ Generate Gemini AI Reply"}
              </button>
              <div className="flex gap-2">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 border rounded-lg p-2 text-sm h-16" placeholder="Review AI reply and send..." />
                <button onClick={() => sendMsg(replyText, "Agent")} className="bg-indigo-600 text-white px-5 rounded-lg font-bold">Send</button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-72 p-4 bg-white space-y-4">
        <h3 className="font-bold border-b pb-2 text-slate-900">Active Catalog (BDT)</h3>
        {products.map((p: any) => (
          <div key={p.id} className="text-xs border rounded p-2">
            <div className="font-semibold text-slate-900">{p.name}</div>
            <div className="text-emerald-600 font-bold">{p.discountPrice || p.price} BDT (Stock: {p.stockQuantity})</div>
          </div>
        ))}
      </div>
    </div>
  );
}