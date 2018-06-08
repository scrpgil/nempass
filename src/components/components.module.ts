import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { PipesModule } from '../pipes/pipes.module';

import { OwnMosaicsComponent } from './own-mosaics/own-mosaics';

@NgModule({
	declarations: [ OwnMosaicsComponent],
	imports: [IonicModule, PipesModule],
	exports: [ OwnMosaicsComponent]
})
export class ComponentsModule {}
