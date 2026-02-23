import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon} from "lucide-react";
import HelpIcon from "@/components/icons/help.svg";
import FeedIcon from "@/components/icons/feed.svg";
import Image from "next/image";

interface ReleaseNote {
  version: string;
  date: string;
  bullets: string[];
}

interface FaqItem {
  question: string;
  answer?: string;
}

const UpdatesSection = ({
  release,
  faqs,
}: {
  release: ReleaseNote;
  faqs: FaqItem[];
}) => {
  const [open, setOpen] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  return (
    <div className="px-8 text-[#090814]">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-2xl font-medium">Updates</span>
        <span className="text-gray-400">
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Updates */}
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                <Image src={FeedIcon} alt="Feed icon" width={24} height={24} />
              </span>
              <span className="text-[16px] font-semibold ">
                Latest Updates
              </span>
            </div>
           <div className="my-6">
             <div className="text-[16px] font-semibold ">
              {release.version}
            </div>
            <div className="text-[11px] text-[#93949C]  mt-0.5 mb-4">
              {release.date}
            </div>
            <ul className="">
              {release.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px] "
                >
                  <span className="mt-2 w-1 h-1 rounded-full bg-[#090814] shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
           </div>
            <button className="mt-5 flex items-center gap-1 text-[11px] text-[#5E54C5] font-medium">
              See all release notes <ExternalLinkIcon size={12} />
            </button>
          </div>

          {/* FAQ */}
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500">
                <Image src={HelpIcon} alt="Help icon" width={24} height={24} />
              </span>
              <span className="text-[16px] ">
                Frequently Asked Questions
              </span>
            </div>
            <div className="">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    className="w-full flex items-center justify-between text-[13px] transition-colors text-left gap-2.5"
                    onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                  >
                    <span>{faq.question}</span>
                    <span className=" font-light text-[16px] shrink-0">
                      {openFaqIdx === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaqIdx === i && (
                    <div className=" text-[13px] pl-1">
                      {faq.answer ??
                        "Answer content will appear here once available from the API."}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdatesSection;