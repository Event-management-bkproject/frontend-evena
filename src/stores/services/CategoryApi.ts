import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { ApiResponse, CategoryResponse, CreateCategoryRequest } from '../types';

export const CategoryAPI = createApi({
  reducerPath: 'CategoryAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Category'],
  keepUnusedDataFor: 3600,
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<CategoryResponse[]>, void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: ['Category'],
    }),
    getCategoryById: builder.query<ApiResponse<CategoryResponse>, number>({
      query: (id: number) => ({
        url: `/categories/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation<ApiResponse<CategoryResponse>, CreateCategoryRequest>({
      query: (categoryData: CreateCategoryRequest) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<ApiResponse<CategoryResponse>, { id: number; data: CreateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),
    deleteCategory: builder.mutation<ApiResponse<string>, number>({
      query: (id: number) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Category', id }, 'Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = CategoryAPI;
