import { ViewChild, Component, NgZone } from '@angular/core';
import { AlertController, Platform, IonicPage, NavController, NavParams } from 'ionic-angular';
import jsQR from "jsqr";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { NemProvider } from '../../providers/nem/nem';
import { UtilProvider } from '../../providers/util/util';
import { HomePage } from '../home/home';


import {WALLET_QR,TESTNET_V} from '../../config';


@IonicPage({
    name:'qrcode',
    segment:'qrcode'
})
@Component({
    selector: 'page-qrcode',
    templateUrl: 'qrcode.html',
})
export class QrcodePage {
    @ViewChild('camera') camera: any;
    showing:boolean = false;
    hide:boolean = false;
    obs:any;
    canvasElement;
    canvas;
    guard:boolean = false;
    isiOS:boolean = false;

    type:number = 1;
    readonly medias: MediaStreamConstraints = {audio: false, video:  { facingMode: "environment" } };
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public zone: NgZone,
        public plt: Platform,
        public nem: NemProvider,
        public util: UtilProvider,
        public navParams: NavParams
    ) {
        this.type = this.navParams.data.type;
        if(this.plt.is('ios')){
            this.isiOS = true;
        }
    }

    ionViewDidEnter() {
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
        this.showCamera();
    }
    chkQRCode(imageData){
        let success = -1;
        var code = jsQR(imageData.data, imageData.width, imageData.height);
        if(code){
            if(this.isJson(code.data) && this.showing){
                let obj = JSON.parse(code.data);
                if(this.nem.validateNEMPaymentQRCode(obj) == this.type){
                    success = 1;
                    this.showing = false;
                    if(this.type == WALLET_QR){
                        //if(obj["v"] == TESTNET_V){
                            this.importWallet(obj);
                        //}
                    }else{
                        if(obj.data.amount==0 && !obj.data.mosaics){
                            this.navCtrl.push('PayEditPage', {qr: obj});
                        }else{
                            this.navCtrl.push('PayConfirmPage', {qr: obj});
                        }
                    }
                }
            }
        }
        return success;
    }
    async importWallet(obj){
        let title = "パスワードを入力";
        let msg = "ウォレットのパスワードを入力してください。";
        let inputs =  [ { name: 'password', placeholder: 'password', type: 'password' }, ];
        let okHandler = (data) => {
            if(data.password){
                let wallet = this.nem.importPrivateKeyWallet(obj["data"].name, data.password, obj["data"].priv_key, obj["data"].salt, data.password, obj["v"]);
                console.log(JSON.stringify(wallet));
                if(wallet){
                    this.nem.createAccount(wallet.accounts[0].address, data.password, wallet, obj["v"]);
                    this.navCtrl.setRoot(HomePage);
                }else{
                    this.showing = true;
                    this.failedAlert("入力に誤りがあります。");
                }
            }
        };
        this.util.promptAlert(title, msg, inputs, okHandler);
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
    ionViewWillLeave(){
        this.hideCamera();
        this.obs.unsubscribe();
    }
    async showCamera(){
        this.showing = true;
        if(this.showing){
            try{
                let stream = await window.navigator.mediaDevices.getUserMedia(this.medias)
                this.camera.nativeElement.srcObject = stream;
                this.camera.nativeElement.setAttribute("playsinline", true);
            }catch(e){
                alert(e);
                this.guard = true;
                this.failedAlert("カメラが見つかりません");
                console.log("Camera Not Found.");
            }
        }else{
            this.hideCamera();
        }
    }
    hideCamera(){
        this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.camera.nativeElement.pause(); 
        if(this.camera.nativeElement.srcObject){
            const track = this.camera.nativeElement.srcObject.getTracks()[0] as MediaStreamTrack;;
            track.stop(); 
        }
        this.hide = true;
        setTimeout(()=>{
            this.hide = false;
        },30);
    }
    back(){
        if(this.guard == true){
            this.navCtrl.pop();
        }
    }
    isJson(arg){
        arg = (typeof(arg) == "function") ? arg() : arg;
        if(typeof(arg) != "string"){return false;}
        try{arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);return true;}catch(e){return false;}
    }
    handleFileInput(e: any) {
        if(!e.target.files[0]){
            return;
        }
        let reader = new FileReader();
        reader.onload = (event) => { 
            console.log(event);
            let img = new Image();
            img.onload = () => {
                console.log("img");
                this.canvasElement.width = img.width;
                this.canvasElement.height = img.height;
                this.canvas.drawImage(img, 0, 0);
                let imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
                this.chkQRCode(imageData);
            };
            let target: any = event.target;
            img.src = target.result;
        };
        reader.readAsDataURL(e.target.files[0]); 
    }
    goToPayEditPage(){
        this.navCtrl.push('PayEditPage');
    }
}
