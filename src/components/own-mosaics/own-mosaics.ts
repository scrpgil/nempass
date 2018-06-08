import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/index';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'own-mosaics',
    templateUrl: 'own-mosaics.html'
})
export class OwnMosaicsComponent {
    mosaics:any;
    constructor(
        public navCtrl: NavController,
        public store: Store<any>
    ) {
        this.store.select(fromRoot.getAccountMosaics).subscribe((res)=>{
            if(res){
                this.mosaics = res;
            }
        });
    }

    detail(m){
        this.navCtrl.push('detail', {m});
    }
}
