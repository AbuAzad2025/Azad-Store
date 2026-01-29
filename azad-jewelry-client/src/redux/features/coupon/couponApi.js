import { apiSlice } from "@/redux/api/apiSlice";

export const couponApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    // get offer coupon
    getOfferCoupons: builder.query({
      query: () => `/api/coupon`,
      providesTags:['Coupon'],
      keepUnusedDataFor: 600,
    }),
    // getAllCoupons seems to be the same endpoint /api/coupon based on backend route
    getAllCoupons: builder.query({
      query: () => `/api/coupon`,
      providesTags:['Coupon'],
    }),
    addCoupon: builder.mutation({
      query: (data) => ({
        url: "/api/coupon/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/coupon/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/api/coupon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useGetOfferCouponsQuery,
  useGetAllCouponsQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
