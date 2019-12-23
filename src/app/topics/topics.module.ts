import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { TopicsPageRoutingModule } from './topics-routing.module';

import { TopicsPage } from './topics.page';

import { TopicCardListComponent } from '../topic-card-list/topic-card-list.component';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TopicsPageRoutingModule,
    SharedModule
  ],
  declarations: [
    TopicsPage,
    TopicCardListComponent
  ]
})
export class TopicsPageModule {}
