import { configureStore } from "@reduxjs/toolkit";
import chessSlice from "./chess/slice";

let store = configureStore({
    reducer: chessSlice.reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;