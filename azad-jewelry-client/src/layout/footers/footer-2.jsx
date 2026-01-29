import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// internal
import social_data from '@/data/social-data';
import { Email, Location } from '@/svg';
import logo from '@assets/img/logo/logo.svg';
import pay from '@assets/img/footer/footer-pay.png';
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const FooterTwo = () => {
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const { t } = useLanguage();
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
  const resolvedSiteName = settings?.siteName || cachedSettings?.siteName || t("siteName");
  const whatsappPhoneDigits = contactPhone.replace(/[^\d]/g, "");
  const whatsappHref = `https://wa.me/${whatsappPhoneDigits}`;
  const addressText = settings?.address || cachedSettings?.address || t("addressLocation");
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
  return (
    <>
      <footer>
        <div className="tp-footer-area tp-footer-style-2 tp-footer-style-3 tp-footer-style-4">
          <div className="tp-footer-top pt-95 pb-40">
            <div className="container">
              <div className="row">
                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                  <div className="tp-footer-widget footer-col-4-1 mb-50">
                    <div className="tp-footer-logo">
                      <Link href="/">
                        <Image src={logo} alt={resolvedSiteName} width={60} height={60} />
                      </Link>
                    </div>
                    <div className="tp-footer-widget-content">
                      <p className="tp-footer-desc">{settings?.footerText || t("footerDesc")}</p>
                      <div className="tp-footer-talk mb-20">
                        <span>{t("haveQuestionCall")}</span>
                        <h4><a href={`tel:${contactPhone}`}>{contactPhone}</a></h4>
                      </div>
                      <div className="tp-footer-contact">
                        <div className="tp-footer-contact-item d-flex align-items-start">
                          <div className="tp-footer-contact-icon">
                            <span>
                              <Email />
                            </span>
                          </div>
                          <div className="tp-footer-contact-content">
                          <p><a href={`mailto:${settings?.contactEmail || "support@azad-store.com"}`}>{settings?.contactEmail || "support@azad-store.com"}</a></p>
                          </div>
                        </div>
                        <div className="tp-footer-contact-item d-flex align-items-start">
                          <div className="tp-footer-contact-icon">
                            <span>
                              <i className="fa-brands fa-whatsapp"></i>
                            </span>
                          </div>
                          <div className="tp-footer-contact-content">
                            <p>
                              <a href={whatsappHref} target="_blank" rel="noreferrer">
                                {contactPhone}
                              </a>
                            </p>
                          </div>
                        </div>
                        <div className="tp-footer-contact-item d-flex align-items-start">
                          <div className="tp-footer-contact-icon">
                            <span>
                              <Location />
                            </span>
                          </div>
                          <div className="tp-footer-contact-content">
                            <p>
                              <a
                                href={mapsHref}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {addressText}
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                  <div className="tp-footer-widget footer-col-4-2 mb-50">
                    <h4 className="tp-footer-widget-title">{t("myAccount")}</h4>
                    <div className="tp-footer-widget-content">
                      <ul>
                        <li><Link href="/profile">{t("trackOrders")}</Link></li>
                        <li><Link href="/shipping-policy">{t("shippingPolicy")}</Link></li>
                        <li><Link href="/wishlist">{t("wishlist")}</Link></li>
                        <li><Link href="/profile">{t("myAccount")}</Link></li>
                        <li><Link href="/profile">{t("orderHistory")}</Link></li>
                        <li><Link href="/returns">{t("returns")}</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-2 col-md-4 col-sm-5">
                  <div className="tp-footer-widget footer-col-4-3 mb-50">
                    <h4 className="tp-footer-widget-title">{t("info")}</h4>
                    <div className="tp-footer-widget-content">
                      <ul>
                        <li><Link href="/about">{t("ourStory")}</Link></li>
                        <li><Link href="/careers">{t("careers")}</Link></li>
                        <li><Link href="/privacy-policy">{t("privacyPolicy")}</Link></li>
                        <li><Link href="/terms">{t("terms")}</Link></li>
                        <li><Link href="/blog">{t("latestNews")}</Link></li>
                        <li><Link href="/contact">{t("contactUsSmall")}</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-xl-4 col-lg-4 col-md-6 col-sm-7">
                  <div className="tp-footer-widget footer-col-4-4 mb-50">
                    <h4 className="tp-footer-widget-title">{t("subscribe")}</h4>
                    <div className="tp-footer-widget-content">
                      <div className="tp-footer-subscribe">
                        <p>{t("subscribeDesc")}</p>
                        <div className="tp-footer-subscribe-form mb-30">
                          <form action="#">
                            <div className="tp-footer-subscribe-input">
                              <input type="email" placeholder={t("enterEmail")} />
                              <button type="submit">{t("subscribe")}</button>
                            </div>
                          </form>
                        </div>
                        <div className="tp-footer-social-4 tp-footer-social">
                          <h4 className="tp-footer-social-title-4">{t("followUsOn")}</h4>
                          {social_data.map(s => <a href={s.link} key={s.id} target="_blank" rel="noreferrer">
                            <i className={s.icon}></i>
                          </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tp-footer-bottom">
            <div className="container">
              <div className="tp-footer-bottom-wrapper">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="tp-footer-copyright">
                      <p>{t("copyright", { year: new Date().getFullYear() })}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tp-footer-payment text-md-end">
                      <p>
                        <Image src={pay} alt="pay" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterTwo;
