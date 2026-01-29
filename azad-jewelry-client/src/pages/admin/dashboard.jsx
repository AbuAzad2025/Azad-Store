import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import { useGetDashboardAmountQuery } from "@/redux/features/admin/adminApi";
import Loader from "@/components/loader/loader";
import AdminSidebar from "@/components/admin/sidebar";
import { useLanguage } from "@/context/language-context";

const AdminDashboard = () => {
  const router = useRouter();
  const { t } = useLanguage();
  
  const { data: dashboardData, isLoading } = useGetDashboardAmountQuery();

  useEffect(() => {
    const adminInfo = Cookies.get("adminInfo");
    if (!adminInfo) {
      router.push("/admin/login");
    }
  }, [router]);

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
      <SEO pageTitle={t("adminPanelTitle")} />
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
                        <h3 className="profile__tab-title">{t("adminPanelTitle")}</h3>
                      </div>

                      {/* Stats Area */}
                      <div className="row mb-40">
                        <div className="col-lg-4 col-md-6 mb-20">
                           <div className="tp-order-info-item p-4 border rounded text-center" style={{backgroundColor: '#f8f9fa'}}>
                              <h5 className="mb-10 text-muted">{t("dashboardTotalSales")}</h5>
                              <h3 className="mb-0 text-primary">${dashboardData?.totalOrderAmount?.toFixed(2) || '0.00'}</h3>
                           </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-20">
                           <div className="tp-order-info-item p-4 border rounded text-center" style={{backgroundColor: '#f8f9fa'}}>
                              <h5 className="mb-10 text-muted">{t("dashboardTotalOrders")}</h5>
                              <h3 className="mb-0 text-primary">{dashboardData?.totalOrder || 0}</h3>
                           </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-20">
                           <div className="tp-order-info-item p-4 border rounded text-center" style={{backgroundColor: '#f8f9fa'}}>
                              <h5 className="mb-10 text-muted">{t("dashboardPendingOrders")}</h5>
                              <h3 className="mb-0 text-warning">{dashboardData?.pendingOrder || 0}</h3>
                           </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-20">
                           <div className="tp-order-info-item p-4 border rounded text-center" style={{backgroundColor: '#f8f9fa'}}>
                              <h5 className="mb-10 text-muted">{t("dashboardProcessingOrders")}</h5>
                              <h3 className="mb-0 text-info">{dashboardData?.processingOrder || 0}</h3>
                           </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-20">
                           <div className="tp-order-info-item p-4 border rounded text-center" style={{backgroundColor: '#f8f9fa'}}>
                              <h5 className="mb-10 text-muted">{t("dashboardCompletedOrders")}</h5>
                              <h3 className="mb-0 text-success">{dashboardData?.completeOrder || 0}</h3>
                           </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                            <div className="alert alert-info">
                                {t("dashboardWelcome")}
                            </div>
                        </div>
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

export default AdminDashboard;
