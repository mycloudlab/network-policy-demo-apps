import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { Http, Response } from "@angular/http";
import 'rxjs/add/operator/map';
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // chart variables random php value
  @ViewChild(BaseChartDirective)
  public chart: BaseChartDirective;
  randomConnected = false;
  chartOptions = {
    responsive: true
  };
  chartData = [
    { data: [], label: 'Account balance' }
  ];
  chartLabels = [];


  // datetime node variables
  datetimeConnected = false;
  date: String = '';
  time: String = '';

  // twitter node variables
  tweetConnected = false;
  searchTerm = "";
  tweets = {
    result: '',
    data: {
      statuses:[]
    }
  };

  constructor(private http: Http) {

    let fn = () => {
      this.http.get('/api/data')
        .map(res => res.json())
        .subscribe((api) => {
          if (api.datetime.result == 'ok') {
            this.datetimeConnected = true;
            this.date = moment(api.datetime.data).format("DD/MM/YYYY");
            this.time = moment(api.datetime.data).format("HH:mm:ss");
          } else {
            this.datetimeConnected = false;
            this.date = ' - '
            this.time = ' - '
          }

          if (api.random.result == 'ok') {
            this.randomConnected = true;
            this.newDataPoint(api.random.data);
          } else {
            this.randomConnected = false;
            this.newDataPoint(0);
          }
        })
      setTimeout(fn, 1000);
    };

    setTimeout(fn, 1000);
  }


  newDataPoint(value) {
    let label = moment().format('HH:mm:ss');

    if (this.chartData[0].data.length > 50) {
      this.chartData[0].data.shift();
      this.chartLabels.shift();
    }

    this.chartData[0].data.push(value);
    this.chartLabels.push(label);
    this.chart.chart.update();
  }


  search() {
    this.http.get('/api/tweets',{params:{q:this.searchTerm}})
      .map(res => res.json())
      .subscribe((api) => {
        if (api.result == 'ok') {
          this.tweetConnected = true;
          this.tweets = api;
        } else {
          this.tweetConnected = false;
          this.tweets.data={statuses:[]};
          
        }
      });
  }
}