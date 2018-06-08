import { Observable } from 'rxjs/Observable';
import axios from 'axios';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import nem from "nem-sdk";
import CryptoJS from 'crypto-js';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/index';
import * as AccountAction from '../../store/actions/account';

import {API_URL, TESTNET_V, MAINNET_V, INVOICE_QR,WALLET_QR} from '../../config';
import {MAINNET_NODE_LIST, TESTNET_NODE_LIST, NODE} from '../../nodelist';


@Injectable()
export class NemProvider {
    public address:string = "";
    public v:number = 0;
    public wallet:any;
    public network_id:number;
    public account$:any;
    public node:NODE;
    public mosaics:any;
    public ownerMosaic:any;
    public http:any;
    public mosaicMetaData:any;

    constructor(
        public store: Store<any>
    ) {
        this.init();
        this.setup();
        this.http = axios.create();
    }
    init(){
        this.network_id = 0;
        this.wallet = null;
        this.address = "";
        this.node = null;
        this.v = 0;
        this.mosaics = null;
        this.mosaicMetaData= null;
    }
    setup(){
        this.account$ = this.store.select("account").subscribe(res =>{
            if(res){
                if(res.created == true){
                    this.setV(res.v);
                    this.setNetworkId(this.v);
                    this.setNode(res.node);
                    if(this.node == null){
                        this.setNodeInit(this.v);
                    }
                    this.setAddress(res.address);
                    this.setWallet(res.wallet);
                }
            }
        });
        this.store.select(fromRoot.getAccountAddress).subscribe((res)=>{
            if(res){
                this.setAddress(res);
                this.asyncSetup();
            }
        });
    }
    async asyncSetup(){
        try{
            this.getAccountMosaicsOwned(this.address);
            this.getAccountNamespacesOwned(this.address);
            let res = await this.getAccountData(this.address);
            if(res){
                this.store.dispatch(new AccountAction.SetAmount(res["account"].balance));
            }
            this.initMetaData();
        }catch(e){
            console.log(e);
        }
    }
    async getAccountData(address){
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        return nem.com.requests.account.data(endpoint, address);
    }
    async initMetaData(){
        this.mosaicMetaData= nem.model.objects.get("mosaicDefinitionMetaDataPair");
        let s = await this.getMosaicSupply("nem:xem");
        this.mosaicMetaData["nem:xem"].supply = s.supply;
    }
    async getMosaicDivisibility(mosaicName){
        if(!this.mosaicMetaData[mosaicName]){
            await this.addMosaicMetaData(mosaicName);
        }
        let p = this.mosaicMetaData[mosaicName].mosaicDefinition.properties;
        let dp = nem.utils.helpers.grep(p, function(w) {
            return w.name === "divisibility";
        });
        let d = dp.length === 1 ? ~~(dp[0].value) : 0;
        return d;
    }
    async addMosaicMetaData(mosaicName){
        let mosaic = this.mosaicNameToId(mosaicName);
        if(this.mosaicMetaData[mosaicName]){
            return;
        }
        let m = await this.getMosaicDefinitions(mosaic.namespaceId, mosaic.name);
        let neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(m, [mosaic.name]);
        if(neededDefinition){
            let s = await this.getMosaicSupply(mosaicName);
            this.mosaicMetaData[mosaicName] = {};
            this.mosaicMetaData[mosaicName].mosaicDefinition = neededDefinition[mosaicName];
            this.mosaicMetaData[mosaicName].supply = s.supply;
        }
    }
    setAddress(val){
        this.address = val;
    }
    setV(val){
        this.v = val;
    }
    setNetworkId(v){
        if(v == TESTNET_V){
            this.network_id = nem.model.network.data.testnet.id;
        }else if(v == MAINNET_V){
            this.network_id = nem.model.network.data.mainnet.id;
        }else{
            throw Error("v is not setting.");
        }
    }
    setNode(val){
        this.node = val;
    }
    setNodeInit(v){
        if(v == TESTNET_V){
            this.node = this.getNodeUrl(TESTNET_NODE_LIST);
        }else if(v == MAINNET_V){
            this.node= this.getNodeUrl(MAINNET_NODE_LIST);
        }else{
            throw Error("v is not setting.");
        }
        this.store.dispatch(new AccountAction.SetNode(this.node));
    }
    setWallet(val){
        this.wallet = val;
    }

