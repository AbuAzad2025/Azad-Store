import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import ErrorMsg from "../common/error-msg";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";

const ChangePassword = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const [changePassword, {}] = useChangePasswordMutation();
  const schema = Yup.object().shape({
    password: Yup.string()
      .required(t("oldPasswordRequired"))
      .min(6, t("passwordMin6")),
    newPassword: Yup.string()
      .required(t("newPasswordRequired"))
      .min(6, t("passwordMin6")),
    confirmPassword: Yup.string()
      .required(t("confirmPasswordRequired"))
      .oneOf([Yup.ref("newPassword"), null], t("passwordsMustMatch")),
  });
  const schemaTwo = Yup.object().shape({
    newPassword: Yup.string()
      .required(t("newPasswordRequired"))
      .min(6, t("passwordMin6")),
    confirmPassword: Yup.string()
      .required(t("confirmPasswordRequired"))
      .oneOf([Yup.ref("newPassword"), null], t("passwordsMustMatch")),
  });
  const getResultErrorMessage = (result, fallback = t("somethingWentWrong")) => {
    const data = result?.error?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || result?.error?.error || fallback;
  };
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(user?.googleSignIn ? schemaTwo : schema),
  });

  // on submit
  const onSubmit = (data) => {
    changePassword({
      email: user?.email,
      password: data.password,
      newPassword: data.newPassword,
      googleSignIn: user?.googleSignIn,
    }).then((result) => {
      if (result?.error) {
        notifyError(getResultErrorMessage(result, t("changePasswordFailed")));
      } else {
        notifySuccess(result?.data?.message);
        reset();
      }
    });
  };
  return (
    <div className="profile__password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          {!user?.googleSignIn && (
            <div className="col-xxl-12">
              <div className="tp-profile-input-box">
                <div className="tp-contact-input">
                  <input
                    {...register("password", {
                      required: t("oldPasswordRequired"),
                    })}
                    name="password"
                    id="password"
                    type="password"
                  />
                </div>
                <div className="tp-profile-input-title">
                  <label htmlFor="password">{t("oldPassword")}</label>
                </div>
                <ErrorMsg msg={errors.password?.message} />
              </div>
            </div>
          )}
          <div className="col-xxl-6 col-md-6">
            <div className="tp-profile-input-box">
              <div className="tp-profile-input">
                <input
                  {...register("newPassword", {
                    required: t("newPasswordRequired"),
                  })}
                  name="newPassword"
                  id="newPassword"
                  type="password"
                />
              </div>
              <div className="tp-profile-input-title">
                <label htmlFor="newPassword">{t("newPassword")}</label>
              </div>
              <ErrorMsg msg={errors.newPassword?.message} />
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="tp-profile-input-box">
              <div className="tp-profile-input">
                <input
                  {...register("confirmPassword")}
                  name="confirmPassword"
                  id="confirmPassword"
                  type="password"
                />
              </div>
              <div className="tp-profile-input-title">
                <label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</label>
              </div>
              <ErrorMsg msg={errors.confirmPassword?.message} />
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="profile__btn">
              <button type="submit" className="tp-btn">
                {t("update")}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
