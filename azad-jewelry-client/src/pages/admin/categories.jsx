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
    useGetAllCategoriesQuery, 
    useAddCategoryMutation, 
    useUpdateCategoryMutation, 
    useDeleteCategoryMutation 
} from '@/redux/features/categoryApi';

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

const Categories = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const { t } = useLanguage();

    const categorySchema = useMemo(() => {
        return Yup.object().shape({
            parent: Yup.string().required(t('categoryParentRequired')),
            productType: Yup.string().required(t('productTypeRequired')),
            img: Yup.string()
                .nullable()
                .test('img', t('imageUrlInvalid'), (value) => {
                    if (!value) return true;
                    const v = String(value).trim();
                    if (!v) return true;
                    return isLocalImagePath(v) || isValidUrl(v);
                }),
            children: Yup.string(),
            status: Yup.string().oneOf(['Show', 'Hide']).default('Show'),
            description: Yup.string(),
        });
    }, [t]);

    // Redux Queries/Mutations
    const { data: categories, isLoading, isError } = useGetAllCategoriesQuery();
    const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    // Form Handling
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(categorySchema),
        defaultValues: {
            status: 'Show'
        }
    });

    const openModal = (category = null) => {
        setEditCategory(category);
        if (category) {
            setValue('parent', category.parent);
            setValue('productType', category.productType);
            setValue('img', category.img);
            setValue('description', category.description);
            setValue('status', category.status);
            // Join children array to string for editing
            setValue('children', category.children ? category.children.join(', ') : '');
        } else {
            reset({
                parent: '',
                productType: '',
                img: '',
                children: '',
                status: 'Show',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditCategory(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            // Convert children string back to array
            const formattedData = {
                ...data,
                children: data.children 
                    ? data.children.split(',').map(item => item.trim()).filter(item => item !== '')
                    : []
            };

            if (editCategory) {
                await updateCategory({ id: editCategory._id, data: formattedData }).unwrap();
                toast.success(t('categoryUpdatedSuccess'));
            } else {
                await addCategory(formattedData).unwrap();
                toast.success(t('categoryAddedSuccess'));
            }
            closeModal();
        } catch (error) {
            toast.error(error?.data?.message || t('somethingWentWrong'));
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: t('confirmTitle'),
            text: t('deleteCategoryConfirmText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('yesDelete'),
            cancelButtonText: t('cancel')
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteCategory(id).unwrap();
                    Swal.fire(
                        t('deleted'),
                        t('categoryDeletedSuccess'),
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
                <title>{t('manageCategories')} | {t('adminPanelTitle')}</title>
            </Head>

            <section className="admin_categories_area pt-50 pb-100">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-3">
                            <AdminSidebar />
                        </div>
                        <div className="col-lg-9">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{t('manageCategories')}</h5>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => openModal()}
                                    >
                                        <i className="fa-solid fa-plus me-1"></i> {t('addCategory')}
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
                                                        <th>{t('categoryImage')}</th>
                                                        <th>{t('categoryParentLabel')}</th>
                                                        <th>{t('productTypeLabel')}</th>
                                                        <th>{t('subcategoriesLabel')}</th>
                                                        <th>{t('status')}</th>
                                                        <th>{t('actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories?.result?.map((category) => (
                                                        <tr key={category._id}>
                                                            <td>
                                                                {category.img ? (
                                                                    <Image 
                                                                        src={category.img} 
                                                                        alt={category.parent} 
                                                                        width={50}
                                                                        height={50}
                                                                        style={{ objectFit: 'cover', borderRadius: '5px' }} 
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted">{t('noImage')}</span>
                                                                )}
                                                            </td>
                                                            <td className="fw-bold">{category.parent}</td>
                                                            <td>
                                                                <span className="badge bg-info text-dark">
                                                                    {category.productType}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {category.children?.join(', ') || '-'}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${category.status === 'Show' ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {category.status === 'Show' ? t('statusVisible') : t('statusHidden')}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => openModal(category)}
                                                                        title={t('edit')}
                                                                        aria-label={t('edit')}
                                                                    >
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDelete(category._id)}
                                                                        title={t('delete')}
                                                                        aria-label={t('delete')}
                                                                    >
                                                                        <i className="fa-solid fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!categories?.result || categories.result.length === 0) && (
                                                        <tr>
                                                            <td colSpan="6" className="text-center py-4">
                                                                {t('noCategoriesFound')}
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
                <div className={`modal fade ${isModalOpen ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" aria-modal={isModalOpen ? "true" : undefined} aria-hidden={!isModalOpen} aria-labelledby="admin-category-modal-title">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="admin-category-modal-title">
                                    {editCategory ? t('editCategory') : t('addCategory')}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal} aria-label={t("close")}></button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">{t('categoryParentLabel')} <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.parent ? 'is-invalid' : ''}`}
                                            {...register('parent')}
                                        />
                                        {errors.parent && <div className="invalid-feedback">{errors.parent.message}</div>}
                                    </div>

                                    <div className="mb-3">
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

                                    <div className="mb-3">
                                        <label className="form-label">{t('subcategoriesLabel')}</label>
                                        <textarea 
                                            className="form-control"
                                            rows="3"
                                            placeholder={t('subcategoriesPlaceholder')}
                                            {...register('children')}
                                        ></textarea>
                                        <div className="form-text">{t('subcategoriesHelp')}</div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('imageUrlLabel')}</label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.img ? 'is-invalid' : ''}`}
                                            {...register('img')}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {errors.img && <div className="invalid-feedback">{errors.img.message}</div>}
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
                                            <option value="Show">{t('statusVisible')}</option>
                                            <option value="Hide">{t('statusHidden')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>{t('cancel')}</button>
                                    <button type="submit" className="btn btn-primary" disabled={isAdding || isUpdating}>
                                        {isAdding || isUpdating ? t('saving') : (editCategory ? t('save') : t('add'))}
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

export default Categories;
