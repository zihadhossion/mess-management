import { configureStore } from "@reduxjs/toolkit";
import authReducer from "~/redux/features/authSlice";
import messReducer from "~/redux/features/messSlice";
import menuReducer from "~/redux/features/menuSlice";
import billingReducer from "~/redux/features/billingSlice";
import memberReducer from "~/redux/features/memberSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mess: messReducer,
    menu: menuReducer,
    billing: billingReducer,
    member: memberReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
