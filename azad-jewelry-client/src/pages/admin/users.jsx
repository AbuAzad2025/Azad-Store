import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import { useGetAllUsersQuery, useDeleteUserMutation, useAddUserMutation, useUpdateUserMutation } from "@/redux/features/admin/adminApi";
import Loader from "@/components/loader/loader";
import dayjs from "dayjs";
import { notifyError, notifySuccess } from "@/utils/toast";
import AdminSidebar from "@/components/admin/sidebar";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ErrorMsg from "@/components/common/error-msg";
import { useLanguage } from "@/context/language-context";

const AdminUsers = () => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { t } = useLanguage();
  
  const { data: users, isLoading, isError, isFetching } = useGetAllUsersQuery({ page, limit });
  const [deleteUser] = useDeleteUserMutation();
  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(t("nameRequired")),
        email: yup.string().email(t("emailInvalid")).required(t("emailRequired")),
        password: yup.string().min(6, t("passwordMin6")).optional(),
        role: yup.string().oneOf(['user', 'admin'], t('somethingWentWrong')).default('user'),
        status: yup.string().oneOf(['active', 'inactive', 'blocked'], t('somethingWentWrong')).default('active'),
        phone: yup.string().optional(),
      })
    ),
  });

  useEffect(() => {
    const adminInfo = Cookies.get("adminInfo");
    if (!adminInfo) {
      router.push("/admin/login");
    }
  }, [router]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        if (!data.password) delete data.password; // Don't send empty password if not changed
        await updateUser({ id: editId, ...data }).unwrap();
        notifySuccess(t("updateUserSuccess"));
      } else {
        if (!data.password) {
            notifyError(t("newUserPasswordRequired"));
            return;
        }
        await addUser(data).unwrap();
        notifySuccess(t("addUserSuccess"));
      }
      reset();
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
    } catch (error) {
      notifyError(error?.data?.message || t("somethingWentWrong"));
    }
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setEditId(user._id);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("role", user.role || 'user');
    setValue("status", user.status || 'active');
    setValue("phone", user.phone || user.contactNumber || "");
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
        title: t("confirmTitle"),
        text: t("deleteUserConfirmText"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t("yesDelete"),
        cancelButtonText: t("cancel")
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await deleteUser(id).unwrap();
                Swal.fire(
                    t("deleted"),
                    t("userDeletedSuccess"),
                    'success'
                );
            } catch (error) {
                toast.error(error?.data?.message || t('deleteError'));
            }
        }
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    reset();
  }

  const userRows = users?.data || [];
  const totalDoc = Number(users?.totalDoc || 0);
  const totalPages = Math.max(Math.ceil(totalDoc / limit), 1);

  const pageNumbers = (() => {
    if (totalPages <= 1) return [];
    let start = Math.max(page - 2, 1);
    let end = Math.min(start + 4, totalPages);
    start = Math.max(end - 4, 1);
    const nums = [];
    for (let i = start; i <= end; i += 1) nums.push(i);
    return nums;
  })();

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

  if (isError) {
    return (
      <Wrapper>
        <HeaderTwo style_2={true} />
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <ErrorMsg msg={t("errorGeneric")} />
        </div>
        <Footer style_2={true} />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SEO pageTitle={t("adminUsers")} />
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
                        <h3 className="profile__tab-title">{t("manageUsers")}</h3>
                        <button 
                            className="btn btn-primary"
                            onClick={() => { setShowForm(!showForm); setIsEditing(false); reset(); }}
                        >
                            {showForm ? t("cancel") : t("addNewUser")}
                        </button>
                      </div>

                      {showForm && (
                        <div className="mb-40 p-4 bg-light rounded">
                            <h4 className="mb-3">{isEditing ? t("editUser") : t("addNewUser")}</h4>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("nameLabel")}</label>
                                        <input {...register("name")} className="form-control" type="text" placeholder={t("nameLabel")} />
                                        <ErrorMsg msg={errors.name?.message} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("emailLabel")}</label>
                                        <input {...register("email")} className="form-control" type="email" placeholder="example@gmail.com" />
                                        <ErrorMsg msg={errors.email?.message} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("passwordLabel")} {isEditing && <span className="text-muted">({t("leaveBlankToKeepPassword")})</span>}</label>
                                        <input {...register("password")} className="form-control" type="password" placeholder="******" />
                                        <ErrorMsg msg={errors.password?.message} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("phoneLabel")}</label>
                                        <input {...register("phone")} className="form-control" type="text" placeholder="05xxxxxxxx" />
                                        <ErrorMsg msg={errors.phone?.message} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("role")}</label>
                                        <select {...register("role")} className="form-control form-select">
                                            <option value="user">{t("roleUser")}</option>
                                            <option value="admin">{t("roleAdmin")}</option>
                                        </select>
                                        <ErrorMsg msg={errors.role?.message} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">{t("status")}</label>
                                        <select {...register("status")} className="form-control form-select">
                                            <option value="active">{t("statusActive")}</option>
                                            <option value="inactive">{t("statusInactive")}</option>
                                            <option value="blocked">{t("statusBlocked")}</option>
                                        </select>
                                        <ErrorMsg msg={errors.status?.message} />
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-3">
                                    <button type="submit" className="btn btn-success" disabled={isAdding || isUpdating}>
                                        {isAdding || isUpdating ? t("saving") : t("save")}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                                        {t("cancel")}
                                    </button>
                                </div>
                            </form>
                        </div>
                      )}
                      
                      {isFetching && (
                        <div className="d-flex align-items-center justify-content-center my-4">
                          <Loader />
                        </div>
                      )}

                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th scope="col">{t("nameLabel")}</th>
                              <th scope="col">{t("emailLabel")}</th>
                              <th scope="col">{t("role")}</th>
                              <th scope="col">{t("status")}</th>
                              <th scope="col">{t("joinDate")}</th>
                              <th scope="col">{t("actions")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userRows.map((item) => (
                              <tr key={item._id}>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>
                                    <span className={`badge ${item.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                                        {item.role === 'admin' ? t("roleAdmin") : t("roleUser")}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${
                                        item.status === 'active' ? 'bg-success' : 
                                        item.status === 'blocked' ? 'bg-dark' : 'bg-warning'
                                    }`}>
                                        {item.status === 'active' ? t("statusActive") : 
                                         item.status === 'blocked' ? t("statusBlocked") : t("statusInactive")}
                                    </span>
                                </td>
                                <td>{dayjs(item.createdAt).format("DD/MM/YYYY")}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleEdit(item)}
                                          className="btn btn-sm btn-primary"
                                          aria-label={t("edit")}
                                          title={t("edit")}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(item._id)}
                                          className="btn btn-sm btn-danger"
                                          aria-label={t("delete")}
                                          title={t("delete")}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                              </tr>
                            ))}
                            {userRows.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center p-4">{t("noUsers")}</td>
                                </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="text-muted">
                            {t("pageXofY", { page, total: totalPages })}
                          </div>
                          <nav>
                            <ul className="pagination mb-0">
                              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button
                                  type="button"
                                  className="page-link"
                                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                >
                                  {t("previous")}
                                </button>
                              </li>
                              {pageNumbers.map((n) => (
                                <li key={n} className={`page-item ${n === page ? 'active' : ''}`}>
                                  <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => setPage(n)}
                                  >
                                    {n}
                                  </button>
                                </li>
                              ))}
                              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                <button
                                  type="button"
                                  className="page-link"
                                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                >
                                  {t("next")}
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
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

export default AdminUsers;
