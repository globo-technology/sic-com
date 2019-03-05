import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {CarritoCompra} from '../models/carrito-compra';
import {ItemCarritoCompra} from '../models/item-carrito-compra';

@Injectable()
export class CarritoCompraService {

  uri = environment.apiUrl + '/api/v1/carrito-compra';
  private cantidadItemsEnCarritoSubject = new Subject<number>();
  cantidadItemsEnCarrito$ = this.cantidadItemsEnCarritoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCarritoCompra(idCliente: number): Observable<CarritoCompra> {
    const idUsuario = localStorage.getItem('id_Usuario');
    return this.http.get<CarritoCompra>(`${this.uri}/usuarios/${idUsuario}/clientes/${idCliente}`);
  }

  setCantidadItemsEnCarrito(cantidad: number) {
    this.cantidadItemsEnCarritoSubject.next(cantidad);
  }

  agregarQuitarAlPedido(producto, cantidad): Observable<ItemCarritoCompra> {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriPost = `${this.uri}/usuarios/${idUsuario}/productos/${producto['idProducto']}?cantidad=${cantidad}`;
    return this.http.post<ItemCarritoCompra>(uriPost, {});
  }

  actualizarAlPedido(producto, cantidad) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriPut = `${this.uri}/usuarios/${idUsuario}/productos/${producto['idProducto']}?cantidad=${cantidad}`;
    return this.http.put(uriPut, {});
  }

  getItems(idCliente: number, pagina: number) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriGet = `${this.uri}/usuarios/${idUsuario}/clientes/${idCliente}/items?pagina=${pagina}`;
    return this.http.get(uriGet);
  }

  eliminarTodosLosItems() {
    const idUsuario = localStorage.getItem('id_Usuario');
    const urlDelete = `${this.uri}/usuarios/${idUsuario}`;
    return this.http.delete(urlDelete);
  }

  eliminarItem(id: number) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriDelete = `${this.uri}/usuarios/${idUsuario}/productos/${id}`;
    return this.http.delete(uriDelete);
  }

  enviarOrden(usarUbicacionDeFacturacion: boolean, observaciones: string, idUsuario, idCliente) {
    const uriPost = `${this.uri}?idEmpresa=${environment.idEmpresa}&idUsuario=${idUsuario}&idCliente=${idCliente}`
      + `&usarUbicacionDeFacturacion=${usarUbicacionDeFacturacion}`;

    return this.http.post(uriPost, observaciones);
  }
}
