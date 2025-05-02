"use client"


// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import useSWR from "swr"
import { Spinner } from "flowbite-react"
import { Icon } from "@iconify/react/dist/iconify.js"
import CardBox from '@/app/components/shared/CardBox';
const fether = (url: string) => fetch(url).then((res) => res.json());
const TopCards = () => {
    const { data , isLoading, error } = useSWR("/api/count/forStudent", fether);
if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }
      const TopCardInfo = [
        {
            key:"card1",
            title:"จำนวนวันฝึกงาน/สัปดาห์",
            desc: data.countDay,
            img: "tabler:calendar",
            bgcolor:"bg-lightwarning dark:bg-lightwarning ",
            textclr:"text-warning dark:text-warning"
        },
        {
            key:"card2",
            title:"จำนวนที่รายงานผล",
            desc: data.report,
            img: "tabler:file-description",
            bgcolor:"bg-lightprimary dark:bg-lightprimary ",
            textclr:"text-primary dark:text-primary"
        },
        {
            key:"card3",
            title:"จำนวนสัปดาห์ที่ฝึกงาน",
            desc: data.weekterm,
            img: "tabler:calendar-stats",
            bgcolor:"bg-lightsuccess dark:bg-lightsuccess",
            textclr:"text-success dark:text-success"
        },
        
    ]


    return (
        <>
          <div>
          <Swiper
        slidesPerView={3}
        spaceBetween={24}
        loop={true}
        dir="ltr"
        grabCursor={true}
        breakpoints={{
            0 : {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 14,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 18,
            },
            1030: {
              slidesPerView: 3,
              spaceBetween: 18,
            },
            1200: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
        pagination={{
          clickable: true,
        }}
        className="mySwiper"
      >
     {
        TopCardInfo.map((item)=>{
            return(
                <SwiperSlide key={item.key} >
                <CardBox className={`shadow-none ${item.bgcolor} w-full`}>
                    <div className="text-center">
                        <div className="flex justify-center">
                            <Icon icon={item.img} height={50} />
                        </div>
                        <p className={`font-semibold ${item.textclr} mb-1`}>
                            {item.title}
                        </p>
                        <h5 className={`text-lg font-semibold ${item.textclr} mb-0`}>{item.desc}</h5>
                    </div>
                </CardBox>
                </SwiperSlide>
            )
        })
     }

      </Swiper>
          </div>
        </>
    )
}
export { TopCards }