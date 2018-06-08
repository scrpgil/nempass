import * as AccountActions from '../actions/account'

export type Action = AccountActions.All;

export interface Account {
    v:number,
    amount:number,
    created:boolean,
    address:string,
    wallet:any,
    node:any,
    mosaics:any,
    owner_mosaics:any,
}


let initialAccount = {
    created:false,
    v:0,
    amount:0,
    address:"",
    wallet:null,
    node:null,
    mosaics:null,
    owner_mosaics:[],
};

export function reducer(account:Account = initialAccount, action: Action) {
    let a = {
        created:account.created,
        v:account.v,
        amount:account.amount,
        address:account.address,
        wallet: account.wallet,
        node: account.node,
        mosaics: account.mosaics,
        owner_mosaics: account.owner_mosaics,
    };
    switch (action.type) {
        case AccountActions.DELETE:{
            localStorage.removeItem("account");
            localStorage.removeItem("accepts");
            localStorage.clear();
            return initialAccount;
        }
        case AccountActions.RESTORE:{
            let r = localStorage.getItem("account");
            let n = account;
            if(r){
                let restore = JSON.parse(r);
                if("created" in restore){
                    n = restore;
                }
            }
            return n;
        }
        case AccountActions.SET_ADDRESS:{
            a.address = action.payload;
            saveLocalStorage(a);
            return a;
        }
        case AccountActions.SET_AMOUNT:{
            a.amount = action.payload;
            saveLocalStorage(a);
            return a;
        }
        case AccountActions.SET_NETWORK:{
            a.v = action.payload;
            saveLocalStorage(a);
            return a;
        }
        case AccountActions.SET_NODE:{
            a.node = action.payload;
            saveLocalStorage(a);
            return a;
        }
        case AccountActions.SET_WALLET:{
            a.wallet = action.payload;
            a.created = true;
            saveLocalStorage(a);
            return a;
        }
        case AccountActions.SET_MOSAICS:{
            if(action.payload){
                a.mosaics = action.payload;
            }
            return a;
        }
        case AccountActions.SET_OWNER_MOSAICS:{
            console.log(action.payload);
            if(action.payload){
                a.owner_mosaics = action.payload;
            }
            return a;
        }
        default:
            return account;
    };
};

function saveLocalStorage(a) {
    try {
        let save = Object.assign({}, a);
        localStorage.setItem("account", JSON.stringify(save));
    }
    catch (e) {
        console.log("Local Storage is full, Please empty data");
        console.log(e);
    }
};

export const getAccountCreated = (account: Account) => account.created;
export const getAccountWallet = (account: Account) => account.wallet;
export const getAccountAddress = (account: Account) => account.address;
export const getAccountAmount = (account: Account) => account.amount;
export const getAccountNetwork = (account: Account) => account.v;
export const getAccountNode = (account: Account) => account.node;
export const getAccountMosaics = (account: Account) => account.mosaics;
export const getAccountOwnerMosaic= (account: Account) => account.owner_mosaics;
