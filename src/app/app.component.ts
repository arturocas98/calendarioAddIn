import { Component, OnInit } from '@angular/core';

import { AuthService } from './auth.service';
import { GraphService } from './graph.service';
import { User } from './user';
import * as moment from 'moment-timezone';
import { findOneIana } from 'windows-iana';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { CalendarOptions } from '@fullcalendar/angular';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
 
})
export class AppComponent implements OnInit{
  title = 'graph-tutorial';
  // Is a user logged in?
  get authenticated(): boolean {
    return this.authService.authenticated;
  }
  // The user
  get user(): User {
    return this.authService.user;
  }
  public events: MicrosoftGraph.Event[];
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { title: 'event 1', date: '2019-04-01' },
      { title: 'event 2', date: '2019-04-02' }
    ],
    locale: esLocale,
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    }
  };
  constructor(private authService: AuthService, private graphService: GraphService,) { }

  ngOnInit() { }

  // <signInSnippet>
  async signIn(): Promise<void> {

    await this.authService.signIn();
    this.getEvents();
  }

  async getEvents() {
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
        console.log("eventos:", this.events);

      });
  }

  handleDateClick(arg) {
    // alert('date click! ' + arg.dateStr)
    this.signIn();
  }


}
