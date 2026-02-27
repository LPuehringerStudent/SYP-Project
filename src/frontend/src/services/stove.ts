import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, Subject, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoveApiService {
private apiUrl = 'http://localhost:3000/api';  // Add /api prefix
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

constructor(private http: HttpClient) {}

  createStove(typeId: number, ownerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/stoves`, {
      typeId,
      currentOwnerId: ownerId
    }).pipe(
      tap(() => this.refreshSubject.next()) // Notify subscribers
    );
  }


getStoves(ownerId: number): Observable<any> {
  // This hits: GET http://localhost:3000/api/players/{ownerId}/stoves
  return this.http.get(`${this.apiUrl}/players/${ownerId}/stoves`);
}
}
