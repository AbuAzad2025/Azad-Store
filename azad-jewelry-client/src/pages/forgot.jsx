import React from 'react';
import SEO from '@/components/seo';
import Wrapper from '@/layout/wrapper';
import HeaderTwo from '@/layout/headers/header-2';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import ForgotArea from '@/components/login-register/forgot-area';
import Footer from '@/layout/footers/footer';
import { useLanguage } from "@/context/language-context";

const ForgotPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("forgotPassword")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("forgotPassword")} subtitle={t("resetPassword")} center={true} />
      <ForgotArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ForgotPage;
