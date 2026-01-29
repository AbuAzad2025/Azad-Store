import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useLanguage } from "@/context/language-context";
import { useGetAllProductsQuery } from "@/redux/features/productApi";

const SearchBar = ({ isSearchOpen, setIsSearchOpen }) => {
  const { setSearchText, setCategory, handleSubmit, searchText } =
    useSearchFormSubmit();
  const { t } = useLanguage();
  const router = useRouter();
  const [debouncedText, setDebouncedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef();

  // selectHandle
  const handleCategory = (value) => {
    setCategory(value);
  };

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
    setIsSearchOpen(false);
    setSearchText("");
    router.push(`/product-details/${product._id}`);
  };

  const categories = ["electronics", "fashion", "beauty", "jewelry"];
  return (
    <>
      <section
        className={`tp-search-area tp-search-style-brown ${
          isSearchOpen ? "opened" : ""
        }`}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-search-form">
                <div
                  onClick={() => setIsSearchOpen(false)}
                  className="tp-search-close text-center mb-20"
                >
                  <button className="tp-search-close-btn tp-search-close-btn"></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="tp-search-input mb-10" style={{ position: "relative" }}>
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
                    />
                    <button type="submit">
                      <i className="flaticon-search-1"></i>
                    </button>
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
                      </div>
                    )}
                  </div>
                  <div className="tp-search-category">
                    <span>{t("searchBy")} </span>
                    {categories.map((c, i) => (
                      <a
                        key={i}
                        onClick={() => handleCategory(c)}
                        className="cursor-pointer"
                      >
                        {t(c)}
                        {i < categories.length - 1 && ", "}
                      </a>
                    ))}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* body overlay */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className={`body-overlay ${isSearchOpen ? "opened" : ""}`}
      ></div>
    </>
  );
};

export default SearchBar;
