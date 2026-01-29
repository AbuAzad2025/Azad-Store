import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import ShopBreadcrumb from '@/components/breadcrumb/shop-breadcrumb';
import ShopCategoryArea from '@/components/categories/shop-category-area';
import { useLanguage } from "@/context/language-context";

const CategoryPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("shopCategory")} />
      <HeaderTwo style_2={true} />
      <ShopBreadcrumb title={t("shopCategory")} subtitle={t("shopCategory")} />
      <ShopCategoryArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default CategoryPage;
