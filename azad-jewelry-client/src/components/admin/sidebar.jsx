import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { adminLoggedOut } from '@/redux/features/admin/adminSlice';
import { useLanguage } from '@/context/language-context';

const AdminSidebar = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { pathname } = router;
    const { t } = useLanguage();

    const handleLogout = () => {
        dispatch(adminLoggedOut());
        router.push("/admin/login");
    };

    const menuItems = [
        { title: t('adminDashboard'), link: '/admin/dashboard', icon: 'fa-solid fa-house' },
        { title: t('adminProducts'), link: '/admin/products', icon: 'fa-solid fa-box' },
        { title: t('adminOrders'), link: '/admin/orders', icon: 'fa-solid fa-cart-shopping' },
        { title: t('adminCategories'), link: '/admin/categories', icon: 'fa-solid fa-list' },
        { title: t('adminBrands'), link: '/admin/brands', icon: 'fa-solid fa-tag' },
        { title: t('adminCoupons'), link: '/admin/coupons', icon: 'fa-solid fa-ticket' },
        { title: t('adminReviews'), link: '/admin/reviews', icon: 'fa-solid fa-star' },
        { title: t('adminReports'), link: '/admin/reports', icon: 'fa-solid fa-chart-line' },
        { title: t('adminUsers'), link: '/admin/users', icon: 'fa-solid fa-users' },
        { title: t('adminSettings'), link: '/admin/settings', icon: 'fa-solid fa-gear' },
    ];

    return (
        <div className="admin-sidebar p-3 border rounded bg-white">
            <h4 className="mb-4 ps-2">{t('adminMainMenu')}</h4>
            <div className="d-flex flex-column gap-2">
                {menuItems.map((item, index) => (
                    <Link 
                        key={index} 
                        href={item.link}
                        className={`d-flex align-items-center p-2 rounded text-decoration-none ${pathname === item.link ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
                        style={{ transition: 'all 0.3s' }}
                    >
                        <i className={`${item.icon}`} style={{ width: '20px', marginInlineEnd: '0.5rem' }}></i>
                        <span>{item.title}</span>
                    </Link>
                ))}
                
                <hr className="my-2" />
                
                <button 
                    type="button"
                    onClick={handleLogout}
                    className="d-flex align-items-center p-2 rounded text-decoration-none text-danger border-0 bg-transparent w-100"
                    style={{ transition: 'all 0.3s', textAlign: 'start' }}
                >
                    <i className="fa-solid fa-right-from-bracket" style={{ width: '20px', marginInlineEnd: '0.5rem' }}></i>
                    <span>{t('adminLogout')}</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
