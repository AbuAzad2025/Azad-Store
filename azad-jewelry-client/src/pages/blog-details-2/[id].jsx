import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import blogData from "@/data/blog-data";
import BlogDetailsAreaTwo from "@/components/blog-details/blog-details-area-2";
import { useLanguage } from "@/context/language-context";

const BlogDetailsPageTwo = ({query}) => {
  const { t } = useLanguage();
  const blogItem = blogData.find(b => Number(b.id) === Number(query.id))
  return (
    <Wrapper>
      <SEO pageTitle={blogItem?.title || t("blogDetails")} />
      <HeaderTwo style_2={true} />
      <BlogDetailsAreaTwo blog={blogItem} />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default BlogDetailsPageTwo;

export const getServerSideProps = async (context) => {
  const { query } = context;

  return {
    props: {
      query,
    },
  };
};

