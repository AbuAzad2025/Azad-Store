import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import AdminSidebar from '@/components/admin/sidebar';
import { useLanguage } from '@/context/language-context';
import { 
    useGetAllBrandsQuery, 
    useAddBrandMutation, 
    useUpdateBrandMutation, 
    useDeleteBrandMutation 
} from '@/redux/features/brandApi';

const isValidUrl = (value) => {
    try {
        const u = new URL(value);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};

const isLocalImagePath = (value) =>
    value.startsWith('/brand-logos/') ||
    value.startsWith('/category-images/') ||
    value.startsWith('/product-images/') ||
    value.startsWith('/site-assets/');

const Brands = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editBrand, setEditBrand] = useState(null);
    const { t } = useLanguage();

    const brandSchema = useMemo(() => {
        return Yup.object().shape({
            name: Yup.string().required(t('nameRequired')),
            logo: Yup.string()
                .nullable()
                .test('logo', t('imageUrlInvalid'), (value) => {
                    if (!value) return true;
                    const v = String(value).trim();
                    if (!v) return true;
                    return isLocalImagePath(v) || isValidUrl(v);
                }),
            email: Yup.string().email(t('emailInvalid')).nullable(),
            website: Yup.string().url(t('websiteUrlInvalid')).nullable(),
            location: Yup.string().nullable(),
            description: Yup.string().nullable(),
            status: Yup.string().oneOf(['active', 'inactive']).default('active'),
        });
    }, [t]);

    // Redux Queries/Mutations
    const { data: brands, isLoading, isError } = useGetAllBrandsQuery();
    const [addBrand, { isLoading: isAdding }] = useAddBrandMutation();
    const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
    const [deleteBrand] = useDeleteBrandMutation();

    // Form Handling
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(brandSchema),
        defaultValues: {
            status: 'active'
        }
    });

    const openModal = (brand = null) => {
        setEditBrand(brand);
        if (brand) {
            setValue('name', brand.name);
            setValue('logo', brand.logo);
            setValue('email', brand.email);
            setValue('website', brand.website);
            setValue('location', brand.location);
            setValue('description', brand.description);
            setValue('status', brand.status);
        } else {
            reset({
                name: '',
                logo: '',
                email: '',
                website: '',
                location: '',
                description: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditBrand(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editBrand) {
                await updateBrand({ id: editBrand._id, data }).unwrap();
                toast.success(t('brandUpdatedSuccess'));
            } else {
                await addBrand(data).unwrap();
                toast.success(t('brandAddedSuccess'));
            }
            closeModal();
        } catch (error) {
            toast.error(error?.data?.message || t('somethingWentWrong'));
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: t('confirmTitle'),
            text: t('deleteBrandConfirmText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('yesDelete'),
            cancelButtonText: t('cancel')
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteBrand(id).unwrap();
                    Swal.fire(
                        t('deleted'),
                        t('brandDeletedSuccess'),
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
                <title>{t('manageBrands')} | {t('adminPanelTitle')}</title>
            </Head>

            <section className="admin_brands_area pt-50 pb-100">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-3">
                            <AdminSidebar />
                        </div>
                        <div className="col-lg-9">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{t('manageBrands')}</h5>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => openModal()}
                                    >
                                        <i className="fa-solid fa-plus me-1"></i> {t('addBrand')}
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
                                                        <th>{t('brandLogo')}</th>
                                                        <th>{t('nameLabel')}</th>
                                                        <th>{t('emailLabel')}</th>
                                                        <th>{t('websiteLabel')}</th>
                                                        <th>{t('locationLabel')}</th>
                                                        <th>{t('status')}</th>
                                                        <th>{t('actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {brands?.result?.map((brand) => (
                                                        <tr key={brand._id}>
                                                            <td>
                                                                {brand.logo ? (
                                                                    <Image 
                                                                        src={brand.logo} 
                                                                        alt={brand.name} 
                                                                        width={50}
                                                                        height={50}
                                                                        style={{ objectFit: 'contain', borderRadius: '5px' }} 
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted">{t('noLogo')}</span>
                                                                )}
                                                            </td>
                                                            <td className="fw-bold">{brand.name}</td>
                                                            <td>{brand.email || '-'}</td>
                                                            <td>
                                                                {brand.website ? (
                                                                    <a href={brand.website} target="_blank" rel="noopener noreferrer">
                                                                        {t('visit')}
                                                                    </a>
                                                                ) : '-'}
                                                            </td>
                                                            <td>{brand.location || '-'}</td>
                                                            <td>
                                                                <span className={`badge ${brand.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {brand.status === 'active' ? t('statusActive') : t('statusInactive')}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => openModal(brand)}
                                                                        title={t('edit')}
                                                                        aria-label={t('edit')}
                                                                    >
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDelete(brand._id)}
                                                                        title={t('delete')}
                                                                        aria-label={t('delete')}
                                                                    >
                                                                        <i className="fa-solid fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!brands?.result || brands.result.length === 0) && (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4">
                                                                {t('noBrandsFound')}
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
                <div className={`modal fade ${isModalOpen ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" aria-modal={isModalOpen ? "true" : undefined} aria-hidden={!isModalOpen} aria-labelledby="admin-brand-modal-title">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="admin-brand-modal-title">
                                    {editBrand ? t('editBrand') : t('addBrand')}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal} aria-label={t("close")}></button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">{t('nameLabel')} <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            {...register('name')}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('logoUrlLabel')}</label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.logo ? 'is-invalid' : ''}`}
                                            {...register('logo')}
                                            placeholder="https://example.com/logo.png"
                                        />
                                        {errors.logo && <div className="invalid-feedback">{errors.logo.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('emailLabel')}</label>
                                        <input 
                                            type="email" 
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            {...register('email')}
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('websiteLabel')}</label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                                            {...register('website')}
                                            placeholder="https://example.com"
                                        />
                                        {errors.website && <div className="invalid-feedback">{errors.website.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('locationLabel')}</label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                            {...register('location')}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('descriptionLabel')}</label>
                                        <textarea 
                                            className="form-control"
                                            rows="2"
                                            {...register('description')}
                                        ></textarea>
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
                                        {isAdding || isUpdating ? t('saving') : (editBrand ? t('save') : t('add'))}
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

export default Brands;
