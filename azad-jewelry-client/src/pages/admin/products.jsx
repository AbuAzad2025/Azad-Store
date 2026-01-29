import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import { useGetAllProductsQuery, useDeleteProductMutation } from "@/redux/features/productApi";
import Link from "next/link";
import Loader from "@/components/loader/loader";
import Image from "next/image";
import { notifyError, notifySuccess } from "@/utils/toast";
import AdminSidebar from "@/components/admin/sidebar";
import { useLanguage } from "@/context/language-context";

const AdminProducts = () => {
  const router = useRouter();
  const { formatPrice, t } = useLanguage();
  
  const { data: products, isLoading, isError } = useGetAllProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    const adminInfo = Cookies.get("adminInfo");
    if (!adminInfo) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleDelete = async (id) => {
    if(confirm(t("productDeleteConfirm"))) {
        try {
            const res = await deleteProduct(id);
            if(res.data) {
                notifySuccess(t("productDeletedSuccess"));
            } else {
                notifyError(t("productDeleteFailed"));
            }
        } catch (error) {
            notifyError(t("somethingWentWrong"));
        }
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
      <SEO pageTitle={t("adminProducts")} />
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
                        <h3 className="profile__tab-title">{t("manageProducts")}</h3>
                        <div>
                            <Link href="/admin/add-product" className="tp-btn tp-btn-sm" style={{ marginInlineEnd: 10 }}>{t("adminAddProduct")}</Link>
                        </div>
                      </div>
                      
                      <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle">
                          <thead>
                            <tr>
                              <th scope="col">{t("productImage")}</th>
                              <th scope="col">{t("productName")}</th>
                              <th scope="col">{t("price")}</th>
                              <th scope="col">{t("stock")}</th>
                              <th scope="col">{t("status")}</th>
                              <th scope="col">{t("actions")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products?.data?.map((item) => (
                              <tr key={item._id}>
                                <td>
                                    {item.img && <Image src={item.img} alt="product" width={50} height={50} style={{objectFit:'cover', borderRadius:'5px'}} />}
                                </td>
                                <td>{item.title}</td>
                                <td>{formatPrice(item.price)}</td>
                                <td>{item.quantity}</td>
                                <td>
                                    {(() => {
                                      const statusLabel =
                                        item.status === "in-stock"
                                          ? t("inStock")
                                          : item.status === "out-of-stock"
                                            ? t("outOfStock")
                                            : item.status;
                                      return (
                                    <span className={`badge ${item.status === 'in-stock' ? 'bg-success' : 'bg-danger'}`}>
                                        {statusLabel}
                                    </span>
                                      );
                                    })()}
                                </td>
                                <td>
                                    <Link
                                      href={`/admin/edit-product/${item._id}`}
                                      className="btn btn-sm btn-primary me-2"
                                      aria-label={t("edit")}
                                      title={t("edit")}
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(item._id)}
                                      className="btn btn-sm btn-danger"
                                      aria-label={t("delete")}
                                      title={t("delete")}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
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

export default AdminProducts;
