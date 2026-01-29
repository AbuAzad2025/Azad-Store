import React from 'react';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import ErrorMsg from '../common/error-msg';
import { EmailTwo, LocationTwo, PhoneThree, UserThree } from '@/svg';
import { useUpdateProfileMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useLanguage } from '@/context/language-context';

const ProfileInfo = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const schema = Yup.object().shape({
    name: Yup.string().required(t("nameRequired")),
    email: Yup.string().required(t("emailRequired")).email(t("emailInvalid")),
    phone: Yup.string().required(t("phoneRequired")).min(11, t("phoneMin11")),
    address: Yup.string().required(t("addressRequired")),
    bio: Yup.string().required(t("bioRequired")).min(20, t("bioMin20")),
  });

  const [updateProfile, {}] = useUpdateProfileMutation();
  const getResultErrorMessage = (result, fallback = t("somethingWentWrong")) => {
    const data = result?.error?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || result?.error?.error || fallback;
  };
  // react hook form
  const {register,handleSubmit,formState: { errors },reset} = useForm({
    resolver: yupResolver(schema),
  });
  // on submit
  const onSubmit = (data) => {
    updateProfile({
      id:user?._id,
      name:data.name,
      email:data.email,
      phone:data.phone,
      address:data.address,
      bio:data.bio,
    }).then((result) => {
      if(result?.error){
        notifyError(getResultErrorMessage(result, t("updateProfileFailed")));
      }
      else {
        notifySuccess(result?.data?.message);
        reset();
      }
    })
  };
  return (
    <div className="profile__info">
      <h3 className="profile__info-title">{t("personalDetails")}</h3>
      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("name", { required: t("nameRequired") })} name='name' type="text" placeholder={t("enterUsername")} defaultValue={user?.name || ""} />
                  <span>
                    <UserThree/>
                  </span>
                  <ErrorMsg msg={errors.name?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("email", { required: t("emailRequired") })} name='email' type="email" placeholder={t("enterYourEmail")} defaultValue={user?.email || ""} />
                  <span>
                    <EmailTwo/>
                  </span>
                  <ErrorMsg msg={errors.email?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("phone", { required: true })} name='phone' type="text" placeholder={t("enterYourNumber")} defaultValue={user?.phone || ""} />
                  <span>
                    <PhoneThree/>
                  </span>
                  <ErrorMsg msg={errors.phone?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("address", { required: true })} name='address' type="text" placeholder={t("enterYourAddress")} defaultValue={user?.address || ""} />
                  <span>
                    <LocationTwo/>
                  </span>
                  <ErrorMsg msg={errors.address?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <textarea {...register("bio", { required: true })} name='bio' placeholder={t("enterYourBio")} defaultValue={user?.bio || ""} />
                  <ErrorMsg msg={errors.bio?.message} />
                </div>
              </div>
            </div>
            <div className="col-xxl-12">
              <div className="profile__btn">
                <button type="submit" className="tp-btn">{t("updateProfile")}</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfo;
