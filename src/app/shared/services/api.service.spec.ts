import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  const baseUrl = 'http://localhost:8000/api/';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    httpSpy.get.and.returnValue(of({}));
    httpSpy.post.and.returnValue(of({}));
    httpSpy.patch.and.returnValue(of({}));
    httpSpy.delete.and.returnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: HttpClient, useValue: httpSpy }
      ]
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('postData should call HttpClient.post with correct URL and options', () => {
    const endpoint = 'test/endpoint/';
    const data = { foo: 'bar' };

    service.postData(endpoint, data).subscribe();

    expect(httpSpy.post).toHaveBeenCalledWith(
      baseUrl + endpoint,
      data,
      { withCredentials: true }
    );
  });

  it('postLoginOrLogouData should call HttpClient.post with correct URL and options', () => {
    const endpoint = 'login/';
    const data = { user: 'test' };

    service.postLoginOrLogouData(endpoint, data).subscribe();

    expect(httpSpy.post).toHaveBeenCalledWith(
      baseUrl + endpoint,
      data,
      { withCredentials: true }
    );
  });

  it('getData should call HttpClient.get with correct URL and options', () => {
    const endpoint = 'movies/';

    service.getData(endpoint).subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith(
      baseUrl + endpoint,
      { withCredentials: true }
    );
  });

  it('getCheckLoggedin should call HttpClient.get with logged/ endpoint and options', () => {
    service.getCheckLoggedin().subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith(
      baseUrl + 'logged/',
      { withCredentials: true }
    );
  });

  it('patchData should call HttpClient.patch with correct URL and options', () => {
    const endpoint = 'update/';
    const data = { progress: 50 };

    service.patchData(endpoint, data).subscribe();

    expect(httpSpy.patch).toHaveBeenCalledWith(
      baseUrl + endpoint,
      data,
      { withCredentials: true }
    );
  });

  it('deleteData should call HttpClient.delete with correct URL and options', () => {
    const endpoint = 'delete/';

    service.deleteData(endpoint).subscribe();

    expect(httpSpy.delete).toHaveBeenCalledWith(
      baseUrl + endpoint,
      { withCredentials: true }
    );
  });
});
