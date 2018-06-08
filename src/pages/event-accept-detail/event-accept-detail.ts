import { ViewChild, Component} from '@angular/core';
import jsQR from "jsqr";
import { AlertController,IonicPage, NavController, NavParams } from 'ionic-angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { NemProvider } from '../../providers/nem/nem';
import { UtilProvider } from '../../providers/util/util';

@IonicPage({
    name:'event-accept-detail',
    segment:'event-accept-detail'
})
@Component({
    selector: 'page-event-accept-detail',
    templateUrl: 'event-accept-detail.html',
})
export class EventAcceptDetailPage {
    @ViewChild('camera') camera: any;
    m:any;
    showing:boolean = false;
    obs:any;
    canvasElement;
    canvas;
    guard:boolean = false;
    accepts:any = [];
    segment:string = "before";
    before:any = []; 
    after:any = [];
    devices:any = [];
    device:any = null;

    type:number = 1;
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public nem: NemProvider,
        public util: UtilProvider,
        public navParams: NavParams
    ) {
        this.m = this.navParams.data.m;
        let obj = this.util.getLocalStorage("accepts:" + this.m.mid);
        if(obj){
            this.accepts = obj;
            console.log(obj);
        }
        this.setup();
    }

    ionViewDidEnter() {
        console.log('ionViewDidLoad EventAcceptDetailPage');
        this.guard = false;
        this.canvasElement = <HTMLCanvasElement>document.getElementById('canvas');
        this.canvas = this.canvasElement.getContext("2d");
        this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.obs = Observable.interval(1).subscribe((x) => {
            if(this.showing){
                this.canvasElement.hidden = false;
                this.canvasElement.height = this.camera.nativeElement.videoHeight;
                this.canvasElement.width = this.camera.nativeElement.videoWidth;
                this.canvas.drawImage(this.camera.nativeElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
                this.canvas.width = this.camera.nativeElement.videoWidth;
                this.canvas.height = this.camera.nativeElement.videoHeight;
                if(this.canvas.width > 0 && this.canvas.height > 0){
                    this.guard = true;
                    try{
                        let imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
                        this.chkQRCode(imageData);
                    }catch(e){
                        console.log(e);
                    }
                }
            }
        });
        this.getDevice();
    }
    getDevice(){
        navigator.mediaDevices.enumerateDevices().then((sourcesInfo) =>  {
            // 取得できたカメラとマイクを含むデバイスからカメラだけをフィルターする
            var videoSroucesArray = sourcesInfo.filter((elem) => {
                return elem.kind == 'videoinput';
            });
            console.log(videoSroucesArray);
            this.devices = videoSroucesArray;
            this.device = videoSroucesArray[0];
        });
    }
    async showCamera(){
        if(this.device == null){
            return;
        }
        this.showing = true;
        this.guard = false;
        try{
            let medias  = {
                audio: false, 
                video:{ 
                    deviceId: this.device.deviceId
                } 
            };
            let stream = await window.navigator.mediaDevices.getUserMedia(medias);
            this.camera.nativeElement.srcObject = stream;
            this.camera.nativeElement.setAttribute("playsinline", true);
        }catch(e){
            alert(e);
            this.guard = true;
            this.failedAlert("カメラが見つかりません");
            console.log("Camera Not Found.");
        }
    }
    ionViewWillLeave(){
        this.hideCamera();
        this.obs.unsubscribe();
    }
    hideCamera(){
        this.showing = false;
        this.guard = true;
        this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.camera.nativeElement.pause(); 
        if(this.camera.nativeElement.srcObject){
            const track = this.camera.nativeElement.srcObject.getTracks()[0] as MediaStreamTrack;;
            track.stop(); 
        }
    }
    chkQRCode(imageData){
        let success = -1;
        var code = jsQR(imageData.data, imageData.width, imageData.height);
        if(code){
            if(this.isJson(code.data) && this.showing){
                let obj = JSON.parse(code.data);
                console.log(obj);
                let flg = this.validAcceptQR(obj);
                console.log(flg);
                if(flg){
                    this.addAccept(obj);
                }
            }
        }
        return success;
    }
    validAcceptQR(obj){
        if(obj["v"] && obj["mid"] == this.m.mid && obj["txHash"] && obj["msg"]){
            return true;
        }else{
            return false;
        }
    }
    isJson(arg){
        arg = (typeof(arg) == "function") ? arg() : arg;
        if(typeof(arg) != "string"){return false;}
        try{arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);return true;}catch(e){return false;}
    }
    addAccept(obj){
        let flg = true;
        for(let i=0;i<this.accepts.length;i++){
            let a = this.accepts[i];
            if(a["txHash"] == obj["txHash"] && a["addr"] == obj["addr"]){
                flg = false;
            }
        }
        console.log(this.m);
        if(flg){
            console.log(obj["signer"]);
            console.log(this.m.owner);
            if(obj["signer"] != this.m.owner){
                obj["assign"] = true;
            }
            obj["time"] = this.nem.getNowDateTime();
            this.accepts.unshift(obj);
            this.util.saveLocalStorage("accepts:" + this.m.mid, this.accepts);
        }
    }
    async failedAlert(key){
        let title = "失敗";
        let msg = key;
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: ['OK']
        });
        alert.present();
    }
    async setup(){
        let res = await this.nem.getBuyTx(this.m.mid, this.m.owner, this.m.txHash);
        this.before = res[0];
        this.after = res[1];
        for(let i=0;i<this.after.length;i++){
            let t = this.after[i];
            for(let j=0;j<this.accepts.length;j++){
                let a = this.accepts[j];
                if(t.meta.id == a.txHash){
                    this.after[i]["chk"] = true;
                }
            }
        }
    }
    goToChainPage(t){
        this.navCtrl.push('chain', {t});
    }
}
