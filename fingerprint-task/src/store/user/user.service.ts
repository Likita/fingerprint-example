import { LoginDataType } from './user.types';
import axios from 'axios';
let baseUrl = 'http://localhost:8050';

export const apiUserLogin = (data: LoginDataType) =>
  axios.post(`${baseUrl}/auth`, data).then(({ data }) => data);
//apiUserLoginResponse