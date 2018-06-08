import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PayConfirmPage } from './pay-confirm';

@NgModule({
  declarations: [
    PayConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(PayConfirmPage),
  ],
})
export class PayConfirmPageModule {}
