import HomeInput from "@/components/home/HomeInput";
import EntranceCard from "@/components/home/EntranceCard";
import { entranceCards } from "@/constants/entranceCards";
// import ConnectionStatus from "@/components/home/ConnectionStatus";

export default function HomePage() {
  return (
    <div className="flex h-full w-full flex-col items-center overflow-hidden transition-colors duration-500">
      <main className="mb-14 flex w-full max-w-md flex-1 flex-col items-center p-5">
        {/* <ConnectionStatus /> */}
        <HomeInput />
        <div className="mb-4 mt-8 w-full max-w-md text-left">
          <div className="inline-block rounded-full bg-[#7a695c] px-3 py-1 text-[10px] font-medium text-white">
            Editor&apos;s pick
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {entranceCards.map((card, index) => (
            <EntranceCard
              key={index}
              title={card.title}
              category={card.category}
              agent={card.agent}
              imageUrl={card.imageUrl}
              userMessage={card.userMessage}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
