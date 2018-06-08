import {
  ActionReducerMap,
  createSelector,
  createFeatureSelector,
} from '@ngrx/store';
 
import * as fromAccount from './reducers/account';
 
export const reducers: ActionReducerMap<any> = {
  account: fromAccount.reducer,
};

export const getAccount = createFeatureSelector<fromAccount.Account>('account');
export const getAccountCreated = createSelector(getAccount, fromAccount.getAccountCreated);
export const getAccountWallet = createSelector(getAccount, fromAccount.getAccountWallet);
export const getAccountAddress = createSelector(getAccount, fromAccount.getAccountAddress);
export const getAccountAmount = createSelector(getAccount, fromAccount.getAccountAmount);
export const getAccountNetwork = createSelector(getAccount, fromAccount.getAccountNetwork);
export const getAccountNode = createSelector(getAccount, fromAccount.getAccountNode);
export const getAccountMosaics = createSelector(getAccount, fromAccount.getAccountMosaics);
export const getAccountOwnerMosaic= createSelector(getAccount, fromAccount.getAccountOwnerMosaic);
