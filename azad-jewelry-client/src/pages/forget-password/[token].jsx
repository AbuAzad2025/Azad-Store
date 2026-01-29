import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// internal
import Wrapper from "@/layout/wrapper";
import LoginShapes from "@/components/login-register/login-shapes";
import ErrorMsg from "@/components/common/error-msg";
import { useConfirmForgotPasswordMutation } from "@/redux/features/auth/authApi";
import { CloseEye, OpenEye } from "@/svg";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";

const ForgotPassword = ({ params }) => {
  const token = params.token;
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [confirmForgotPassword, { }] = useConfirmForgotPasswordMutation();
  const { t } = useLanguage();
  const schema = Yup.object().shape({
    password: Yup.string()
      .required(t("passwordRequired"))
      .min(6, t("passwordMin6")),
    confirmPassword: Yup.string()
      .required(t("confirmPasswordRequired"))
      .oneOf([Yup.ref("password"), null], t("passwordsMustMatch")),
  });
  const getResultErrorMessage = (result, fallback = t("somethingWentWrong")) => {
    const data = result?.error?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || result?.error?.error || fallback;
  };
  // react hook form
  const {register,handleSubmit,formState: { errors },reset,} = useForm({
    resolver: yupResolver(schema),
  });
  // onSubmit
  const onSubmit = (data) => {
    confirmForgotPassword({
      password: data.password,
      token,
    }).then((result) => {
      if (result?.error) {
        notifyError(getResultErrorMessage(result, t("resetPasswordFailed")))
      } 
      else {
        notifySuccess(result?.data?.message);
        reset();
      }
    });
  };

  return (
    <Wrapper>
      <section className="tp-login-area d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
        <LoginShapes />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="tp-login-wrapper">
                <div className="tp-login-top text-center mb-30">
                  <h3 className="tp-login-title">{t("forgotPassword")}</h3>
                  <p>
                    {t("resetYourPassword")}
                  </p>
                </div>
                <div className="tp-login-option">
                  {/* form start */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="tp-login-input-wrapper">
                      {/* password */}
                      <div className="tp-login-input-box">
                        <div className="p-relative">
                          <div className="tp-login-input">
                            <input
                              {...register("password", { required: t("passwordRequired") })}
                              id="password"
                              name="password"
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
                      {/* confirm password */}
                      <div className="tp-login-input-box">
                        <div className="p-relative">
                          <div className="tp-login-input">
                            <input
                              {...register("confirmPassword")}
                              type={showConPass ? "text" : "password"}
                              placeholder={t("confirmPasswordPlaceholder")}
                              name="confirmPassword"
                              id="confirmPassword"
                            />
                          </div>
                          <div className="tp-login-input-eye" id="password-show-toggle">
                            <span className="open-eye" onClick={() => setShowConPass(!showConPass)}>
                              {showConPass ? <CloseEye /> : <OpenEye />}
                            </span>
                          </div>
                          <div className="tp-login-input-title">
                            <label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</label>
                          </div>
                        </div>
                        <ErrorMsg msg={errors.confirmPassword?.message} />
                      </div>
                    </div>

                    <div className="tp-login-bottom">
                      <button type="submit" className="tp-login-btn w-100">
                        {t("confirmPasswordAction")}
                      </button>
                    </div>
                  </form>
                  {/* form end */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default ForgotPassword;
