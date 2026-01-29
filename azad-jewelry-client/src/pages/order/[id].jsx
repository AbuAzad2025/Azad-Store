import React, { useRef } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import ReactToPrint from "react-to-print";
// internal
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import logo from "@assets/img/logo/logo.svg";
import ErrorMsg from "@/components/common/error-msg";
import { useGetUserOrderByIdQuery } from "@/redux/features/order/orderApi";
import PrdDetailsLoader from "@/components/loader/prd-details-loader";
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";


const SingleOrder = ({ params }) => {
  const orderId = params.id;
  const printRef = useRef();
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const { data: order, isError, isLoading } = useGetUserOrderByIdQuery(orderId);
  const { formatPrice, t } = useLanguage();
  let content = null;
  if (isLoading) {
    content = <PrdDetailsLoader loading={isLoading}/>
  }
  if (isError) {
    content = <ErrorMsg msg="errorGeneric" />;
  }
  if (!isLoading && !isError) {
    const { name, country, city, contact, invoice, createdAt, cart, shippingCost, discount, totalAmount, paymentMethod, status } = order.order;
    const resolvedAddress = settings?.address || cachedSettings?.address || t("addressLocation");
    const resolvedPhone = settings?.contactPhone || cachedSettings?.contactPhone || "00970598953362";
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
    const contactPhone = toInternationalPhone(resolvedPhone);
    const whatsappPhoneDigits = contactPhone.replace(/[^\d]/g, "");
    const authenticityMessage = t("authenticityWhatsappMessage", { invoice });
    const whatsappHref = whatsappPhoneDigits
      ? `https://wa.me/${whatsappPhoneDigits}?text=${encodeURIComponent(authenticityMessage)}`
      : null;
    const qrSrc = whatsappHref
      ? `https://quickchart.io/qr?text=${encodeURIComponent(whatsappHref)}&size=220`
      : null;
    const normalizedStatus = String(status || "pending").toLowerCase();
    const statusBadgeClass =
      normalizedStatus === "delivered"
        ? "success"
        : normalizedStatus === "cancel"
          ? "danger"
          : normalizedStatus === "processing"
            ? "info"
            : "warning";
    const statusProgress = normalizedStatus === "delivered" ? 100 : normalizedStatus === "processing" ? 66 : normalizedStatus === "cancel" ? 100 : 33;
    content = (
      <>
        <section className="invoice__area pt-120 pb-120">
          <div className="container">
            <div className="invoice__msg-wrapper">
              <div className="row">
                <div className="col-xl-12">
                  <div className="invoice_msg mb-40">
                    <p className="text-black alert alert-success">
                      {t("thankYouOrderReceived", { name })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div ref={printRef} className="invoice__wrapper grey-bg-2 pt-40 pb-40 pl-40 pr-40 tp-invoice-print-wrapper">
              <div className="invoice__header-wrapper border-2 border-bottom border-white mb-40">
                <div className="row">
                  <div className="col-xl-12">
                    <div className="invoice__header pb-20">
                      <div className="row align-items-end">
                        <div className="col-md-4 col-sm-6">
                          <div className="invoice__left">
                            <Image src={logo} alt={t("siteName")} width={50} height={50} style={{ borderRadius: "50%", objectFit: "cover" }} />
                            <p>{resolvedAddress} <br /> {resolvedPhone} </p>
                          </div>
                        </div>
                        <div className="col-md-8 col-sm-6">
                          <div className="invoice__right mt-15 mt-sm-0 text-sm-end">
                            <h3 className="text-uppercase font-70 mb-20">{t("invoice")}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice__customer mb-30">
                <div className="row">
                  <div className="col-md-6 col-sm-8">
                    <div className="invoice__customer-details">
                      <h4 className="mb-10 text-uppercase">{name}</h4>
                      <p className="mb-0 text-uppercase">{country}</p>
                      <p className="mb-0 text-uppercase">{city}</p>
                      <p className="mb-0">{contact}</p>
                    </div>
                  </div>
                  <div className="col-md-6 col-sm-4">
                    <div className="invoice__details mt-md-0 mt-20 text-md-end">
                      <p className="mb-0">
                        <strong>{t("invoiceId")}:</strong> #{invoice}
                      </p>
                      <p className="mb-0">
                        <strong>{t("status")}:</strong>{" "}
                        <span className={`badge bg-${statusBadgeClass}`}>{t(`orderStatus_${normalizedStatus}`)}</span>
                      </p>
                      <p className="mb-0">
                        <strong>{t("date")}:</strong> {dayjs(createdAt).format("MMMM D, YYYY")}
                      </p>
                      <div className="mt-10">
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className={`progress-bar bg-${statusBadgeClass}`}
                            role="progressbar"
                            style={{ width: `${statusProgress}%` }}
                            aria-valuenow={statusProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                        <div className="d-flex justify-content-between mt-5" style={{ fontSize: 12 }}>
                          <span>{t("orderStatus_pending")}</span>
                          <span>{t("orderStatus_processing")}</span>
                          <span>{t("orderStatus_delivered")}</span>
                        </div>
                      </div>
                      {qrSrc && (
                        <div className="mt-25">
                          <h6 className="mb-10">{t("authenticityCardTitle")}</h6>
                          <div className="bg-white p-2 border rounded d-inline-block">
                            <img
                              src={qrSrc}
                              alt={t("authenticityQrAlt")}
                              width={180}
                              height={180}
                              loading="lazy"
                            />
                          </div>
                          <p className="mb-0 mt-10">{t("scanToVerifyOnWhatsapp")}</p>
                          <a
                            className="tp-btn tp-btn-2 tp-btn-blue mt-10"
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t("verifyOnWhatsapp")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice__order-table pt-30 pb-30 pl-40 pr-40 bg-white mb-30">
                <table className="table">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">{t("serial")}</th>
                      <th scope="col">{t("product")}</th>
                      <th scope="col">{t("quantity")}</th>
                      <th scope="col">{t("price")}</th>
                      <th scope="col">{t("amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {cart.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{item.title}</td>
                        <td>{item.orderQuantity}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{formatPrice(item.price * item.orderQuantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="invoice__total pt-40 pb-10 alert-success pl-40 pr-40 mb-30">
                <div className="row">
                  <div className="col-lg-3 col-md-4">
                    <div className="invoice__payment-method mb-30">
                      <h5 className="mb-0">{t("paymentMethod")}</h5>
                      <p className="tp-font-medium text-uppercase">{paymentMethod}</p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-4">
                    <div className="invoice__shippint-cost mb-30">
                      <h5 className="mb-0">{t("shippingCost")}</h5>
                      <p className="tp-font-medium">{formatPrice(shippingCost)}</p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-4">
                    <div className="invoice__discount-cost mb-30">
                      <h5 className="mb-0">{t("discount")}</h5>
                      <p className="tp-font-medium">{formatPrice(discount)}</p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-4">
                    <div className="invoice__total-ammount mb-30">
                      <h5 className="mb-0">{t("total")}</h5>
                      <p className="tp-font-medium text-danger">
                        <strong>{formatPrice(Number(totalAmount))}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="invoice__print text-end mt-3">
              <div className="row">
                <div className="col-xl-12">
                  <ReactToPrint
                    trigger={() => (
                      <button
                        type="button"
                        className="tp-invoice-print tp-btn tp-btn-black"
                      >
                        <span className="mr-5">
                          <i className="fa-regular fa-print"></i>
                        </span>{" "}
                        {t("print")}
                      </button>
                    )}
                    content={() => printRef.current}
                    documentTitle={t("invoice")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </>

    );
  }
  return (
    <>
      <Wrapper>
        <SEO pageTitle={t("orderDetails")} />
        <HeaderTwo style_2={true} />
        {/* content */}
        {content}
        {/* content */}
        {/* footer start */}
        <Footer primary_style={true} />
        {/* footer end */}
      </Wrapper>
    </>
  );
};

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default SingleOrder;
