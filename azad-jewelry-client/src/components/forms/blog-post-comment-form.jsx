import React from 'react';
import { useLanguage } from '@/context/language-context';

const BlogPostCommentForm = () => {
  const { t } = useLanguage();
  return (
    <form >
      <div className="tp-postbox-details-form-wrapper">
        <div className="tp-postbox-details-form-inner">
          <div className="tp-postbox-details-input-box">
            <div className="tp-contact-input">
              <input name="name" id="name" type="text" placeholder={t("nameLabel")} />
            </div>
            <div className="tp-postbox-details-input-title">
              <label htmlFor="name">{t("nameLabel")}</label>
            </div>
          </div>
          <div className="tp-postbox-details-input-box">
            <div className="tp-contact-input">
              <input name="email" id="email" type="email" placeholder="name@example.com" />
            </div>
            <div className="tp-postbox-details-input-title">
              <label htmlFor="email">{t("emailLabel")}</label>
            </div>
          </div>
          <div className="tp-postbox-details-input-box">
            <div className="tp-contact-input">
              <textarea id="msg" placeholder={t("messagePlaceholder")}></textarea>
            </div>
            <div className="tp-postbox-details-input-title">
              <label htmlFor="msg">{t("messageLabel")}</label>
            </div>
          </div>
        </div>
        <div className="tp-postbox-details-suggetions mb-20">
          <div className="tp-postbox-details-remeber">
            <input id="remeber" type="checkbox" />
            <label htmlFor="remeber">{t("consentText")}</label>
          </div>
        </div>
        <div className="tp-postbox-details-input-box">
          <button className="tp-postbox-details-input-btn" type="submit">{t("sendComment")}</button>
        </div>
      </div>
    </form>
  );
};

export default BlogPostCommentForm;
