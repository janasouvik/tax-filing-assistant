import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: string[];
  grounded?: boolean;
}

const PRESET_QUESTIONS = [
  'How much tax do I need to pay for AY 2026–27?',
  'Why is my tax liability higher under the Old Regime?',
  'Which income sources have been consolidated?',
  'How much bank interest has been included?',
  'What should I do about the interest mismatch in AIS?',
  'How much TDS has already been deducted?',
  'How was taxable income calculated?',
  'What is Form 16 Part A and Part B?',
];

export default function TaxCopilotAIChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am your TaxPilot Statutory Copilot. I analyze your uploaded documents, income schedules, and deterministic tax engine calculations. How can I assist you with your tax return today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      grounded: true,
      citations: ['CBDT Master Circular 2025', 'Income-tax Act, 1961 / 2025'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const question = textToSend || inputText;
    if (!question.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Contextual simulated responses strictly grounded in deterministic tax rules
    setTimeout(() => {
      let reply = '';
      let citations = ['Deterministic Tax Engine'];

      const q = question.toLowerCase();
      if (q.includes('how much tax') || q.includes('pay')) {
        reply =
          'Based on your verified income schedules (Salary ₹8,00,000, Interest ₹60,000, Property ₹1,20,000, Capital Gains ₹50,000), your Gross Total Income is ₹10,30,000. Under the New Regime (Finance Act 2024 revised slabs), after standard deduction of ₹75,000, your taxable income is ₹9,55,000. Your net tax liability before TDS is calculated deterministically at ₹47,320 (including 4% Cess). After subtracting ₹28,500 TDS already paid, your net tax payable is ₹18,820.';
        citations = ['Section 115BAC', 'Form 16 TDS', 'Rule 288B'];
      } else if (q.includes('regime') || q.includes('higher') || q.includes('lower')) {
        reply =
          'The New Regime is recommended for your profile because your total Chapter VI-A deductions (₹1,85,000 under 80C and 80D) are below the mathematical breakeven threshold of ₹3,75,000. Under the New Regime you benefit from revised slabs up to ₹12 lakh and a ₹75,000 standard deduction, saving you ₹14,200 compared to the Old Regime.';
        citations = ['Regime Arbitrage Engine', 'Section 80CCE', 'Finance Act 2024'];
      } else if (q.includes('mismatch') || q.includes('ais')) {
        reply =
          'A potential mismatch of ₹2,500 was detected: your uploaded Bank Statement reports ₹12,500 in savings interest, whereas AIS/TIS records indicate ₹15,000. This requires verification. You can either confirm the AIS value, add another missing bank account statement, or submit an explanatory feedback.';
        citations = ['AIS Annual Information Statement', 'Rule 114-I', 'Validation Engine'];
      } else if (q.includes('income sources') || q.includes('consolidated')) {
        reply =
          'The following 5 income heads have been consolidated without double counting:\n1. Salary: ₹8,00,000 (Form 16)\n2. Bank Interest: ₹25,000 (Savings Accounts)\n3. FD/RD Interest: ₹35,000 (Fixed Deposit Certificates)\n4. Rental Income: ₹1,20,000 (House Property, standard 30% statutory deduction applies)\n5. Capital Gains: ₹50,000 (Listed Securities Statement)';
        citations = ['Income Consolidation Ledger', 'Section 14 Classification'];
      } else if (q.includes('tds')) {
        reply =
          'You have ₹28,500 in total TDS credited:\n- TechCorp India Ltd (TAN: BLRT12345A): ₹25,000 under Section 192\n- State Bank of India (TAN: BLRS54321B): ₹3,500 under Section 194A\nBoth entries match Form 26AS records with 100% cryptographic confidence.';
        citations = ['Form 26AS', 'Section 199 TDS Credit Rules'];
      } else if (q.includes('form 16')) {
        reply =
          'Form 16 is a certificate issued by employers under Section 203 of the Income-tax Act. Part A contains employer TAN, employee PAN, and tax deposited with the government quarterly. Part B contains gross salary breakdown, allowances exempted under Section 10, Chapter VI-A deductions, and net taxable salary.';
        citations = ['CBDT Rule 31(1)(a)', 'Form 16 Schema'];
      } else {
        reply =
          'I have analyzed your query against the statutory provisions of the Income-tax Act and your uploaded financial records. Every calculation in TaxPilot is executed deterministically by certified statutory engines, while I explain provisions, verify deductions, and highlight compliance checks.';
        citations = ['Deterministic Rulebook AY 2026-27'];
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounded: true,
        citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      <Navbar />
      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-outline-variant/60 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">smart_toy</span>
                <h1 className="text-2xl font-serif font-bold text-on-surface">Tax Copilot AI Assistant</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary/10 text-primary border border-primary/20">
                  Grounded & Deterministic
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">
                Context-aware conversational assistance grounded in statutory tax codes and your verified financial documents.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/50">
              <span className="material-symbols-outlined text-emerald-500 text-[16px]">verified</span>
              <span>Zero Hallucination Tax Guarantee</span>
            </div>
          </div>

          {/* Quick preset questions */}
          <div className="py-3 flex gap-2 overflow-x-auto no-scrollbar">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-3 py-1 text-xs rounded-full bg-surface-container border border-outline-variant/60 text-on-surface hover:bg-primary/10 hover:border-primary/30 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-xl p-4 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-xs'
                      : 'bg-surface-container border border-outline-variant/60 text-on-surface rounded-bl-xs'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-outline-variant/30 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-primary">menu_book</span>
                        Statutory Citations:
                      </span>
                      {msg.citations.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-surface px-1.5 py-0.5 rounded border border-outline-variant/50 text-secondary font-mono"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-white/70' : 'text-on-surface-variant'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                </div>
                <div className="bg-surface-container border border-outline-variant/60 px-4 py-2.5 rounded-xl rounded-bl-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-on-surface-variant ml-1 font-mono">Consulting statutory rules...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="pt-3 border-t border-outline-variant/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about tax slabs, deductions, mismatches, or calculation steps..."
                className="flex-1 bg-surface-container border border-outline-variant/80 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
