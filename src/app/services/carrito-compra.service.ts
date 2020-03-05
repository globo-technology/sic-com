import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {CarritoCompra} from '../models/carrito-compra';
import {ItemCarritoCompra} from '../models/item-carrito-compra';
import {NuevaOrdenDeCompra} from '../models/nueva-orden-de-compra';
import {StorageService} from './storage.service';
import {AuthService} from './auth.service';

@Injectable()
export class CarritoCompraService {

  uri = environment.apiUrl + '/api/v1/carrito-compra';
  private cantidadItemsEnCarritoSubject = new Subject<number>();
  cantidadItemsEnCarrito$ = this.cantidadItemsEnCarritoSubject.asObservable();

  constructor(private http: HttpClient,
              private storageService: StorageService,
              private authService: AuthService) {}

  getCarritoCompra(idCliente: number): Observable<CarritoCompra> {
    const idUsuario = this.authService.getLoggedInIdUsuario();
    return this.http.get<CarritoCompra>(`${this.uri}/usuarios/${idUsuario}/clientes/${idCliente}`);
  }

  setCantidadItemsEnCarrito(cantidad: number) {
    this.cantidadItemsEnCarritoSubject.next(cantidad);
  }

  actualizarAlPedido(producto, cantidad) {
    const idUsuario = this.authService.getLoggedInIdUsuario();
    const uriPost = `${this.uri}/usuarios/${idUsuario}/productos/${producto['idProducto']}?cantidad=${cantidad}`;
    return this.http.post(uriPost, {});
  }

  getItems(pagina: number) {
    const idUsuario = this.authService.getLoggedInIdUsuario();
    const uriGet = `${this.uri}/usuarios/${idUsuario}/items?pagina=${pagina}`;
    return this.http.get(uriGet);
  }

  eliminarTodosLosItems() {
    const idUsuario = this.authService.getLoggedInIdUsuario();
    const urlDelete = `${this.uri}/usuarios/${idUsuario}`;
    return this.http.delete(urlDelete);
  }

  eliminarItem(id: number) {
    const idUsuario = this.authService.getLoggedInIdUsuario();
    const uriDelete = `${this.uri}/usuarios/${idUsuario}/productos/${id}`;
    return this.http.delete(uriDelete);
  }

  enviarOrden(nuevaOrdenDeCompra: NuevaOrdenDeCompra) {
    return this.http.post(this.uri, nuevaOrdenDeCompra);
  }

  getCantidadEnCarrito(idProducto): Observable<ItemCarritoCompra> {
    const idUsuario = this.authService.getLoggedInIdUsuario();
    return this.http.get<ItemCarritoCompra>(`${this.uri}/usuarios/${idUsuario}/productos/${idProducto}`);
  }
}
