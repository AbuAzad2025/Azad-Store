import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/router";
// internal
import { CloseEye, OpenEye } from "@/svg";
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useRegisterUserMutation } from "@/redux/features/auth/authApi";
import { useLanguage } from "@/context/language-context";

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [registerUser, {}] = useRegisterUserMutation();
  const router = useRouter();
  const { t } = useLanguage();
  const { redirect } = router.query;
  const redirectTo =
    typeof redirect === "string" ? redirect : Array.isArray(redirect) ? redirect[0] : undefined;
  // react hook form
  const {register,handleSubmit,formState: { errors },reset} = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        name: Yup.string().required(t("nameRequired")).label(t("nameLabel")),
        email: Yup.string().required(t("emailRequired")).email(t("emailInvalid")).label(t("emailLabel")),
        password: Yup.string().required(t("passwordRequired")).min(6, t("passwordMin6")).label(t("passwordLabel")),
        remember: Yup.boolean()
          .oneOf([true], t("termsRequired"))
          .required(t("termsRequired"))
          .label(t("terms")),
      })
    ),
    defaultValues: {
      remember: false
    }
  });
  // on submit
  const onSubmit = (data) => {
    registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    }).then((result) => {
      if (result?.error) {
        notifyError(result?.error?.data?.message || t("createAccountFailed"));
      } else {
        notifySuccess(result?.data?.message || t("createAccountSuccess"));
        reset();
        router.push({
          pathname: "/login",
          query: redirectTo ? { redirect: redirectTo } : {},
        });
      }
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("name")}
              id="name"
              type="text"
              placeholder={t("nameLabel")}
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="name">{t("nameLabel")}</label>
          </div>
          <ErrorMsg msg={errors.name?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("email")}
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
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("password")}
                id="password"
                type={showPass ? "text" : "password"}
                placeholder={t("passwordMin6Placeholder")}
              />
            </div>
            <div className="tp-login-input-eye" id="password-show-toggle">
              <span className="open-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="password">{t("passwordLabel")}</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message} />
        </div>
      </div>
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input
            {...register("remember")}
            id="remember"
            type="checkbox"
          />
          <label htmlFor="remember">
            {t("agreeTermsPrefix")} {t("termsOfService")} {t("and")} <a href="#">{t("privacyPolicyLink")}</a>.
          </label>
          <ErrorMsg msg={errors.remember?.message} />
        </div>
      </div>
      <div className="tp-login-bottom">
        <button type="submit" className="tp-login-btn w-100">
          {t("registerButton")}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
