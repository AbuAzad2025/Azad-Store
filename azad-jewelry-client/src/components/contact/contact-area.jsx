import React from "react";
import Image from "next/image";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";
import { useLanguage } from "@/context/language-context";
// internal
import ContactForm from "../forms/contact-form";
import contact_icon_1 from "@assets/img/contact/contact-icon-1.png";
import contact_icon_2 from "@assets/img/contact/contact-icon-2.png";
import contact_icon_3 from "@assets/img/contact/contact-icon-3.png";

const ContactArea = () => {
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
  const whatsappPhoneDigits = contactPhone.replace(/[^\d]/g, "");
  const whatsappHref = `https://wa.me/${whatsappPhoneDigits}`;
  const contactEmail = settings?.contactEmail || cachedSettings?.contactEmail || "support@azad-store.com";
  const addressText = settings?.address || cachedSettings?.address || t("addressLocation");
  return (
    <>
      <section className="tp-contact-area pb-100">
        <div className="container">
          <div className="tp-contact-inner">
            <div className="row">
              <div className="col-xl-9 col-lg-8">
                <div className="tp-contact-wrapper">
                  <h3 className="tp-contact-title">
                    {t("sendMessage")}
                  </h3>

                  <div className="tp-contact-form">
                    {/* form start */}
                    <ContactForm />
                    {/* form end */}
                    <p className="ajax-response"></p>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4">
                <div className="tp-contact-info-wrapper">
                  <div className="tp-contact-info-item">
                    <div className="tp-contact-info-icon">
                      <span>
                        <Image src={contact_icon_1} alt="contact-icon" />
                      </span>
                    </div>
                    <div className="tp-contact-info-content">
                      <p data-info="mail">
                        <a href={`mailto:${contactEmail}`}>
                          {contactEmail}
                        </a>
                      </p>
                      <p data-info="phone">
                        <a href={`tel:${contactPhone}`}>
                          {contactPhone}
                        </a>
                      </p>
                      <p data-info="whatsapp">
                        <a href={whatsappHref} target="_blank" rel="noreferrer">
                          {t("whatsapp")}: {contactPhone}
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="tp-contact-info-item">
                    <div className="tp-contact-info-icon">
                      <span>
                        <Image src={contact_icon_2} alt="contact-icon" />
                      </span>
                    </div>
                    <div className="tp-contact-info-content">
                      <p>
                        <a
                          href="https://www.google.com/maps"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {addressText}
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="tp-contact-info-item">
                    <div className="tp-contact-info-icon">
                      <span>
                        <Image src={contact_icon_3} alt="contact-icon" />
                      </span>
                    </div>
                    <div className="tp-contact-info-content">
                      <div className="tp-contact-social-wrapper mt-5">
                        <h4 className="tp-contact-social-title">
                          {t("followUsOnSocialMedia")}
                        </h4>

                        <div className="tp-contact-social-icon">
                          {settings?.facebook && (
                            <a href={settings.facebook} target="_blank" rel="noreferrer">
                              <i className="fa-brands fa-facebook-f"></i>
                            </a>
                          )}
                          {settings?.twitter && (
                            <a href={settings.twitter} target="_blank" rel="noreferrer">
                              <i className="fa-brands fa-twitter"></i>
                            </a>
                          )}
                          {settings?.linkedin && (
                            <a href={settings.linkedin} target="_blank" rel="noreferrer">
                              <i className="fa-brands fa-linkedin-in"></i>
                            </a>
                          )}
                          {settings?.instagram && (
                            <a href={settings.instagram} target="_blank" rel="noreferrer">
                              <i className="fa-brands fa-instagram"></i>
                            </a>
                          )}
                          {settings?.youtube && (
                            <a href={settings.youtube} target="_blank" rel="noreferrer">
                              <i className="fa-brands fa-youtube"></i>
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
        </div>
      </section>
    </>
  );
};

export default ContactArea;
