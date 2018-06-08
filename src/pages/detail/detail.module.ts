import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailPage } from './detail';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    DetailPage,
  ],
  imports: [
        QRCodeModule,
    IonicPageModule.forChild(DetailPage),
  ],
})
export class DetailPageModule {}
