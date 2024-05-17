export interface IInfoUserAuth {
  address: string | null;
  expiredAt: string;
  fullName: string;
  email: string;
  firstName: string,
  lastName: string,
  id: string;
  avatar: any;
  idNumber: null | string | number;
  isPurchased: boolean;
  isSynced: boolean;
  isVerified: boolean;
  isWalletLinked: boolean;
  landingPage: string;
  phone: string;
  remindLinkWallet: boolean;
  roles: null | string | number;
  jwToken: null | string;
  token: null | string;
  userName: null | string;
  refreshToken: null | string;
  dob: string;
  isSocialLogin: boolean,
  permissions: any
}
export class User {
  address!: string | null;
  expiredAt!: string;
  fullName!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  id!: string;
  avatar!: any;
  idNumber!: null | string | number;
  isPurchased!: boolean;
  isSynced!: boolean;
  isVerified!: boolean;
  isWalletLinked!: boolean;
  landingPage!: string;
  phone!: string;
  remindLinkWallet!: boolean;
  roles!: null | string | number;
  jwToken!: null | string;
  token!: null | string;
  userName!: null | string;
  refreshToken!: null | string;
  dob!: string;
  gender?: string;
  isSocialLogin!: boolean;
  permissions!: any
}
