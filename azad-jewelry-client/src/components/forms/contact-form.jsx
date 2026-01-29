import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// internal
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";

const ContactForm = () => {
    const { t } = useLanguage();
    const schema = Yup.object().shape({
      name: Yup.string().required(t("nameRequired")),
      email: Yup.string().required(t("emailRequired")).email(t("emailInvalid")),
      subject: Yup.string().required(t("subjectRequired")),
      message: Yup.string().required(t("messageRequired")),
      remember: Yup.bool()
        .oneOf([true], t("consentRequired")),
    });

    // react hook form
    const {register,handleSubmit,formState: { errors },reset} = useForm({
      resolver: yupResolver(schema),
    });
    // on submit
    const onSubmit = (data) => {
      if(data){
        notifySuccess(t("sendMessageSuccess"));
      }

      reset();
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="contact-form">
      <div className="tp-contact-input-wrapper">
        <div className="tp-contact-input-box">
          <div className="tp-contact-input">
            <input {...register("name", { required: t("nameRequired") })} name="name" id="name" type="text" placeholder={t("fullNamePlaceholder")} />
          </div>
          <div className="tp-contact-input-title">
            <label htmlFor="name">{t("nameLabel")}</label>
          </div>
          <ErrorMsg msg={errors.name?.message} />
        </div>
        <div className="tp-contact-input-box">
          <div className="tp-contact-input">
            <input {...register("email", { required: t("emailRequired") })} name="email" id="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="tp-contact-input-title">
            <label htmlFor="email">{t("emailLabel")}</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
        <div className="tp-contact-input-box">
          <div className="tp-contact-input">
            <input {...register("subject", { required: t("subjectRequired") })} name="subject" id="subject" type="text" placeholder={t("subjectPlaceholder")} />
          </div>
          <div className="tp-contact-input-title">
            <label htmlFor="subject">{t("subjectLabel")}</label>
          </div>
          <ErrorMsg msg={errors.subject?.message} />
        </div>
        <div className="tp-contact-input-box">
          <div className="tp-contact-input">
            <textarea {...register("message", { required: t("messageRequired") })} id="message" name="message" placeholder={t("messagePlaceholder")} />
          </div>
          <div className="tp-contact-input-title">
            <label htmlFor="message">{t("messageLabel")}</label>
          </div>
          <ErrorMsg msg={errors.message?.message} />
        </div>
      </div>
      <div className="tp-contact-suggetions mb-20">
        <div className="tp-contact-remeber">
          <input  {...register("remember", {required: t("consentRequired")})} name="remember" id="remember" type="checkbox" />
          <label htmlFor="remember">
            {t("consentText")}
          </label>
          <ErrorMsg msg={errors.remember?.message} />
        </div>
      </div>
      <div className="tp-contact-btn">
        <button type="submit">{t("send")}</button>
      </div>
    </form>
  );
};

export default ContactForm;
