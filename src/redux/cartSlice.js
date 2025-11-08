// import { createSlice } from "@reduxjs/toolkit"
// const initialState = {
//     buyCart: [],
//     rentCart: []
// }
// const cartSlice = createSlice({
//     name: "cart",
//     initialState,
//     reducers: {
//         addToBuyCart: (state, action) => {
//             state.buyCart.push(action.payload);
//         },
//         addToRentCart: (state, action) => {
//             state.rentCart.push(action.payload)
//         },
//         removeFromBuyCart : (state, action)=> {
//             state.buyCart = state.buyCart.filter(item => item.id !== action.payload)
//         },
//         removeFromRentCart : (state, action)=> {
//             state.rentCart = state.rentCart.filter(item => item.id !== action.payload)
//         },
//         clearBuyCart : (state, action)=>{
//             state.buyCart = []
//         },
//         clearRentCart : (state, action)=> {
//             state.rentCart = [];
//         }
//     }
// })

// export const {addToBuyCart, addToRentCart, removeFromBuyCart, removeFromRentCart, clearBuyCart, clearRentCart} = cartSlice.actions;
// export default cartSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    buyCart: JSON.parse(localStorage.getItem("buyCart")) || [],
    rentCart: JSON.parse(localStorage.getItem("rentCart")) || []
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToBuyCart: (state, action) => {
            const existing = state.buyCart.find(item => item.id === action.payload.id);

            if (existing) {
                existing.qty += 1;
            } else {
                state.buyCart.push({ ...action.payload, qty: 1 });
            }

            localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
        },

        addToRentCart: (state, action) => {
            const existing = state.rentCart.find(item => item.id === action.payload.id);

            if (existing) {
                existing.qty += 1;
            } else {
                state.rentCart.push({ ...action.payload, qty: 1 });
            }

            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },

        decreaseBuyQty: (state, action) => {
            const existing = state.buyCart.find(item => item.id === action.payload);

            if (!existing) return;

            if (existing.qty > 1) {
                existing.qty -= 1;
            } else {
                state.buyCart = state.buyCart.filter(item => item.id !== action.payload);
            }

            localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
        },

        decreaseRentQty: (state, action) => {
            const existing = state.rentCart.find(item => item.id === action.payload);

            if (!existing) return;

            if (existing.qty > 1) {
                existing.qty -= 1;
            } else {
                state.rentCart = state.rentCart.filter(item => item.id !== action.payload);
            }

            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },

        removeFromBuyCart: (state, action) => {
            state.buyCart = state.buyCart.filter(item => item.id !== action.payload);
            localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
        },

        removeFromRentCart: (state, action) => {
            state.rentCart = state.rentCart.filter(item => item.id !== action.payload);
            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },

        clearBuyCart: (state) => {
            state.buyCart = [];
            localStorage.removeItem("buyCart");
        },

        clearRentCart: (state) => {
            state.rentCart = [];
            localStorage.removeItem("rentCart");
        },
        setRentDates: (state, action) => {
            const { id, fromDate, toDate } = action.payload;
            const existing = state.rentCart.find(item => item.id === id);
            if (existing) {
                existing.fromDate = fromDate;
                existing.toDate = toDate;
            }
            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },
    }
});

export const {
    addToBuyCart,
    addToRentCart,
    decreaseBuyQty,
    decreaseRentQty,
    removeFromBuyCart,
    removeFromRentCart,
    clearBuyCart,
    clearRentCart,
    setRentDates
} = cartSlice.actions;

export default cartSlice.reducer;
