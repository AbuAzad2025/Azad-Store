import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// internal
import { CloseTwo } from '@/svg';
import logo from '@assets/img/logo/logo.svg';
import contact_img from '@assets/img/icon/contact.png';
import language_img from '@assets/img/icon/language-flag.png';
import MobileCategory from '@/layout/headers/header-com/mobile-category';
import MobileMenus from './mobile-menus';
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const OffCanvas = ({ isOffCanvasOpen, setIsCanvasOpen,categoryType = "electronics" }) => {
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const [isCategoryActive, setIsCategoryActive] = useState(false);
  const [isCurrencyActive, setIsCurrencyActive] = useState(false);
  const [isLanguageActive, setIsLanguageActive] = useState(false);
  const { language, setLanguage, t, currency, setCurrency, currencyLabel } = useLanguage();
  const offcanvasStyle =
    {
      electronics: "green",
      fashion: "darkRed",
      beauty: "darkRed",
      jewelry: "brown",
    }[categoryType] || "brown";
  const toInternationalPhone = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const compact = raw.replace(/\s+/g, "").replace(/-/g, "");
    if (compact.startsWith("+")) return compact;
    if (compact.startsWith("00")) return `+${compact.slice(2)}`;
    const digits = compact.replace(/[^\d]/g, "");
    if (!digits) return raw;
    if (digits.startsWith("970")) return `+${digits}`;
    if (digits.startsWith("0") && digits.length >= 9) return `+970${digits.slice(1)}`;
    return `+${digits}`;
  };
  const contactPhone = toInternationalPhone(settings?.contactPhone || cachedSettings?.contactPhone || "00970598953362");

  // handle language active
  const handleLanguageActive = () => {
    setIsLanguageActive(!isLanguageActive)
    setIsCurrencyActive(false)
  }
  // handle Currency active
  const handleCurrencyActive = () => {
    setIsCurrencyActive(!isCurrencyActive)
    setIsLanguageActive(false)
  }
  return (
    <>
      <div className={`offcanvas__area offcanvas__radius offcanvas__style-${offcanvasStyle} ${isOffCanvasOpen ? "offcanvas-opened" : ""}`}>
        <div className="offcanvas__wrapper">
          <div className="offcanvas__close">
            <button onClick={() => setIsCanvasOpen(false)} className="offcanvas__close-btn offcanvas-close-btn">
              <CloseTwo />
            </button>
          </div>
          <div className="offcanvas__content">
            <div className="offcanvas__top mb-70 d-flex justify-content-between align-items-center">
              <div className="offcanvas__logo logo">
                <Link href="/">
                  <Image src={logo} alt={t("siteName")} width={40} height={40} priority />
                </Link>
              </div>
            </div>
            <div className="offcanvas__category pb-40">
              <button onClick={() => setIsCategoryActive(!isCategoryActive)} className="tp-offcanvas-category-toggle">
                <i className="fa-solid fa-bars"></i>
                {t("allCategories")}
              </button>
              <div className="tp-category-mobile-menu">
                <nav className={`tp-category-menu-content ${isCategoryActive ? "active" : ""}`}>
                  <MobileCategory categoryType={categoryType} isCategoryActive={isCategoryActive} />
                </nav>
              </div>
            </div>
            <div className="tp-main-menu-mobile fix d-lg-none mb-40">
              <MobileMenus />
            </div>

            <div className="offcanvas__contact align-items-center d-none">
              <div className="offcanvas__contact-icon mr-20">
                <span>
                  <Image src={contact_img} alt="contact_img" />
                </span>
              </div>
              <div className="offcanvas__contact-content">
                <h3 className="offcanvas__contact-title">
                  <a href={`tel:${contactPhone}`}>{contactPhone}</a>
                </h3>
              </div>
            </div>
            <div className="offcanvas__btn">
              <Link href="/contact" className="tp-btn-2 tp-btn-border-2">{t("contactUs")}</Link>
            </div>
          </div>
          <div className="offcanvas__bottom">
            <div className="offcanvas__footer d-flex align-items-center justify-content-between">
              <div className="offcanvas__currency-wrapper currency">
                <span onClick={handleCurrencyActive} className="offcanvas__currency-selected-currency tp-currency-toggle" id="tp-offcanvas-currency-toggle">{t("currency")} : {currency}</span>
                <ul className={`offcanvas__currency-list tp-currency-list ${isCurrencyActive ? 'tp-currency-list-open' : ''}`}>
                  <li>
                    <button type="button" onClick={() => setCurrency("ILS")}>
                      {currencyLabel("ILS")} - ILS
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setCurrency("JOD")}>
                      {currencyLabel("JOD")} - JOD
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setCurrency("USD")}>
                      {currencyLabel("USD")} - USD
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setCurrency("AED")}>
                      {currencyLabel("AED")} - AED
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setCurrency("SAR")}>
                      {currencyLabel("SAR")} - SAR
                    </button>
                  </li>
                </ul>
              </div>
              <div className="offcanvas__select language">
                <div className="offcanvas__lang d-flex align-items-center justify-content-md-end">
                  <div className="offcanvas__lang-img mr-15">
                    <Image src={language_img} alt="language-flag" />
                  </div>
                  <div className="offcanvas__lang-wrapper">
                    <span onClick={handleLanguageActive} className="offcanvas__lang-selected-lang tp-lang-toggle" id="tp-offcanvas-lang-toggle">
                      {language === "ar" ? t("arabic") : t("english")}
                    </span>
                    <ul className={`offcanvas__lang-list tp-lang-list ${isLanguageActive ? 'tp-lang-list-open' : ''}`}>
                      <li>
                        <button type="button" onClick={() => setLanguage("en")}>
                          {t("english")}
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => setLanguage("ar")}>
                          {t("arabic")}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* body overlay start */}
      <div onClick={() => setIsCanvasOpen(false)} className={`body-overlay ${isOffCanvasOpen ? 'opened' : ''}`}></div>
      {/* body overlay end */}
    </>
  );
};

export default OffCanvas;
