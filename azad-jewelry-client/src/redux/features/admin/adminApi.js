import { apiSlice } from "@/redux/api/apiSlice";
import { adminLoggedIn } from "./adminSlice";
import Cookies from "js-cookie";

const getCookieOptions = () => {
  if (typeof window === "undefined") return { expires: 0.5 };
  const isHttps = window.location?.protocol === "https:";
  return { expires: 0.5, sameSite: "strict", secure: isHttps };
};

export const adminApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // admin login
    loginAdmin: builder.mutation({
      query: (data) => ({
        url: "/api/admin/login",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          
          Cookies.set(
            "adminInfo",
            JSON.stringify({
              accessToken: result.data.token,
              admin: result.data, 
            }),
            getCookieOptions()
          );

          dispatch(
            adminLoggedIn({
              accessToken: result.data.token,
              admin: result.data,
            })
          );
        } catch (err) {
          // do nothing
        }
      },
    }),
    
    // get all staff
    getAllStaff: builder.query({
      query: () => "/api/admin/all",
    }),

    // add staff
    addStaff: builder.mutation({
      query: (data) => ({
        url: "/api/admin/add",
        method: "POST",
        body: data,
      }),
    }),

    // get dashboard amount
    getDashboardAmount: builder.query({
      query: () => "/api/user-order/dashboard-amount",
      keepUnusedDataFor: 600,
    }),

    // get recent orders
    getRecentOrders: builder.query({
      query: () => "/api/user-order/dashboard-recent-order",
      keepUnusedDataFor: 600,
    }),

    // get most selling category
    getMostSellingCategory: builder.query({
      query: () => "/api/user-order/most-selling-category",
      keepUnusedDataFor: 600,
    }),

    // get all orders
    getAllOrders: builder.query({
      query: () => "/api/order/orders",
      providesTags: ['Orders'],
    }),

    // update order status
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/order/update-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),

    // delete staff
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/api/admin/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
          try {
            await queryFulfilled;
            dispatch(
              apiSlice.util.updateQueryData('getAllStaff', undefined, (draft) => {
                return draft.filter((item) => item._id !== arg);
              })
            );
          } catch (err) {
            // do nothing
          }
      },
    }),

    // get all users (customers)
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/api/user/all",
        params: { page, limit },
      }),
      providesTags: ['Users'],
    }),

    // delete user (customer)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Users'],
    }),

    // add user by admin
    addUser: builder.mutation({
      query: (data) => ({
        url: "/api/user/add-by-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    // update user by admin
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/user/update-by-admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    // get sales report
    getSalesReport: builder.query({
      query: () => "/api/user-order/sales-report",
    }),

    // get sold products report
    getSoldProductsReport: builder.query({
      query: () => "/api/user-order/sold-products-report",
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useGetAllStaffQuery,
  useAddStaffMutation,
  useGetDashboardAmountQuery,
  useGetRecentOrdersQuery,
  useGetMostSellingCategoryQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteStaffMutation,
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useGetSalesReportQuery,
  useGetSoldProductsReportQuery,
} = adminApi;
