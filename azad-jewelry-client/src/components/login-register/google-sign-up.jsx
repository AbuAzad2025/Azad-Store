import React from "react";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";
// internal
import google_icon from "@assets/img/icon/login/google.svg";
import { useSignUpProviderMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";

const GoogleSignUp = () => {
  const { t } = useLanguage();
  const [signUpProvider, {}] = useSignUpProviderMutation();
  const router = useRouter();
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
  // handleGoogleSignIn
  const handleGoogleSignIn = (user) => {
    if (user) {
      signUpProvider(user?.credential).then((res) => {
        if (res?.data) {
          notifySuccess(t("loginSuccess"));
          router.replace(getSafeRedirectTarget());
        } else {
          notifyError(res?.error?.message || t("somethingWentWrong"));
        }
      });
    }
  };
  return (
    <GoogleLogin
      render={(renderProps) => (
        <a
          className="cursor-pointer"
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
        >
          <Image src={google_icon} alt="google_icon" />
          {t("signInWithGoogle")}
        </a>
      )}
      onSuccess={handleGoogleSignIn}
      onFailure={(err) =>
        notifyError(err?.message || t("googleAuthSetupError"))
      }
      cookiePolicy={"single_host_origin"}
    />
  );
};

export default GoogleSignUp;
