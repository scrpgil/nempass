import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem';
import { UtilProvider } from '../../providers/util/util';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store/index';
import sha256 from 'crypto-js/sha256';
import enc from 'crypto-js/enc-hex';
import {SERVER} from '../../config';


@IonicPage({
    name:'event-create',
    segment:'event-create'
})
@Component({
    selector: 'page-event-create',
    templateUrl: 'event-create.html',
})
export class EventCreatePage {
    ownerMosaic:any;
    ev={
        mid:"",
        ver:1,
        type:1,
        start:"",
        end:"",
        name:"",
        locate:"",
    }
    flg:boolean = true;
    block:boolean = false;
    showMapFlg:boolean = false;
    url:any;
    sum:number = 0;
    constructor(
        public store: Store<any>,
        public navCtrl: NavController,
        public util: UtilProvider,
        public nem: NemProvider,
        public navParams: NavParams
    ) {
    }
    init(){
        this.ev={
            mid:"",
            ver:1,
            type:1,
            start:"",
            end:"",
            name:"",
            locate:"",
        }
        this.ev.start = (new Date().toISOString());
        this.ev.end = (new Date().toISOString());
        let id =this.ownerMosaic[0]["mosaics"][0]["mosaic"].id;
        this.ev.mid = id.namespaceId + ':' + id.name;
        this.flg = true;
        this.block = false;
        this.showMapFlg = false;
        this.url = null;
        this.sum = 0;
    }

    ionViewDidLoad() {
        this.store.select(fromRoot.getAccountOwnerMosaic).subscribe((res)=>{
            if(res){
                console.log(res);
                if(res.length>0){
                    this.ownerMosaic = res;
                    this.init();
                }
            }
        });
        this.store.select(fromRoot.getAccountMosaics).subscribe((res)=>{
            if(res && this.ownerMosaic){
                console.log(res);
                let mosaics =res;
                for(let i = 0; i<mosaics.length;i++){
                    let r = mosaics[i];
                    for(let j = 0; j<this.ownerMosaic.length;j++){
                        let om = this.ownerMosaic[j];
                        console.log(om);
                        for(let k = 0; k<om.mosaics.length;k++){
                            let m = om.mosaics[k];
                            console.log(m);
                            let mid = m.mosaic.id.namespaceId + ':' + m.mosaic.id.name;
                            if(mid == r.mid){
                                console.log("found");
                                this.ownerMosaic[j].mosaics.splice(k, 1);
                                break;
                            }
                        }
                    }
                }
            }
        });
    }
    async next(){
        if(this.block){
            return;
        }
        this.block = true;
        let hashDigest = sha256(JSON.stringify(this.ev));
        //let res = await this.nem.uploadEvent(this.ev);
        let title = "パスワード入力";
        let msg = "ウォレットのパスワードを入力してください。";
        let inputs =  [ { name: 'password', placeholder: 'password', type: 'password' }, ];
        console.log(this.ev);
        let okHandler = async (data) => {
            if(data.password){
                let entity = this.nem.prepareTransaction(data.password, this.nem.convDivToAmount(0), SERVER, JSON.stringify(this.ev));
                try{
                    let res = await this.nem.send(entity, data.password).toPromise();
                    this.block = false;
                    if(res["code"] == 1){
                        let buttons = {
                            text: 'OK',
                            handler: data => {
                                this.init();
                            }
                        }
                        this.util.basicAlert("Success!", "", buttons);
                    }else{
                        this.util.basicAlert("Failed!");
                    }
                }catch(e){
                    this.util.basicAlert("Failed!");
                    this.block = false;
                }
            }
        };
        this.util.promptAlert(title, msg, inputs, okHandler);
    }
    change(){
        if(this.ev.mid != "" && this.ev.name != "" && this.ev.start != "" && this.ev.end != "" && this.ev.locate != ""){
            this.flg = false;
        }else{
            this.flg = true;
        }
        console.log(this.ev);
        console.log(this.flg);
        this.updateFee();
    }
    photoURL(){
        this.url = this.util.SanitizeURL(this.ev.locate);
    }
    showMap(){
        this.photoURL();
        this.showMapFlg = true;
    }
    updateFee(){
        let entity = this.nem.prepareTransaction("", this.nem.convDivToAmount(0), SERVER, JSON.stringify(this.ev));
        this.sum = this.nem.convAmountToDiv(entity.fee);
    }
}
