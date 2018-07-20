import {Component, OnInit} from '@angular/core';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {MatDialog} from '@angular/material';
import {CheckoutDialogComponent} from './checkoutDialog/checkout-dialog.component';
import {ClientesService} from '../../services/clientes.service';
import {ClientesDialogComponent} from './clientesDialog/clientes-dialog.component';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {ConfirmationDialogComponent} from '../../components/confirmation-dialog/confirmation-dialog.component';
import { Rol } from '../../models/rol';
import { CantidadProductoDialogComponent } from './cantidadProductoDialog/cantidad-producto-dialog.component';

@Component({
  selector: 'sic-com-carrito-compra',
  templateUrl: './carrito-compra.component.html',
  styleUrls: ['./carrito-compra.component.scss']
})
export class CarritoCompraComponent implements OnInit {

  itemsCarritoCompra = [];
  totalLista = 0;
  cantidadArticulos = 0;
  cantidadRenglones = 0;
  clienteSeleccionado = [];
  pagina = 0;
  tamanioPagina = 10;
  totalPaginas = 0;
  loadingPedido = false;
  loadingRenglones = false;
  mostrarBotonAsignarCliente = true;

  constructor(private carritoCompraService: CarritoCompraService, private clientesService: ClientesService,
              private dialog: MatDialog, private avisoService: AvisoService, private authService: AuthService) {}

  ngOnInit() {
    this.loadingPedido = true;
    this.cargarPedido();
    this.clienteSeleccionado = this.clientesService.getClienteSeleccionado();
    this.clientesService.clienteSeleccionado.subscribe(
      data => this.clienteSeleccionado = data);
    this.authService.getLoggedInUsuario().subscribe(
      data => {
        if (data['roles'].indexOf(Rol.COMPRADOR) !== -1 && data['roles'].length === 1) {
          this.mostrarBotonAsignarCliente = false;
          this.clientesService.getClienteDelUsuario(data['id_Usuario']).subscribe(
            cliente => this.clientesService.setClienteSeleccionado(cliente)
          );
        }
      }
    );
    this.carritoCompraService.getCantidadRenglones().subscribe(
      data => {
        this.cantidadRenglones = Number(data);
        this.carritoCompraService.setCantidadItemsEnCarrito(Number(data));
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  openDialogCliente() {
    this.dialog.open(ClientesDialogComponent);
  }

  openDialogCheckout() {
    const dialogRef = this.dialog.open(CheckoutDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.itemsCarritoCompra = [];
        this.cantidadArticulos = 0;
        this.totalLista = 0;
      }
    });
  }

  vaciarPedido() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar todos los productos del carrito?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cantidadArticulos = 0;
        this.carritoCompraService.eliminarTodosLosItems().subscribe(
        data => {
          this.avisoService.openSnackBar('Se borraron todos los articulos del listado', '', 3500);
          this.itemsCarritoCompra = [];
          this.clientesService.deleteClienteSeleccionado();
          this.carritoCompraService.setCantidadItemsEnCarrito(0);
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500));
      }
    });
  }

  cargarPedido() {
    this.carritoCompraService.getItems(this.pagina, this.tamanioPagina).subscribe(
      data => {
        data['content'].forEach(item => this.itemsCarritoCompra.push(item));
        this.totalPaginas = data['totalPages'];
        this.sumarTotales();
        this.loadingPedido = false;
        this.loadingRenglones = false;
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  sumarTotales() {
    this.carritoCompraService.getTotalImportePedido().subscribe(
      data => {
        this.totalLista = 0;
        if (data !== null) {
          this.totalLista = parseFloat(data.toString());
          this.carritoCompraService.getCantidadArticulos().subscribe(
            cantArt => this.cantidadArticulos = Number(cantArt),
            err => this.avisoService.openSnackBar(err.error, '', 3500));
        }
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  eliminarItemDelCarrito(itemCarritoCompra) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar el producto?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carritoCompraService.eliminarItem(itemCarritoCompra.producto.id_Producto).subscribe(
          data => {
            this.avisoService.openSnackBar('Se eliminó el articulo del listado', '', 3500);
            this.sumarTotales();
            const id = this.itemsCarritoCompra.map(function(e) {return e; }).indexOf(itemCarritoCompra);
            this.itemsCarritoCompra.splice(id, 1);
            this.cantidadArticulos = this.itemsCarritoCompra.length;
            this.carritoCompraService.setCantidadItemsEnCarrito(this.itemsCarritoCompra.length);
          },
          err => this.avisoService.openSnackBar(err.error, '', 3500));
      }
    });
  }

  editCantidadProducto(itemCarritoCompra) {
    const dialogRef = this.dialog.open(CantidadProductoDialogComponent);
    dialogRef.componentInstance.itemCarritoCompra = itemCarritoCompra;
    // dialogRef.componentInstance.cantidad = cantidad;
    dialogRef.afterClosed().subscribe(data => {
      console.log(data);
      // console.log(cantidad);
      /* this.carritoCompraService.agregarQuitarAlPedido(itemCarritoCompra.producto, cantidad).subscribe(
        data => {
          itemCarritoCompra.descuento_porcentaje = 0;
          itemCarritoCompra.descuento_neto = 0;
          itemCarritoCompra.subTotal = cantidad * itemCarritoCompra.producto.precioLista;
          this.sumarTotales();
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500)); */
    });

    /* let cant = cantidad;

    if (direccion === 2) {
      cant = cantidad - producto.cantidad;
    }
    producto.cantidad = cant + producto.cantidad;
    this.carritoCompraService.agregarQuitarAlPedido(producto.producto, cant).subscribe(
      data => {
       producto.descuento_porcentaje = 0;
       producto.descuento_neto = 0;
       producto.subTotal = cantidad * producto.producto.precioLista;
       this.sumarTotales();
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500)); */
  }

  masProductosPedido() {
    this.loadingRenglones = true;
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarPedido();
    }
  }
}
