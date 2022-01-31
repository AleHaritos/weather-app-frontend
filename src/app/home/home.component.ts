import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [trigger('backTrigger', [
    state('show', style({ opacity: 0.7 })),
    transition('void => show', [style({ opacity: 0 }), animate('1.5s 200ms ease-in-out', keyframes([
      style({ offset: 0.15, opacity: 0.1 }),
      style({ offset: 0.30, opacity: 0.2 }),
      style({ offset: 0.50, opacity: 0.3 }),
      style({ offset: 0.75, opacity: 0.4 }),
      style({ offset: 0.80, opacity: 0.5 }),
      style({ offset: 0.95, opacity: 0.7 }),
    ]))])
  ]),
  trigger('result', [
    state('show', style({ opacity: 1 })),
    transition('void => show', [
      style({opacity: 0, transform:'translate(160px, 0px)'}),
      animate('1.5s', keyframes([
      style({ offset: 0.15, opacity: 1, transform: 'translateX(-130px)' }),
      style({ offset: 0.25, opacity: 1, transform: 'translateX(110px)' }),
      style({ offset: 0.50, opacity: 1, transform: 'translateX(-90px)' }),
      style({ offset: 0.65, opacity: 1, transform: 'translateX(70px)' }),
      style({ offset: 0.80, opacity: 1, transform: 'translateX(-40px)' }),
      style({ offset: 0.90, opacity: 1, transform: 'translateX(0px)' })
    ]))])
  ]), 
    trigger('tomorrow', [
      state('criado', style({ opacity: 1 })),
      transition('void => criado', [
        style({ transform: 'translate(-250px, 0)' }),
        animate('1.5s 300ms ease-in-out', keyframes([
          style({ offset: 0.50, opacity: 0.5, transform: 'translateX(0px)'}),
          style({ offset: 0.80, opacity: 0.7, transform: 'translateX(-50px)'}),
          style({ offset: 0.96, opacity: 1, transform: 'translateX(0px)'})

        ]))
      ])
    ]),
    trigger('today', [
      state('criado', style({ opacity: 1 })),
      transition('void => criado', [
        style({ transform: 'translate(0, -250px)' }),
        animate('1.5s 300ms ease-in-out', keyframes([
          style({ offset: 0.50, opacity: 0.5, transform: 'translateY(-150px)'}),
          style({ offset: 0.80, opacity: 0.7, transform: 'translateY(-180px)'}),
          style({ offset: 0.90, opacity: 0.7, transform: 'translateY(-100px)'}),
          style({ offset: 0.96, opacity: 1, transform: 'translateY(0px)'})

        ]))
      ])
    ])
]
})
export class HomeComponent implements OnInit {
  resultState: string = 'show'
  criadoState: string = 'none'
  criadoStateToday: string = 'none'
  result: boolean = false

  cities: any
  backClass: string = ''
  home: boolean = true

  temperature!: number

  maxToday!: number
  minToday!: number

  maxTomorrow!: number
  minTomorrow!: number

  sub: Subject<string> = new Subject<string>();

  forms: FormGroup = new FormGroup({
    cityName: new FormControl(null, [Validators.required])
  })


  constructor(
    private service: ServiceService
  ) { }


  ngOnInit(): void {
    this.cities = this.sub
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((cityName: string) => {
          let formatName = cityName
          if (cityName.length > 1) {
            formatName = cityName[0].toUpperCase() + cityName.slice(1)
          }
          return this.service.getCity(formatName)
        })
      )
  }

  getWeather(): void {
    if (this.forms.valid) {
      this.service.getWeather(this.forms.value.cityName)
        .subscribe((res: any) => {
          //Temperaturas
          this.temperature = this.calcularTemp(res[0].current.temperature);
          this.maxToday = this.calcularTemp(res[0].forecast[1].high)
          this.minToday = this.calcularTemp(res[0].forecast[1].low)
          this.maxTomorrow = this.calcularTemp(res[0].forecast[2].high)
          this.minTomorrow = this.calcularTemp(res[0].forecast[2].low)

          this.home = false
          if (res[0].forecast[1].skytextday.includes('Rain')) {
            this.backClass = 'backClassRain'
          }
          if (res[0].forecast[1].skytextday.includes('Sunny')) {
            this.backClass = 'backClassSunny'
          }
          if (res[0].forecast[1].skytextday.includes('Cloudy')) {
            this.backClass = 'backClassCloudy'
          }
          if (res[0].forecast[1].skytextday.includes('Storm')) {
            this.backClass = 'backClassStorm'
          }
        })
    }
  }

  getCity(): void {
    this.service.getCity('Br')
      .subscribe((res: any) => {
        console.log(res)
      })
  }

  pesquisarCidade(): void {
    this.sub.next(this.forms.value.cityName)
  }

  voltar() {
    this.resultState = 'none'
    this.forms.reset()
    this.home = true
    this.criadoState = 'none'
    this.criadoStateToday = 'none'
  }

  calcularTemp(valor: string): number {
    let temp = parseFloat(valor)
    temp = (temp - 32) * 5 / 9

    temp = parseFloat(temp.toFixed(2))

    return temp
  }


  changeStateResult(evento: any): void {
      this.resultState = 'show'
    
      this.result = !this.result
  }

  tomorrow(evento: any) {
    // console.log(evento)
    if(evento.totalTime != 0) {
      this.criadoState = 'criado'
    }
  }  

  today(evento: any) {
    // console.log(evento)
    if(evento.totalTime != 0) {
      this.criadoStateToday = 'criado'
    }
  } 
  
}
