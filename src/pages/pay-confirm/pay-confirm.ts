import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem';
import { UtilProvider } from '../../providers/util/util';

@IonicPage({
    name:'pay-confirm',
    segment:'pay-confirm'
})
@Component({
  selector: 'page-pay-confirm',
  templateUrl: 'pay-confirm.html',
})
export class PayConfirmPage {
    qr:any = null;
    msg:string = "";
    fee:number = 0;
    sum:number = 0;
    mosaics:any = [];
    block:boolean = false;
    items:any;

    constructor(
        public navCtrl: NavController,
        public nem: NemProvider,
        public util: UtilProvider,
        public navParams: NavParams
    ) {
        this.qr = this.navParams.data.qr;
        console.log(this.qr);
        if(this.qr){
            this.setup();
        }
    }
    setup(){
        let address = this.qr.data["addr"];
        let amount = this.nem.convAmountToDiv(this.qr.data["amount"]);
        this.msg = this.qr.data["msg"];
        this.mosaics = this.qr.data["mosaics"];
        this.items=[
            {l:'アドレス',t:address},
            //{l:'量',t:amount},
        ];
        if(this.mosaics){
            this.attachMosaic(this.mosaics);
        }else{
            this.updateFee();
        }
    }

    async attachMosaic(mosaics){
        for(let i=0;i<mosaics.length;i++){
            let m = mosaics[i];
            try{
                await this.nem.addMosaicMetaData(m.name);
                m.amount = await this.nem.calcMosaicAmount(m.name, m.amount);
            }catch(e){
                console.log(e);
            }
        }
        this.updateFee();
    }
    updateFee(){
        console.log(this.mosaics);
        let entity = this.nem.prepareTransaction("", this.qr.data["amount"],this.qr.data["addr"] , this.qr.data["msg"], this.mosaics);
        this.sum = this.nem.convAmountToDiv(this.qr.data["amount"] + entity.fee);
        this.fee = this.nem.convAmountToDiv(entity.fee);
        console.log(entity);
        console.log(this.qr.data["msg"]);
    }
    async send(){
        if(this.block){
            return;
        }
        this.block = true;
        let title = "パスワード入力";
        let msg = "ウォレットのパスワードを入力してください。";
        let inputs =  [ { name: 'password', placeholder: 'password', type: 'password' }, ];
        let okHandler = async (data) => {
            if(data.password){
                let password = data.password;
                let entity = this.nem.prepareTransaction(password, this.qr.data["amount"],this.qr.data["addr"] , this.qr.data["msg"], this.qr.data["mosaics"]);
                try{
                    let res = await this.nem.send(entity, password).toPromise();
                    console.log(res);
                    if(res["code"] == 1){
                        let buttons = {
                            text: 'OK',
                            handler: data => {
                                this.navCtrl.pop();
                            }
                        }
                        this.util.basicAlert("Success!", "", buttons);
                    }else{
                        this.util.basicAlert("Failed!");
                    }
                }catch(e){
                    console.log(e);
                    this.util.basicAlert("Failed!");
                    this.block = false;
                }
            }
        };
        this.util.promptAlert(title, msg, inputs, okHandler);
    }
}
