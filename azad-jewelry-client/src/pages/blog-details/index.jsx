import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import BlogDetailsArea from "@/components/blog-details/blog-details-area";
import blogData from "@/data/blog-data";
import { useLanguage } from "@/context/language-context";

const BlogDetailsPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={blogData?.[4]?.title || t("blogDetails")} />
      <HeaderTwo style_2={true} />
      <BlogDetailsArea blog={blogData[4]} />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default BlogDetailsPage;


