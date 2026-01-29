import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CouponArea from '@/components/coupon/coupon-area';
import { useLanguage } from "@/context/language-context";

const CouponPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("couponPage")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("couponGrabBestOffer")} subtitle={t("couponPage")} />
      <CouponArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default CouponPage;
