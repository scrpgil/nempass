import { Action } from '@ngrx/store';

export const DELETE = '[Account] Delete';
export const RESTORE = '[Account] Restore';
export const SET_NETWORK = '[Account] SetNetwork';
export const SET_ADDRESS = '[Account] SetAddress';
export const SET_AMOUNT = '[Account] SetAmount';
export const SET_WALLET = '[Account] SetWallet';
export const SET_NODE = '[Account] SetNode';
export const SET_MOSAICS = '[Account] SetMosaics';
export const SET_OWNER_MOSAICS = '[Account] SetOwnerMosaics';

export class Delete implements Action {
    readonly type = DELETE;
}

export class Restore implements Action {
    readonly type = RESTORE;
}

export class SetAddress implements Action {
    readonly type = SET_ADDRESS;
    constructor(public payload: any) {}
}

export class SetAmount implements Action {
    readonly type = SET_AMOUNT;
    constructor(public payload: any) {}
}

export class SetNetwork implements Action {
    readonly type = SET_NETWORK;
    constructor(public payload: any) {}
}

export class SetWallet implements Action {
    readonly type = SET_WALLET;
    constructor(public payload: any) {}
}

export class SetNode implements Action {
    readonly type = SET_NODE;
    constructor(public payload: any) {}
}

export class SetMosaics implements Action {
    readonly type = SET_MOSAICS;
    constructor(public payload: any) {}
}

export class SetOwnerMosaics implements Action {
    readonly type = SET_OWNER_MOSAICS;
    constructor(public payload: any) {}
}

export type All
= Delete | Restore | SetAmount | SetAddress | SetNetwork | SetWallet | SetNode | SetMosaics | SetOwnerMosaics;
