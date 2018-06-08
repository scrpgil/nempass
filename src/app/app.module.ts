import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../store/index';
import { NemProvider } from '../providers/nem/nem';
import { SplitCommunicationProvider } from '../providers/split-communication/split-communication';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

import { MyApp } from './app.component';
import { HomePageModule } from '../pages/home/home.module';
import { ListPageModule} from '../pages/list/list.module';
import { EventCreatePageModule} from '../pages/event-create/event-create.module';
import { DetailPageModule} from '../pages/detail/detail.module';
import { QrcodePageModule } from '../pages/qrcode/qrcode.module';
import { EventManagePageModule } from '../pages/event-manage/event-manage.module';
import { ChainPageModule } from '../pages/chain/chain.module';
import { ComponentsModule } from '../components/components.module';

import { QRCodeModule } from 'angularx-qrcode';
import { UtilProvider } from '../providers/util/util';



@NgModule({
    declarations: [
        MyApp,
    ],
    imports: [
        HomePageModule,
        BrowserModule,
        QrcodePageModule,
        ListPageModule,
        DetailPageModule,
        EventCreatePageModule,
        QRCodeModule,
        ComponentsModule,
        PipesModule,
        HttpClientModule,
        EventManagePageModule,
        ChainPageModule,
        DirectivesModule,
        StoreModule.forRoot(reducers),
        IonicModule.forRoot(MyApp, {
            mode: 'md',
            preloadModules: true
        }),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
    ],
    providers: [
        NemProvider,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        SplitCommunicationProvider,
        UtilProvider
    ]
})
export class AppModule {
}
