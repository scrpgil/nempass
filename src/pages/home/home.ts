import { Component } from '@angular/core';
import { IonicPage,NavController } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/index';
import {INVOICE_QR, WALLET_QR, TESTNET_V, VER} from '../../config';

@IonicPage({
    name:'home',
    segment:'home'
})
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    created:boolean = false;
    version:string = "";
    segment:string = "before";
    mosaics:any;
    flg:boolean = false;
    before:any = [];
    after:any = [];

    constructor(
        public store: Store<any>,
        public nem: NemProvider,
        public navCtrl: NavController
    ) {
        this.version = VER;
    }

    ionViewDidLoad(){
        this.store.select(fromRoot.getAccountCreated).subscribe((res)=>{
            if(res){
                this.created = res;
            }
        });
        this.store.select(fromRoot.getAccountMosaics).subscribe((res)=>{
            if(res){
                console.log(res);
                this.mosaics = res;
                for(let i=0;i<this.mosaics.length;i++){
                    let m = this.mosaics[i];
                    let s = new Date(m.start);
                    let today = new Date();
                    console.log(s.getTime());
                    console.log(today.getTime());
                    if(s.getTime() > today.getTime()){
                        this.before.push(m);
                    }else{
                        this.after.push(m);
                    }
                }
                this.before.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
                this.flg = true;
            }
        });
    }
    goToImportWallet(){
        this.navCtrl.push('qrcode', {type:WALLET_QR});
    }
    detail(m){
        this.navCtrl.push('detail', {m});
    }
    goToDemoAcount(num){
        if(num==1){
            let w = {"name":"nempass-demouser","accounts":{"0":{"brain":false,"algo":"pass:enc","encrypted":"493eca6640d1222ab7a1bec212643f9683c7d7fd92315fb3d2a7ef77cc6f17ca4783170b5922d0a3eb52466e3a92ddd3","iv":"a8e4fd916cba82a3d1ae2431ef3c4ad0","address":"TC3W6YJXGQOVT35ZSUQYUH2MP25VDEEKOW2VARLH","label":"Primary","network":-104}}};
            this.nem.createAccount(w.accounts[0].address, "demo1", w, TESTNET_V);
            this.navCtrl.setRoot(HomePage);
        }
        if(num==2){
            let w = {"name":"nempass-server","accounts":{"0":{"brain":false,"algo":"pass:enc","encrypted":"a800421070eda74bf5ba9709f72a4b865ef1a3fb0ad6a59987f1e1196b09eb5c8c55193b16db9ee8b9475b583326935a","iv":"a012680dd539924e38152c4abeed4712","address":"TBMVV4ZMG7XAZ5KNFRR4HHALH4XJWZALM2EXB4GJ","label":"Primary","network":-104}}};
            this.nem.createAccount(w.accounts[0].address, "nemindemo2", w, TESTNET_V);
            this.navCtrl.setRoot(HomePage);
        }
    }

}
