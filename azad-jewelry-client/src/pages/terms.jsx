import React from "react";
import Link from "next/link";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import { useLanguage } from "@/context/language-context";

const TermsPage = () => {
  const { t } = useLanguage();

  return (
    <Wrapper>
      <SEO pageTitle={t("terms")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("terms")} subtitle={t("terms")} />

      <section className="pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              <div className="bg-white p-4 p-md-5 rounded border">
                <h3 className="mb-4">{t("terms")}</h3>

                <p className="mb-4">{t("termsIntro", { siteName: t("siteName") })}</p>

                <h4 className="mb-3">{t("termsOrdersPaymentTitle")}</h4>
                <ul className="mb-4">
                  <li>{t("termsOrdersPayment1")}</li>
                  <li>{t("termsOrdersPayment2")}</li>
                </ul>

                <h4 className="mb-3">{t("termsShippingDeliveryTitle")}</h4>
                <p className="mb-4">
                  {t("termsShippingDeliveryDescPrefix")}{" "}
                  <Link className="text-decoration-underline" href="/shipping-policy">
                    {t("shippingPolicy")}
                  </Link>
                  .
                </p>

                <h4 className="mb-3">{t("termsReturnsTitle")}</h4>
                <p className="mb-4">
                  {t("termsReturnsDescPrefix")}{" "}
                  <Link className="text-decoration-underline" href="/returns">
                    {t("returns")}
                  </Link>
                  .
                </p>

                <h4 className="mb-3">{t("termsIpTitle")}</h4>
                <p className="mb-4">{t("termsIpDesc")}</p>

                <h4 className="mb-3">{t("termsContactTitle")}</h4>
                <p className="mb-0">
                  {t("termsContactPrefix")}{" "}
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

export default TermsPage;
