import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import AdminSidebar from '@/components/admin/sidebar';
import Loader from "@/components/loader/loader";
import { useLanguage } from "@/context/language-context";
import { 
    useGetSalesReportQuery, 
    useGetSoldProductsReportQuery, 
    useGetAllOrdersQuery 
} from '@/redux/features/admin/adminApi';
import dayjs from 'dayjs';
// Using Recharts for charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminReports = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('sales');
    const { t } = useLanguage();

    // Queries
    const { data: salesReport, isLoading: isSalesLoading } = useGetSalesReportQuery();
    const { data: soldProducts, isLoading: isProductsLoading } = useGetSoldProductsReportQuery();
    const { data: orders, isLoading: isOrdersLoading } = useGetAllOrdersQuery();

    useEffect(() => {
        const adminInfo = Cookies.get("adminInfo");
        if (!adminInfo) {
            router.push("/admin/login");
        }
    }, [router]);

    if (isSalesLoading || isProductsLoading || isOrdersLoading) {
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

    // Filter pending/processing orders for "Reservations"
    const reservations = orders?.data?.filter(order => 
        ['pending', 'processing'].includes(order.status)
    ) || [];

    return (
        <Wrapper>
            <SEO pageTitle={`${t("reports")} | ${t("adminPanelTitle")}`} />
            <HeaderTwo style_2={true} />
            
            <section className="profile__area pt-120 pb-120">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3">
                            <AdminSidebar />
                        </div>
                        <div className="col-lg-9">
                            <div className="profile__inner p-relative">
                                <div className="d-flex justify-content-between align-items-center mb-40">
                                    <h3 className="profile__tab-title">{t("reportsAndStats")}</h3>
                                </div>

                                {/* Tabs */}
                                <ul className="nav nav-tabs mb-4">
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('sales')}
                                        >
                                            {t("salesReports")}
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${activeTab === 'purchases' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('purchases')}
                                        >
                                            {t("soldProductsReport")}
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('reservations')}
                                        >
                                            {t("reservationsReport")}
                                        </button>
                                    </li>
                                </ul>

                                <div className="tab-content">
                                    {/* Sales Report */}
                                    {activeTab === 'sales' && (
                                        <div className="tab-pane fade show active">
                                            <div className="card mb-4 border-0 shadow-sm">
                                                <div className="card-body">
                                                    <h5 className="card-title mb-4">{t("salesLast7Days")}</h5>
                                                    <div style={{ width: '100%', height: 300 }}>
                                                        <ResponsiveContainer>
                                                            <BarChart data={salesReport?.salesReport || []}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="date" />
                                                                <YAxis />
                                                                <Tooltip />
                                                                <Legend />
                                                                <Bar name={t("salesUsdLegend")} dataKey="total" fill="#8884d8" />
                                                                <Bar name={t("ordersCountLegend")} dataKey="order" fill="#82ca9d" />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="table-responsive bg-white p-3 border rounded">
                                                <h5 className="mb-3">{t("dailySalesDetails")}</h5>
                                                <table className="table table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>{t("date")}</th>
                                                            <th>{t("ordersCount")}</th>
                                                            <th>{t("total")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {salesReport?.salesReport?.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.date}</td>
                                                                <td>{item.order}</td>
                                                                <td>${item.total.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                        {(!salesReport?.salesReport || salesReport.salesReport.length === 0) && (
                                                            <tr><td colSpan="3" className="text-center">{t("noData")}</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sold Products (Purchases) Report */}
                                    {activeTab === 'purchases' && (
                                        <div className="tab-pane fade show active">
                                            <div className="bg-white p-3 border rounded">
                                                <h5 className="mb-3">{t("topSellingProducts")}</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>{t("product")}</th>
                                                                <th>{t("price")}</th>
                                                                <th>{t("quantitySold")}</th>
                                                                <th>{t("totalRevenue")}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {soldProducts?.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{item.title}</td>
                                                                    <td>${item.price}</td>
                                                                    <td>{item.totalSold}</td>
                                                                    <td>${item.totalRevenue.toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                            {(!soldProducts || soldProducts.length === 0) && (
                                                                <tr><td colSpan="4" className="text-center">{t("noData")}</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reservations (Active Orders) Report */}
                                    {activeTab === 'reservations' && (
                                        <div className="tab-pane fade show active">
                                            <div className="bg-white p-3 border rounded">
                                                <h5 className="mb-3">{t("reservationsTitle")}</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>{t("orderNumber")}</th>
                                                                <th>{t("customer")}</th>
                                                                <th>{t("date")}</th>
                                                                <th>{t("amount")}</th>
                                                                <th>{t("status")}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reservations.map((order) => (
                                                                <tr key={order._id}>
                                                                    <td>#{order.invoice}</td>
                                                                    <td>{order.name}</td>
                                                                    <td>{dayjs(order.createdAt).format("DD/MM/YYYY")}</td>
                                                                    <td>${order.totalAmount.toFixed(2)}</td>
                                                                    <td>
                                                                        <span className={`badge bg-${
                                                                            order.status === 'pending' ? 'warning' : 
                                                                            order.status === 'processing' ? 'info' : 'secondary'
                                                                        }`}>
                                                                            {order.status === 'pending' ? t("orderStatus_pending") : t("orderStatus_processing")}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {reservations.length === 0 && (
                                                                <tr><td colSpan="5" className="text-center">{t("noReservationsFound")}</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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

export default AdminReports;
