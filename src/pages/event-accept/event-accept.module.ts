import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventAcceptPage } from './event-accept';

@NgModule({
  declarations: [
    EventAcceptPage,
  ],
  imports: [
    IonicPageModule.forChild(EventAcceptPage),
  ],
})
export class EventAcceptPageModule {}
