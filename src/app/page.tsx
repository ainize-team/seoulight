import HomeInput from "@/components/home/client-components/HomeInput";

export default function HomePage() {
  return (
    <div className="flex h-full w-full flex-col items-center overflow-hidden transition-colors duration-500">
      <main className="mb-14 flex w-full max-w-md flex-1 flex-col items-center p-5">
        <div className="my-8 w-full text-center">
          <p className="text-lg leading-7 text-[#302f2a]">
            워커힐을 즐기는 <br />
            <span className="font-bold">다양한 가이드를 만나보세요</span>
          </p>
        </div>
        <HomeInput />
      </main>
    </div>
  );
}
