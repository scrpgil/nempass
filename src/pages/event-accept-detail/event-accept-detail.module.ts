import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventAcceptDetailPage } from './event-accept-detail';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        EventAcceptDetailPage,
    ],
    imports: [
        PipesModule,
        IonicPageModule.forChild(EventAcceptDetailPage),
    ],
})
export class EventAcceptDetailPageModule {}
