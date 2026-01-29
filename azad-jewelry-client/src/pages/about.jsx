import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import { useLanguage } from "@/context/language-context";
import Link from "next/link";

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <Wrapper>
      <SEO pageTitle={t("ourStory")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("ourStory")} subtitle={t("ourStory")} />

      <section className="pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              <div className="bg-white p-4 p-md-5 rounded border">
                <h3 className="mb-4">{t("ourStory")}</h3>
                  <p className="mb-4">{t("aboutIntro")}</p>
                  <h4 className="mb-3">{t("aboutVisionTitle")}</h4>
                  <p className="mb-4">{t("aboutVisionDesc")}</p>
                  <h4 className="mb-3">{t("aboutValuesTitle")}</h4>
                  <ul className="mb-4">
                    <li>{t("aboutValue1")}</li>
                    <li>{t("aboutValue2")}</li>
                    <li>{t("aboutValue3")}</li>
                  </ul>
                  <p className="mb-0">
                    {t("aboutContactPrefix")}{" "}
                    <Link className="text-decoration-underline" href="/contact">
                      {t("contactPage")}
                    </Link>
                    .
                  </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default AboutPage;
