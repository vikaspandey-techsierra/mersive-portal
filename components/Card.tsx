import Image from "next/image";

export default function Card({
  title,
  children,
  icon
}: {
  title: string;
  children: React.ReactNode;
  icon: string
}) {
  return (
    <div className=" bg-white border border-[#E2E1E8] rounded-xl p-6 text-[#090814] flex flex-col justify-center items-center">
      <div className="flex items-center gap-2 w-full" >
        <Image src={icon} width={24} height={24} alt="Card Icon" className="mb-4" />
      <h3 className="font-semibold text-[16px] mb-4 text-[#090814]">{title}</h3>
      </div>
      {children}
    </div>
  );
}
