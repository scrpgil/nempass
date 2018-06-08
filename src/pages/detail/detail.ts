import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilProvider } from '../../providers/util/util';
import { NemProvider } from '../../providers/nem/nem';


@IonicPage({
    name:'detail',
    segment:'detail',
    defaultHistory: ['home']
})
@Component({
    selector: 'page-detail',
    templateUrl: 'detail.html',
})
export class DetailPage {
    m:any;
    show:boolean = false;
    enc:boolean = false;
    qr:any=null;
    myQR:string="";
    url:any;
    tx:any;

    constructor(
        public navCtrl: NavController,
        public util: UtilProvider,
        public nem: NemProvider,
        public navParams: NavParams,
    ) {
        this.m = this.navParams.data.m;
        this.myQR = JSON.stringify(this.m);
        this.getQR();
        this.photoURL();
    }

    async getQR(){
        let res = await this.nem.getAcceptQR(this.m.mid, this.m.owner);
        if(res[1]){
            this.qr = res[0];
            this.tx = res[1];
            if(this.qr["enc"]){
                this.enc = true;
                this.show = true;
            }else{
                this.myQR = JSON.stringify(this.qr);
                console.log(this.myQR);
                setTimeout(()=>{
                    this.show = true;
                },30);
            }
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DetailPage');
    }
    photoURL(){
        this.url = this.util.SanitizeURL(this.m.localtion);
    }
    decode(){
        let title = "パスワード入力";
        let msg = "ウォレットのパスワードを入力してください。";
        let inputs =  [ { name: 'password', placeholder: 'password', type: 'password' }, ];
        let okHandler = async (data) => {
            if(data.password){
                try{
                    this.qr.msg = await this.nem.decodeMsg(this.qr.msg, data.password, this.tx.transaction.signer, this.tx.transaction.recipient);
                    this.myQR = JSON.stringify(this.qr);
                    this.show = false;
                    this.enc = false;
                    console.log(this.myQR);
                    setTimeout(()=>{
                        this.show = true;
                    },30);
                }catch(e){
                    console.log(e);
                    this.util.basicAlert("パスワードが違うようです!");
                }
            }
        };
        this.util.promptAlert(title, msg, inputs, okHandler);
    }
}
