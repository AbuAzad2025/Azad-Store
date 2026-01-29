import React from "react";
import Link from "next/link";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import { useLanguage } from "@/context/language-context";

const PrivacyPolicyPage = () => {
  const { t } = useLanguage();

  return (
    <Wrapper>
      <SEO pageTitle={t("privacyPolicy")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("privacyPolicy")} subtitle={t("privacyPolicy")} />

      <section className="pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              <div className="bg-white p-4 p-md-5 rounded border">
                <h3 className="mb-4">{t("privacyPolicy")}</h3>

                <p className="mb-4">{t("privacyIntro", { siteName: t("siteName") })}</p>

                <h4 className="mb-3">{t("privacyInfoWeCollectTitle")}</h4>
                <ul className="mb-4">
                  <li>{t("privacyInfoWeCollect1")}</li>
                  <li>{t("privacyInfoWeCollect2")}</li>
                  <li>{t("privacyInfoWeCollect3")}</li>
                </ul>

                <h4 className="mb-3">{t("privacyHowWeUseTitle")}</h4>
                <ul className="mb-4">
                  <li>{t("privacyHowWeUse1")}</li>
                  <li>{t("privacyHowWeUse2")}</li>
                  <li>{t("privacyHowWeUse3")}</li>
                </ul>

                <h4 className="mb-3">{t("privacySharingTitle")}</h4>
                <p className="mb-4">{t("privacySharingDesc")}</p>

                <h4 className="mb-3">{t("privacySecurityTitle")}</h4>
                <p className="mb-4">{t("privacySecurityDesc")}</p>

                <h4 className="mb-3">{t("privacyRightsTitle")}</h4>
                <p className="mb-0">
                  {t("privacyRightsPrefix")}{" "}
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

export default PrivacyPolicyPage;
