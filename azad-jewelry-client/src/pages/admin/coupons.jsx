import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import AdminSidebar from '@/components/admin/sidebar';
import { useLanguage } from '@/context/language-context';
import { 
    useGetAllCouponsQuery, 
    useAddCouponMutation, 
    useUpdateCouponMutation, 
    useDeleteCouponMutation 
} from '@/redux/features/coupon/couponApi';

const Coupons = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCoupon, setEditCoupon] = useState(null);
    const { t } = useLanguage();

    const couponSchema = useMemo(() => {
        return Yup.object().shape({
            title: Yup.string().required(t('couponTitleRequired')),
            logo: Yup.string().url(t('imageUrlInvalid')).required(t('couponLogoRequired')),
            couponCode: Yup.string().required(t('couponCodeRequired')),
            startTime: Yup.date().nullable(),
            endTime: Yup.date()
                .required(t('endDateRequired'))
                .min(new Date(), t('endDateMustBeFuture')),
            discountPercentage: Yup.number()
                .typeError(t('mustBeNumber'))
                .required(t('discountPercentageRequired'))
                .min(1, t('discountMin1'))
                .max(100, t('discountMax100')),
            minimumAmount: Yup.number()
                .typeError(t('mustBeNumber'))
                .required(t('minimumAmountRequired'))
                .min(0, t('minimumAmountNonNegative')),
            productType: Yup.string().required(t('productTypeRequired')),
            status: Yup.string().oneOf(['active', 'inactive']).default('active'),
        });
    }, [t]);

    // Redux Queries/Mutations
    const { data: coupons, isLoading, isError } = useGetAllCouponsQuery();
    const [addCoupon, { isLoading: isAdding }] = useAddCouponMutation();
    const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
    const [deleteCoupon] = useDeleteCouponMutation();

    // Form Handling
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(couponSchema),
        defaultValues: {
            status: 'active'
        }
    });

    const openModal = (coupon = null) => {
        setEditCoupon(coupon);
        if (coupon) {
            setValue('title', coupon.title);
            setValue('logo', coupon.logo);
            setValue('couponCode', coupon.couponCode);
            setValue('startTime', coupon.startTime ? dayjs(coupon.startTime).format('YYYY-MM-DD') : '');
            setValue('endTime', dayjs(coupon.endTime).format('YYYY-MM-DD'));
            setValue('discountPercentage', coupon.discountPercentage);
            setValue('minimumAmount', coupon.minimumAmount);
            setValue('productType', coupon.productType);
            setValue('status', coupon.status);
        } else {
            reset({
                title: '',
                logo: '',
                couponCode: '',
                startTime: dayjs().format('YYYY-MM-DD'),
                endTime: '',
                discountPercentage: '',
                minimumAmount: '',
                productType: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditCoupon(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editCoupon) {
                await updateCoupon({ id: editCoupon._id, data }).unwrap();
                toast.success(t('couponUpdatedSuccess'));
            } else {
                await addCoupon(data).unwrap();
                toast.success(t('couponAddedSuccess'));
            }
            closeModal();
        } catch (error) {
            toast.error(error?.data?.message || t('somethingWentWrong'));
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: t('confirmTitle'),
            text: t('deleteCouponConfirmText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('yesDelete'),
            cancelButtonText: t('cancel')
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteCoupon(id).unwrap();
                    Swal.fire(
                        t('deleted'),
                        t('couponDeletedSuccess'),
                        'success'
                    );
                } catch (error) {
                    toast.error(t('deleteError'));
                }
            }
        });
    };

    return (
        <>
            <Head>
                <title>{t('manageCoupons')} | {t('adminPanelTitle')}</title>
            </Head>

            <section className="admin_coupons_area pt-50 pb-100">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-3">
                            <AdminSidebar />
                        </div>
                        <div className="col-lg-9">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{t('manageCoupons')}</h5>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => openModal()}
                                    >
                                        <i className="fa-solid fa-plus me-1"></i> {t('addCoupon')}
                                    </button>
                                </div>
                                <div className="card-body">
                                    {isLoading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">{t('loading')}</span>
                                            </div>
                                        </div>
                                    ) : isError ? (
                                        <div className="alert alert-danger">{t('loadingDataError')}</div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>{t('couponImage')}</th>
                                                        <th>{t('title')}</th>
                                                        <th>{t('couponCode')}</th>
                                                        <th>{t('discount')}</th>
                                                        <th>{t('minimumAmount')}</th>
                                                        <th>{t('productTypeLabel')}</th>
                                                        <th>{t('endDate')}</th>
                                                        <th>{t('status')}</th>
                                                        <th>{t('actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {coupons?.map((coupon) => (
                                                        <tr key={coupon._id}>
                                                            <td>
                                                                {coupon.logo ? (
                                                                    <Image 
                                                                        src={coupon.logo} 
                                                                        alt={coupon.title} 
                                                                        width={40}
                                                                        height={40}
                                                                        style={{ objectFit: 'contain', borderRadius: '5px' }} 
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted">{t('noImage')}</span>
                                                                )}
                                                            </td>
                                                            <td className="fw-bold">{coupon.title}</td>
                                                            <td>
                                                                <span className="badge bg-light text-dark border">
                                                                    {coupon.couponCode}
                                                                </span>
                                                            </td>
                                                            <td className="text-success fw-bold">{coupon.discountPercentage}%</td>
                                                            <td>{coupon.minimumAmount}</td>
                                                            <td>{coupon.productType}</td>
                                                            <td>{dayjs(coupon.endTime).format('YYYY-MM-DD')}</td>
                                                            <td>
                                                                <span className={`badge ${coupon.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {coupon.status === 'active' ? t('statusActive') : t('statusInactive')}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => openModal(coupon)}
                                                                        title={t('edit')}
                                                                        aria-label={t('edit')}
                                                                    >
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDelete(coupon._id)}
                                                                        title={t('delete')}
                                                                        aria-label={t('delete')}
                                                                    >
                                                                        <i className="fa-solid fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!coupons || coupons.length === 0) && (
                                                        <tr>
                                                            <td colSpan="9" className="text-center py-4">
                                                                {t('noCouponsFound')}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="modal-backdrop show"></div>
                )}
                <div
                    className={`modal fade ${isModalOpen ? 'show d-block' : ''}`}
                    tabIndex="-1"
                    role="dialog"
                    aria-modal={isModalOpen ? "true" : undefined}
                    aria-hidden={!isModalOpen}
                    aria-labelledby="admin-coupon-modal-title"
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="admin-coupon-modal-title">
                                    {editCoupon ? t('editCoupon') : t('addCoupon')}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                    aria-label={t("close")}
                                    title={t("close")}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">{t('title')} <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                            {...register('title')}
                                        />
                                        {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('couponLogoUrlLabel')} <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.logo ? 'is-invalid' : ''}`}
                                            {...register('logo')}
                                            placeholder="https://example.com/image.png"
                                        />
                                        {errors.logo && <div className="invalid-feedback">{errors.logo.message}</div>}
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">{t('couponCode')} <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className={`form-control ${errors.couponCode ? 'is-invalid' : ''}`}
                                                {...register('couponCode')}
                                            />
                                            {errors.couponCode && <div className="invalid-feedback">{errors.couponCode.message}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">{t('productTypeLabel')} <span className="text-danger">*</span></label>
                                            <select 
                                                className={`form-select ${errors.productType ? 'is-invalid' : ''}`}
                                                {...register('productType')}
                                            >
                                                <option value="">{t('selectProductType')}</option>
                                                <option value="electronics">{t('electronics')}</option>
                                                <option value="fashion">{t('fashion')}</option>
                                                <option value="beauty">{t('beauty')}</option>
                                                <option value="jewelry">{t('jewelry')}</option>
                                                <option value="other">{t('other')}</option>
                                            </select>
                                            {errors.productType && <div className="invalid-feedback">{errors.productType.message}</div>}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">{t('discountPercentage')} <span className="text-danger">*</span></label>
                                            <input 
                                                type="number" 
                                                className={`form-control ${errors.discountPercentage ? 'is-invalid' : ''}`}
                                                {...register('discountPercentage')}
                                            />
                                            {errors.discountPercentage && <div className="invalid-feedback">{errors.discountPercentage.message}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">{t('minimumAmount')} <span className="text-danger">*</span></label>
                                            <input 
                                                type="number" 
                                                className={`form-control ${errors.minimumAmount ? 'is-invalid' : ''}`}
                                                {...register('minimumAmount')}
                                            />
                                            {errors.minimumAmount && <div className="invalid-feedback">{errors.minimumAmount.message}</div>}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">{t('startDate')}</label>
                                            <input 
                                                type="date" 
                                                className="form-control"
                                                {...register('startTime')}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">{t('endDate')} <span className="text-danger">*</span></label>
                                            <input 
                                                type="date" 
                                                className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                                                {...register('endTime')}
                                            />
                                            {errors.endTime && <div className="invalid-feedback">{errors.endTime.message}</div>}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('status')}</label>
                                        <select 
                                            className="form-select"
                                            {...register('status')}
                                        >
                                            <option value="active">{t('statusActive')}</option>
                                            <option value="inactive">{t('statusInactive')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>{t('cancel')}</button>
                                    <button type="submit" className="btn btn-primary" disabled={isAdding || isUpdating}>
                                        {isAdding || isUpdating ? t('saving') : (editCoupon ? t('save') : t('add'))}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Coupons;
