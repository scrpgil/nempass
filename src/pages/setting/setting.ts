import { Component } from '@angular/core';
import { MenuController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem';
import { UtilProvider } from '../../providers/util/util';
import {SplitCommunicationProvider} from "../../providers/split-communication/split-communication";
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/index';
import * as Action from '../../store/actions/account';
import {TESTNET_V, MAINNET_V, VER} from '../../config';
import {MAINNET_NODE_LIST, TESTNET_NODE_LIST, NODE} from '../../nodelist';

@IonicPage({
    name:'setting',
    segment:'setting'
})
@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html',
})
export class SettingPage {
    address:string="";
    amount:number=0;
    ver= VER;
    v:number=0;
    node:NODE;
    host:string="";
    lang:string="";
    nodelist:NODE[];


    constructor(
        public navCtrl: NavController, 
        public nem: NemProvider,
        public util: UtilProvider,
        public navParams: NavParams,
        public store: Store<any>,
        public menu: MenuController,
        public splitCommunication:SplitCommunicationProvider
    ) {
    }

    ionViewDidLoad() {
        this.address = this.nem.address;
        this.store.select(fromRoot.getAccountAmount).subscribe((res)=>{
            this.amount = this.nem.convAmountToDiv(res);
        });
        this.store.select(fromRoot.getAccountNetwork).subscribe((res)=>{
            this.v = res;
            if(this.v == TESTNET_V){
                this.nodelist = TESTNET_NODE_LIST;
            }else if(this.v == MAINNET_V){
                this.nodelist = MAINNET_NODE_LIST;
            }
        });
        this.store.select(fromRoot.getAccountNode).subscribe((res)=>{
            if(res){
                this.node = res;
                this.host = this.node.host;
            }
        });
    }

    chgNode(host: string){
        let n = this.nodelist.find(n => n.host === host);
        this.store.dispatch(new Action.SetNode(n));
    }
    async deleteAccount(){
        let title = "ログアウト";
        let msg = "アカウント情報を削除します。あなたのアドレスを入力してください。";
        let placeholder = "アドレスを入力"
        let inputs = [ { name: 'address', placeholder: placeholder }, ];
        let okHandler = (data) => {
            if(data.address){
                if(this.address == data.address){
                    this.store.dispatch(new Action.Delete());
                    this.nem.init();
                    this.navCtrl.setRoot('home');
                }
            }
        };
        this.util.promptAlert(title, msg, inputs, okHandler);
    }
    copyAddress(){
        this.util.copy(this.address);
    }
}
