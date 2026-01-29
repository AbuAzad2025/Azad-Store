import React from "react";
import { useLanguage } from "@/context/language-context";


const ErrorMsg = ({ msg }) => {
  const { t } = useLanguage();

  const msgToKey = {
    "There was an error": "errorGeneric",
    "No products found": "noProductsFound",
    "No products found!": "noProductsFound",
    "No Products found!": "noProductsFound",
    "No Category found!": "noCategoryFound",
    "No Brands found!": "noBrandsFound",
    "No Coupons found!": "noCouponsFound",
  };

  const keyOrText = msgToKey[msg] || msg;
  return <div style={{ color: "red" }}>{t(keyOrText)}</div>;
};

export default ErrorMsg;
