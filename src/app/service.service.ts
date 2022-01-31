import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, map } from 'rxjs/operators'
import { url } from '../global'

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(
    private http: HttpClient
  ) { }

getCity(termo: string): Observable<any> {
  return this.http.post(`${url}/city`, { termo })
    .pipe(
      retry(5),
      map((res: any) => res)
    )
}
   
getWeather(termo: string): Observable<any> {
  return this.http.post(`${url}/weather`, { termo })
    .pipe(
      retry(5),
      map((res: any) => res)
    )
}


}
