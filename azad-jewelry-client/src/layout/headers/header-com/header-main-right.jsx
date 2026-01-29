import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
// internal
import useCartInfo from "@/hooks/use-cart-info";
import logo from "@assets/img/logo/logo.svg";
import { CartTwo, Compare, Menu, Wishlist } from "@/svg";
import { openCartMini } from "@/redux/features/cartSlice";
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const HeaderMainRight = ({ setIsCanvasOpen }) => {
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const { user: userInfo } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { quantity } = useCartInfo();
  const dispatch = useDispatch()
  const { t } = useLanguage();
  return (
    <div className="tp-header-main-right d-flex align-items-center justify-content-end">
      <div className="tp-header-login d-none d-lg-block">
        <div className="d-flex align-items-center">
          <div className="tp-header-login-icon">
            <span>
              {userInfo?.imageURL ? (
                <Link href="/profile">
                  <Image
                    src={userInfo.imageURL}
                    alt="user img"
                    width={35}
                    height={35}
                  />
                </Link>
              ) : userInfo?.name ? (
                <Link href="/profile">
                  <h2 className="text-uppercase login_text">
                    {userInfo?.name[0]}
                  </h2>
                </Link>
              ) : (
                <Image
                  src={logo}
                  alt={t("siteName")}
                  width={35}
                  height={35}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                  priority
                />
              )}
            </span>
          </div>
          <div className="tp-header-login-content d-none d-xl-block">
            {!userInfo?.name && (
              <Link href="/login">
                <span>{t("hello")}</span>
              </Link>
            )}
            {userInfo?.name && <span>{t("helloUser", { name: userInfo?.name })}</span>}
            <div className="tp-header-login-title">
              {!userInfo?.name && <Link href="/login">{t("login")}</Link>}
              {userInfo?.name && <Link href="/profile">{t("yourAccount")}</Link>}
            </div>
          </div>
        </div>
      </div>
      <div className="tp-header-action d-flex align-items-center ml-50">
        <div className="tp-header-action-item d-none d-lg-block">
          <Link href="/compare" className="tp-header-action-btn" aria-label={t("compare")} title={t("compare")}>
            <Compare />
          </Link>
        </div>
        <div className="tp-header-action-item d-none d-lg-block">
          <Link href="/wishlist" className="tp-header-action-btn" aria-label={t("wishlist")} title={t("wishlist")}>
            <Wishlist />
            <span className="tp-header-action-badge">{wishlist.length}</span>
          </Link>
        </div>
        <div className="tp-header-action-item">
          <button
            onClick={() => dispatch(openCartMini())}
            type="button"
            className="tp-header-action-btn cartmini-open-btn"
            aria-label={t("cart")}
            title={t("cart")}
          >
            <CartTwo />
            <span className="tp-header-action-badge">{quantity}</span>
          </button>
        </div>
        <div className="tp-header-action-item d-lg-none">
          <button
            onClick={() => setIsCanvasOpen(true)}
            type="button"
            className="tp-header-action-btn tp-offcanvas-open-btn"
            aria-label={t("menu")}
            title={t("menu")}
          >
            <Menu />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMainRight;
