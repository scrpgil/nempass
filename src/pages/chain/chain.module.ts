import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChainPage } from './chain';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        ChainPage,
    ],
    imports: [
        PipesModule,
        IonicPageModule.forChild(ChainPage),
    ],
})
export class ChainPageModule {}
