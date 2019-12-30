import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { CommunitiesPageRoutingModule } from './communities-routing.module';

import { CommunitiesPage } from './communities.page';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CommunitiesPageRoutingModule,
    SharedModule
  ],
  declarations: [
    CommunitiesPage
  ]
})
export class CommunitiesPageModule {}
