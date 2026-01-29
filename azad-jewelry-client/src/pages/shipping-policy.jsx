import React from "react";
import Link from "next/link";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import { useLanguage } from "@/context/language-context";

const ShippingPolicyPage = () => {
  const { t } = useLanguage();

  return (
    <Wrapper>
      <SEO pageTitle={t("shippingPolicy")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("shippingPolicy")} subtitle={t("shippingPolicy")} />

      <section className="pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              <div className="bg-white p-4 p-md-5 rounded border">
                <h3 className="mb-4">{t("shippingPolicy")}</h3>

                <p className="mb-4">{t("shippingIntro")}</p>

                <h4 className="mb-3">{t("shippingPreparationTitle")}</h4>
                <ul className="mb-4">
                  <li>{t("shippingPreparation1")}</li>
                  <li>{t("shippingPreparation2")}</li>
                </ul>

                <h4 className="mb-3">{t("shippingDeliveryTimesTitle")}</h4>
                <ul className="mb-4">
                  <li>{t("shippingDeliveryTimes1")}</li>
                  <li>{t("shippingDeliveryTimes2")}</li>
                </ul>

                <h4 className="mb-3">{t("shippingCostTitle")}</h4>
                <p className="mb-4">{t("shippingCostDesc")}</p>

                <h4 className="mb-3">{t("shippingTrackTitle")}</h4>
                <p className="mb-0">
                  {t("shippingTrackPrefix")}{" "}
                  <Link className="text-decoration-underline" href="/profile">
                    {t("shippingTrackLink")}
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

export default ShippingPolicyPage;
