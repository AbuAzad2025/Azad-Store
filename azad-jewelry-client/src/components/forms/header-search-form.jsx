// internal
import { Search } from "@/svg";
import NiceSelect from "@/ui/nice-select";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useLanguage } from "@/context/language-context";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGetAllProductsQuery } from "@/redux/features/productApi";

const HeaderSearchForm = () => {
  const router = useRouter();
  const { setSearchText, setCategory, handleSubmit, searchText, category, submitSearch } = useSearchFormSubmit();
  const { t } = useLanguage();
  const [debouncedText, setDebouncedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef();

  // selectHandle
  const selectCategoryHandle = (e) => {
    setCategory(e.value);
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
    const categoryNormalized =
      category && category !== "Select Category" ? String(category).toLowerCase() : "";
    const filtered = list
      .filter((p) => p?.status !== "out-of-stock")
      .filter((p) => (categoryNormalized ? String(p?.productType || "").toLowerCase() === categoryNormalized : true))
      .filter((p) => String(p?.title || "").toLowerCase().includes(term));

    return filtered.slice(0, 6);
  }, [productsData, debouncedText, category]);

  const handlePickProduct = (product) => {
    setIsOpen(false);
    setSearchText("");
    router.push(`/product-details/${product._id}`);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    submitSearch(searchText, category);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="tp-header-search-wrapper d-flex align-items-center">
        <div className="tp-header-search-box" style={{ position: "relative" }}>
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
                onClick={handleViewAll}
              >
                {t("viewAllResults")}
              </button>
            </div>
          )}
        </div>
        <div className="tp-header-search-category">
          <NiceSelect
            options={[
              { value: "Select Category", text: t("selectCategory") },
              { value: "electronics", text: t("electronics") },
              { value: "fashion", text: t("fashion") },
              { value: "beauty", text: t("beauty") },
              { value: "jewelry", text: t("jewelry") },
            ]}
            defaultCurrent={0}
            onChange={selectCategoryHandle}
            name="Select Category"
          />
        </div>
        <div className="tp-header-search-btn">
          <button type="submit">
            <Search />
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeaderSearchForm;
