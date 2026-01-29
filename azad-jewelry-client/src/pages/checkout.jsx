import React,{useEffect} from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
// internal
import SEO from '@/components/seo';
import Wrapper from '@/layout/wrapper';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CheckoutArea from '@/components/checkout/checkout-area';
import { useLanguage } from "@/context/language-context";


const CheckoutPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  useEffect(() => {
    const isAuthenticate = Cookies.get("userInfo");
    if(!isAuthenticate){
      const redirect = encodeURIComponent(router.asPath || "/checkout");
      router.replace(`/login?redirect=${redirect}`);
    }
  },[router])
  return (
    <Wrapper>
      <SEO pageTitle={t("checkout")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("checkout")} subtitle={t("checkout")} bg_clr={true} />
      <CheckoutArea/>
      <Footer style_2={true} />
    </Wrapper>
  );
};

export default CheckoutPage;
