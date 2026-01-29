import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import ContactBreadcrumb from "@/components/breadcrumb/contact-breadcrumb";
import ContactArea from "@/components/contact/contact-area";
import ContactMap from "@/components/contact/contact-map";
import { useLanguage } from "@/context/language-context";

const ContactPage = () => {
  const { t } = useLanguage();
  return (
    <Wrapper>
      <SEO pageTitle={t("contactUs")} />
      <HeaderTwo style_2={true} />
      <ContactBreadcrumb />
      <ContactArea />
      <ContactMap />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ContactPage;
