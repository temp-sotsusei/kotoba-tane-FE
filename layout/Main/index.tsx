"use client";

import DoneMark from "@/components/icon/DoneMark";
import { CircleQuestionMark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import Calendar from "react-calendar";
import { Swiper, SwiperSlide } from "swiper/react";
import { APP_TITLE } from "@/const";

import "swiper/css";
import "react-calendar/dist/Calendar.css";

type CalenderStoryItem = {
  image: string;
  title: string;
};
type CalenderStoryDataStrict = Record<string, CalenderStoryItem[]>;

type Props = {
  calenderStoryData: CalenderStoryDataStrict;
};

const Main: FC<Props> = ({ calenderStoryData }) => {
  const calenderStoryDataKeys = Object.keys(calenderStoryData);
  const calenderStoryDataEntries = Object.entries(calenderStoryData);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const findEntries = calenderStoryDataEntries.find(
    (data) => data[0] === selectedDay
  );
  return (
    <div className="bg-[url('/images/background.jpg')] h-dvh flex flex-col overflow-hidden">
      <header 
        className="relative flex items-center justify-end w-full pt-6 pb-3 bg-[#C1ED86] border-b-2 border-[#93C400] shadow-md px-4"
      >
        
        <h1
          className="absolute left-1/2 transform -translate-x-1/2"
        >
          <Image
            src={"/images/icon.png"}
            alt="ロゴ"
            width={96}
            height={16}
            priority
          />
        </h1>

        <button className="h-fit px-2 py-1 bg-[#FF8258] text-white font-bold border-2 border-white text-sm rounded-md z-10">
          つかいかた！
        </button>
        
      </header>

      
    </div>
  );
};

export default Main;
