import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import { useDispatch } from "react-redux";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "@/redux/features/admin/adminApi";
import Link from "next/link";
import Loader from "@/components/loader/loader";
import dayjs from "dayjs";
import { notifyError, notifySuccess } from "@/utils/toast";
import AdminSidebar from "@/components/admin/sidebar";
import { useLanguage } from "@/context/language-context";

const AdminOrders = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  
  const { data: orders, isLoading, isError } = useGetAllOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();

  useEffect(() => {
    const adminInfo = Cookies.get("adminInfo");
    if (!adminInfo) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleStatusChange = async (id, newStatus) => {
      try {
          const res = await updateStatus({ id, status: newStatus });
          if(res.data) {
              notifySuccess(t("orderStatusUpdated"));
          } else {
              notifyError(t("statusUpdateFailed"));
          }
      } catch (error) {
          notifyError(t("somethingWentWrong"));
      }
  };

  if (isLoading) {
    return (
      <Wrapper>
        <HeaderTwo style_2={true} />
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <Loader />
        </div>
        <Footer style_2={true} />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SEO pageTitle={t("adminOrders")} />
      <HeaderTwo style_2={true} />
      
      <section className="profile__area pt-120 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
                <AdminSidebar />
            </div>
            <div className="col-lg-9">
              <div className="profile__inner p-relative">
                <div className="row">
                  <div className="col-md-12">
                    <div className="profile__tab-content">
                      <div className="d-flex justify-content-between align-items-center mb-40">
                        <h3 className="profile__tab-title">{t("manageOrders")}</h3>
                      </div>
                      
                      <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle">
                          <thead>
                            <tr>
                              <th scope="col">{t("orderNumber")}</th>
                              <th scope="col">{t("date")}</th>
                              <th scope="col">{t("customer")}</th>
                              <th scope="col">{t("amount")}</th>
                              <th scope="col">{t("status")}</th>
                              <th scope="col">{t("payment")}</th>
                              <th scope="col">{t("updateStatus")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders?.data?.map((item) => (
                              <tr key={item._id}>
                                <td>#{item._id.substring(20, 24)}</td>
                                <td>{dayjs(item.createdAt).format("DD/MM/YYYY")}</td>
                                <td>{item.user?.name || item.name}</td>
                                <td>${item.totalAmount}</td>
                                <td>
                                    <span className={`badge bg-${
                                        item.status === 'delivered' ? 'success' : 
                                        item.status === 'cancel' ? 'danger' :
                                        item.status === 'processing' ? 'info' : 'warning'
                                    }`}>
                                        {t(`orderStatus_${item.status}`)}
                                    </span>
                                </td>
                                <td>{item.paymentMethod}</td>
                                <td>
                                    <select 
                                        className="form-select form-select-sm" 
                                        value={item.status}
                                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                        style={{width: '130px'}}
                                    >
                                        <option value="pending">{t("orderStatus_pending")}</option>
                                        <option value="processing">{t("orderStatus_processing")}</option>
                                        <option value="delivered">{t("orderStatus_delivered")}</option>
                                        <option value="cancel">{t("orderStatus_cancel")}</option>
                                    </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer style_2={true} />
    </Wrapper>
  );
};

export default AdminOrders;
