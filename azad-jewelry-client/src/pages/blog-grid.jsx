import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import SectionTitle from "@/components/blog/blog-grid/section-title";
import BlogGridArea from "@/components/blog/blog-grid/blog-grid-area";
import { useLanguage } from "@/context/language-context";

const BlogGridPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("blogGrid")} />
      <HeaderTwo style_2={true} />
      <SectionTitle/>
      <BlogGridArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default BlogGridPage;
