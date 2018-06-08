import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilProvider } from '../../providers/util/util';
import { NemProvider } from '../../providers/nem/nem';

@IonicPage({
    name:'event-manage-detail',
    segment:'event-manage-detail'
})
@Component({
    selector: 'page-event-manage-detail',
    templateUrl: 'event-manage-detail.html',
})
export class EventManageDetailPage {
    m:any;
    qr:any;
    myQR:string="";
    show:boolean=false;
    url:any;
    segment:string = "before";
    before:any = []; 
    after:any = [];

    constructor(
        public navCtrl: NavController,
        public util: UtilProvider,
        public nem: NemProvider,
        public navParams: NavParams
    ) {
        this.m = this.navParams.data.m;
        this.qr = this.nem.getInvoice(0);
        this.qr.data.msg = JSON.stringify(this.nem.getBuyMsg(this.m.mid, 0));
        this.refresh(this.qr);
        console.log(this.qr.data.msg);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EventManageDetailPage');
        this.setup();
    }

    async setup(){
        let res = await this.nem.getBuyTx(this.m.mid, this.m.owner, this.m.txHash);
        console.log(res);
        this.before = res[0];
        this.after = res[1];
    }
    async refresh(qr){
        this.qr = qr;
        this.show = false;
        let obj = JSON.parse(JSON.stringify(this.qr));
        setTimeout(()=>{
            this.myQR = JSON.stringify(obj);
            console.log(this.myQR);
            this.show = true;
        },30);
    }
    setAmount(){
        let title = "価格入力";
        let msg = "販売したい価格を入力してください。";
        let inputs =  [ { name: 'amount', placeholder: 'amount', type: 'number' }, ];
        let okHandler = async (data) => {
            if(data.amount){
                let amount = data.amount;
                if(0 <= amount&& amount<= 99999999999999999){
                    let valid = String(amount);
                    let split = valid.split(".");
                    if(split.length >= 2){
                        if(split[1].length > 6){
                            let d = split[1].substr(0, 6);
                            console.log(d);
                            amount = Number(split[0] + "." + d);
                        }
                    }
                    this.show = false;
                    this.qr.data.amount = this.nem.convDivToAmount(amount);
                    this.qr.data.msg = JSON.stringify(this.nem.getBuyMsg(this.m.mid, amount));
                    this.refresh(this.qr);
                }
            };
        }
        this.util.promptAlert(title, msg, inputs, okHandler);
    }
    goToConfirm(t){
        let m = [{name:this.m.mid, amount:1}]
        let qr = this.nem.getSendInvoice(t.transaction.signerAddress, 0, "", m);
        qr.data.msg = JSON.stringify(this.nem.getReplyMsg(this.m.mid, t.meta.hash.data));
        this.navCtrl.push('pay-confirm', {qr});
    }
}
