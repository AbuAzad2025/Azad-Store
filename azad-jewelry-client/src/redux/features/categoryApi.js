import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    addCategory: builder.mutation({
      query: (data) => ({
        url: "/api/category/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    getAllCategories: builder.query({
      query: () => `/api/category/all`,
      providesTags: ['Category'],
    }),
    getShowCategory: builder.query({
      query: () => `/api/category/show`,
      providesTags: ['Category'],
    }),
    getProductTypeCategory: builder.query({
      query: (type) => `/api/category/show/${type}`
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/category/edit/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/api/category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
 useAddCategoryMutation,
 useGetProductTypeCategoryQuery,
 useGetShowCategoryQuery,
 useGetAllCategoriesQuery,
 useUpdateCategoryMutation,
 useDeleteCategoryMutation,
} = categoryApi;
