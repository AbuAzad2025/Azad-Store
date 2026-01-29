import React from "react";
import Link from "next/link";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import { useLanguage } from "@/context/language-context";

const ReturnsPage = () => {
  const { t } = useLanguage();

  return (
    <Wrapper>
      <SEO pageTitle={t("returns")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("returns")} subtitle={t("returns")} />

      <section className="pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              <div className="bg-white p-4 p-md-5 rounded border">
                <h3 className="mb-4">{t("returns")}</h3>

                <p className="mb-4">{t("returnsIntro")}</p>

                <h4 className="mb-3">{t("returnsConditionsTitle")}</h4>
                <ul className="mb-4">
                  <li>{t("returnsCondition1")}</li>
                  <li>{t("returnsCondition2")}</li>
                  <li>{t("returnsCondition3")}</li>
                </ul>

                <h4 className="mb-3">{t("returnsStepsTitle")}</h4>
                <ol className="mb-4">
                  <li>{t("returnsStep1")}</li>
                  <li>{t("returnsStep2")}</li>
                  <li>{t("returnsStep3")}</li>
                </ol>

                <h4 className="mb-3">{t("returnsRefundTitle")}</h4>
                <p className="mb-4">{t("returnsRefundDesc")}</p>

                <h4 className="mb-3">{t("returnsContactTitle")}</h4>
                <p className="mb-0">
                  {t("returnsContactPrefix")}{" "}
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

export default ReturnsPage;