    getNodeUrl(list){
        return list[Math.floor(Math.random() * list.length)];
    }

    createWallet(walletName, password, v){
        let network_id = 0;
        if(v == TESTNET_V){
            network_id = nem.model.network.data.testnet.id;
        }else{
            network_id = nem.model.network.data.mainnet.id;
        }
        let wallet = nem.model.wallet.createPRNG(walletName, password, network_id);
        return wallet;
    }
    getRandomKey(){
        return nem.crypto.helpers.randomKey();
    }
    importPrivateKeyWallet(walletName, password, privateKey,salt,  pass, v){
        let network_id = 0;
        if(v == TESTNET_V){
            network_id = nem.model.network.data.testnet.id;
        }else{
            network_id = nem.model.network.data.mainnet.id;
        }
        salt = CryptoJS.enc.Hex.parse(salt);
        let key = CryptoJS.PBKDF2(pass, salt, {
            keySize: 256 / 32,
            iterations: 2000
        });
        let iv = privateKey.substring(0, 32);
        let encryptedPrvKey = privateKey.substring(32, 128);

        let obj = {
            ciphertext: CryptoJS.enc.Hex.parse(encryptedPrvKey),
            iv: nem.utils.convert.hex2ua(iv),
            key: nem.utils.convert.hex2ua(key.toString())
        }

        let priv = nem.crypto.helpers.decrypt(obj);
        if(64 <= priv.length && priv.length <= 66){
            let wallet = nem.model.wallet.importPrivateKey(walletName, password, priv, network_id);
            return wallet;
        }
        return null;
    }
    createAccount(address, password, wallet, network){
        this.store.dispatch(new AccountAction.SetNetwork(network));
        this.store.dispatch(new AccountAction.SetWallet(wallet));
        this.store.dispatch(new AccountAction.SetAddress(address));
    }
    async getAccountMosaicsOwned(address){
        let id=null;
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        let res = await nem.com.requests.account.mosaics.owned(endpoint, address, id);
        if(res){
            let a = [];
            for(let i=0;i<res.data.length;i++){
                let mid = res.data[i].mosaicId;
                let mname = this.mosaicIdToName(mid);
                a.push(mname)
            }
            let id = a.join(',');
            try{
                //let r = await this.http.get(API_URL + "v1/mosaic/info?id=" + id);
                let r = await this.http.get("assets/info.json");
                if(r && r.data){
                    let m = [];
                    for(let i=0;i<r.data.mosaics.length;i++){
                        let ms = r.data.mosaics[i];
                        if(this.address != ms["owner"]){
                            let dates = this.getDates(ms.start, ms.end);
                            ms["dates"] = dates;
                            m.push(ms);
                        }
                    }
                    this.store.dispatch(new AccountAction.SetMosaics(m));
                }
            }catch(e){
                console.log(e);
            }
        }
    }
    async getOwnerEvent(){
        try{
            //let r = await this.http.get(API_URL + "v1/mosaic/info_by_owner?owner=" + this.address);
            let r = await this.http.get("assets/info_by_owner.json");
            let m = [];
            if(r && r.data){
                for(let i=0;i<r.data.mosaics.length;i++){
                    let ms = r.data.mosaics[i];
                    let dates = this.getDates(ms.start, ms.end);
                    ms["dates"] = dates;
                    m.push(ms);
                }
            }
            return m;
        }catch(e){
            console.log(e);
            return [];
        }
    }
    async getAccountNamespacesOwned(address){
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        try{
            let res = await nem.com.requests.account.namespaces.owned(endpoint, address);
            let name = await this.getNamespaceMosaicDefined(res.data);
            this.ownerMosaic = name;
            this.store.dispatch(new AccountAction.SetOwnerMosaics(this.ownerMosaic));
        }catch(e){
            console.log(e);
        }
        return;
    }
    async getNamespaceMosaicDefined(namespaces){
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        let createdMosaic = [];
        for(let i=0;i<namespaces.length;i++){
            let flg = true;
            let id = null;
            let mosaics = [];
            while (flg) {
                try{
                    let res = await nem.com.requests.namespace.mosaicDefinitions(endpoint, namespaces[i].fqn, "",id);
                    if(id == res.data[res.data.length-1].meta.id){
                        namespaces[i].mosaics = mosaics;
                        break
                    }
                    id = res.data[res.data.length-1].meta.id;
                    mosaics = mosaics.concat(res.data);
                }catch(e){
                    console.log(e);
                    flg = false;
                }
            }
        }
        return namespaces;
    }

