import React, { useState } from 'react';
import SEO from '@/components/seo';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import Footer from '@/layout/footers/footer';
import HeaderTwo from '@/layout/headers/header-2';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from 'next/router';
import { CloseEye, OpenEye } from '@/svg';
import ErrorMsg from '@/components/common/error-msg';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useLoginAdminMutation } from '@/redux/features/admin/adminApi';
import { useLanguage } from '@/context/language-context';

const AdminLoginPage = () => {
  const [showPass, setShowPass] = useState(false);
  const [loginAdmin, { isLoading }] = useLoginAdminMutation();
  const router = useRouter();
  const { t } = useLanguage();
  
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

  const onSubmit = (data) => {
    loginAdmin({
      email: data.email,
      password: data.password,
    })
      .then((res) => {
        if (res?.data?.token) {
          notifySuccess(t("adminLoginSuccess"));
          router.push("/admin/dashboard");
          reset();
        } else {
          notifyError(res?.error?.data?.message || t("adminLoginFailed"));
        }
      })
      .catch((err) => notifyError(err.message));
  };

  return (
    <Wrapper>
      <SEO pageTitle={t("adminLoginPageTitle")} />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title={t("adminLoginPageTitle")} subtitle={t("adminLoginPageTitle")} center={true} />
      
      <section className="tp-login-area pb-140 p-relative z-index-1 fix">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="tp-login-wrapper">
                <div className="tp-login-top text-center mb-30">
                  <h3 className="tp-login-title">{t("adminPanelTitle")}</h3>
                </div>
                <div className="tp-login-option">
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
                    <div className="tp-login-bottom">
                      <button type='submit' className="tp-login-btn w-100">
                        {isLoading ? t("loadingDots") : t("loginButton")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer style_2={true} />
    </Wrapper>
  );
};

export default AdminLoginPage;
