import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CartArea from '@/components/cart-wishlist/cart-area';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import { useLanguage } from "@/context/language-context";

const CartPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("cartPage")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("shoppingCart")} subtitle={t("shoppingCart")} />
      <CartArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default CartPage;
