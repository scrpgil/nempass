import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventManagePage } from './event-manage';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
    declarations: [
        EventManagePage,
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(EventManagePage),
    ],
})
export class EventManagePageModule {}
