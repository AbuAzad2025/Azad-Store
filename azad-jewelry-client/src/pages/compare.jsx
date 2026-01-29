import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CompareArea from '@/components/compare/compare-area';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import { useLanguage } from "@/context/language-context";

const ComparePage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("compare")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("compare")} subtitle={t("compare")} />
      <CompareArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ComparePage;
