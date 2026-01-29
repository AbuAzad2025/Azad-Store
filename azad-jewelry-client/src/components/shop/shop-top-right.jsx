import React from "react";
import { useDispatch } from "react-redux";
// internal
import { Filter } from "@/svg";
import NiceSelect from "@/ui/nice-select";
import {handleFilterSidebarOpen } from "@/redux/features/shop-filter-slice";
import { useLanguage } from "@/context/language-context";

const ShopTopRight = ({selectHandleFilter}) => {
  const dispatch = useDispatch()
  const { t } = useLanguage();
  return (
    <div className="tp-shop-top-right d-sm-flex align-items-center justify-content-xl-end">
      <div className="tp-shop-top-select">
        <NiceSelect
          options={[
            { value: "Default Sorting", text: t("defaultSorting") },
            { value: "Low to High", text: t("lowToHigh") },
            { value: "High to Low", text: t("highToLow") },
            { value: "New Added", text: t("newAdded") },
            { value: "On Sale", text: t("onSale") },
          ]}
          defaultCurrent={0}
          onChange={selectHandleFilter}
          name="Default Sorting"
        />
      </div>
      <div className="tp-shop-top-filter">
        <button onClick={()=> dispatch(handleFilterSidebarOpen())} type="button" className="tp-filter-btn">
          <span>
            <Filter />
          </span>
          {" "}{t("filter")}
        </button>
      </div>
    </div>
  );
};

export default ShopTopRight;
