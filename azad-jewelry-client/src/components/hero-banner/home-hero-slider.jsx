// external
import React, { useState } from "react";
import { Navigation, Pagination, EffectFade } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
// internal
import slider_img_1 from "@assets/img/slider/slider-img-1.png";
import slider_img_2 from "@assets/img/slider/slider-img-2.png";
import slider_img_3 from "@assets/img/slider/slider-img-3.png";
import shape_1 from "@assets/img/slider/shape/slider-shape-1.png";
import shape_2 from "@assets/img/slider/shape/slider-shape-2.png";
import shape_3 from "@assets/img/slider/shape/slider-shape-3.png";
import shape_4 from "@assets/img/slider/shape/slider-shape-4.png";
import { ArrowRightLong, SliderNextBtn, SliderPrevBtn, TextShape } from "@/svg";
import { useLanguage } from "@/context/language-context";

// slider data
const sliderData = [
  {
    id: 1,
    badgeKey: "palHeroBadge1",
    titleKey: "palHeroTitle1",
    subtitle: {
      text1Key: "palHeroText1a",
      highlightKey: "palHeroText1b",
      text2Key: "palHeroText1c",
    },
    img: slider_img_1,
    green_bg: true,
  },
  {
    id: 2,
    badgeKey: "palHeroBadge2",
    titleKey: "palHeroTitle2",
    subtitle: {
      text1Key: "palHeroText2a",
      highlightKey: "palHeroText2b",
      text2Key: "palHeroText2c",
    },
    img: slider_img_2,
    green_bg: true,
  },
  {
    id: 3,
    badgeKey: "palHeroBadge3",
    titleKey: "palHeroTitle3",
    subtitle: {
      text1Key: "palHeroText3a",
      highlightKey: "palHeroText3b",
      text2Key: "palHeroText3c",
    },
    img: slider_img_3,
    is_light: true,
  },
];

function Shape({ img, num }) {
  return (
    <Image className={`tp-slider-shape-${num}`} src={img} alt="slider-shape" priority />
  );
}

const HomeHeroSlider = () => {
  const [active,setActive] = useState(false);
  const { t } = useLanguage();

  // handleActiveIndex
  const handleActiveIndex = (index) => {
    if(index === 2){
      setActive(true)
    }
    else {
      setActive(false)
    }
  }
  return (
    <>
      <section className="tp-slider-area p-relative z-index-1">
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          loop={false}
          effect="fade"
          navigation={{
            nextEl: ".tp-slider-button-next",
            prevEl: ".tp-slider-button-prev",
          }}
          onSlideChange={(swiper) => handleActiveIndex(swiper.activeIndex)}
          pagination={{ el: ".tp-slider-dot", clickable: true }}
          modules={[Navigation, Pagination, EffectFade]}
          className={`tp-slider-active tp-slider-variation swiper-container ${
            active ? "is-light" : ""
          }`}
        >
          {sliderData.map((item) => (
            <SwiperSlide
              key={item.id}
              className={`tp-slider-item tp-slider-height d-flex align-items-center ${
                item?.green_bg
                  ? "green-dark-bg"
                  : item?.is_light
                  ? "is-light"
                  : ""
              }`}
              style={{ backgroundColor: item.is_light && "#E3EDF6" }}
            >
              <div className="tp-slider-shape">
                <Shape img={shape_1} num="1" />
                <Shape img={shape_2} num="2" />
                <Shape img={shape_3} num="3" />
                <Shape img={shape_4} num="4" />
              </div>
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-xl-5 col-lg-6 col-md-6">
                    <div className="tp-slider-content p-relative z-index-1">
                      <span>{t(item.badgeKey)}</span>
                      <h3 className="tp-slider-title">{t(item.titleKey)}</h3>
                      <p>
                        {t(item.subtitle.text1Key)}
                        <span>
                          {t(item.subtitle.highlightKey)}
                          <TextShape />
                        </span>{" "}
                        {t(item.subtitle.text2Key)}
                      </p>

                      <div className="tp-slider-btn">
                        <Link href="/shop" className="tp-btn tp-btn-2 tp-btn-white">
                          {t("shopNow")}
                          {" "} <ArrowRightLong />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-7 col-lg-6 col-md-6">
                    <div className="tp-slider-thumb text-end">
                      <Image src={item.img} alt="slider-img" />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="tp-slider-arrow tp-swiper-arrow">
            <button type="button" className="tp-slider-button-prev">
              <SliderPrevBtn />
            </button>
            <button type="button" className="tp-slider-button-next">
              <SliderNextBtn />
            </button>
          </div>
          <div className="tp-slider-dot tp-swiper-dot"></div>
        </Swiper>
      </section>
    </>
  );
};

export default HomeHeroSlider;
