import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem';

@IonicPage({
    name:'chain',
    segment:'chain'
})
@Component({
    selector: 'page-chain',
    templateUrl: 'chain.html',
})
export class ChainPage {
    t:any;
    chain:any = [];

    constructor(
        public navCtrl: NavController,
        public nem: NemProvider,
        public navParams: NavParams
    ) {
        this.t = this.navParams.data.t;
        console.log(this.t);
        this.setup();
        
    }
    async setup(){
        //let r = await this.nem.chainTransaction(this.t.mid, this.t.signer, this.t.signer, this.t.txId);
        let r = await this.nem.chainTransaction(this.t.mid, this.t.signer, "TC3W6YJXGQOVT35ZSUQYUH2MP25VDEEKOW2VARLH", null);
        if(r.length > 0){
            this.chain = r;
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ChainPage');
    }

}
