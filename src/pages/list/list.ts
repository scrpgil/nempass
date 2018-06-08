import { Component } from '@angular/core';
import { MenuController, IonicPage, AlertController,NavController, NavParams } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem';
import {SplitCommunicationProvider} from "../../providers/split-communication/split-communication";
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/index';
import {VER} from '../../config';

@IonicPage({
    name:'list',
    segment:'list'
})
@Component({
    selector: 'page-list',
    templateUrl: 'list.html',
})
export class ListPage {
    address:string="";
    amount:number=0;
    items:any=[];
    ver= VER;

    constructor(
        public navCtrl: NavController, 
        public alertCtrl:AlertController,
        public nem: NemProvider,
        public navParams: NavParams,
        public store: Store<any>,
        public menu: MenuController,
        public splitCommunication:SplitCommunicationProvider
    ) {
        this.items = [
            {t:1, l:"イベント参加者メニュー"},
            {t:2, l:"保有チケット一覧", n:"home",p:"home"},
            //{t:2, l:"過去参加したチケット", n:"time", p:"history"},
            //{t:2, l:"チケットを探す", n:"search", p:"search"},
            {t:1, l:"イベント開催者メニュー"},
            {t:2, l:"チケット作成", n:"create", p:"event-create"},
            {t:2, l:"チケット管理", n:"construct", p:"event-manage"},
            {t:2, l:"受付をする", n:"checkmark-circle", p:"event-accept"},
            {t:3, l:"その他"},
            {t:2, l:"設定", n:"settings", p:"setting"},
        ];
    }

    ionViewDidLoad() {
        this.store.select(fromRoot.getAccountAddress).subscribe((res)=>{
            console.log(res);
            this.address = res;
        });
        this.store.select(fromRoot.getAccountAmount).subscribe((res)=>{
            console.log(res);
            this.amount = this.nem.convAmountToDiv(res);
        });
    }

    itemTapped(name){
        if(this.address == ""){
            let title = "インポートされてません";
            let msg = "ウォレットのインポートをお願いします。";
            let alert = this.alertCtrl.create({
                title: title,
                subTitle: msg,
                buttons: ['OK']
            });
            alert.present();
            return ;
        }
        this.menu.close();
        this.splitCommunication.setRootPage(name);
    }
}
