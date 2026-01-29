import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
// internal
import { clearCart } from '@/redux/features/cartSlice';
import CartCheckout from './cart-checkout';
import CartItem from './cart-item';
import RenderCartProgress from '../common/render-cart-progress';
import { useLanguage } from "@/context/language-context";
import { useGetTopRatedProductsQuery } from "@/redux/features/productApi";
import ProductItem from "@/components/products/jewelry/product-item";

const CartArea = () => {
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch()
  const { t } = useLanguage();
  const { data: topRated } = useGetTopRatedProductsQuery();
  const cartIds = new Set((cart_products || []).map((p) => String(p?._id || "")));
  const upsellItems = Array.isArray(topRated)
    ? topRated.filter((p) => p && !cartIds.has(String(p._id || ""))).slice(0, 4)
    : [];
  return (
    <>
      <section className="tp-cart-area pb-120">
        <div className="container">
          {cart_products.length === 0 &&
            <div className='text-center pt-50'>
              <h3>{t("cartEmpty")}</h3>
              <Link href="/shop" className="tp-cart-checkout-btn mt-20">{t("goToShop")}</Link>
            </div>
          }
          {cart_products.length > 0 &&
            <div className="row">
              <div className="col-xl-9 col-lg-8">
                <div className="tp-cart-list mb-25 mr-30">
                  <div className="cartmini__shipping">
                    <RenderCartProgress />
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th colSpan="2" className="tp-cart-header-product">{t("product")}</th>
                        <th className="tp-cart-header-price">{t("price")}</th>
                        <th className="tp-cart-header-quantity">{t("quantity")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart_products.map((item, i) => (
                        <CartItem key={i} product={item} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {upsellItems.length > 0 && (
                  <div className="mr-30 mb-40">
                    <h3 className="mb-25">{t("recommendedAddons")}</h3>
                    <div className="row">
                      {upsellItems.map((item) => (
                        <div key={String(item._id)} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6">
                          <ProductItem product={item} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="tp-cart-bottom">
                  <div className="row align-items-end">
                    <div className="col-xl-6 col-md-8">
                      {/* <div className="tp-cart-coupon">
                        <form action="#">
                          <div className="tp-cart-coupon-input-box">
                            <label>Coupon Code:</label>
                            <div className="tp-cart-coupon-input d-flex align-items-center">
                              <input type="text" placeholder="Enter Coupon Code" />
                              <button type="submit">Apply</button>
                            </div>
                          </div>
                        </form>
                      </div> */}
                    </div>
                    <div className="col-xl-6 col-md-4">
                      <div className="tp-cart-update text-md-end mr-30">
                        <button onClick={() => dispatch(clearCart())} type="button" className="tp-cart-update-btn">{t("clearCart")}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <CartCheckout />
              </div>
            </div>
          }
        </div>
      </section>
    </>
  );
};

export default CartArea;
