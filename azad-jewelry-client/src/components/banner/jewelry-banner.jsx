import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Navigation, Pagination } from 'swiper';
// internal
import slider_img_1 from '@assets/img/slider/4/slider-1.png';
import slider_img_2 from '@assets/img/slider/4/slider-2.png';
import slider_img_3 from '@assets/img/slider/4/slider-3.png';
import slider_img_4 from '@assets/img/slider/4/slider-4.png';
// nav icon
import nav_icon_1 from '@assets/img/slider/4/nav/icon-1.png';
import nav_icon_2 from '@assets/img/slider/4/nav/icon-2.png';
import nav_icon_3 from '@assets/img/slider/4/nav/icon-3.png';
import nav_icon_4 from '@assets/img/slider/4/nav/icon-4.png';
import { ArrowRightLong, SliderNextBtn, SliderPrevBtn } from '@/svg';
import { useLanguage } from '@/context/language-context';

// slider data 
const slider_data = [
  { subtitleKey: "jewelryHeroSlide1Subtitle", titleKey: "jewelryHeroSlide1Title", img: slider_img_1 },
  { subtitleKey: "jewelryHeroSlide2Subtitle", titleKey: "jewelryHeroSlide2Title", img: slider_img_2 },
  { subtitleKey: "jewelryHeroSlide3Subtitle", titleKey: "jewelryHeroSlide3Title", img: slider_img_3 },
  { subtitleKey: "jewelryHeroSlide4Subtitle", titleKey: "jewelryHeroSlide4Title", img: slider_img_4 },
]

// slider nav data
const slider_nav_data = [
  { icon: nav_icon_1, line1Key: "jewelryNav1Line1", line2Key: "jewelryNav1Line2" },
  { icon: nav_icon_2, line1Key: "jewelryNav2Line1", line2Key: "jewelryNav2Line2" },
  { icon: nav_icon_3, line1Key: "jewelryNav3Line1", line2Key: "jewelryNav3Line2" },
  { icon: nav_icon_4, line1Key: "jewelryNav4Line1", line2Key: "jewelryNav4Line2" },
]

const JewelryBanner = () => {
  const { t } = useLanguage();
  return (
    <>
      <section className="tp-slider-area p-relative z-index-1" style={{ paddingTop: 90 }}>
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          loop
          effect="fade"
          navigation={{
            nextEl: ".tp-slider-button-next",
            prevEl: ".tp-slider-button-prev",
          }}
          pagination={{ el: ".tp-slider-dot", clickable: true }}
          modules={[Navigation, Pagination, EffectFade]}
          className="tp-slider-active tp-slider-variation swiper-container"
        >
          {slider_data.map((item, i) => (
            <SwiperSlide
              key={i}
              className="tp-slider-item tp-slider-height d-flex align-items-center is-light"
              style={{
                background: "linear-gradient(135deg, #F8F3EA 0%, #D2B48C 45%, #B6906B 100%)",
              }}
            >
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-xl-5 col-lg-6 col-md-6 order-2 order-md-1">
                    <div className="tp-slider-content p-relative z-index-1">
                      <span>{t(item.subtitleKey)}</span>
                      <h3 className="tp-slider-title">{t(item.titleKey)}</h3>
                      <p>{t("jewelryHeroDesc")}</p>
                      <div className="tp-slider-btn">
                        <Link href="/shop" className="tp-btn tp-btn-2 tp-btn-white">
                          {t("shopNow")}{" "} <ArrowRightLong />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-7 col-lg-6 col-md-6 order-1 order-md-2">
                    <div className="tp-slider-thumb text-center text-md-start">
                      <Image src={item.img} alt={t("jewelryHeroImageAlt")} priority />
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

        <div className="container">
          <div className="row g-3 justify-content-center pt-30 pb-30">
            {slider_nav_data.map((item, i) => (
              <div key={i} className="col-6 col-md-3">
                <div
                  className="d-flex align-items-center gap-3 p-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.75)",
                    borderRadius: 12,
                  }}
                >
                  <Image src={item.icon} alt={t("categories")} width={44} height={44} />
                  <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
                    {t(item.line1Key)}<br />{t(item.line2Key)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default JewelryBanner;
