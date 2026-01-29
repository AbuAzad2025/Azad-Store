import React from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// internal
import ErrorMsg from "../common/error-msg";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";

const ForgotForm = () => {
  const [resetPassword, {}] = useResetPasswordMutation();
  const { t } = useLanguage();
  const getResultErrorMessage = (result, fallback = t("somethingWentWrong")) => {
    const data = result?.error?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || result?.error?.error || fallback;
  };
    // react hook form
    const {register,handleSubmit,formState: { errors },reset} = useForm({
      resolver: yupResolver(
        Yup.object().shape({
          email: Yup.string()
            .required(t("emailRequired"))
            .email(t("emailInvalid"))
            .label(t("emailLabel")),
        })
      ), 
    });
    // onSubmit
    const onSubmit = (data) => {
      resetPassword({
        email: data.email,
      }).then((result) => {
        if(result?.error){
          notifyError(getResultErrorMessage(result, t("resetLinkFailed")))
        }
        else {
          notifySuccess(result.data?.message);
          reset();
        }
      });
    };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("email", { required: t("emailRequired") })}
              name="email"
              id="email"
              type="email"
              placeholder="name@example.com"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">{t("emailLabel")}</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
      </div>
      <div className="tp-login-bottom mb-15">
        <button type="submit" className="tp-login-btn w-100">
          {t("resetLinkButton")}
        </button>
      </div>
    </form>
  );
};

export default ForgotForm;
