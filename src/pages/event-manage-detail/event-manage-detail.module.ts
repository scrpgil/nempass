import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventManageDetailPage } from './event-manage-detail';
import { QRCodeModule } from 'angularx-qrcode';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        EventManageDetailPage,
    ],
    imports: [
        PipesModule,
        QRCodeModule,
        IonicPageModule.forChild(EventManageDetailPage),
    ],
})
export class EventManageDetailPageModule {}
