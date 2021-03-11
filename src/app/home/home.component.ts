// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';
import { GraphService } from '../graph.service';
import { User } from '../user';
import * as moment from 'moment-timezone';
import { findOneIana } from 'windows-iana';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Is a user logged in?
  get authenticated(): boolean {
    return this.authService.authenticated;
  }
  // The user
  get user(): User {
    return this.authService.user;
  }
  public events: MicrosoftGraph.Event[];

  constructor(private authService: AuthService,private graphService: GraphService,) { }

  ngOnInit() {}

  // <signInSnippet>
  async signIn(): Promise<void> {
   
    await this.authService.signIn();
    this.getEvents();
  }

  async getEvents(){
    let usuario = await this.authService.user;
    
    // const ianaName = findOneIana(usuario.timeZone);
    // const timeZone = ianaName!.valueOf() || usuario.timeZone;
    // console.log("timezone:",timeZone);
    
    var startOfWeek = moment.tz("America/Bogota").startOf('week').utc();
    var endOfWeek = moment(startOfWeek).add(7, 'day');

    this.graphService.getCalendarView(
      startOfWeek.format(),
      endOfWeek.format(),
      "SA Pacific Standard Time")
        .then((events) => {
          this.events = events;
          console.log("eventos:",this.events);
          
        });
  }
  // </signInSnippet>
}
