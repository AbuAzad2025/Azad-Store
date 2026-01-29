import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
// internal
import LoginShapes from "./login-shapes";
import RegisterForm from "../forms/register-form";
import GoogleSignUp from "./google-sign-up";
import { useLanguage } from "@/context/language-context";


const RegisterArea = () => {
  const router = useRouter();
  const { redirect } = router.query;
  const { t } = useLanguage();
  return (
    <>
      <section className="tp-login-area pb-140 p-relative z-index-1 fix">
        <LoginShapes />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="tp-login-wrapper">
                <div className="tp-login-top text-center mb-30">
                  <h3 className="tp-login-title">{t("createAccount")}</h3>
                  <p>
                    {t("alreadyHaveAccountQuestion")}{" "}
                    <span>
                      <Link
                        href={{
                          pathname: "/login",
                          query: redirect ? { redirect } : {},
                        }}
                      >
                        {t("login")}
                      </Link>
                    </span>
                  </p>
                </div>
                <div className="tp-login-option">
                  <div className="tp-login-social mb-10 d-flex flex-wrap align-items-center justify-content-center">
                    <div className="tp-login-option-item has-google">
                      <GoogleSignUp/>
                    </div>
                  </div>
                  <div className="tp-login-mail text-center mb-40">
                    <p>
                      {t("orCreateAccountVia")} <a href="#">{t("emailLabel")}</a>
                    </p>
                  </div>
                  {/* form start */}
                  <RegisterForm />
                  {/* form end */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterArea;
