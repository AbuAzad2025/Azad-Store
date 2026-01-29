import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedOut } from "@/redux/features/auth/authSlice";
import { useLanguage } from "@/context/language-context";

// language
function Language({active,handleActive}) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="tp-header-top-menu-item tp-header-lang">
      <span
        onClick={() => handleActive('lang')}
        className="tp-header-lang-toggle"
        id="tp-header-lang-toggle"
      >
        {language === "ar" ? t("arabic") : t("english")}
      </span>
      <ul className={active === 'lang' ? "tp-lang-list-open" : ""}>
        <li>
          <button type="button" onClick={() => setLanguage("en")}>
            {t("english")}
          </button>
        </li>
        <li>
          <button type="button" onClick={() => setLanguage("ar")}>
            {t("arabic")}
          </button>
        </li>
      </ul>
    </div>
  );
}

// currency
function Currency({active,handleActive}) {
  const { currency, setCurrency, currencyLabel, t } = useLanguage();
  return (
    <div className="tp-header-top-menu-item tp-header-currency">
      <span
        onClick={() => handleActive('currency')}
        className="tp-header-currency-toggle"
        id="tp-header-currency-toggle"
      >
        {t("currency")} : {currency}
      </span>
      <ul className={active === 'currency' ? "tp-currency-list-open" : ""}>
        <li>
          <button type="button" onClick={() => setCurrency("ILS")}>
            {currencyLabel("ILS")} - ILS
          </button>
        </li>
        <li>
          <button type="button" onClick={() => setCurrency("JOD")}>
            {currencyLabel("JOD")} - JOD
          </button>
        </li>
        <li>
          <button type="button" onClick={() => setCurrency("USD")}>
            {currencyLabel("USD")} - USD
          </button>
        </li>
        <li>
          <button type="button" onClick={() => setCurrency("AED")}>
            {currencyLabel("AED")} - AED
          </button>
        </li>
        <li>
          <button type="button" onClick={() => setCurrency("SAR")}>
            {currencyLabel("SAR")} - SAR
          </button>
        </li>
      </ul>
    </div>
  );
}

// setting
function ProfileSetting({active,handleActive}) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useLanguage();
  // handle logout
  const handleLogout = () => {
    dispatch(userLoggedOut());
    router.push('/')
  }
  return (
    <div className="tp-header-top-menu-item tp-header-setting">
      <span
        onClick={() => handleActive('setting')}
        className="tp-header-setting-toggle"
        id="tp-header-setting-toggle"
      >
        {t("setting")}
      </span>
      <ul className={active === 'setting' ? "tp-setting-list-open" : ""}>
        <li>
          <Link href="/profile">{t("myProfile")}</Link>
        </li>
        <li>
          <Link href="/wishlist">{t("wishlist")}</Link>
        </li>
        <li>
          <Link href="/cart">{t("cart")}</Link>
        </li>
        <li>
          {!user?.name &&<Link href="/login" className="cursor-pointer">{t("login")}</Link>}
          {user?.name &&<a onClick={handleLogout} className="cursor-pointer">{t("logout")}</a>}
        </li>
      </ul>
    </div>
  );
}

const HeaderTopRight = () => {
  const [active, setIsActive] = useState('');
  // handle active
  const handleActive = (type) => {
    if(type === active){
      setIsActive('')
    }
    else {
      setIsActive(type)
    }
  }
  return (
    <div className="tp-header-top-menu d-flex align-items-center justify-content-end">
      <Language active={active} handleActive={handleActive} />
      <Currency active={active} handleActive={handleActive} />
      <ProfileSetting active={active} handleActive={handleActive} />
    </div>
  );
};

export default HeaderTopRight;
