import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from 'next/router';
import Link from 'next/link';
// internal
import { CloseEye, OpenEye } from '@/svg';
import ErrorMsg from '../common/error-msg';
import { useLoginUserMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useLanguage } from '@/context/language-context';


const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [loginUser, { }] = useLoginUserMutation();
  const router = useRouter();
  const { t } = useLanguage();
  const { redirect } = router.query;
  const redirectTo =
    typeof redirect === "string"
      ? redirect
      : Array.isArray(redirect)
        ? redirect[0]
        : undefined;

  const getSafeRedirectTarget = () => {
    const raw = typeof redirectTo === "string" ? redirectTo.trim() : "";
    const decoded = raw
      ? (() => {
          try {
            return decodeURIComponent(raw);
          } catch (e) {
            return raw;
          }
        })()
      : "";

    if (!decoded || !decoded.startsWith("/") || decoded.startsWith("//")) return "/";
    const pathnameOnly = decoded.split("?")[0].split("#")[0];
    if (pathnameOnly === "/login") return "/";
    return decoded;
  };
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        email: Yup.string().required(t("emailRequired")).email(t("emailInvalid")).label(t("emailLabel")),
        password: Yup.string().required(t("passwordRequired")).min(6, t("passwordMin6")).label(t("passwordLabel")),
      })
    ),
  });
  // onSubmit
  const onSubmit = (data) => {
    loginUser({
      email: data.email,
      password: data.password,
    })
      .then((res) => {
        const token = res?.data?.data?.token || res?.data?.token;
        if (token) {
          notifySuccess(t("loginSuccess"));
          const target = getSafeRedirectTarget();
          router.replace(target);
          reset();
        } else {
          const isStringData = typeof res?.error?.data === "string";
          const errorMessage =
            res?.error?.data?.message ||
            res?.error?.data?.error ||
            (isStringData ? res?.error?.data : undefined) ||
            res?.error?.error ||
            t("somethingWentWrong");
          notifyError(errorMessage);
        }
      });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input {...register("email", { required: t("emailRequired") })} name="email" id="email" type="email" placeholder="name@example.com" />
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
                {...register("password", { required: t("passwordRequired") })}
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
          <ErrorMsg msg={errors.password?.message}/>
        </div>
      </div>
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input id="remeber" type="checkbox" />
          <label htmlFor="remeber">{t("rememberMe")}</label>
        </div>
        <div className="tp-login-forgot">
          <Link href="/forgot">{t("forgotPasswordQuestion")}</Link>
        </div>
      </div>
      <div className="tp-login-bottom">
        <button type='submit' className="tp-login-btn w-100">{t("loginButton")}</button>
      </div>
    </form>
  );
};

export default LoginForm;
