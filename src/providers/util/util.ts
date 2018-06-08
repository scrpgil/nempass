import { Injectable } from '@angular/core';
import {ToastController, AlertController} from 'ionic-angular';
import {DomSanitizer} from '@angular/platform-browser';
import { G_API_KEY } from '../../config';

@Injectable()
export class UtilProvider {

    constructor(
        private toastCtrl: ToastController,
        public _sanitizer: DomSanitizer,
        private alertCtrl: AlertController
    ) {
    }

    basicAlert(title:string, subtitle:string = "", buttons:any = {text:'OK'}) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: subtitle,
            buttons: [buttons]
        });
        alert.present();
    }
    promptAlert(title:string, msg:string = "", inputs:any = [], okHandler:any = (data) => {},cancelHandler:any = (data) => {}) {
        let prompt = this.alertCtrl.create({
            title: title,
            message: msg,
            inputs: inputs,
            buttons: [
                {
                    text: 'Cancel',
                    handler: cancelHandler
                },
                {
                    text: 'OK',
                    handler: okHandler
                }
            ]
        });
        prompt.present();
    }
    showCheckbox(title:string, inputs:any = [], okHandler:any = (data) => {}) {
        let alert = this.alertCtrl.create();
        alert.setTitle(title);
        for(let i=0;i<inputs.length;i++){
            alert.addInput(inputs[i]);
        }
        alert.addButton('Cancel');
        alert.addButton({
            text: 'OK',
            handler: okHandler
        });
        alert.present();
    }
    toast(message, duration:number = 300, pos:string = "top",css:string = ""): void {
        let toast = this.toastCtrl.create({
            message:  message,
            duration: duration,
            position: pos,
            cssClass: css
        });
        toast.present();
    }
    copy(text){
        var temp = document.createElement('div');
        temp.appendChild(document.createElement('pre')).textContent = text;

        var s = temp.style;
        s.position = 'fixed';
        s.left = '-100%';

        document.body.appendChild(temp);
        document.getSelection().selectAllChildren(temp);

        var result = document.execCommand('copy');

        document.body.removeChild(temp);
        if(result){
            let toast = this.toastCtrl.create({
                message: 'コピーしました',
                duration: 300,
                position: 'top'
            });
            toast.present();
        }
        return result;
    }
    getTransalte(key) {
        return "";//this.translate.get(key).toPromise();
    }
    SanitizeURL(q){
        console.log(q);
        console.log(G_API_KEY);
        let url = "https://www.google.com/maps/embed/v1/place?key=" + G_API_KEY + "&q=" + q;
        return this._sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    saveLocalStorage(key, obj) {
        try {
            localStorage.setItem(key, JSON.stringify(obj));
        }
        catch (e) {
            console.log("Local Storage is full, Please empty data");
            console.log(e);
        }
    }
    getLocalStorage(key){
        let copy = localStorage.getItem(key);
        if(copy != null){
            let n = JSON.parse(copy);
            return n;
        }
        return null;
    }
}
