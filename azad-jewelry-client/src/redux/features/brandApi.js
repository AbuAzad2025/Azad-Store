import { apiSlice } from "../api/apiSlice";

export const brandApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    getActiveBrands: builder.query({
      query: () => `/api/brand/active`,
      providesTags: ['Brand'],
    }),
    getAllBrands: builder.query({
      query: () => `/api/brand/all`,
      providesTags: ['Brand'],
    }),
    addBrand: builder.mutation({
      query: (data) => ({
        url: "/api/brand/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Brand'],
    }),
    updateBrand: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/brand/edit/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Brand'],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/api/brand/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Brand'],
    }),
  }),
});

export const {
 useGetActiveBrandsQuery,
 useGetAllBrandsQuery,
 useAddBrandMutation,
 useUpdateBrandMutation,
 useDeleteBrandMutation,
} = brandApi;