    getCalcAmount(amount){
        return amount / 1000000;
    }
    mosaicNameToId(name){
        let m = name.split(":");
        return {namespaceId:m[0], name:m[1]};
    }
    mosaicIdToName(mosaicId){
        return nem.utils.format.mosaicIdToName(mosaicId);
    }
    validateNEMPaymentQRCode(obj){
        let ret = 999;
        if(obj["v"] && obj["type"] && obj["data"]){
            if(obj["type"] == 1 || obj["type"] == 2){
                ret = INVOICE_QR;
            }else if(obj["type"] == 3){
                ret = WALLET_QR;
            }
        }
        return ret;
    }
    valdInvoice(obj){
        if(obj["v"] && obj["type"] && obj["data"]){
            if((obj["type"] != 1 && obj["type"] != 2) && obj["v"] != this.v){
                return false;
            }
            let d = obj["data"];
            if(!this.isAddressValid(d["addr"])){
                return false;
            }
        }else{
            return false;
        }
        return true;
    }
    convAmountToDiv(amount){
        return amount / 1000000;
    }
    convDivToAmount(amount){
        return amount * 1000000;
    }
    getSignerAddress(signer){
        let signer_address = nem.model.address.toAddress(signer, this.network_id);
        return signer_address;
    }
    getAliasAddress(name){
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        return nem.com.requests.namespace.info(endpoint, name);
    }
    getSendInvoice(address, amount, msg:string = "", mosaics:any=[]){
        let obj = nem.model.objects.create("invoice")();
        obj["v"] = this.v;
        obj["type"] = INVOICE_QR;
        obj["data"].addr = address;
        obj["data"].amount = amount;
        obj["data"].msg = msg;
        if(mosaics.length>0){
            obj["data"].mosaics = mosaics;
        }
        return obj;
    }
    async getAcceptQR(mid, owner){
        let obj = {
            "v":1,
            "addr":this.address,
            "mid":mid,
            "txHash":"",
            "msg":"",
            "signer":"",
            "enc":false,
        }
        let tx = await this.searchBuyTransaction(mid, owner);
        if(tx){
            obj["txHash"] = tx.meta.hash.data;
            obj["signer"] = nem.model.address.toAddress(tx.transaction.signer, this.network_id);
            if(tx.transaction.message){
                if(tx.transaction.message.type == 1){
                    let msg = this.fmtHexToUtf8Pipe(tx.transaction.message.payload);
                    obj["msg"] = msg;
                }else if(tx.transaction.message.type == 2){
                    obj["msg"] = tx.transaction.message.payload;
                    obj["enc"] = true;
                }
            }
        }
        return [obj, tx];
    }
    async searchBuyTransaction(mid, owner){
        let txId = null;
        let flg = true;
        let tx:any = null;
        while(flg){
            try{
                let res = await this.getAccountTransactionAll(this.address, txId);
                if(res.data.length>0){
                    for(let i=0;i<res.data.length;i++){
                        let t = res.data[i].transaction;
                        if(t["type"] == nem.model.transactionTypes.transfer){
                            let signer = nem.model.address.toAddress(t["signer"], this.network_id);
                            if(t["mosaics"] &&  t["recipient"] == this.address){
                                for(let j=0;j<t["mosaics"].length;j++){
                                    let m = t["mosaics"][j];
                                    let name = m.mosaicId["namespaceId"] + ":" + m.mosaicId["name"];
                                    if(mid == name){
                                        tx = res.data[i];
                                        flg = false;
                                        return tx;
                                    }
                                }
                            }
                        }
                    }
                }
                if(txId == res.data[res.data.length-1].meta.id){
                    flg = false;
                    break
                }
                txId = res.data[res.data.length-1].meta.id;
            }catch(e){
                flg = false;
            }
        }
        return tx;
    }
    async getBuyTx(mid, owner, stopTxHash){
        let before = [];
        let after = [];
        let txId = null;
        let flg = true;
        let tx:any = [];
        // トランザクションの取得
        while(flg){
            try{
                let res = await this.getAccountTransactionAll(this.address, txId);
                if(txId == res.data[res.data.length-1].meta.id ){
                    flg = false;
                    break
                }
                txId = res.data[res.data.length-1].meta.id;
                if(res.data.length>0){
                    tx = tx.concat(res.data);
                }
                for(let i=0;i<res.data.length;i++){
                    if(res.data[i].meta.hash.data == stopTxHash){
                        flg = false;
                        break
                    }
                }
            }catch(e){
                flg = false;
            }
        }
        //before配列を作成
        for(let i=0;i<tx.length;i++){
            let t = tx[i].transaction;
            let signer = nem.model.address.toAddress(t["signer"], this.network_id);
            if(t.message && signer != this.address){
                let msg = "";
                if(t.message.type == 1){
                    msg = this.fmtHexToUtf8Pipe(t.message.payload);
                }
                if(t.message.type == 2){
                    msg = await this.decodeMsg(t.message.payload, "nemindemo2", t.signer, t.recipient);
                }
                if(msg){
                    if(this.isJson(msg)){
                        let obj = JSON.parse(msg);
                        if(this.validBuyMsg(obj, mid)){
                            tx[i]["transaction"]["signerAddress"] = signer;
                            let copy = JSON.parse(JSON.stringify(tx[i]));
                            before.push(copy);
                        }
                    }
                }
            }
        }
        //after配列を作成
        for(let i=0;i<before.length;i++){
            let b = before[i];
            for(let j=0;j<tx.length;j++){
                let t = tx[j].transaction;
                let signer = nem.model.address.toAddress(t["signer"], this.network_id);
                if(t.message && signer == this.address){
                    let msg = "";
                    if(t.message.type == 1){
                        msg = this.fmtHexToUtf8Pipe(t.message.payload);
                    }
                    if(t.message.type == 2){
                        msg = await this.decodeMsg(t.message.payload, "nemindemo2", t.signer, t.recipient);
                    }
                    if(this.isJson(msg)){
                        let obj = JSON.parse(msg);
                        if(this.validReplyMsg(obj, mid, b.meta.hash.data)){
                            tx[j]["transaction"]["signerAddress"] = signer;
                            let copy = JSON.parse(JSON.stringify(tx[j]));
                            after.push(copy);
                        }
                    }
                }
            }
        }
        //before配列からafter配列にあるものを削除する
        for(let i =0;i<after.length;i++){
            let a = after[i];
            let t = a.transaction;
            for(let j = 0;j<before.length;j++){
                let b = before[j];
                let msg = "";
                if(t.message.type == 1){
                    msg = this.fmtHexToUtf8Pipe(t.message.payload);
                }
                if(t.message.type == 2){
                    msg = await this.decodeMsg(t.message.payload, "nemindemo2", t.signer, t.recipient);
                }
                if(msg){
                    if(this.isJson(msg)){
                        let obj = JSON.parse(msg);
                        if(obj.hash == b.meta.hash.data){
                            before.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        }
        return [before, after];
    }
    async chainTransaction(mid, owner, address, txId){
        let flg = true;
        let tx:any = [];
        while(flg){
            try{
                let res = await this.getAccountTransactionAll(address, txId);
                console.log(res);
                if(res.data.length>0){
                    for(let i=0;i<res.data.length;i++){
                        let t = res.data[i].transaction;
                        if(t["type"] == nem.model.transactionTypes.transfer){
                            let signer = nem.model.address.toAddress(t["signer"], this.network_id);
                            if(t["mosaics"] &&  t["recipient"] == address){
                                for(let j=0;j<t["mosaics"].length;j++){
                                    let m = t["mosaics"][j];
                                    let name = m.mosaicId["namespaceId"] + ":" + m.mosaicId["name"];
                                    if(mid == name){
                                        res.data[i]["transaction"]["signerAddress"] = signer;
                                        tx.push(res.data[i]);
                                        flg = false;
                                        if(this.address == signer){
                                            console.log(tx);
                                            return tx;
                                        }else{
                                            console.log("reflect");
                                            let r = await this.chainTransaction(mid, owner, signer, res.data[i].meta.id);
                                            r = r.concat(tx)
                                            return r;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if(txId == res.data[res.data.length-1].meta.id){
                    flg = false;
                    break
                }
                txId = res.data[res.data.length-1].meta.id;
            }catch(e){
                flg = false;
            }
        }
        return tx;
    }
    async getAccountTransactionAll(address, txId:any=null){
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        return nem.com.requests.account.transactions.all(endpoint, address, null, txId);
    }
    isJson(arg){
        arg = (typeof(arg) == "function") ? arg() : arg;
        if(typeof(arg) != "string"){return false;}
        try{arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);return true;}catch(e){return false;}
    }
    isAddressValid(address){
        var isValid = nem.model.address.isValid(address);
        return isValid;
    }
    getInvoice(amount){
        let obj = this.getSendInvoice(this.address, amount);
        return obj;
    }
    getReplyMsg(mid, hash){
        let obj = {
            "mid":mid,
            "hash":hash,
            "v":2,
            "name":"nempass",
        }
        return obj;
    }
    getBuyMsg(mid, amount){
        let obj = {
            "mid":mid,
            "amount":amount,
            "v":1,
            "name":"nempass",
        }
        return obj;
    }
    validBuyMsg(obj, mid){
        if(obj["v"] == 1 && obj["name"] == "nempass" && obj["amount"] && obj["mid"] == mid){
            return true;
        }else{
            return false;
        }
    }
    validReplyMsg(obj, mid, hash){
        if(obj["v"] == 2 && obj["name"] == "nempass" && obj["hash"] == hash && obj["mid"] == mid){
            return true;
        }else{
            return false;
        }
    }
    getNowDateTime(){
        let today = new Date();
        return today.getFullYear() + "/" + ("0" + (today.getMonth()+1)).slice(-2) + "/" +  ("0"+today.getDate()).slice(-2) + " " + ("0"+today.getHours()).slice(-2) + ":" + ("0"+today.getMinutes()).slice(-2) + "-" + ("0"+today.getSeconds()).slice(-2);
    }
    getDateTime(){
        let today = new Date();
        return today.getFullYear() + "" + ("0" + (today.getMonth()+1)).slice(-2) + "" +  ("0"+today.getDate()).slice(-2) + "" + ("0"+today.getHours()).slice(-2) + "" + ("0"+today.getMinutes()).slice(-2) + "" + ("0"+today.getSeconds()).slice(-2);
    }
    getDates(start, end){
        let s = new Date(start);
        let e = new Date(end);
        s.setTime(s.getTime() - 1000*60*60*9);
        e.setTime(e.getTime() - 1000*60*60*9);
        let dayOfWeekStr = [ "日", "月", "火", "水", "木", "金", "土" ][s.getDay()] ;
        return s.getFullYear() + "/" + (s.getMonth()+1) + "/" +  s.getDate() + "("+dayOfWeekStr+") " + s.getHours() + ":" + ("0"+s.getMinutes()).slice(-2) + "〜" + e.getHours() + ":" +("0"+e.getMinutes()).slice(-2);
    }
    fmtHexToUtf8Pipe(value){
        return nem.utils.format.hexToUtf8(value);
    }
    async uploadEvent(model){
        return this.http.post(API_URL + "v1/mosaic/upload_event", JSON.stringify(model));
    }

    prepareTransaction(pass:string="", amount, recipient:string = "", message:string = "",mosaics:any = []) {
        amount = this.convAmountToDiv(amount);
        let cleanTransferTransaction = nem.model.objects.get("transferTransaction");
        cleanTransferTransaction.recipient = recipient;
        cleanTransferTransaction.message = message;
        cleanTransferTransaction.messageType = 1;

        let entity:any;
        let common:any;
        if(pass != ""){
            common = nem.model.objects.create("common")(pass, "");
            nem.crypto.helpers.passwordToPrivatekey(common, this.wallet.accounts[0], this.wallet.accounts[0].algo);
        }else{
            common = nem.model.objects.create("common")("", "");
        }
        if(mosaics.length >= 1){
            cleanTransferTransaction.amount = 1;
            let arr = [];
            if(amount>0){
                let xemMosaic = nem.model.objects.create("mosaicAttachment")("nem", "xem", amount);
                arr.push(xemMosaic);
            }
            for(let i=0; i < mosaics.length; i++){
                let mid = this.mosaicNameToId(mosaics[i].name);
                let m = nem.model.objects.create("mosaicAttachment")(mid.namespaceId, mid.name, mosaics[i].amount); 
                arr.push(m);
            }
            let m = this.cleanMosaicAmounts(arr, this.mosaicMetaData);
            cleanTransferTransaction.mosaics = m;
            entity = nem.model.transactions.prepare("mosaicTransferTransaction")(common, cleanTransferTransaction, this.mosaicMetaData, this.network_id);
        }else{
            cleanTransferTransaction.amount = amount;
            cleanTransferTransaction.mosaics = null;
            entity = nem.model.transactions.prepare("transferTransaction")(common, cleanTransferTransaction, this.network_id);
        }
        return entity;
    }
    async getMosaicDefinitions(namespaceId, name): Promise<any>{
        let m = nem.model.objects.create("mosaicAttachment")(namespaceId, name, 0); 
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        nem.com.requests.namespace.mosaicDefinitions(endpoint, m.mosaicId.namespaceId);
        let id = null;
        let flg = true;
        let mosaics = [];
        while (flg) {
            try{
                let res = await nem.com.requests.namespace.mosaicDefinitions(endpoint, namespaceId, "",id);
                if(id == res.data[res.data.length-1].meta.id){
                    flg = false;
                    break
                }
                id = res.data[res.data.length-1].meta.id;
                mosaics = mosaics.concat(res.data);
            }catch(e){
                flg = false;
            }
        }
        return mosaics;
    }
    getMosaicSupply(mosaicId): Promise<any>{
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        return nem.com.requests.mosaic.supply(endpoint, mosaicId);
    }
    send(entity, password){
        let common = nem.model.objects.create("common")(password, "");
        nem.crypto.helpers.passwordToPrivatekey(common, this.wallet.accounts[0], this.wallet.accounts[0].algo);
        let endpoint = nem.model.objects.create("endpoint")(this.node.host, this.node.port);
        let promise =  nem.model.transactions.send(common, entity, endpoint);
        return Observable.fromPromise(promise);
    }
    cleanMosaicAmounts(elem, mosaicDefinitions) {
        let copy;
        if(Object.prototype.toString.call(elem) === '[object Array]') {
            copy = JSON.parse(JSON.stringify(elem));
        } else {
            let _copy = [];
            _copy.push(JSON.parse(JSON.stringify(elem)))
            copy = _copy;
        }
        for (let i = 0; i < copy.length; i++) {
            if(!nem.utils.helpers.isTextAmountValid(copy[i].quantity)) {
                return [];
            } else {
                let divisibility = mosaicDefinitions[nem.utils.format.mosaicIdToName(copy[i].mosaicId)].mosaicDefinition.properties[0].value;
                copy[i].quantity = Math.round(nem.utils.helpers.cleanTextAmount(copy[i].quantity) * Math.pow(10, divisibility));
            }
        }
        return copy;
    }
    async decodeMsg(value, password, signer, recipient){
        let common = nem.model.objects.create("common")(password, "");
        nem.crypto.helpers.passwordToPrivatekey(common, this.wallet.accounts[0], this.wallet.accounts[0].algo);
        let kp = nem.crypto.keyPair.create(common.privateKey);
        let decoded = "";
        if(kp.publicKey.toString() !== signer){
            decoded = nem.crypto.helpers.decode(common.privateKey, signer, value);
        }else{
            let a = await this.getAccountData(recipient);
            decoded = nem.crypto.helpers.decode(common.privateKey, a.account.publicKey, value);
        }

        return this.fmtHexToUtf8Pipe(decoded);
    }
    async calcMosaicAmount(mosaicName, amount){
        let d = await this.getMosaicDivisibility(mosaicName);
        let ret = amount;
        if(d>0){
            let pow = Math.pow(10, d)
            ret = amount / pow;
        }
        return ret;
    }
}
