import React from "react";
import Link from "next/link";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import { useLanguage } from "@/context/language-context";

const CareersPage = () => {
  const { t } = useLanguage();

  return (
    <Wrapper>
      <SEO pageTitle={t("careers")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("careers")} subtitle={t("careers")} />

      <section className="pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              <div className="bg-white p-4 p-md-5 rounded border">
                <h3 className="mb-4">{t("careers")}</h3>
                <p className="mb-4">{t("careersIntro")}</p>

                <h4 className="mb-3">{t("careersHowToApplyTitle")}</h4>
                <ol className="mb-4">
                  <li>{t("careersStep1", { siteName: t("siteName") })}</li>
                  <li>{t("careersStep2")}</li>
                  <li>{t("careersStep3")}</li>
                </ol>

                <h4 className="mb-3">{t("careersContactTitle")}</h4>
                <p className="mb-0">
                  {t("careersContactPrefix")}{" "}
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

export default CareersPage;
