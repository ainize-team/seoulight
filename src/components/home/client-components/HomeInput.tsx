"use client";

import UpArrowIcon from "@/icons/UpArrowIcon";
import { useForm } from "react-hook-form";

interface FormValues {
  message: string;
}

export default function HomeInput() {
  const { register, handleSubmit, watch } = useForm<FormValues>();
  const message = watch("message") || "";

  const onSubmit = (data: FormValues) => {
    console.log(data.message);
  };

  return (
    <div className="w-full">
      <div className="relative bg-white rounded-[10px] border border-[#dfdfdf] h-[104px] overflow-hidden">
        <input
          type="text"
          className="absolute inset-0 w-full h-full pl-4 pr-12 pt-2 pb-3 text-[15px] text-[#302f2a] outline-none placeholder:text-[#8c8c8c] placeholder:font-normal"
          placeholder="무엇이든 물어보세요."
          {...register("message")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(onSubmit)();
            }
          }}
        />
        <button
          className={`absolute top-1/2 right-3 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full border border-transparent ${
            message.trim() ? "bg-[#363534] hover:bg-gray-800" : "bg-[#e8e7e6] text-gray-500"
          }`}
          onClick={handleSubmit(onSubmit)}>
          {message.trim() ? <UpArrowIcon color="#FFF" /> : <UpArrowIcon color="#2F333B" />}
        </button>
      </div>
    </div>
  );
}
