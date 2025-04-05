import HomeInput from "@/components/home/client-components/HomeInput";

export default function HomePage() {
  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden transition-colors duration-500">
      <main className="flex-1 w-full max-w-md flex flex-col items-center p-5 mb-14">
        <div className="w-full text-center my-8">
          <p className="text-[#302f2a] text-lg leading-7">
            워커힐을 즐기는 <br />
            <span className="font-bold">다양한 가이드를 만나보세요</span>
          </p>
        </div>
        <HomeInput />
      </main>
    </div>
  );
}
