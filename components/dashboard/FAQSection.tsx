"use client";

import { useState } from "react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id}>
            <button
              className="w-full text-left font-medium"
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            >
              {faq.question}
            </button>

            {openId === faq.id && (
              <div className="text-sm text-gray-500 mt-1">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
