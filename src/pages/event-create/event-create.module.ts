import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventCreatePage } from './event-create';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
    declarations: [
        EventCreatePage,
    ],
    imports: [
        DirectivesModule,
        IonicPageModule.forChild(EventCreatePage),
    ],
})
export class EventCreatePageModule {}
