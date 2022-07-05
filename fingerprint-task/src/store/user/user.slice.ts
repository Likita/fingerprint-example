import { apiUserLogin } from './user.service';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LoginDataType } from './user.types';

export const loginUser = createAsyncThunk('auth', async (formData: LoginDataType) => {
  return await apiUserLogin(formData)
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    status: false,
  },
  reducers: {
    
  },
  extraReducers: {
    [loginUser.fulfilled.toString()]: (state, action) => {
      // if (action.payload.content.data.auth) {
      // }
    },
  },
});

export const userReducer = userSlice.reducer;
