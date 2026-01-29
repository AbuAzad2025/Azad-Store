import React, { useEffect } from 'react';
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import AdminSidebar from '@/components/admin/sidebar';
import { useGetAllReviewsQuery, useDeleteReviewMutation } from '@/redux/features/reviewApi';
import dayjs from 'dayjs';
import Loader from "@/components/loader/loader";
import { useLanguage } from "@/context/language-context";

const Reviews = () => {
    const router = useRouter();
    const { t } = useLanguage();
    const { data: reviews, isLoading, isError } = useGetAllReviewsQuery();
    const [deleteReview] = useDeleteReviewMutation();

    useEffect(() => {
        const adminInfo = Cookies.get("adminInfo");
        if (!adminInfo) {
            router.push("/admin/login");
        }
    }, [router]);

    const handleDelete = (id) => {
        Swal.fire({
            title: t('confirmTitle'),
            text: t('deleteReviewConfirmText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('yesDelete'),
            cancelButtonText: t('cancel')
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteReview(id).unwrap();
                    Swal.fire(
                        t('deleted'),
                        t('reviewDeletedSuccess'),
                        'success'
                    );
                } catch (error) {
                    toast.error(error?.data?.message || t('deleteError'));
                }
            }
        });
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
            <SEO pageTitle={`${t('manageReviews')} | ${t('adminPanelTitle')}`} />
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
                                    <h3 className="profile__tab-title">{t('manageReviews')}</h3>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>{t('product')}</th>
                                                <th>{t('user')}</th>
                                                <th>{t('rating')}</th>
                                                <th>{t('comment')}</th>
                                                <th>{t('date')}</th>
                                                <th>{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviews?.map((review) => (
                                                <tr key={review._id}>
                                                    <td>{review.productId?.title || t('deletedProduct')}</td>
                                                    <td>{review.userId?.name || review.userId?.email || t('deletedUser')}</td>
                                                    <td className="text-warning">
                                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                    </td>
                                                    <td className="text-muted" style={{maxWidth: '250px'}}>
                                                        {review.comment}
                                                    </td>
                                                    <td>{dayjs(review.createdAt).format('DD/MM/YYYY')}</td>
                                                    <td>
                                                        <button 
                                                            onClick={() => handleDelete(review._id)}
                                                            className="btn btn-danger btn-sm"
                                                            aria-label={t('delete')}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {reviews?.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="text-center p-4 text-muted">
                                                        {t('noReviewsFound')}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
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

export default Reviews;
