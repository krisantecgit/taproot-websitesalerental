import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./cartSlice.js"
import addressSlice from "./addressSlice.js"
const store = configureStore({
    reducer : {
        cart : cartSlice,
        address : addressSlice
    }
})

export default store;