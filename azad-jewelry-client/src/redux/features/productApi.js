import { apiSlice } from "../api/apiSlice";

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => `/api/product/all`,
      providesTags:['Products']
    }),
    getProductType: builder.query({
      query: ({ type, query }) =>
        query ? `/api/product/${type}?${query}` : `/api/product/${type}`,
      providesTags:['ProductType']
    }),
    getOfferProducts: builder.query({
      query: (type) => `/api/product/offer?type=${type}`,
      providesTags:['OfferProducts']
    }),
    getPopularProductByType: builder.query({
      query: (type) => `/api/product/popular/${type}`,
      providesTags:['PopularProducts']
    }),
    getTopRatedProducts: builder.query({
      query: () => `/api/product/top-rated`,
      providesTags:['TopRatedProducts']
    }),
    // get single product
    getProduct: builder.query({
      query: (id) => `/api/product/single-product/${id}`,
      providesTags: (result, error, arg) => [{ type: "Product", id: arg }],
      invalidatesTags: (result, error, arg) => [
        { type: "RelatedProducts", id:arg },
      ],
    }),
    // get related products
    getRelatedProducts: builder.query({
      query: (id) => `/api/product/related-product/${id}`,
      providesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg },
      ],
    }),

    getProductsByIds: builder.mutation({
      query: ({ ids, limit } = {}) => ({
        url: "/api/product/by-ids",
        method: "POST",
        body: { ids, limit },
      }),
    }),
    
    // add product
    addProduct: builder.mutation({
      query: (data) => ({
        url: "/api/product/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Products', 'ProductType'],
    }),

    // delete product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Products', 'ProductType', 'TopRatedProducts', 'PopularProducts'],
    }),

    // edit product
    editProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/product/edit-product/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        'Products', 
        'ProductType', 
        { type: "Product", id: arg.id }
      ],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductTypeQuery,
  useGetOfferProductsQuery,
  useGetPopularProductByTypeQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useGetProductsByIdsMutation,
  useAddProductMutation,
  useDeleteProductMutation,
  useEditProductMutation,
} = productApi;
