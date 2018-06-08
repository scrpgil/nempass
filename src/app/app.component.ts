import { ViewChild, Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import * as fromRoot from '../store/index';
import * as Action from '../store/actions/account';


import { NemProvider } from '../providers/nem/nem';
import {SplitCommunicationProvider} from "../providers/split-communication/split-communication";


@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = 'home';
    listPage: any = 'list';
    @ViewChild("content") contentCtrl: NavController;

    constructor(
        private store: Store<any>,
        public splitCommunication:SplitCommunicationProvider,
        public nem: NemProvider
    ) {
        history.replaceState('','','/');
        this.initLoad();
    }
    initLoad(){
        this.store.dispatch(new Action.Restore());
        this.splitCommunication.rootSubject$.subscribe((path) => {
            if(this.contentCtrl.getActive().id != path){
                this.contentCtrl.setRoot(path);
            }
        });
    }
}

