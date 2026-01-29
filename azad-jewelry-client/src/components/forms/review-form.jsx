import React,{useState} from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Rating } from "react-simple-star-rating";
import * as Yup from "yup";
// internal
import ErrorMsg from "../common/error-msg";
import { useAddReviewMutation } from "@/redux/features/reviewApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";

const ReviewForm = ({product_id}) => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [addReview, {}] = useAddReviewMutation();
  const schema = Yup.object().shape({
    name: Yup.string().required(t("nameRequired")),
    email: Yup.string().required(t("emailRequired")).email(t("emailInvalid")),
    comment: Yup.string().required(t("commentRequired")),
  });
  const getResultErrorMessage = (result, fallback = t("somethingWentWrong")) => {
    const data = result?.error?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || result?.error?.error || fallback;
  };

  // Catch Rating value
  const handleRating = (rate) => {
    setRating(rate)
  }

   // react hook form
   const {register,handleSubmit,formState: { errors },reset} = useForm({
    resolver: yupResolver(schema),
  });
  // on submit
  const onSubmit = (data) => {
    if(!user){
      notifyError(t("pleaseLoginFirst"));
      return;
    }
    else {
      addReview({
        userId: user?._id,
        productId: product_id,
        rating: rating,
        comment: data.comment,
      }).then((result) => {
        if (result?.error) {
          notifyError(getResultErrorMessage(result, t("submitReviewFailed")));
        } else {
          notifySuccess(result?.data?.message);
          reset();
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-product-details-review-form-rating d-flex align-items-center">
        <p>{t("yourRating")}</p>
        <div className="tp-product-details-review-form-rating-icon d-flex align-items-center">
          <Rating onClick={handleRating} allowFraction size={16} initialValue={rating} />
        </div>
      </div>
      <div className="tp-product-details-review-input-wrapper">
        <div className="tp-product-details-review-input-box">
          <div className="tp-product-details-review-input">
            <textarea
              {...register("comment", { required: t("commentRequired") })}
              id="comment"
              name="comment"
              placeholder={t("writeYourReviewHere")}
            />
          </div>
          <div className="tp-product-details-review-input-title">
            <label htmlFor="comment">{t("review")}</label>
          </div>
          <ErrorMsg msg={errors.comment?.message} />
        </div>
        <div className="tp-product-details-review-input-box">
          <div className="tp-product-details-review-input">
            <input
              {...register("name", { required: t("nameRequired") })}
              name="name"
              id="name"
              type="text"
              placeholder={t("nameLabel")}
            />
          </div>
          <div className="tp-product-details-review-input-title">
            <label htmlFor="name">{t("nameLabel")}</label>
          </div>
          <ErrorMsg msg={errors.name?.message} />
        </div>
        <div className="tp-product-details-review-input-box">
          <div className="tp-product-details-review-input">
            <input
              {...register("email", { required: t("emailRequired") })}
              name="email"
              id="email"
              type="email"
              placeholder="name@example.com"
            />
          </div>
          <div className="tp-product-details-review-input-title">
            <label htmlFor="email">{t("emailLabel")}</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
      </div>
      <div className="tp-product-details-review-btn-wrapper">
        <button type="submit" className="tp-product-details-review-btn">{t("send")}</button>
      </div>
    </form>
  );
};

export default ReviewForm;
