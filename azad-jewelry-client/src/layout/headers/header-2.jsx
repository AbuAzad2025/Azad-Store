import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
// internal
import Menus from './header-com/menus';
import logo from '@assets/img/logo/logo.svg';
import useSticky from '@/hooks/use-sticky';
import useCartInfo from '@/hooks/use-cart-info';
import { openCartMini } from '@/redux/features/cartSlice';
import HeaderTopRight from './header-com/header-top-right';
import CartMiniSidebar from '@/components/common/cart-mini-sidebar';
import { CartTwo, Compare, Facebook, Menu, PhoneTwo, Wishlist, Search } from '@/svg';
import useSearchFormSubmit from '@/hooks/use-search-form-submit';
import OffCanvas from '@/components/common/off-canvas';
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";
import { useRouter } from "next/router";
import { useGetAllProductsQuery } from "@/redux/features/productApi";

const HeaderTwo = ({ style_2 = false }) => {
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const { wishlist } = useSelector((state) => state.wishlist);
  const [isOffCanvasOpen, setIsCanvasOpen] = useState(false);
  const router = useRouter();
  const { setSearchText, handleSubmit, searchText, submitSearch } = useSearchFormSubmit();
  const { quantity } = useCartInfo();
  const { sticky } = useSticky();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [debouncedText, setDebouncedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef();
  const toInternationalPhone = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const compact = raw.replace(/\s+/g, "").replace(/-/g, "");
    if (compact.startsWith("+")) return compact;
    if (compact.startsWith("00")) return `+${compact.slice(2)}`;
    const digits = compact.replace(/[^\d]/g, "");
    if (!digits) return raw;
    if (digits.startsWith("970")) return `+${digits}`;
    if (digits.startsWith("0") && digits.length >= 9) return `+970${digits.slice(1)}`;
    return `+${digits}`;
  };
  const contactPhone = toInternationalPhone(settings?.contactPhone || cachedSettings?.contactPhone || "00970598953362");
  const resolvedSiteName = settings?.siteName || cachedSettings?.siteName || t("siteName");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(String(searchText || "").trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const { data: productsData } = useGetAllProductsQuery(undefined, {
    skip: debouncedText.length < 2,
  });

  const suggestions = useMemo(() => {
    if (debouncedText.length < 2) return [];
    const list = Array.isArray(productsData?.data) ? productsData.data : [];
    const term = debouncedText.toLowerCase();
    const filtered = list
      .filter((p) => p?.status !== "out-of-stock")
      .filter((p) => String(p?.title || "").toLowerCase().includes(term));
    return filtered.slice(0, 6);
  }, [productsData, debouncedText]);

  const handlePickProduct = (product) => {
    setIsOpen(false);
    setSearchText("");
    router.push(`/product-details/${product._id}`);
  };
  return (
    <>
      <header>
        <div className={`tp-header-area tp-header-style-${style_2 ? 'primary' : 'darkRed'} tp-header-height`}>
          <div className="tp-header-top-2 p-relative z-index-11 tp-header-top-border d-none d-md-block">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="tp-header-info d-flex align-items-center">
                    <div className="tp-header-info-item">
                      <a href={settings?.facebook || "#"} target="_blank" rel="noreferrer">
                        <span>
                          <Facebook />
                        </span> 
                        {/* 7500k {t("followers")} */}
                        {t("facebook")}
                      </a>
                    </div>
                    <div className="tp-header-info-item">
                      <a href={`tel:${contactPhone}`}>
                        <span>
                          <PhoneTwo />
                        </span> {contactPhone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="tp-header-top-right tp-header-top-black d-flex align-items-center justify-content-end">
                    <HeaderTopRight />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="header-sticky" className={`tp-header-bottom-2 tp-header-sticky ${sticky ? 'header-sticky' : ''}`}>
            <div className="container">
              <div className="tp-mega-menu-wrapper p-relative">
                <div className="row align-items-center">
                  <div className="col-xl-2 col-lg-5 col-md-5 col-sm-4 col-6">
                    <div className="logo">
                      <Link href="/">
                        <Image
                          src={logo}
                          alt={resolvedSiteName}
                          width={40}
                          height={40}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                          priority
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="col-xl-5 d-none d-xl-block">
                    <div className="main-menu menu-style-2">
                      <nav className="tp-main-menu-content">
                        <Menus />
                      </nav>
                    </div>
                  </div>
                  <div className="col-xl-5 col-lg-7 col-md-7 col-sm-8 col-6">
                    <div className="tp-header-bottom-right d-flex align-items-center justify-content-end pl-30">
                      <div className="tp-header-search-2 d-none d-sm-block">
                        <form onSubmit={handleSubmit}>
                          <div style={{ position: "relative" }}>
                            <input
                              onChange={(e) => {
                                setSearchText(e.target.value);
                                setIsOpen(true);
                              }}
                              onFocus={() => setIsOpen(true)}
                              onBlur={() => {
                                blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 120);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") setIsOpen(false);
                              }}
                              value={searchText}
                              type="text"
                              placeholder={t("searchPlaceholder")}
                              aria-label={t("search")}
                            />
                            {isOpen && suggestions.length > 0 && (
                              <div
                                className="list-group"
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 6px)",
                                  left: 0,
                                  right: 0,
                                  zIndex: 9999,
                                  maxHeight: 280,
                                  overflowY: "auto",
                                }}
                              >
                                {suggestions.map((p) => (
                                  <button
                                    key={p._id}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handlePickProduct(p)}
                                  >
                                    {p.title}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  className="list-group-item list-group-item-action"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setIsOpen(false);
                                    submitSearch(searchText);
                                  }}
                                >
                                  {t("viewAllResults")}
                                </button>
                              </div>
                            )}
                          </div>
                          <button type="submit">
                            <Search />
                          </button>
                        </form>
                      </div>
                      <div className="tp-header-action d-flex align-items-center ml-30">
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
                          <button onClick={() => dispatch(openCartMini())} type="button" className="tp-header-action-btn cartmini-open-btn" aria-label={t("cart")} title={t("cart")}>
                            <CartTwo />
                            <span className="tp-header-action-badge">{quantity}</span>
                          </button>
                        </div>
                        <div className="tp-header-action-item tp-header-hamburger mr-20 d-xl-none">
                          <button onClick={() => setIsCanvasOpen(true)} type="button" className="tp-offcanvas-open-btn" aria-label={t("menu")} title={t("menu")}>
                            <Menu />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* cart mini sidebar start */}
      <CartMiniSidebar />
      {/* cart mini sidebar end */}

      {/* off canvas start */}
      <OffCanvas isOffCanvasOpen={isOffCanvasOpen} setIsCanvasOpen={setIsCanvasOpen} categoryType="fashion" />
      {/* off canvas end */}
    </>
  );
};

export default HeaderTwo;
