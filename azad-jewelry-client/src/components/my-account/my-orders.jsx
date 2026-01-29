import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { useLanguage } from "@/context/language-context";

const MyOrders = ({ orderData }) => {
  const order_items = orderData?.orders;
  const { t } = useLanguage();
  return (
    <div className="profile__ticket table-responsive">
      {!order_items ||
        (order_items?.length === 0 && (
          <div
            style={{ height: "210px" }}
            className="d-flex align-items-center justify-content-center"
          >
            <div className="text-center">
              <i
                style={{ fontSize: "30px" }}
                className="fa-solid fa-cart-circle-xmark"
              ></i>
              <p>{t("noOrdersYet")}</p>
            </div>
          </div>
        ))}
      {order_items && order_items?.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">{t("orderId")}</th>
              <th scope="col">{t("orderTime")}</th>
              <th scope="col">{t("status")}</th>
              <th scope="col">{t("view")}</th>
            </tr>
          </thead>
          <tbody>
            {order_items.map((item, i) => (
              <tr key={i}>
                <th scope="row">#{item._id.substring(20, 25)}</th>
                <td data-info="title">
                  {dayjs(item.createdAt).format("MMMM D, YYYY")}
                </td>
                <td
                  data-info={`status ${item.status === "pending" ? "pending" : ""}  ${item.status === "processing" ? "hold" : ""}  ${item.status === "delivered" ? "done" : ""}`}
                  className={`status ${item.status === "pending" ? "pending" : ""} ${item.status === "processing" ? "hold" : ""}  ${item.status === "delivered" ? "done" : ""}`}
                >
                  {t(`orderStatus_${String(item.status || "pending").toLowerCase()}`)}
                </td>
                <td>
                  <Link href={`/order/${item._id}`} className="tp-logout-btn">
                    {t("invoice")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders;
