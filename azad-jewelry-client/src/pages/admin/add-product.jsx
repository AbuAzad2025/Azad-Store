import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import { useAddProductMutation } from "@/redux/features/productApi";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useGetActiveBrandsQuery } from "@/redux/features/brandApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import AdminSidebar from "@/components/admin/sidebar";
import { useLanguage } from "@/context/language-context";

const AdminAddProduct = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [addProduct, { isLoading }] = useAddProductMutation();
  const { data: categories } = useGetShowCategoryQuery();
  const { data: brands } = useGetActiveBrandsQuery();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const schema = React.useMemo(() => {
    return Yup.object().shape({
      title: Yup.string().required(t("productTitleRequired")),
      price: Yup.number().typeError(t("mustBeNumber")).required(t("priceRequired")).positive(t("mustBePositive")),
      sku: Yup.string().required(t("skuRequired")),
      quantity: Yup.number().typeError(t("mustBeNumber")).required(t("quantityRequired")).integer(t("mustBeInteger")),
      img: Yup.string().required(t("imageUrlRequired")),
      description: Yup.string().required(t("descriptionRequired")),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const adminInfo = Cookies.get("adminInfo");
    if (!adminInfo) {
      router.push("/admin/login");
    }
  }, [router]);

  const onSubmit = (data) => {
    if (!selectedCategory) {
        return notifyError(t("selectCategoryError"));
    }
    if (!selectedSubCategory) {
        return notifyError(t("selectSubcategoryError"));
    }
    if (!selectedBrand) {
        return notifyError(t("selectBrandError"));
    }

    const brandObj = brands.result.find(b => b._id === selectedBrand);
    
    const payload = {
        ...data,
        status: 'in-stock',
        productType: selectedCategory.productType || 'jewelry',
        unit: 'ea',
        parent: selectedCategory.parent,
        children: selectedSubCategory,
        category: {
            name: selectedCategory.parent,
            id: selectedCategory._id
        },
        brand: {
            name: brandObj?.name || 'Generic',
            id: selectedBrand
        },
        imageURLs: [], // Add logic for multiple images if needed
    };

    addProduct(payload).then((res) => {
        if(res.data) {
            notifySuccess(t("productAddedSuccess"));
            reset();
            router.push('/admin/products');
        } else {
            notifyError(res.error?.data?.message || t("somethingWentWrong"));
        }
    });
  };

  return (
    <Wrapper>
      <SEO pageTitle={`${t("adminAddProduct")} | ${t("adminPanelTitle")}`} />
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
                        <h3 className="profile__tab-title">{t("addNewProduct")}</h3>
                      </div>
                      
                      <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded bg-white">
                                <div className="mb-3">
                                    <label className="form-label">{t("productName")}</label>
                                    <input {...register("title")} type="text" className="form-control" />
                                    <p className="text-danger">{errors.title?.message}</p>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("price")}</label>
                                        <input {...register("price")} type="number" className="form-control" />
                                        <p className="text-danger">{errors.price?.message}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("quantity")}</label>
                                        <input {...register("quantity")} type="number" className="form-control" />
                                        <p className="text-danger">{errors.quantity?.message}</p>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">SKU</label>
                                        <input {...register("sku")} type="text" className="form-control" />
                                        <p className="text-danger">{errors.sku?.message}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("mainCategory")}</label>
                                        <select 
                                            className="form-control"
                                            onChange={(e) => {
                                                const cat = categories?.result?.find(c => c._id === e.target.value);
                                                setSelectedCategory(cat);
                                                setSelectedSubCategory(""); // Reset subcategory
                                            }}
                                        >
                                            <option value="">{t("selectCategory")}</option>
                                            {categories?.result?.map(c => (
                                                <option key={c._id} value={c._id}>{c.parent}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("subCategory")}</label>
                                        <select 
                                            className="form-control"
                                            value={selectedSubCategory}
                                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                                            disabled={!selectedCategory}
                                        >
                                            <option value="">{t("selectSubCategory")}</option>
                                            {selectedCategory?.children?.map((child, idx) => (
                                                <option key={idx} value={child}>{child}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("brand")}</label>
                                        <select 
                                            className="form-control"
                                            value={selectedBrand}
                                            onChange={(e) => setSelectedBrand(e.target.value)}
                                        >
                                            <option value="">{t("selectBrand")}</option>
                                            {brands?.result?.map(b => (
                                                <option key={b._id} value={b._id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">{t("imageUrlLabel")}</label>
                                    <input {...register("img")} type="text" className="form-control" placeholder="https://example.com/image.jpg" />
                                    <p className="text-danger">{errors.img?.message}</p>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">{t("descriptionLabel")}</label>
                                    <textarea {...register("description")} className="form-control" rows="4"></textarea>
                                    <p className="text-danger">{errors.description?.message}</p>
                                </div>

                                <button type="submit" className="tp-btn w-100" disabled={isLoading}>
                                    {isLoading ? t("adding") : t("addProduct")}
                                </button>
                            </form>
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

export default AdminAddProduct;
