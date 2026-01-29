// external
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar } from "swiper";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
// internal
import { TextShapeLine } from "@/svg";
import ErrorMsg from "@/components/common/error-msg";
import { useGetPopularProductByTypeQuery } from "@/redux/features/productApi";
import { add_cart_product } from "@/redux/features/cartSlice";
import { HomeTwoPopularPrdLoader } from "@/components/loader";
import { notifyError } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";

// slider setting
const slider_setting = {
  slidesPerView: 5,
  spaceBetween: 20,
  loop: false,
  centeredSlides: false,
  scrollbar: {
    el: ".swiper-scrollbar",
    draggable: true,
    dragClass: "tp-swiper-scrollbar-drag",
    snapOnRelease: true,
  },
  breakpoints: {
    1200: {
      slidesPerView: 5,
    },
    992: {
      slidesPerView: 4,
    },
    768: {
      slidesPerView: 3,
    },
    576: {
      slidesPerView: 2,
    },
    0: {
      slidesPerView: 1,
    },
  },
};

const PopularProducts = () => {
  const { t, formatPrice } = useLanguage();
  const {data: products,isError,isLoading} = useGetPopularProductByTypeQuery("fashion");
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  // handle add product
  const handleAddProduct = (prd) => {
    if(prd.status === 'out-of-stock'){
      notifyError(t("productNotAvailableCurrently"))
    }
    else {
      dispatch(add_cart_product(prd));
    }
  };
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <HomeTwoPopularPrdLoader loading={isLoading}/>;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg={t("error")} />;
  }
  if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg={t("noProducts")} />;
  }
  if (!isLoading && !isError && products?.data?.length > 0) {
    const product_items = products.data;

    content = (
      <Swiper
        {...slider_setting}
        modules={[Scrollbar]}
        className="tp-category-slider-active-2 swiper-container mb-50"
      >
        {product_items.map((item) => (
          <SwiperSlide
            key={item._id}
            className="tp-category-item-2 p-relative z-index-1 text-center"
          >
            <div className="tp-category-thumb-2">
              <Link href={`/product-details/${item._id}`}>
                <Image src={item.img} alt="product-img" width={224} height={260} />
              </Link>
            </div>
            <div className="tp-category-content-2">
              <span>{t("startingFrom")} {formatPrice(item.price)}</span>
              <h3 className="tp-category-title-2">
                <Link href={`/product-details/${item._id}`}>{item.title.substring(0, 15)}</Link>
              </h3>
              <div className="tp-category-btn-2">
                {cart_products.some((prd) => prd._id === item._id) ? (
                  <Link
                    href="/cart"
                    className="tp-btn tp-btn-border cursor-pointer"
                  >
                    {t("viewCart")}
                  </Link>
                ) : (
                  <a
                    onClick={() => handleAddProduct(item)}
                    className="tp-btn tp-btn-border cursor-pointer"
                  >
                    {t("addToCart")}
                  </a>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }
  return (
    <>
      <section className="tp-category-area pb-95 pt-95">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-section-title-wrapper-2 text-center mb-50">
                <span className="tp-section-title-pre-2">
                  {t("shopByMostPopular")}
                  <TextShapeLine />
                </span>
                <h3 className="tp-section-title-2">
                  {t("mostPopularInStore")}
                </h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-category-slider-2 p-relative">
                {content}
                <div className="swiper-scrollbar tp-swiper-scrollbar tp-swiper-scrollbar-drag"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PopularProducts;
