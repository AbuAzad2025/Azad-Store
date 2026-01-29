import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const envApiBaseUrl =
  typeof process.env.NEXT_PUBLIC_API_BASE_URL === "string"
    ? process.env.NEXT_PUBLIC_API_BASE_URL.trim().replace(/\/+$/, "")
    : "";

const isDev = process.env.NODE_ENV === "development";
const devDefaultApiBaseUrl = "http://localhost:7000";

const isBrowser = typeof window !== "undefined";
const getCandidateApiBaseUrls = () =>
  Array.from(
    new Set(
      [
        isBrowser ? "" : null,
        envApiBaseUrl.length > 0 ? envApiBaseUrl : null,
        isDev ? devDefaultApiBaseUrl : null,
      ].filter((url) => typeof url === "string")
    )
  );

const prepareHeaders = async (headers) => {
  try {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user?.accessToken) {
        headers.set("Authorization", `Bearer ${user.accessToken}`);
      }
      return headers;
    }

    const adminInfo = Cookies.get("adminInfo");
    if (adminInfo) {
      const admin = JSON.parse(adminInfo);
      if (admin?.accessToken) {
        headers.set("Authorization", `Bearer ${admin.accessToken}`);
      }
    }
  } catch (error) {
  }
  return headers;
};

const createBaseQuery = (baseUrl) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  });

let lastWorkingBaseUrl = null;
const baseQueryWithFallback = async (args, api, extraOptions) => {
  const normalizeArgsForBaseUrl = (baseUrl, originalArgs) => {
    const baseHasApiSuffix = /\/api$/i.test(baseUrl);
    const normalizeUrl = (url) => {
      if (!baseHasApiSuffix) return url;
      return typeof url === "string" && url.startsWith("/api/") ? url.slice(4) : url;
    };

    if (typeof originalArgs === "string") {
      return normalizeUrl(originalArgs);
    }
    if (originalArgs && typeof originalArgs === "object" && typeof originalArgs.url === "string") {
      return { ...originalArgs, url: normalizeUrl(originalArgs.url) };
    }
    return originalArgs;
  };

  const candidateApiBaseUrls = getCandidateApiBaseUrls();
  if (!candidateApiBaseUrls.includes(lastWorkingBaseUrl)) {
    lastWorkingBaseUrl = candidateApiBaseUrls[0] ?? "";
  }
  const baseUrls = [
    lastWorkingBaseUrl,
    ...candidateApiBaseUrls.filter((url) => url !== lastWorkingBaseUrl),
  ];

  let lastResult;
  const isNetworkError = (result) => {
    const status = result?.error?.status;
    return status === "FETCH_ERROR" || status === "TIMEOUT_ERROR";
  };

  for (const baseUrl of baseUrls) {
    const normalizedArgs = normalizeArgsForBaseUrl(baseUrl, args);
    lastResult = await createBaseQuery(baseUrl)(normalizedArgs, api, extraOptions);
    if (!lastResult.error) {
      lastWorkingBaseUrl = baseUrl;
      return lastResult;
    }
    if (!isNetworkError(lastResult)) {
      return lastResult;
    }
  }
  return lastResult;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithFallback,
  endpoints: (builder) => ({}),
  tagTypes: ["Products","Coupon","Product","RelatedProducts","UserOrder","UserOrders","ProductType","OfferProducts","PopularProducts","TopRatedProducts","Category","Brand","Reviews","Users","Settings"]
});
