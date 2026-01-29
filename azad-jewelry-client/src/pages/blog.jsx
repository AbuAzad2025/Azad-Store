import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import BlogBreadcrumb from "@/components/breadcrumb/blog-breadcrumb";
import BlogPostboxArea from "@/components/blog/blog-postox/blog-postbox-area";
import { useLanguage } from "@/context/language-context";

const BlogPostBoxPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("blog")} />
      <HeaderTwo style_2={true} />
      <BlogBreadcrumb/>
      <BlogPostboxArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default BlogPostBoxPage;
