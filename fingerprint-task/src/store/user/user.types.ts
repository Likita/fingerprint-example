export interface FormDataType {
  user: string;
  password: string;
}

export interface LoginDataType {
  user: string;
  password: string;
  visitorId: string;
}

export interface apiUserLoginResponse {
  payload: apiUserLoginResponsePayload
}

export interface apiUserLoginResponsePayload {
  status: boolean;
  visitorId: string;
  ip?: string;
  totallyBlocked?: boolean;
  expires?: number;
}
