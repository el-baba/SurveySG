"use client";

export type Message = {
  role: "user" | "assistant";
  text: string;
  personaCount?: number;
  error?: boolean;
};

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed bg-blue-600/90 text-white backdrop-blur-sm">
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="flex justify-start gap-3">
        <AssistantAvatar />
        <div className="max-w-[85%] text-sm leading-relaxed">
          <p className="text-red-400">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3">
      <AssistantAvatar />
      <div className="max-w-[85%] text-sm leading-relaxed">
        {message.personaCount != null && message.personaCount > 0 && (
          <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-white/8 border border-white/10">
            {message.personaCount} personas
          </span>
        )}
        <p className="text-slate-200 whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div
      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
      style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
    >
      SG
    </div>
  );
}
