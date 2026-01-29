import home_1 from '@assets/img/menu/menu-home-1.jpg';
import home_2 from '@assets/img/menu/menu-home-2.jpg';
import home_3 from '@assets/img/menu/menu-home-3.jpg';
import home_4 from '@assets/img/menu/menu-home-4.jpg';

const menu_data = [
  {
    id: 1,
    title: 'الرئيسية',
    title_en: 'Home',
    link: '/',
  },
  {
    id: 2,
    products: true,
    title: 'المنتجات',
    title_en: 'Products',
    link: '/shop',
    product_pages: [
      {
        title: 'تصفح المتجر',
        title_en: 'Shop Pages',
        link: '/shop',
        mega_menus: [
          { title: 'كل المنتجات', title_en: 'All Products', link: '/shop' },
          { title: 'المفضلة', title_en: 'Wishlist', link: '/wishlist' },
          { title: 'سلة التسوق', title_en: 'Cart', link: '/cart' },
          { title: 'إتمام الشراء', title_en: 'Checkout', link: '/checkout' },
        ]
      },
      {
        title: 'حسابي',
        title_en: 'My Account',
        link: '/profile',
        mega_menus: [
          { title: 'لوحة التحكم', title_en: 'Admin Dashboard', link: '/admin/dashboard' },
          { title: 'تسجيل الدخول', title_en: 'Login', link: '/login' },
          { title: 'إنشاء حساب', title_en: 'Register', link: '/register' },
          { title: 'نسيت كلمة المرور', title_en: 'Forgot Password', link: '/forgot' },
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'المتجر',
    title_en: 'Shop',
    link: '/shop',
  },
  {
    id: 4,
    title: 'المجموعات',
    title_en: 'Collections',
    link: '/collections',
  },
  {
    id: 5,
    title: 'كوبونات',
    title_en: 'Coupons',
    link: '/coupon',
  },
  {
    id: 6,
    title: 'المدونة',
    title_en: 'Blog',
    link: '/blog',
  },
  {
    id: 7,
    title: 'تواصل معنا',
    title_en: 'Contact',
    link: '/contact',
  },
]

export default menu_data;

// mobile_menu
export const mobile_menu = [
  {
    id: 1,
    title: 'الرئيسية',
    title_en: 'Home',
    link: '/',
  },
  {
    id: 2,
    sub_menu: true,
    title: 'المنتجات',
    title_en: 'Products',
    link: '/shop',
    sub_menus: [
      { title: 'كل المنتجات', title_en: 'All Products', link: '/shop' },
      { title: 'المفضلة', title_en: 'Wishlist', link: '/wishlist' },
      { title: 'سلة التسوق', title_en: 'Cart', link: '/cart' },
      { title: 'إتمام الشراء', title_en: 'Checkout', link: '/checkout' },
    ],
  },
  {
    id: 3,
    sub_menu: true,
    title: 'حسابي',
    title_en: 'My Account',
    link: '/profile',
    sub_menus: [
      { title: 'لوحة التحكم', title_en: 'Admin Dashboard', link: '/admin/dashboard' },
      { title: 'تسجيل الدخول', title_en: 'Login', link: '/login' },
      { title: 'إنشاء حساب', title_en: 'Register', link: '/register' },
    ],
  },
  {
    id: 4,
    title: 'المجموعات',
    title_en: 'Collections',
    link: '/collections',
  },
  {
    id: 5,
    title: 'كوبونات',
    title_en: 'Coupons',
    link: '/coupon',
  },
  {
    id: 6,
    title: 'المدونة',
    title_en: 'Blog',
    link: '/blog',
  },
  {
    id: 7,
    title: 'تواصل معنا',
    title_en: 'Contact',
    link: '/contact',
  },
]
