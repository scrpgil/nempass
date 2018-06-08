import { Component } from '@angular/core';
import { NemProvider } from '../../providers/nem/nem';
import { UtilProvider } from '../../providers/util/util';
import { Store } from '@ngrx/store';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage({
    name:'event-accept',
    segment:'event-accept'
})
@Component({
    selector: 'page-event-accept',
    templateUrl: 'event-accept.html',
})
export class EventAcceptPage {
    mosaics:any;
    constructor(
        public nem: NemProvider,
        public util: UtilProvider,
        public navCtrl: NavController, 
        public navParams: NavParams
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EventAcceptPage');
        this.setup();
    }
    async setup(){
        this.mosaics = await this.nem.getOwnerEvent();
    }
    detail(m){
        this.navCtrl.push('event-accept-detail', {m});
    }
}
