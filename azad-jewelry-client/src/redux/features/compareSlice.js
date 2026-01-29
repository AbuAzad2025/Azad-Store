import { createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { notifyError, notifySuccess } from "@/utils/toast";

const initialState = {
  compareItems: [],
};

export const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    add_to_compare: (state, { payload }) => {
      const isExist = state.compareItems.some(
        (item) => item._id === payload._id
      );
      if (!isExist) {
        state.compareItems.push(payload);
        notifySuccess({ key: "addedToCompareToast", vars: { title: payload.title } });
      } else {
        state.compareItems = state.compareItems.filter(
          (item) => item._id !== payload._id
        );
        notifyError({ key: "removedFromCompareToast", vars: { title: payload.title } });
      }
      setLocalStorage("compare_items", state.compareItems);
    },
    remove_compare_product: (state, { payload }) => {
      state.compareItems = state.compareItems.filter(
        (item) => item._id !== payload.id
      );
      setLocalStorage("compare_items", state.compareItems);
      notifyError({ key: "removedFromCompareToast", vars: { title: payload.title } });
    },
    get_compare_products: (state, { payload }) => {
      state.compareItems = getLocalStorage("compare_items");
    },
  },
});

export const { add_to_compare, get_compare_products, remove_compare_product } =
  compareSlice.actions;
export default compareSlice.reducer;
