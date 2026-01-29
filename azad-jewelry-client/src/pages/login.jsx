import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import LoginArea from '@/components/login-register/login-area';
import { useLanguage } from "@/context/language-context";

const LoginPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("loginPage")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("loginPage")} subtitle={t("loginPage")} center={true} />
      <LoginArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default LoginPage;
