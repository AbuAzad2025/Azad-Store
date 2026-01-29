import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

const ContactBreadcrumb = () => {
  const { t } = useLanguage();
  return (
    <section className="breadcrumb__area include-bg text-center pt-95 pb-50">
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <div className="breadcrumb__content p-relative z-index-1">
              <h3 className="breadcrumb__title">
                {t("stayInTouch")}
              </h3>
              <div className="breadcrumb__list">
                <span>
                  <Link href="/">{t("home")}</Link>
                </span>
                <span>{t("contactUs")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactBreadcrumb;
