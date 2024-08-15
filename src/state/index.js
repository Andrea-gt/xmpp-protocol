import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mode: "light",  // Theme mode: light or dark
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setMode: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light"; // Toggle between light and dark
        },
    },
});

export const { setMode } = authSlice.actions;
export default authSlice.reducer;