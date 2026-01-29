import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import AdminSidebar from '@/components/admin/sidebar';
import Loader from "@/components/loader/loader";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLanguage } from "@/context/language-context";
import { 
    useGetGlobalSettingsQuery, 
    useUpdateGlobalSettingsMutation,
    useDownloadBackupMutation,
    useRestoreBackupMutation
} from '@/redux/features/settingApi';

const AdminSettings = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');
    const { t } = useLanguage();
    const { data: settings, isLoading: isSettingsLoading } = useGetGlobalSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateGlobalSettingsMutation();
    const [downloadBackup] = useDownloadBackupMutation();
    const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();
    const fallbackLogoPath = "/assets/img/logo/azad-logo.png";
    const fallbackFaviconPath = "/assets/img/logo/azad-logo.png";

    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        const adminInfo = Cookies.get("adminInfo");
        if (!adminInfo) {
            router.push("/admin/login");
        }
    }, [router]);

    useEffect(() => {
        if (settings) {
            Object.keys(settings).forEach(key => {
                setValue(key, settings[key]);
            });
            setValue("logo", settings?.logo || fallbackLogoPath);
            setValue("favicon", settings?.favicon || fallbackFaviconPath);
            setValue("paymentCodEnabled", settings?.paymentCodEnabled ?? true);
            setValue("paymentCardEnabled", settings?.paymentCardEnabled ?? false);
            setValue("paymentPaypalEnabled", settings?.paymentPaypalEnabled ?? false);
            setValue("paymentBankTransferEnabled", settings?.paymentBankTransferEnabled ?? false);
            setValue("bankTransferInstructions", settings?.bankTransferInstructions ?? "");
            setValue("shippingCostTiers", JSON.stringify(settings?.shippingCostTiers ?? [], null, 2));
        }
    }, [settings, setValue, fallbackLogoPath, fallbackFaviconPath]);

    const onSubmit = async (data) => {
        try {
            const payload = { ...data };
            if (typeof payload.shippingCostTiers === "string") {
                const raw = payload.shippingCostTiers.trim();
                payload.shippingCostTiers = raw ? JSON.parse(raw) : [];
            }

            await updateSettings(payload).unwrap();
            notifySuccess(t("settingsUpdatedSuccess"));
        } catch (error) {
            if (error instanceof SyntaxError) {
                notifyError(t("invalidJson"));
                return;
            }
            notifyError(t("settingsUpdatedFailed"));
        }
    };

    const handleBackupDownload = async () => {
        try {
            const blob = await downloadBackup().unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            notifySuccess(t("backupDownloadedSuccess"));
        } catch (error) {
            notifyError(t("backupDownloadedFailed"));
        }
    };

    const handleRestoreUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                await restoreBackup(data).unwrap();
                notifySuccess(t("backupRestoredSuccess"));
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                notifyError(t("backupRestoredFailed"));
            }
        };
        reader.readAsText(file);
    };

    if (isSettingsLoading) {
        return <Loader />;
    }

    return (
        <Wrapper>
            <SEO pageTitle={`${t("siteSettings")} | ${t("adminPanelTitle")}`} />
            <HeaderTwo style_2={true} />
            
            <section className="profile__area pt-120 pb-120">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3">
                            <AdminSidebar />
                        </div>
                        <div className="col-lg-9">
                            <div className="profile__inner p-relative">
                                <h3 className="profile__tab-title mb-40">{t("siteSettings")}</h3>

                                <ul className="nav nav-tabs mb-4">
                                    <li className="nav-item">
                                        <button type="button" className={`nav-link ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>{t("tabGeneral")}</button>
                                    </li>
                                    <li className="nav-item">
                                        <button type="button" className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>{t("tabContact")}</button>
                                    </li>
                                    <li className="nav-item">
                                        <button type="button" className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>{t("tabPayment")}</button>
                                    </li>
                                    <li className="nav-item">
                                        <button type="button" className={`nav-link ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>{t("tabSocial")}</button>
                                    </li>
                                    <li className="nav-item">
                                        <button type="button" className={`nav-link ${activeTab === 'backup' ? 'active' : ''}`} onClick={() => setActiveTab('backup')}>{t("tabBackup")}</button>
                                    </li>
                                </ul>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="tab-content">
                                        {/* General Settings */}
                                        {activeTab === 'general' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row">
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("siteNameLabel")}</label>
                                                        <input type="text" className="form-control" {...register("siteName")} />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("siteUrlLabel")}</label>
                                                        <input type="text" className="form-control" {...register("siteUrl")} />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("logoUrlLabel")}</label>
                                                        <input type="text" className="form-control" {...register("logo")} />
                                                        <div className="mt-2">
                                                            <img src={settings?.logo || fallbackLogoPath} alt={t("logoAlt")} width={50} height={50} style={{ objectFit: "contain" }} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("faviconUrlLabel")}</label>
                                                        <input type="text" className="form-control" {...register("favicon")} />
                                                        <div className="mt-2">
                                                            <img src={settings?.favicon || fallbackFaviconPath} alt={t("faviconAlt")} width={32} height={32} style={{ objectFit: "contain" }} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("ogImageUrlLabel")}</label>
                                                        <input type="text" className="form-control" {...register("ogImage")} />
                                                        {settings?.ogImage ? (
                                                            <div className="mt-2">
                                                                <img src={settings.ogImage} alt={t("ogImageAlt")} width={120} height={63} style={{ objectFit: "cover" }} />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("metaTitleLabel")}</label>
                                                        <input type="text" className="form-control" {...register("metaTitle")} />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("metaDescriptionLabel")}</label>
                                                        <textarea className="form-control" rows={3} {...register("metaDescription")} />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("footerTextLabel")}</label>
                                                        <textarea className="form-control" {...register("footerText")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("currency")}</label>
                                                        <input type="text" className="form-control" {...register("currency")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("defaultDeliveryChargeLabel")}</label>
                                                        <input type="number" className="form-control" {...register("deliveryCharge")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("standardDeliveryChargeLabel")}</label>
                                                        <input type="number" className="form-control" {...register("deliveryChargeStandard")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("expressDeliveryChargeLabel")}</label>
                                                        <input type="number" className="form-control" {...register("deliveryChargeExpress")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("freeShippingMinSubtotalLabel")}</label>
                                                        <input type="number" className="form-control" {...register("freeShippingMinSubtotal")} />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-check mt-4">
                                                            <input className="form-check-input" type="checkbox" id="bundleDiscountEnabled" {...register("bundleDiscountEnabled")} />
                                                            <label className="form-check-label" htmlFor="bundleDiscountEnabled">
                                                                {t("bundleDiscountEnabledLabel")}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("bundleDiscountPercentLabel")}</label>
                                                        <input type="number" className="form-control" {...register("bundleDiscountPercent")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("bundleDiscountMinItemsLabel")}</label>
                                                        <input type="number" className="form-control" {...register("bundleDiscountMinItems")} />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-check mt-4">
                                                            <input className="form-check-input" type="checkbox" id="giftWrapEnabled" {...register("giftWrapEnabled")} />
                                                            <label className="form-check-label" htmlFor="giftWrapEnabled">
                                                                {t("giftWrapEnabledLabel")}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("giftWrapFeeStandardLabel")}</label>
                                                        <input type="number" className="form-control" {...register("giftWrapFeeStandard")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("giftWrapFeePremiumLabel")}</label>
                                                        <input type="number" className="form-control" {...register("giftWrapFeePremium")} />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("whatsappNumberLabel")}</label>
                                                        <input type="text" className="form-control" {...register("whatsappNumber")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("deliveryEstimateMinDaysLabel")}</label>
                                                        <input type="number" className="form-control" {...register("deliveryEstimateMinDays")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("deliveryEstimateMaxDaysLabel")}</label>
                                                        <input type="number" className="form-control" {...register("deliveryEstimateMaxDays")} />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("whatsappDefaultMessageLabel")}</label>
                                                        <textarea className="form-control" rows={3} {...register("whatsappDefaultMessage")} />
                                                    </div>

                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("shippingCostTiersLabel")}</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows={6}
                                                            placeholder='[{"city":"","option":"STANDARD","minSubtotal":0,"maxSubtotal":0,"cost":0}]'
                                                            {...register("shippingCostTiers")}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Settings */}
                                        {activeTab === 'contact' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("emailLabel")}</label>
                                                        <input type="email" className="form-control" {...register("contactEmail")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">{t("phoneLabel")}</label>
                                                        <input type="text" className="form-control" {...register("contactPhone")} />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("addressLabel")}</label>
                                                        <input type="text" className="form-control" {...register("address")} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Settings */}
                                        {activeTab === 'payment' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row">
                                                    <div className="col-md-12 mb-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" id="paymentCodEnabled" {...register("paymentCodEnabled")} />
                                                            <label className="form-check-label" htmlFor="paymentCodEnabled">
                                                                {t("enableCod")}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12 mb-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" id="paymentCardEnabled" {...register("paymentCardEnabled")} />
                                                            <label className="form-check-label" htmlFor="paymentCardEnabled">
                                                                {t("enableCard")}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12 mb-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" id="paymentPaypalEnabled" {...register("paymentPaypalEnabled")} />
                                                            <label className="form-check-label" htmlFor="paymentPaypalEnabled">
                                                                {t("enablePaypal")}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12 mb-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" id="paymentBankTransferEnabled" {...register("paymentBankTransferEnabled")} />
                                                            <label className="form-check-label" htmlFor="paymentBankTransferEnabled">
                                                                {t("enableBankTransfer")}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">{t("bankTransferInstructionsLabel")}</label>
                                                        <textarea className="form-control" rows={4} {...register("bankTransferInstructions")} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Social Settings */}
                                        {activeTab === 'social' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Facebook</label>
                                                        <input type="text" className="form-control" {...register("facebook")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Twitter</label>
                                                        <input type="text" className="form-control" {...register("twitter")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Instagram</label>
                                                        <input type="text" className="form-control" {...register("instagram")} />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">LinkedIn</label>
                                                        <input type="text" className="form-control" {...register("linkedin")} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab !== 'backup' && (
                                            <div className="mt-4">
                                                <button type="submit" className="tp-btn tp-color-btn" disabled={isUpdating}>
                                                    {isUpdating ? t("saving") : t("saveChanges")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>

                                {/* Backup Settings - Separate from form */}
                                {activeTab === 'backup' && (
                                    <div className="tab-pane fade show active">
                                        <div className="alert alert-info">
                                            {t("backupInfo")}
                                        </div>
                                        
                                        <div className="row">
                                            <div className="col-md-6 mb-4">
                                                <div className="card p-4 text-center h-100">
                                                    <i className="fa-solid fa-download fa-3x text-primary mb-3"></i>
                                                    <h5>{t("downloadBackupTitle")}</h5>
                                                    <p>{t("downloadBackupDesc")}</p>
                                                    <button type="button" onClick={handleBackupDownload} className="btn btn-primary">
                                                        {t("downloadNow")}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6 mb-4">
                                                <div className="card p-4 text-center h-100">
                                                    <i className="fa-solid fa-upload fa-3x text-warning mb-3"></i>
                                                    <h5>{t("restoreBackupTitle")}</h5>
                                                    <p>{t("restoreBackupDesc")}</p>
                                                    <label className="btn btn-warning text-white">
                                                        {isRestoring ? t("restoring") : t("uploadRestoreFile")}
                                                        <input type="file" hidden accept=".json" onChange={handleRestoreUpload} disabled={isRestoring} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer style_2={true} />
        </Wrapper>
    );
};

export default AdminSettings;
