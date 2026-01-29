import { useRouter } from "next/router";
import React, { useEffect } from "react";
// internal
import ErrorMsg from "@/components/common/error-msg";
import { useConfirmEmailQuery } from "@/redux/features/auth/authApi";
import { notifySuccess } from "@/utils/toast";
import Wrapper from "@/layout/wrapper";
import { useLanguage } from "@/context/language-context";

const EmailVerification = ({ params }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const { data, isLoading, isError, error, isSuccess } = useConfirmEmailQuery(params.token)

  useEffect(() => {
    if (isSuccess) {
      router.push("/");
      notifySuccess(t("createAccountSuccess"));
    }
  }, [router, isSuccess, t]);

  return (
    <Wrapper>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        {isLoading ? (
          <h3>{t("loadingDots")}</h3>
        ) : isSuccess ? (
          <h2>{data?.message}</h2>
        ) : (
          <ErrorMsg msg={error?.data?.error} />
        )}
      </div>
    </Wrapper>
  );
};

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default EmailVerification;
