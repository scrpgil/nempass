import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem';
import { UtilProvider } from '../../providers/util/util';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/index';


@IonicPage({
    name:'event-manage',
    segment:'event-manage'
})
@Component({
    selector: 'page-event-manage',
    templateUrl: 'event-manage.html',
})
export class EventManagePage {
    mosaics:any;

    constructor(
        public nem: NemProvider,
        public util: UtilProvider,
        public navCtrl: NavController, 
        public navParams: NavParams
    ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EventManagePage');
        this.setup();
    }
    async setup(){
        this.mosaics = await this.nem.getOwnerEvent();
    }
    detail(m){
        this.navCtrl.push('event-manage-detail', {m});
    }

}
